const hre = require("hardhat");

async function main() {
  console.log("Deploying GovernmentSpending and CitizenFeedback contracts...");

  // Deploy GovernmentSpending contract
  const GovernmentSpending = await hre.ethers.getContractFactory("GovernmentSpending");
  const governmentSpending = await GovernmentSpending.deploy();
  await governmentSpending.deployed();

  console.log("GovernmentSpending contract deployed to:", governmentSpending.address);

  // Deploy CitizenFeedback contract
  const CitizenFeedback = await hre.ethers.getContractFactory("CitizenFeedback");
  const citizenFeedback = await CitizenFeedback.deploy();
  await citizenFeedback.deployed();

  console.log("CitizenFeedback contract deployed to:", citizenFeedback.address);

  // Save contract addresses and ABIs
  const fs = require("fs");
  const contractAddresses = {
    GovernmentSpending: governmentSpending.address,
    CitizenFeedback: citizenFeedback.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "./src/config/contracts.json",
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("Contract addresses saved to src/config/contracts.json");

  // Verify contracts on Polygonscan (if on mainnet or testnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await governmentSpending.deployTransaction.wait(5);
    await citizenFeedback.deployTransaction.wait(5);

    try {
      await hre.run("verify:verify", {
        address: governmentSpending.address,
        constructorArguments: [],
      });
      console.log("GovernmentSpending contract verified on Polygonscan");
    } catch (error) {
      console.log("Error verifying GovernmentSpending contract:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: citizenFeedback.address,
        constructorArguments: [],
      });
      console.log("CitizenFeedback contract verified on Polygonscan");
    } catch (error) {
      console.log("Error verifying CitizenFeedback contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });