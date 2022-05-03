import { ethers } from "hardhat";

async function main() {
  const name = "GDB Vanilla";
  const symbol = "GDBV";
  const decimals = 18;
  const totalSupply = ethers.BigNumber.from(10).pow(18).mul(1_000_000); // 1 million actual tokens * (10**18)

  const factory = await ethers.getContractFactory("ERC20");
  const contract = await factory.deploy(name, symbol, decimals, totalSupply);

  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
