const { ethers } = require("ethers");

async function createAccountWithFaucet() {
    console.log("🆕 Creating New Account for Blockchain Testing\n");

    // Generate a random wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log("🔐 New Account Details:");
    console.log("════════════════════════════");
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    console.log("Mnemonic:", wallet.mnemonic.phrase);
    console.log("════════════════════════════");

    console.log("\n💰 Getting Test Funds from Faucets");
    console.log("═══════════════════════════════════");
    
    console.log("\n🚰 POLYGON MUMBAI TESTNET FAUCETS:");
    console.log("1. Official Polygon Faucet:");
    console.log("   🌐 https://faucet.polygon.technology/");
    console.log("   📝 Paste your address:", wallet.address);
    console.log("   💎 Get: 0.5 MATIC");
    
    console.log("\n2. Mumbai Faucet (Alternative):");
    console.log("   🌐 https://mumbaifaucet.com/");
    console.log("   📝 Paste your address:", wallet.address);
    console.log("   💎 Get: 0.2 MATIC");
    
    console.log("\n3. Alchemy Faucet:");
    console.log("   🌐 https://mumbaifaucet.alchemy.com/");
    console.log("   📝 Paste your address:", wallet.address);
    console.log("   💎 Get: 0.5 MATIC");

    console.log("\n📱 METAMASK SETUP INSTRUCTIONS:");
    console.log("═══════════════════════════════════");
    console.log("1. Open MetaMask");
    console.log("2. Click 'Import Account'");
    console.log("3. Paste this private key:", wallet.privateKey);
    console.log("4. Add Mumbai Testnet network:");
    console.log("   - Network Name: Mumbai Testnet");
    console.log("   - RPC URL: https://polygon-mumbai.g.alchemy.com/v2/demo");
    console.log("   - Chain ID: 80001");
    console.log("   - Currency Symbol: MATIC");
    console.log("   - Block Explorer: https://mumbai.polygonscan.com/");

    console.log("\n🏠 LOCAL HARDHAT NETWORK SETUP:");
    console.log("═══════════════════════════════════");
    console.log("For immediate testing (no real funds needed):");
    console.log("1. Add Localhost Network to MetaMask:");
    console.log("   - Network Name: Localhost 8545");
    console.log("   - RPC URL: http://127.0.0.1:8545");
    console.log("   - Chain ID: 31337");
    console.log("   - Currency Symbol: ETH");
    console.log("2. Import this account:", wallet.address);
    console.log("3. You'll automatically have 10,000 test ETH");

    console.log("\n🔒 SECURITY REMINDERS:");
    console.log("═══════════════════════════");
    console.log("⚠️  TESTNET ONLY - Never use this for mainnet");
    console.log("⚠️  Keep private key secure");
    console.log("⚠️  Don't share with others");
    console.log("⚠️  Use separate wallet for production");

    console.log("\n✅ NEXT STEPS:");
    console.log("══════════════");
    console.log("1. Import account to MetaMask");
    console.log("2. Get test MATIC from faucets above");
    console.log("3. Visit your app: http://localhost:3001/admin");
    console.log("4. Connect wallet and test transactions");
    
    // Create a simple .env update suggestion
    console.log("\n📄 Optional: Update .env file");
    console.log("Add this line to backend/.env:");
    console.log(`PRIVATE_KEY=${wallet.privateKey}`);

    return wallet;
}

createAccountWithFaucet();