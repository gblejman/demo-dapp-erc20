import { ethers } from "hardhat";

async function main() {
  const tokenAddress = "0xa45183513F9EbB4092434a69Bb6c4aE884CF9702";
  const drip = ethers.BigNumber.from(10).pow(18).mul(1);
  const factory = await ethers.getContractFactory("ERC20Faucet");
  const contract = await factory.deploy(tokenAddress, drip);

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
