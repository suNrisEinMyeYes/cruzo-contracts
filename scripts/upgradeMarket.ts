import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import hre from "hardhat";

async function main() {
    const chainId = hre.network.config.chainId;

    console.log("Upgrading market contract");
    const Market = await ethers.getContractFactory("CruzoMarket");

    let text = fs.readFileSync("networks.json", "utf8");
    let obj = JSON.parse(text);
    let data = { token: "", market: "" };
    let contractsAddressMapping = new Map();
    contractsAddressMapping = new Map(Object.entries(obj));
    data = contractsAddressMapping.get(chainId?.toString());

    let newMarket = await upgrades.upgradeProxy(data.market, Market);
    await newMarket.deployed();

    console.log("Market Contract upgraded");
    console.log("New Market Contract Address : ", newMarket.address);
    console.log(`https://polygonscan.com/token/${newMarket.address}`);
    console.log(`https://mumbai.polygonscan.com/token/${newMarket.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
