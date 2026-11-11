const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SafeVendor (Token Vendor + MultiSig Treasury)", function () {
  let token, vendor, treasury;
  let owner1, owner2, owner3, buyer, attacker;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1,000,000 SVT
  const RATE = 100n; // 100 SVT per 1 ETH

  beforeEach(async function () {
    [owner1, owner2, owner3, buyer, attacker] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("SafeVendorToken");
    token = await Token.deploy(INITIAL_SUPPLY);

    const Treasury = await ethers.getContractFactory("MultiSigTreasury");
    treasury = await Treasury.deploy(
      [owner1.address, owner2.address, owner3.address],
      2
    );

    const Vendor = await ethers.getContractFactory("TokenVendor");
    vendor = await Vendor.deploy(token.target, treasury.target, RATE);

    // Deployer holds the whole supply; move the sale stock into the vendor.
    await token.transfer(vendor.target, INITIAL_SUPPLY);
  });

  describe("TokenVendor", function () {
    it("sells tokens at the fixed rate and forwards ETH to the treasury", async function () {
      const eth = ethers.parseEther("1");
      const treasuryBefore = await ethers.provider.getBalance(treasury.target);
      const buyerBefore = await token.balanceOf(buyer.address);

      await vendor.connect(buyer).buyTokens({ value: eth });

      const expected = eth * RATE; // 1 ETH -> 100 SVT
      expect(await token.balanceOf(buyer.address)).to.equal(buyerBefore + expected);
      expect(await ethers.provider.getBalance(treasury.target)).to.equal(
        treasuryBefore + eth
      );
    });

    it("rejects a zero-ETH purchase", async function () {
      await expect(
        vendor.connect(buyer).buyTokens({ value: 0 })
      ).to.be.revertedWith("Vendor: send ETH");
    });

    it("rejects when the vendor runs out of stock", async function () {
      // attacker buys almost everything (9999 ETH -> 999900 SVT), leaving 100 SVT.
      await vendor.connect(attacker).buyTokens({ value: ethers.parseEther("9999") });
      expect(await token.balanceOf(vendor.target)).to.equal(ethers.parseEther("100"));

      // buyer tries to buy 2 ETH (= 200 SVT) but only 100 SVT remain.
      await expect(
        vendor.connect(buyer).buyTokens({ value: ethers.parseEther("2") })
      ).to.be.revertedWith("Vendor: not enough tokens");
    });
  });

  describe("MultiSigTreasury (2-of-3)", function () {
    it("submit auto-confirms, then confirm + execute moves funds", async function () {
      await owner1.sendTransaction({
        to: treasury.target,
        value: ethers.parseEther("10"),
      });

      await treasury
        .connect(owner1)
        .submitTransaction(owner1.address, ethers.parseEther("1"), "0x");
      expect((await treasury.transactions(0)).confirmations).to.equal(1n);

      // One confirmation is not enough to execute.
      await expect(
        treasury.connect(owner1).executeTransaction(0)
      ).to.be.revertedWith("Treasury: not enough confirmations");

      await treasury.connect(owner2).confirmTransaction(0);
      expect((await treasury.transactions(0)).confirmations).to.equal(2n);

      await treasury.connect(owner2).executeTransaction(0);
      expect((await treasury.transactions(0)).executed).to.equal(true);
      expect(await ethers.provider.getBalance(treasury.target)).to.equal(
        ethers.parseEther("9")
      );
    });

    it("rejects a double confirmation by the same owner", async function () {
      await owner1.sendTransaction({
        to: treasury.target,
        value: ethers.parseEther("1"),
      });
      await treasury
        .connect(owner1)
        .submitTransaction(owner1.address, ethers.parseEther("1"), "0x");
      await expect(
        treasury.connect(owner1).confirmTransaction(0)
      ).to.be.revertedWith("Treasury: already confirmed");
    });

    it("rejects re-execution of an already executed transaction", async function () {
      await owner1.sendTransaction({
        to: treasury.target,
        value: ethers.parseEther("1"),
      });
      await treasury
        .connect(owner1)
        .submitTransaction(owner1.address, ethers.parseEther("1"), "0x");
      await treasury.connect(owner2).confirmTransaction(0);
      await treasury.connect(owner1).executeTransaction(0);

      await expect(
        treasury.connect(owner1).executeTransaction(0)
      ).to.be.revertedWith("Treasury: tx already executed");
    });

    it("rejects non-owner submit and confirm", async function () {
      await expect(
        treasury.connect(attacker).submitTransaction(attacker.address, 1, "0x")
      ).to.be.revertedWith("Treasury: not an owner");

      await owner1.sendTransaction({
        to: treasury.target,
        value: ethers.parseEther("1"),
      });
      await treasury
        .connect(owner1)
        .submitTransaction(owner1.address, ethers.parseEther("1"), "0x");
      await expect(
        treasury.connect(attacker).confirmTransaction(0)
      ).to.be.revertedWith("Treasury: not an owner");
    });

    it("rejects execute when the treasury balance is insufficient", async function () {
      await treasury
        .connect(owner1)
        .submitTransaction(owner1.address, ethers.parseEther("5"), "0x");
      await treasury.connect(owner2).confirmTransaction(0);
      await expect(
        treasury.connect(owner1).executeTransaction(0)
      ).to.be.revertedWith("Treasury: insufficient balance");
    });

    it("supports revoking a confirmation", async function () {
      await owner1.sendTransaction({
        to: treasury.target,
        value: ethers.parseEther("1"),
      });
      await treasury
        .connect(owner1)
        .submitTransaction(owner1.address, ethers.parseEther("1"), "0x");
      await treasury.connect(owner2).confirmTransaction(0);
      await treasury.connect(owner2).revokeConfirmation(0);
      expect((await treasury.transactions(0)).confirmations).to.equal(1n);
    });
  });
});
