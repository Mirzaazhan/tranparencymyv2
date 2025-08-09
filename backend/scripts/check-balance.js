const { ethers } = require("ethers");
require("dotenv").config();

async function checkBalance() {
    try {
        // Connect to Mumbai testnet
        const provider = new ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
        
        // Create wallet instance
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        console.log("=== Wallet Balance Check ===\n");
        console.log("Wallet Address:", wallet.address);
        console.log("Network: Mumbai Testnet");
        
        // Get balance
        const balance = await provider.getBalance(wallet.address);
        const balanceInMatic = ethers.utils.formatEther(balance);
        
        console.log("Balance:", balanceInMatic, "MATIC");
        
        if (parseFloat(balanceInMatic) < 0.1) {
            console.log("\n❌ Insufficient balance for deployment!");
            console.log("📝 Get test MATIC from:");
            console.log("🚰 https://faucet.polygon.technology/");
            console.log("🚰 https://mumbaifaucet.com/");
            console.log("\nYour address:", wallet.address);
            console.log("Need at least 0.1 MATIC for deployment");
        } else {
            console.log("\n✅ Sufficient balance for deployment!");
            console.log("Ready to deploy contracts");
        }
        
    } catch (error) {
        console.error("Error checking balance:", error.message);
    }
}

checkBalance();