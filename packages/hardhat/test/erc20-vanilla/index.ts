import { expect } from "chai";
import { ethers } from "hardhat";
// type defs
import { BigNumberish } from "ethers";
import { ERC20 } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type Token = {
  name: string;
  symbol: string;
  decimals: BigNumberish;
  totalSupply: BigNumberish;
};

const token = {
  name: "GDB Token",
  symbol: "GDB",
  decimals: 18,
  totalSupply: 1_000_000, //ethers.BigNumber.from(10).pow(18).mul(1_000_000), // 1 million actual tokens * (10**18)
};

export const deploy = async ({
  name,
  symbol,
  decimals,
  totalSupply,
}: Token) => {
  const factory = await ethers.getContractFactory("ERC20");
  const contract = await factory.deploy(name, symbol, decimals, totalSupply);
  await contract.deployed();

  return contract;
};

describe("ERC20", () => {
  let owner: SignerWithAddress;
  let account1: SignerWithAddress;
  let account2: SignerWithAddress;
  let contract: ERC20;

  beforeEach(async () => {
    [owner, account1, account2] = await ethers.getSigners();
    contract = await deploy(token);
  });

  describe("deployment", () => {
    it("Should assign total supply to contract owner", async () => {
      expect(await contract.name()).to.equal(token.name);
      expect(await contract.symbol()).to.equal(token.symbol);
      expect(await contract.totalSupply()).to.equal(token.totalSupply);
      expect(await contract.balanceOf(owner.address)).to.equal(
        token.totalSupply
      );
      expect(await contract.balanceOf(account1.address)).to.equal(0);
    });

    it("Should fail if token name is empty", async () => {
      await expect(deploy({ ...token, name: "" })).to.be.revertedWith(
        "ERC20: Token name must not be empty"
      );
    });

    it("Should fail if symbol name is empty", async () => {
      await expect(deploy({ ...token, symbol: "" })).to.be.revertedWith(
        "ERC20: Token symbol must not be empty"
      );
    });

    it("Should fail if decimals is greater than 18", async () => {
      // Negative decimals will never happen as expected decimal type is uint256, evm throws itself

      await expect(deploy({ ...token, decimals: 19 })).to.be.revertedWith(
        "ERC20: Token decimals must be between 0 and 18"
      );
    });

    it("Should fail if total supply is empty", async () => {
      await expect(deploy({ ...token, totalSupply: 0 })).to.be.revertedWith(
        "ERC20: Token total supply must be positive"
      );
    });
  });

  describe("transfer()", () => {
    it("Should succeed if caller has sufficient balance", async () => {
      const from = owner;
      const to = account1;
      const value = 10;

      expect(await contract.balanceOf(from.address)).to.equal(
        token.totalSupply
      );
      expect(await contract.balanceOf(to.address)).to.equal(0);

      await expect(contract.transfer(to.address, value))
        .to.emit(contract, "Transfer")
        .withArgs(from.address, to.address, value);

      expect(await contract.balanceOf(from.address)).to.equal(
        token.totalSupply - value
      );
      expect(await contract.balanceOf(to.address)).to.equal(value);
    });

    it("Should fail if to address is the zero address", async () => {
      const to = ethers.constants.AddressZero;
      const value = 10;

      await expect(contract.transfer(to, value)).to.be.revertedWith(
        "ERC20: To address can not be the zero address"
      );
    });

    it("Should fail if caller has insufficient balance", async () => {
      const from = account1;
      const to = account2;
      const value = 10;

      expect(await contract.balanceOf(from.address)).to.equal(0);
      await expect(
        contract.connect(account1).transfer(to.address, value)
      ).to.be.revertedWith("ERC20: Insufficient balance");
    });
  });

  describe("allowance()", () => {
    it("Should retrieve spender allowance", async () => {
      const from = owner;
      const spender = account1;

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        0
      );
    });
  });

  describe("approve()", () => {
    it("Should set the value the spender is allowed to withdraw", async () => {
      const from = owner;
      const spender = account1;
      const value = 10;

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        0
      );

      await expect(contract.approve(spender.address, value))
        .to.emit(contract, "Approval")
        .withArgs(from.address, spender.address, value);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        value
      );
    });
  });

  describe("transferFrom()", () => {
    it("Should allow spender to transfer value amount", async () => {
      const from = owner;
      const spender = account1;
      const to = account2;
      const allowance = 50;
      const value = 10;

      expect(await contract.balanceOf(from.address)).to.equal(
        token.totalSupply
      );
      expect(await contract.balanceOf(to.address)).to.equal(0);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        0
      );

      await expect(contract.approve(spender.address, allowance))
        .to.emit(contract, "Approval")
        .withArgs(from.address, spender.address, allowance);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        allowance
      );

      await expect(
        contract.connect(spender).transferFrom(from.address, to.address, value)
      )
        .to.emit(contract, "Transfer")
        .withArgs(from.address, to.address, value);

      expect(await contract.balanceOf(from.address)).to.equal(
        token.totalSupply - value
      );
      expect(await contract.balanceOf(to.address)).to.equal(value);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        allowance - value
      );
    });

    it("Should prevent spender to transfer a higher amount than owner's allowance", async () => {
      const from = owner;
      const spender = account1;
      const to = account2;
      const allowance = 5;
      const value = 10;

      expect(await contract.balanceOf(from.address)).to.equal(
        token.totalSupply
      );
      expect(await contract.balanceOf(to.address)).to.equal(0);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        0
      );

      await expect(contract.approve(spender.address, allowance))
        .to.emit(contract, "Approval")
        .withArgs(from.address, spender.address, allowance);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        allowance
      );

      await expect(
        contract.connect(spender).transferFrom(from.address, to.address, value)
      ).to.be.revertedWith("ERC20: Insufficient allowance");
    });

    it("Should prevent spender to transfer a higher amount than owner's balance", async () => {
      const from = owner;
      const spender = account1;
      const to = account2;
      const allowance = token.totalSupply + 2;
      const value = token.totalSupply + 1;

      expect(await contract.balanceOf(from.address)).to.equal(
        token.totalSupply
      );
      expect(await contract.balanceOf(to.address)).to.equal(0);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        0
      );

      await expect(contract.approve(spender.address, allowance))
        .to.emit(contract, "Approval")
        .withArgs(from.address, spender.address, allowance);

      expect(await contract.allowance(from.address, spender.address)).to.equal(
        allowance
      );

      await expect(
        contract.connect(spender).transferFrom(from.address, to.address, value)
      ).to.be.revertedWith("ERC20: Insufficient balance");
    });
  });
});
