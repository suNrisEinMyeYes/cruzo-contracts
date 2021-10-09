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

describe("Cruzo", () => {
  let admin: SignerWithAddress;

  let signers: SignerWithAddress[];

  let token: Cruzo1155;

  before(async () => {
    signers = await ethers.getSigners();
    admin = signers[0];
  });

  beforeEach(async () => {
    let Token = await ethers.getContractFactory("Cruzo1155");
    token = (await Token.deploy()) as Cruzo1155;
  });

  it("Check Token Counters", async () => {

  });

  it("Create Token", async () => {});
});
