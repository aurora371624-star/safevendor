require("@nomicfoundation/hardhat-toolbox");

// Sepolia config is read from environment variables so no secret is stored in this repo.
//   export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/<your project id>"
//   export PRIVATE_KEY="<a dedicated test-only wallet private key>"
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};
