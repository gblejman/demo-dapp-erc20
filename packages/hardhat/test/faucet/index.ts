import { expect } from "chai";
import { ethers } from "hardhat";
// type defs
import { ERC20, ERC20Faucet } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const token = {
  name: "Token",
  symbol: "T",
  decimals: 18,
  totalSupply: 1_000_000,
};

const deployERC20 = async () => {
  const factory = await ethers.getContractFactory("ERC20");
  const contract = await factory.deploy(
    token.name,
    token.symbol,
    token.decimals,
    token.totalSupply
  );
  await contract.deployed();

  return contract;
};

const deployERC20Faucet = async ({
  token,
  drip,
}: {
  token: string;
  drip: number;
}) => {
  const factory = await ethers.getContractFactory("ERC20Faucet");
  const contract = await factory.deploy(token, drip);
  await contract.deployed();

  return contract;
};

describe("ERC20Faucet", () => {
  let owner: SignerWithAddress;
  let account1: SignerWithAddress;
  let tokenContract: ERC20;
  let faucetContract: ERC20Faucet;
  let drip = 1;

  beforeEach(async () => {
    [owner, account1] = await ethers.getSigners();

    tokenContract = await deployERC20();
    faucetContract = await deployERC20Faucet({
      token: tokenContract.address,
      drip: 1,
    });
  });

  describe("deployment", () => {
    it("Should assign the correct underlying token contract address and drip", async () => {
      console.log("await contract.drip()", await faucetContract.drip());
      expect(await faucetContract.token()).to.equal(tokenContract.address);
      expect(await faucetContract.drip()).to.equal(drip);
    });

    it("Should fail if token address is the zero address", async () => {
      await expect(
        deployERC20Faucet({ token: ethers.constants.AddressZero, drip })
      ).to.be.revertedWith(
        "ERC20Faucet: Token address can not be the zero address"
      );
    });

    it("Should fail if drip is 0", async () => {
      await expect(
        deployERC20Faucet({ token: tokenContract.address, drip: 0 })
      ).to.be.revertedWith("ERC20Faucet: Drip must be positive");
    });
  });

  describe("request()", () => {
    it("Should succeed if faucet has sufficient balance", async () => {
      const value = 1000;

      expect(await tokenContract.balanceOf(faucetContract.address)).to.equal(0);
      expect(await tokenContract.balanceOf(account1.address)).to.equal(0);

      await tokenContract.transfer(faucetContract.address, value);

      expect(await tokenContract.balanceOf(faucetContract.address)).to.equal(
        value
      );

      expect(await faucetContract.connect(account1).request())
        .to.emit(tokenContract, "Transfer")
        .withArgs(faucetContract.address, account1.address, drip);

      expect(await tokenContract.balanceOf(faucetContract.address)).to.equal(
        value - drip
      );
      expect(await tokenContract.balanceOf(account1.address)).to.equal(drip);
    });

    it("Should fail if faucet has insufficient balance", async () => {
      expect(await tokenContract.balanceOf(faucetContract.address)).to.equal(0);
      expect(await tokenContract.balanceOf(account1.address)).to.equal(0);

      await expect(
        faucetContract.connect(account1).request()
      ).to.be.revertedWith("ERC20: Insufficient balance");
    });

    it("Should fail if not 1 minute has passed since last request", async () => {
      const value = 1000;

      expect(await tokenContract.balanceOf(faucetContract.address)).to.equal(0);
      expect(await tokenContract.balanceOf(account1.address)).to.equal(0);

      await tokenContract.transfer(faucetContract.address, value);

      // 1st request should pass
      expect(await faucetContract.connect(account1).request())
        .to.emit(tokenContract, "Transfer")
        .withArgs(faucetContract.address, account1.address, drip);

      // 2nd immediate request should fail
      await expect(
        faucetContract.connect(account1).request()
      ).to.be.revertedWith("ERC20Faucet: Wait 1 minute");
    });

    it("Should succeed if more than 1 minute has passed since last request", async () => {
      const value = 1000;

      expect(await tokenContract.balanceOf(faucetContract.address)).to.equal(0);
      expect(await tokenContract.balanceOf(account1.address)).to.equal(0);

      await tokenContract.transfer(faucetContract.address, value);

      // 1st request should pass
      expect(await faucetContract.connect(account1).request())
        .to.emit(tokenContract, "Transfer")
        .withArgs(faucetContract.address, account1.address, drip);

      await increaseTime(60 + 1);

      // 2nd request should pass after 1 minute
      expect(await faucetContract.connect(account1).request())
        .to.emit(tokenContract, "Transfer")
        .withArgs(faucetContract.address, account1.address, drip);
    });
  });
});

/**
 * Adds number of seconds to the latest block
 * TODO: research proper block.timestamp advancement test tools, not sure if this affects the next test run globally
 * @param seconds the number of seconds to advance in time
 */
const increaseTime = async (seconds: number): Promise<void> => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
};
