require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const RINKEBY_API_URL = "https://rinkeby.infura.io/v3/" + process.env.INFURA_ID;

module.exports = {
  solidity: "0.8.15",
  networks: {
    rinkeby: {
      url: RINKEBY_API_URL,
      accounts: [`0x${process.env.PRIVATE_RINK_KEY_1}`,`0x${process.env.PRIVATE_RINK_KEY_2}`]
    },
  },
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
};
