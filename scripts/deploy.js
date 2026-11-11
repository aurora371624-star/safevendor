const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const initialSupply = ethers.parseEther("1000000"); // 1,000,000 SVT
  const rate = 100n; // 100 SVT per 1 ETH
  const required = 2;

  let deployer;
  let owners;

  if (process.env.PRIVATE_KEY) {
    // Real-network deploy: one key pays gas, two extra owners are generated for the demo.
    deployer = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
    const o2 = ethers.Wallet.createRandom();
    const o3 = ethers.Wallet.createRandom();
    owners = [deployer.address, o2.address, o3.address];
    console.log("\n=== 3 owners (for the 2-of-3 multisig) ===");
    console.log("Owner1 (you, deploys) :", deployer.address);
    console.log("Owner2 address        :", o2.address);
    console.log("Owner2 PRIVATE KEY    :", o2.privateKey);
    console.log("Owner3 address        :", o3.address);
    console.log("Owner3 PRIVATE KEY    :", o3.privateKey);
    console.log("Give Owner2/Owner3 keys to teammates B and C to import in MetaMask.\n");
  } else {
    const [d, o2, o3] = await ethers.getSigners();
    deployer = d;
    owners = [d.address, o2.address, o3.address];
  }

  console.log("Deploying with account:", deployer.address);

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
