import { ethers, upgrades } from "hardhat";
import { Cruzo1155 } from "../typechain/Cruzo1155";
import { CruzoMarket } from "../typechain/CruzoMarket";

async function main() {
    console.log("Upgrading market contract");
    const marketProxyAddress = process.env.MARKET || '';
    const UpgradedMarket = await ethers.getContractFactory("CruzoMarket");
    await upgrades.upgradeProxy(marketProxyAddress, UpgradedMarket);

    console.log("Market Contract Upgraded");
    console.log("Market Contract Address : ", marketProxyAddress);
    console.log(`https://polygonscan.com/token/${marketProxyAddress}`);
    console.log(`https://mumbai.polygonscan.com/token/${marketProxyAddress}`);

    console.log("Upgrading token contract");
    const tokenProxyAddress = process.env.TOKEN || '';
    const Token = await ethers.getContractFactory("Cruzo1155");
    await upgrades.upgradeProxy(tokenProxyAddress, Token);

    console.log("Token Contract Upgraded");
    console.log("Token Contract Address : ", tokenProxyAddress);
    console.log(`https://polygonscan.com/token/${tokenProxyAddress}`);
    console.log(`https://mumbai.polygonscan.com/token/${tokenProxyAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
