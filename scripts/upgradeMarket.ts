import { ethers, upgrades } from "hardhat";
import * as fs from "fs";
import hre from 'hardhat'


async function main() {
    const chainId = hre.network.config.chainId

    console.log("Upgrading market contract");
    const marketServiceFee = parseInt(process.env.MARKET_SERVICE_FEE || "");
    const Market = await ethers.getContractFactory("CruzoMarket");

    let oldAddr = ""
    console.log("Network chain id=", chainId);
    var text = fs.readFileSync('networks.json', 'utf8')
    var obj = JSON.parse(text)
    var data = { token: "", market: "" }
    var mapping = new Map()
    mapping = new Map(Object.entries(obj));
    console.log(mapping)
    data = mapping.get(chainId?.toString())
    console.log("market", data.market)


    let newMarket = await upgrades.upgradeProxy(data.market, Market)
    await newMarket.deployed();



    console.log("Market Contract upgraded");
    console.log("New Market Contract Address : ", newMarket.address);
    console.log(`https://polygonscan.com/token/${newMarket.address}`);
    console.log(`https://mumbai.polygonscan.com/token/${newMarket.address}`);

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });