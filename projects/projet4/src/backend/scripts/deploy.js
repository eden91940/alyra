require('dotenv').config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const VRF = await ethers.getContractFactory("VrfCategory");
  const vrf = await VRF.deploy(process.env.SUB_VRF_ID, process.env.VRF_COORDINATOR);

  const NFT = await ethers.getContractFactory("NFT");
  const NftCollectionFactory = await ethers.getContractFactory("NftCollectionFactory");
  const nftcollectionfactory = await NftCollectionFactory.deploy();
  await(await nftcollectionfactory.createCollection("NFT ALYRA", "ALY", "Alyra NFT", vrf.address)).wait();
  nftAddress = await nftcollectionfactory.getUserAllCollections(deployer.address);
  console.log(nftAddress);
  nft = await NFT.attach(nftAddress[0]); //deploying my contract later using dai.address in constructor


  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);


  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(marketplace , "Marketplace");
  saveFrontendFiles(nft , "NFT");
  saveFrontendFiles(vrf , "VrfCategory");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });