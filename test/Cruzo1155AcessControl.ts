import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { assert, expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Cruzo1155 } from "../typechain/Cruzo1155";

const real = (inp: string) => inp + "0".repeat(9);

describe("Testing Cruzo1155 Contract", () => {
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

  it("Check Contract Data", async () => {
    expect(await token.marketAddress()).equal(signers[5].address);
    expect(await token.uri(1)).equal("https://somthing.something/{id}.json");
    expect(await token.setURI("https://opensea.io/{id}.json"));
    expect(await token.uri(1)).equal("https://opensea.io/{id}.json");
    expect(await token.total()).equal(0);
  });

  it("Check mintNew function", async () => {
    await token.create(1000, admin.address, []);
    await token.create(1, admin.address, []);
    expect(await token.balanceOf(admin.address, 1)).equal(1000);
    expect(await token.balanceOf(admin.address, 2)).equal(1);
    await expect(token.connect(signers[1]).create(1, signers[1].address, [])).revertedWith("Ownable: caller is not the owner");
  });

});
