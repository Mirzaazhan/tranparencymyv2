const { ethers } = require("ethers");
const contractsConfig = require('../src/config/contracts.json');

// Import contract ABIs
const GovernmentSpendingABI = require('../artifacts/contracts/GovernmentSpending.sol/GovernmentSpending.json').abi;
const CitizenFeedbackABI = require('../artifacts/contracts/CitizenFeedback.sol/CitizenFeedback.json').abi;

async function testBlockchainFunctionality() {
    console.log("🧪 Testing Blockchain Functionality...\n");

    try {
        // Connect to local hardhat network
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        
        // Use first hardhat account as admin
        const adminPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const adminSigner = new ethers.Wallet(adminPrivateKey, provider);
        
        // Use second hardhat account as citizen
        const citizenPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
        const citizenSigner = new ethers.Wallet(citizenPrivateKey, provider);

        console.log("👑 Admin Address:", adminSigner.address);
        console.log("👨‍💼 Citizen Address:", citizenSigner.address);

        // Create contract instances
        const governmentSpendingContract = new ethers.Contract(
            contractsConfig.GovernmentSpending,
            GovernmentSpendingABI,
            adminSigner
        );

        const citizenFeedbackContract = new ethers.Contract(
            contractsConfig.CitizenFeedback,
            CitizenFeedbackABI,
            citizenSigner
        );

        console.log("\n📄 Contract Addresses:");
        console.log("Government Spending:", contractsConfig.GovernmentSpending);
        console.log("Citizen Feedback:", contractsConfig.CitizenFeedback);

        // Test 1: Record a government spending transaction
        console.log("\n🏛️ Test 1: Recording Government Spending Transaction...");
        const txData = {
            department: "MOH",
            projectName: "Test Hospital Equipment Purchase",
            projectType: "Healthcare Infrastructure",
            budgetAllocated: ethers.utils.parseEther("1000"),
            amountSpent: ethers.utils.parseEther("750"),
            location: "Kuala Lumpur",
            description: "Purchase of medical equipment for public hospital"
        };

        const recordTx = await governmentSpendingContract.recordTransaction(
            txData.department,
            txData.projectName,
            txData.projectType,
            txData.budgetAllocated,
            txData.amountSpent,
            txData.location,
            txData.description
        );

        await recordTx.wait();
        console.log("✅ Transaction recorded! Hash:", recordTx.hash);

        // Get transaction count
        const transactionCount = await governmentSpendingContract.transactionCount();
        console.log("📊 Total transactions:", transactionCount.toString());

        // Get the recorded transaction
        const recordedTx = await governmentSpendingContract.getTransaction(1);
        console.log("📋 Retrieved transaction:");
        console.log("  - Project:", recordedTx.projectName);
        console.log("  - Department:", recordedTx.department);
        console.log("  - Budget:", ethers.utils.formatEther(recordedTx.budgetAllocated), "ETH");
        console.log("  - Spent:", ethers.utils.formatEther(recordedTx.amountSpent), "ETH");

        // Test 2: Submit citizen feedback
        console.log("\n💬 Test 2: Submitting Citizen Feedback...");
        const feedbackTx = await citizenFeedbackContract.submitFeedback(
            1, // transaction ID
            "Great project! The hospital equipment has improved patient care significantly.",
            5 // 5-star rating
        );

        await feedbackTx.wait();
        console.log("✅ Feedback submitted! Hash:", feedbackTx.hash);

        // Get feedback count
        const feedbackCount = await citizenFeedbackContract.feedbackCount();
        console.log("💭 Total feedbacks:", feedbackCount.toString());

        // Get the submitted feedback
        const feedback = await citizenFeedbackContract.getFeedback(1);
        console.log("📝 Retrieved feedback:");
        console.log("  - Comment:", feedback.comment);
        console.log("  - Rating:", feedback.rating, "stars");
        console.log("  - Citizen:", feedback.citizen);

        // Get transaction rating
        const rating = await citizenFeedbackContract.getTransactionRating(1);
        console.log("⭐ Transaction rating:", (rating.averageRating / 100).toFixed(2), "out of 5");
        console.log("📊 Total feedback count:", rating.totalFeedbacks.toString());

        // Test 3: Get departments
        console.log("\n🏢 Test 3: Retrieving Departments...");
        const departments = await governmentSpendingContract.getAllDepartments();
        console.log("📋 Available departments:", departments.slice(0, 3), "... (and more)");

        // Test 4: Get department spending
        console.log("\n💰 Test 4: Department Spending Analytics...");
        const mohSpending = await governmentSpendingContract.getTotalSpendingByDepartment("MOH");
        console.log("🏥 MOH Spending:");
        console.log("  - Total Budget:", ethers.utils.formatEther(mohSpending.totalBudget), "ETH");
        console.log("  - Total Spent:", ethers.utils.formatEther(mohSpending.totalSpent), "ETH");

        console.log("\n🎉 All tests passed! Blockchain functionality is working correctly.");
        console.log("\n📱 Frontend URLs:");
        console.log("- Admin Interface: http://localhost:3001/admin");
        console.log("- Feedback Interface: http://localhost:3001/feedback");
        console.log("- Dashboard: http://localhost:3001");

        console.log("\n🦊 MetaMask Setup:");
        console.log("1. Network: Localhost 8545");
        console.log("2. RPC URL: http://127.0.0.1:8545");
        console.log("3. Chain ID: 31337");
        console.log("4. Import account with private key:", adminPrivateKey);
        console.log("   (This account has admin permissions)");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        process.exit(1);
    }
}

testBlockchainFunctionality();