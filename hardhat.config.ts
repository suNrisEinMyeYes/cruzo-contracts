import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-abi-exporter";
import { task, HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

dotenv.config();
const PKS = [process.env.PRIVATE_KEY!];
const config: HardhatUserConfig = {
  solidity: "0.8.7",
  networks: {
    ethMainnet: {
      url: "https://mainnet.infura.io/v3/2439f263ff0c4b29bfa0cf70da744d46",
      chainId: 1,
      accounts: PKS,
    },
    ethRinkeby: {
      url: "https://rinkeby.infura.io/v3/2439f263ff0c4b29bfa0cf70da744d46",
      chainId: 4,
      accounts: PKS,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 15000000000,
      accounts: PKS,
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: PKS,
    },
    polygonMumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: PKS,
    },
    polygonMainnet: {
      url: "https://rpc-mainnet.matic.network",
      accounts: PKS,
    },
    cronosMainnetBeta: {
      url: "https://evm-cronos.crypto.org",
      chainId: 25,
      accounts: PKS,
    },
    cronosTestnet: {
      url: "https://cronos-testnet-3.crypto.org:8545",
      chainId: 338,
      accounts: PKS,
    },
    avaxMainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: PKS
    },
    avaxFuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      chainId: 43113,
      accounts: PKS
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  abiExporter: {
    path: './data/abi',
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    pretty: false,
  }
};

export default config;
