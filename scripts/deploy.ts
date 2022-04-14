import { ethers, upgrades } from "hardhat";
import { Cruzo1155 } from "../typechain/Cruzo1155";
import { CruzoMarket } from "../typechain/CruzoMarket";

async function main() {
    console.log("Deploying market contract");
    const Market = await ethers.getContractFactory("CruzoMarket");
    const market = await upgrades.deployProxy(Market, [], { initializer: 'initialize()' }) as CruzoMarket;
    await market.deployed();

    console.log("Market Contract Deployed");
    console.log("Market Contract Address : ", market.address);
    console.log(`https://polygonscan.com/token/${market.address}`);
    console.log(`https://mumbai.polygonscan.com/token/${market.address}`);

    console.log("Deploying token contract");
    const Token = await ethers.getContractFactory("Cruzo1155");
    const token = await upgrades.deployProxy(Token, ["https://cruzo.market", market.address], { initializer: 'initialize(string,address)' }) as CruzoMarket;
    await token.deployed();

    console.log("Token Contract Deployed");
    console.log("Token Contract Address : ", token.address);
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
