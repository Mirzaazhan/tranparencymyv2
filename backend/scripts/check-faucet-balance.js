const { ethers } = require("ethers");

async function checkFaucetBalance() {
    const testAddress = "0x0d9568f9e93e988b5B627c2530aCc04F43A58BDf";
    
    console.log("💰 Checking Faucet Balance for:", testAddress);
    console.log("═══════════════════════════════════════════════════\n");

    // Check Mumbai testnet balance
    try {
        console.log("🔍 Checking Mumbai Testnet...");
        const mumbaiProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/demo");
        const mumbaiBalance = await mumbaiProvider.getBalance(testAddress);
        const mumbaiBalanceMatic = ethers.utils.formatEther(mumbaiBalance);
        
        console.log("🏦 Mumbai Balance:", mumbaiBalanceMatic, "MATIC");
        
        if (parseFloat(mumbaiBalanceMatic) > 0) {
            console.log("✅ Mumbai: Funds received! Ready for testnet transactions");
        } else {
            console.log("❌ Mumbai: No funds yet. Try the faucets:");
            console.log("   🚰 https://faucet.polygon.technology/");
            console.log("   🚰 https://mumbaifaucet.com/");
        }
    } catch (error) {
        console.log("❌ Mumbai: Network error -", error.message);
    }

    console.log("\n" + "═".repeat(50));

    // Check localhost balance
    try {
        console.log("🔍 Checking Localhost Network...");
        const localProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        const localBalance = await localProvider.getBalance(testAddress);
        const localBalanceEth = ethers.utils.formatEther(localBalance);
        
        console.log("🏠 Localhost Balance:", localBalanceEth, "ETH");
        
        if (parseFloat(localBalanceEth) > 0) {
            console.log("✅ Localhost: Ready for local testing");
        } else {
            console.log("ℹ️  Localhost: Import account to MetaMask to get 10,000 test ETH");
        }
    } catch (error) {
        console.log("❌ Localhost: Network not running or connection error");
        console.log("   💡 Make sure 'npx hardhat node' is running");
    }

    console.log("\n📋 ACCOUNT SUMMARY:");
    console.log("═══════════════════");
    console.log("Address:", testAddress);
    console.log("Private Key: 0x4614db56ae854979750ba963351bc453f352870c9ba70f954310cf5fdcd955ca");
    console.log("\n💡 Tips:");
    console.log("- Use Mumbai for real testnet experience");
    console.log("- Use Localhost for instant testing");
    console.log("- Both networks work with your transparency app");
}

// Run every 30 seconds to monitor faucet deposits
async function monitorFaucet() {
    await checkFaucetBalance();
    
    console.log("\n🔄 Checking again in 30 seconds... (Ctrl+C to stop)");
    setTimeout(monitorFaucet, 30000);
}

// Check if we want to monitor continuously
const args = process.argv.slice(2);
if (args.includes('--monitor')) {
    console.log("🔄 Starting faucet balance monitor...\n");
    monitorFaucet();
} else {
    checkFaucetBalance();
}