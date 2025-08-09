const { ethers } = require("ethers");

console.log("=== Blockchain Wallet Setup ===\n");

// Generate a random wallet
const wallet = ethers.Wallet.createRandom();

console.log("🔐 New wallet generated for testing:");
console.log("Address:", wallet.address);
console.log("Private Key:", wallet.privateKey);
console.log("Mnemonic:", wallet.mnemonic.phrase);

console.log("\n📝 Next steps:");
console.log("1. Copy the private key above");
console.log("2. Update your .env file: PRIVATE_KEY=" + wallet.privateKey);
console.log("3. Go to https://faucet.polygon.technology/ to get test MATIC");
console.log("4. Use the address above to receive test MATIC");
console.log("5. Save the mnemonic phrase securely (for wallet import)");

console.log("\n⚠️  SECURITY WARNING:");
console.log("- This is for TESTNET ONLY");
console.log("- Never share your private key");
console.log("- Use a separate wallet for production");