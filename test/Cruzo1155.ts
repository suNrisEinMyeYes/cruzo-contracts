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
    token = (await Token.deploy("Cruzo", "CRZ", signers[5].address)) as Cruzo1155;
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
    await expect(token.connect(signers[1]).create(1, signers[1].address, [])).revertedWith("Ownable: caller is not the admin");
  });

  it("Check marketAddress approval", async () => {
    await token.create(1000, admin.address, []);
    await expect(token.connect(signers[1]).safeTransferFrom(admin.address, signers[1].address, 1, 1, [])).to.be.reverted;
    await expect(token.connect(signers[5]).safeTransferFrom(admin.address, signers[1].address, 1, 1, [])).not.to.be.reverted;
    expect(await token.balanceOf(signers[1].address, 1)).equal(1);
  });

  it("Check create function", async () => {
    await token.create(1000, signers[1].address, []);
    await token.create(1, signers[1].address, []);
    expect(await token.balanceOf(signers[1].address, 1)).equal(1000);
    expect(await token.balanceOf(signers[1].address, 2)).equal(1);
    await expect(token.connect(signers[1]).create(1, signers[1].address, [])).revertedWith("Ownable: caller is not the admin");
  });

  it("Check mintTo function", async () => {
    await token.create(1, signers[1].address, []);
    await token.create(1, signers[1].address, []);
    await token.mintTo(1, 1, signers[1].address, []);
    await token.mintTo(2, 1, signers[1].address, []);
    expect(await token.balanceOf(signers[1].address, 1)).equal(2);
    expect(await token.balanceOf(signers[1].address, 2)).equal(2);
    await expect(token.connect(signers[1]).mintTo(1, 1, signers[1].address, [])).revertedWith("Ownable: caller is not the admin");
  });

  it("Should update balance and totalSupply on burn", async () => {
    await token.create(1000, admin.address, []);
    expect(await token.totalSupply(1)).equal(1000);
    expect(await token.balanceOf(admin.address, 1)).equal(1000);
    await token.burn(admin.address, 1, 1);
    expect(await token.balanceOf(admin.address, 1)).equal(999);
    expect(await token.totalSupply(1)).equal(999);
  });

  it("Should not burn if msg.sender is not approved", async () => {
    await token.create(1000, signers[1].address, []);
    await expect(token.burn(signers[1].address, 1, 1)).to.revertedWith("ERC1155: caller is not owner nor approved");
  });

  it("Should update balance and totalSupply on burnBatch", async () => {
    await token.create(1000, admin.address, []);
    await token.create(1000, admin.address, []);
    await token.burnBatch(admin.address, [1, 2], [2, 2]);
    const batchBal = await token.balanceOfBatch([admin.address, admin.address], [1, 2]);
    expect(await token.totalSupply(1)).equal(998);
    expect(await token.totalSupply(2)).equal(998);
    expect(batchBal[0]).to.equal(998);
    expect(batchBal[1]).to.equal(998);
  });
});
