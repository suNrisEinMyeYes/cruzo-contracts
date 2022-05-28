// @ts-ignore
import { ethers, upgrades } from "hardhat";
import { Cruzo1155Factory, Cruzo1155 } from "../typechain";

async function main() {
    console.log("Deploying beacon contract");
    const Token = await ethers.getContractFactory("Cruzo1155");
    const beacon = await upgrades.deployBeacon(Token);
    await beacon.deployed();
    console.log("Beacon deployed to:", beacon.address);

    console.log("Deploying factory contract");
    const Cruzo1155Factory = await ethers.getContractFactory("Cruzo1155Factory");
    const factory = await Cruzo1155Factory.deploy(beacon.address);
    await factory.deployed();
    console.log("Factory deployed to:", factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
