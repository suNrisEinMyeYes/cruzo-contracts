import { ethers } from "hardhat";
import { Cruzo1155 } from "../typechain/Cruzo1155";
async function main() {
  console.log("Deploying contract");
  const Token = await ethers.getContractFactory("Cruzo1155");
  const token = (await Token.deploy()) as Cruzo1155;

  console.log("Contract Deployed");
  console.log("Contract Address : ", token.address);
  console.log(`https://polygonscan.com/token/${token.address}`);
  console.log(`https://mumbai.polygonscan.com/token/${token.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
