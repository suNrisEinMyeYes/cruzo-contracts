import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Cruzo1155 } from "../typechain/Cruzo1155";
import { CruzoMarket } from "../typechain/CruzoMarket";

describe("CruzoMarket", () => {
  let market: CruzoMarket;
  let token: Cruzo1155;

  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;

  const serviceFee = 300;

  beforeEach(async () => {
    const CruzoMarket = await ethers.getContractFactory("CruzoMarket");
    const Cruzo1155 = await ethers.getContractFactory("Cruzo1155");

    market = await CruzoMarket.deploy(serviceFee);
    await market.deployed();

    token = await Cruzo1155.deploy("baseURI", market.address);
    await token.deployed();

    [seller, buyer] = await ethers.getSigners();
  });

  describe("openTrade", () => {
    it("Should Open Trade", async () => {
      const tokenId = ethers.BigNumber.from("1");
      const supply = ethers.BigNumber.from("100");
      const tradeAmount = ethers.BigNumber.from("10");
      const price = ethers.utils.parseEther("0.01");

      expect(await token.create(supply, seller.address, "", []));

      await expect(market.openTrade(token.address, tokenId, tradeAmount, price))
        .emit(market, "TradeOpened")
        .withArgs(token.address, tokenId, seller.address, tradeAmount, price);

      expect(await token.balanceOf(seller.address, tokenId)).eq(
        supply.sub(tradeAmount)
      );
      expect(await token.balanceOf(market.address, tokenId)).eq(tradeAmount);

      const trade = await market.trades(token.address, tokenId, seller.address);
      expect(trade.price).eq(price);
      expect(trade.amount).eq(tradeAmount);
    });

    // TODO: add negative test cases: "Trade is already open", ...
  });

  describe("executeTrade", () => {
    it("Should Execute Trade", async () => {
      const tokenId = ethers.BigNumber.from("1");
      const supply = ethers.BigNumber.from("100");
      const tradeAmount = ethers.BigNumber.from("10");
      const price = ethers.utils.parseEther("0.01");

      const purchaseAmount = ethers.BigNumber.from("5");
      const purchaseValue = price.mul(purchaseAmount);
      const serviceFeeValue = purchaseValue.mul(serviceFee).div(10000);

      expect(await  token.create(supply, seller.address, "", []));

      expect(
        await market.openTrade(token.address, tokenId, tradeAmount, price)
      );

      expect(await token.balanceOf(buyer.address, tokenId)).eq(0);

      const sellerBalance = await ethers.provider.getBalance(seller.address);

      await expect(
        market
          .connect(buyer)
          .executeTrade(
            token.address,
            tokenId,
            seller.address,
            purchaseAmount,
            {
              value: purchaseValue,
            }
          )
      )
        .emit(market, "TradeExecuted")
        .withArgs(
          token.address,
          tokenId,
          seller.address,
          buyer.address,
          purchaseAmount
        );

      expect(await token.balanceOf(buyer.address, tokenId)).eq(purchaseAmount);
      expect(await token.balanceOf(market.address, tokenId)).eq(
        tradeAmount.sub(purchaseAmount)
      );

      expect(sellerBalance.add(purchaseValue).sub(serviceFeeValue)).eq(
        await ethers.provider.getBalance(seller.address)
      );
    });

    // TODO: add negative test cases: "Amount must be greater than 0", "Not enough items in trade", ...
  });

  describe("closeTrade", () => {
    it("Should Close Trade", async () => {
      const tokenId = ethers.BigNumber.from("1");
      const supply = ethers.BigNumber.from("100");
      const tradeAmount = ethers.BigNumber.from("10");
      const price = ethers.utils.parseEther("0.01");

      expect(await token.create(supply, seller.address, "", []));

      expect(await market.openTrade(token.address, tokenId, tradeAmount, price));

      let trade = await market.trades(token.address, tokenId, seller.address);
      expect(trade.price).eq(price);
      expect(trade.amount).eq(tradeAmount);

      expect(await token.balanceOf(seller.address, tokenId)).eq(
        supply.sub(tradeAmount)
      );

      await expect(market.closeTrade(token.address, tokenId))
        .emit(market, "TradeClosed")
        .withArgs(token.address, tokenId, seller.address);

      trade = await market.trades(token.address, tokenId, seller.address);
      expect(trade.price).eq(0);
      expect(trade.amount).eq(0);

      expect(await token.balanceOf(seller.address, tokenId)).eq(supply);
    });

    // TODO: add negative test cases: "Trade is not open", ...
  });
});
