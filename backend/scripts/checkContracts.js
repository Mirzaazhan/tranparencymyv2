const { ethers } = require("hardhat");

async function main() {
    try {
        console.log("🔍 Checking deployed contracts...");
        
        // Load contract addresses
        const contracts = require('../src/config/contracts.json');
        console.log("📋 Contract addresses:", contracts);
        
        // Get network info
        const network = await ethers.provider.getNetwork();
        console.log("🌐 Connected to network:", network.name, "Chain ID:", network.chainId);
        
        // Check if contracts exist at addresses
        const govSpendingCode = await ethers.provider.getCode(contracts.GovernmentSpending);
        const feedbackCode = await ethers.provider.getCode(contracts.CitizenFeedback);
        
        console.log("📊 GovernmentSpending contract:", 
            govSpendingCode !== '0x' ? '✅ Deployed' : '❌ Not found');
        console.log("💬 CitizenFeedback contract:", 
            feedbackCode !== '0x' ? '✅ Deployed' : '❌ Not found');
            
        if (govSpendingCode !== '0x') {
            // Try to call a view function
            const GovernmentSpending = await ethers.getContractFactory("GovernmentSpending");
            const govContract = GovernmentSpending.attach(contracts.GovernmentSpending);
            
            try {
                const count = await govContract.transactionCount();
                console.log("📈 Transaction count:", count.toString());
            } catch (error) {
                console.log("⚠️ Could not read transaction count:", error.message);
            }
        }
        
    } catch (error) {
        console.error("❌ Error checking contracts:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });