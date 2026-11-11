const hre = require("hardhat");

async function main() {
  const [deployer, owner2, owner3] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const initialSupply = hre.ethers.parseEther("1000000"); // 1,000,000 SVT
  const rate = 100n; // 100 SVT per 1 ETH
  const owners = [deployer.address, owner2.address, owner3.address];
  const required = 2;

  const Token = await hre.ethers.getContractFactory("SafeVendorToken");
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();
  console.log("SafeVendorToken  :", token.target);

  const Treasury = await hre.ethers.getContractFactory("MultiSigTreasury");
  const treasury = await Treasury.deploy(owners, required);
  await treasury.waitForDeployment();
  console.log("MultiSigTreasury :", treasury.target);

  const Vendor = await hre.ethers.getContractFactory("TokenVendor");
  const vendor = await Vendor.deploy(token.target, treasury.target, rate);
  await vendor.waitForDeployment();
  console.log("TokenVendor      :", vendor.target);

  console.log("Transferring sale stock to the vendor...");
  const tx = await token.transfer(vendor.target, initialSupply);
  await tx.wait();
  console.log("Vendor now holds", (await token.balanceOf(vendor.target)).toString(), "SVT");

  console.log("\n--- Deployment summary ---");
  console.log("Token    :", token.target);
  console.log("Treasury :", treasury.target);
  console.log("Vendor   :", vendor.target);
  console.log("Owners   :", owners.join(", "));
  console.log("Required :", required, "of", owners.length);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
