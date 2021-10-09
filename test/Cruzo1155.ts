import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Cruzo1155 } from "../typechain/Cruzo1155";

const tokenDetails = {
  name: "Cruzo",
  symbol: "CRZ",
};

const real = (inp: string) => inp + "0".repeat(9);

describe("Testing Cruzo1155 COntract", () => {
  let admin: SignerWithAddress;

  let signers: SignerWithAddress[];

  let token: Cruzo1155;

  before(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
  });

  beforeEach(async () => {
    let Token = await ethers.getContractFactory("Cruzo1155");
    token = (await Token.deploy(signers[5].address)) as Cruzo1155;
  });

  it("Check Market Address", async () => {
    expect(await token.marketAddress()).equal(signers[5].address);
    expect(await token.total()).equal(0);
  });

  it("Check OwnerShip", async () => {
    expect(await token.owner()).eq(admin.address);
  });

  it("Check mintNew function", async () => {
    await token.mintNew(1000);
    await token.mintNew(1);
    expect(await token.balanceOf(admin.address, 1)).equal(1000);
    expect(await token.balanceOf(admin.address, 2)).equal(1);
    await expect(token.connect(signers[1]).mintNew(1)).revertedWith("Ownable: caller is not the owner");
  });

  it("Check mintNewTo function", async () => {
    await token.mintNewTo(1000, signers[1].address);
    await token.mintNewTo(1, signers[1].address);
    expect(await token.balanceOf(signers[1].address, 1)).equal(1000);
    expect(await token.balanceOf(signers[1].address, 2)).equal(1);
    await expect(token.connect(signers[1]).mintNewTo(1, signers[1].address)).revertedWith("Ownable: caller is not the owner");
  });

  it("Check mint function", async () => {
    await token.mintNew(1);
    await token.mintNew(1);
    await token.mint(1, 1);
    await token.mint(2, 1);
    expect(await token.balanceOf(admin.address, 1)).equal(2);
    expect(await token.balanceOf(admin.address, 2)).equal(2);
    await expect(token.connect(signers[1]).mint(1, 1)).revertedWith("Ownable: caller is not the owner");
  });

  it("Check mintTo function", async () => {
    await token.mintNewTo(1, signers[1].address);
    await token.mintNewTo(1, signers[1].address);
    await token.mintTo(1, 1, signers[1].address);
    await token.mintTo(2, 1, signers[1].address);
    expect(await token.balanceOf(signers[1].address, 1)).equal(2);
    expect(await token.balanceOf(signers[1].address, 2)).equal(2);
    await expect(token.connect(signers[1]).mintTo(1, 1, signers[1].address)).revertedWith("Ownable: caller is not the owner");
  });
});
