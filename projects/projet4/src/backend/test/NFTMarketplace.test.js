const {expect} = require("chai");
const {BN} = require('@openzeppelin/test-helpers');

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFTMarketplace", function () {

    let NftCollectionFactory;
    let nftCollectionFactory;
    let NFT;
    let nft;
    let vrf;
    let Marketplace;
    let marketplace
    let deployer;
    let addr1;
    let addr2;
    let addrs;
    let feePercent = 1;
    let URI = "sample URI"

    beforeEach(async function () {

        NftCollectionFactory = await ethers.getContractFactory("NftCollectionFactory");
        NFT = await ethers.getContractFactory("NFT");
        Marketplace = await ethers.getContractFactory("Marketplace");

        // Get the ContractFactories and Signers here.
        [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();

        let vrfCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        hardhatVrfCoordinatorV2Mock = await vrfCoordinatorV2Mock.deploy(0, 0);

        const VRF = await ethers.getContractFactory("VrfCategory");
        // deploy contracts
        const subTx = await(await hardhatVrfCoordinatorV2Mock.createSubscription()).wait()
        const subId = subTx.events[0].args.subId;
        vrf = await VRF.deploy(1, hardhatVrfCoordinatorV2Mock.address);
        await hardhatVrfCoordinatorV2Mock.addConsumer(1, vrf.address)
        await hardhatVrfCoordinatorV2Mock.fundSubscription(1, ethers.utils.parseEther("7"))

        // To deploy our contracts
        marketplace = await Marketplace.deploy(feePercent);
        nftCollectionFactory = await NftCollectionFactory.deploy();
        const transact = await nftCollectionFactory.createCollection("DApp NFT", "DAPP", "Alyra Test", vrf.address);
        nftAddress = await nftCollectionFactory.getUserAllCollections(deployer.address);
        nft = await NFT.attach(nftAddress[0]);


    });

    describe("Deployment", function () {

        it("Should track name and symbol of the nft collection", async function () {
            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.

            const nftName = "DApp NFT"
            const nftSymbol = "DAPP"
            // console.log("nft contrat: ",  nft)
            expect(await nft.name()).to.equal(nftName);
            expect(await nft.symbol()).to.equal(nftSymbol);
        });

        it("Should track feeAccount and feePercent of the marketplace", async function () {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(feePercent);
        });
    });

    describe("Minting NFTs", function () {

        it("Should track each minted NFT", async function () {

            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(0)).to.equal(URI);

            //TODO fix callback mock not called
/*            await new Promise((r) => setTimeout(r, 1000));
            expect(await vrf.category(0)).to.equal('test');
            */

            // addr2 mints an nft
            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);
        });
    })

    describe("Making marketplace items", function () {
        let price = 1
        let result
        beforeEach(async function () {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            // addr1 approves marketplace to spend nft
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })


        it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
            // addr1 offers their nft at a price of 1 ether
            await expect(marketplace.connect(addr1).makeItem(nft.address, 0, toWei(price)))
                .to.emit(marketplace, "Offered")
                .withArgs(
                    1,
                    nft.address,
                    0,
                    toWei(price),
                    addr1.address
                )
            // Owner of NFT should now be the marketplace
            expect(await nft.ownerOf(0)).to.equal(marketplace.address);
            // Item count should now equal 1
            expect(await marketplace.itemCount()).to.equal(1)
            // Get item from items mapping then check fields to ensure they are correct
            const item = await marketplace.items(1)
            expect(item.itemId).to.equal(1)
            expect(item.nft).to.equal(nft.address)
            expect(item.tokenId).to.equal(0)
            expect(item.price).to.equal(toWei(price))
            expect(item.sold).to.equal(false)
        });

        it("Should fail if price is set to zero", async function () {
            await expect(
                marketplace.connect(addr1).makeItem(nft.address, 0, 0)
            ).to.be.revertedWith("Price must be greater than zero");
        });

    });

    describe("Purchasing marketplace items", function () {
        let price = 2
        let fee = (feePercent / 100) * price
        let totalPriceInWei

        beforeEach(async function () {
            // addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            // addr1 approves marketplace to spend tokens
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
            // addr1 makes their nft a marketplace item.
            await marketplace.connect(addr1).makeItem(nft.address, 0, toWei(price))
        })

        it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
            const sellerInitalEthBal = await addr1.getBalance()
            const feeAccountInitialEthBal = await deployer.getBalance()
            // fetch items total price (market fees + item price)
            totalPriceInWei = await marketplace.getTotalPrice(1);
            // addr 2 purchases item.
            await expect(marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei}))
                .to.emit(marketplace, "Bought")
                .withArgs(
                    1,
                    nft.address,
                    0,
                    toWei(price),
                    addr1.address,
                    addr2.address
                )
            const sellerFinalEthBal = await addr1.getBalance()
            const feeAccountFinalEthBal = await deployer.getBalance()
            // Item should be marked as sold
            expect((await marketplace.items(1)).sold).to.equal(true)
            // Seller should receive payment for the price of the NFT sold.
            expect(+fromWei(sellerFinalEthBal)).to.equal(+price + +fromWei(sellerInitalEthBal))
            // feeAccount should receive fee
            expect(+fromWei(feeAccountFinalEthBal)).to.equal(+fee + +fromWei(feeAccountInitialEthBal))
            // The buyer should now own the nftn
            expect(await nft.ownerOf(0)).to.equal(addr2.address);
        })
        it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
            // fails for invalid item ids
            await expect(
                marketplace.connect(addr2).purchaseItem(2, {value: totalPriceInWei})
            ).to.be.revertedWith("item doesn't exist");
            await expect(
                marketplace.connect(addr2).purchaseItem(0, {value: totalPriceInWei})
            ).to.be.revertedWith("item doesn't exist");
            // Fails when not enough ether is paid with the transaction.
            // In this instance, fails when buyer only sends enough ether to cover the price of the nft
            // not the additional market fee.
            await expect(
                marketplace.connect(addr2).purchaseItem(1, {value: toWei(price)})
            ).to.be.revertedWith("not enough ether to cover item price and market fee");
            // addr2 purchases item 1
            await marketplace.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
            // addr3 tries purchasing item 1 after its been sold
            const addr3 = addrs[0]
            await expect(
                marketplace.connect(addr3).purchaseItem(1, {value: totalPriceInWei})
            ).to.be.revertedWith("item already sold");
        });
    })
})
