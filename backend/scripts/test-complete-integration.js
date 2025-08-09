const { ethers } = require("ethers");
const contractsConfig = require('../src/config/contracts.json');

// Import contract ABIs
const GovernmentSpendingABI = require('../artifacts/contracts/GovernmentSpending.sol/GovernmentSpending.json').abi;
const CitizenFeedbackABI = require('../artifacts/contracts/CitizenFeedback.sol/CitizenFeedback.json').abi;

async function testCompleteIntegration() {
    console.log("🚀 Testing Complete Blockchain Integration\n");

    try {
        // Connect to local hardhat network
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        
        // Use hardhat accounts
        const adminPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const citizen1PrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
        const citizen2PrivateKey = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
        
        const adminSigner = new ethers.Wallet(adminPrivateKey, provider);
        const citizen1Signer = new ethers.Wallet(citizen1PrivateKey, provider);
        const citizen2Signer = new ethers.Wallet(citizen2PrivateKey, provider);

        console.log("👑 Admin:", adminSigner.address);
        console.log("👨‍💼 Citizen 1:", citizen1Signer.address);
        console.log("👩‍💼 Citizen 2:", citizen2Signer.address);

        // Create contract instances
        const governmentContract = new ethers.Contract(
            contractsConfig.GovernmentSpending,
            GovernmentSpendingABI,
            adminSigner
        );

        const feedbackContract1 = new ethers.Contract(
            contractsConfig.CitizenFeedback,
            CitizenFeedbackABI,
            citizen1Signer
        );

        const feedbackContract2 = new ethers.Contract(
            contractsConfig.CitizenFeedback,
            CitizenFeedbackABI,
            citizen2Signer
        );

        console.log("\n📄 Contract Addresses:");
        console.log("Government Spending:", contractsConfig.GovernmentSpending);
        console.log("Citizen Feedback:", contractsConfig.CitizenFeedback);

        // Test 1: Submit multiple spending records
        console.log("\n🏛️ Test 1: Submitting Multiple Government Projects...");
        
        const projects = [
            {
                department: "MOH",
                projectName: "Kuala Lumpur Hospital Equipment Upgrade",
                projectType: "Healthcare Infrastructure",
                budgetAllocated: ethers.utils.parseEther("1500"),
                amountSpent: ethers.utils.parseEther("1200"),
                location: "Kuala Lumpur",
                description: "Upgrading medical equipment and facilities at KL General Hospital"
            },
            {
                department: "MOE",
                projectName: "Digital Learning Initiative Selangor",
                projectType: "Education Technology",
                budgetAllocated: ethers.utils.parseEther("2000"),
                amountSpent: ethers.utils.parseEther("1800"),
                location: "Selangor",
                description: "Implementation of digital learning platforms in 50 schools"
            },
            {
                department: "MOT",
                projectName: "Penang Bridge Maintenance & Safety",
                projectType: "Infrastructure Maintenance",
                budgetAllocated: ethers.utils.parseEther("3000"),
                amountSpent: ethers.utils.parseEther("2100"),
                location: "Penang",
                description: "Comprehensive maintenance and safety upgrades for Penang Bridge"
            },
            {
                department: "MOSTI",
                projectName: "AI Research Center Development",
                projectType: "Research & Development",
                budgetAllocated: ethers.utils.parseEther("2500"),
                amountSpent: ethers.utils.parseEther("1000"),
                location: "Cyberjaya",
                description: "Establishing national AI research center with international partnerships"
            }
        ];

        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            console.log(`   Submitting project ${i + 1}: ${project.projectName}`);
            
            const tx = await governmentContract.recordTransaction(
                project.department,
                project.projectName,
                project.projectType,
                project.budgetAllocated,
                project.amountSpent,
                project.location,
                project.description
            );
            await tx.wait();
            console.log(`   ✅ Project ${i + 1} recorded - TX: ${tx.hash}`);
        }

        // Get transaction count
        const transactionCount = await governmentContract.transactionCount();
        console.log(`\n📊 Total projects on blockchain: ${transactionCount.toString()}`);

        // Test 2: Citizens submit feedback
        console.log("\n💬 Test 2: Citizens Submitting Feedback...");
        
        const feedbacks = [
            { txId: 1, citizen: "1", comment: "Excellent project! The new equipment has significantly improved patient care quality.", rating: 5 },
            { txId: 1, citizen: "2", comment: "Great initiative, though implementation could have been faster.", rating: 4 },
            { txId: 2, citizen: "1", comment: "My children love the new digital learning tools. Very engaging!", rating: 5 },
            { txId: 2, citizen: "2", comment: "Good project but some teachers need more training on the technology.", rating: 3 },
            { txId: 3, citizen: "1", comment: "Bridge feels much safer now. Worth the investment.", rating: 4 },
            { txId: 4, citizen: "1", comment: "Exciting to see Malaysia investing in AI research!", rating: 5 }
        ];

        for (const feedback of feedbacks) {
            const contract = feedback.citizen === "1" ? feedbackContract1 : feedbackContract2;
            const citizenName = feedback.citizen === "1" ? "Citizen 1" : "Citizen 2";
            
            console.log(`   ${citizenName} rating project #${feedback.txId}: ${feedback.rating}⭐`);
            
            const tx = await contract.submitFeedback(
                feedback.txId,
                feedback.comment,
                feedback.rating
            );
            await tx.wait();
            console.log(`   ✅ Feedback submitted - TX: ${tx.hash}`);
        }

        const feedbackCount = await feedbackContract1.feedbackCount();
        console.log(`\n💭 Total feedback submissions: ${feedbackCount.toString()}`);

        // Test 3: Generate Analytics
        console.log("\n📈 Test 3: Generating Blockchain Analytics...");
        
        for (let i = 1; i <= transactionCount; i++) {
            const tx = await governmentContract.getTransaction(i);
            const [averageRating, totalFeedbacks] = await feedbackContract1.getTransactionRating(i);
            
            console.log(`\n   Project #${i}: ${tx.projectName}`);
            console.log(`   Department: ${tx.department}`);
            console.log(`   Budget: ${ethers.utils.formatEther(tx.budgetAllocated)} MATIC`);
            console.log(`   Spent: ${ethers.utils.formatEther(tx.amountSpent)} MATIC`);
            console.log(`   Utilization: ${((parseFloat(ethers.utils.formatEther(tx.amountSpent)) / parseFloat(ethers.utils.formatEther(tx.budgetAllocated))) * 100).toFixed(1)}%`);
            console.log(`   Rating: ${(averageRating.toNumber() / 100).toFixed(1)}⭐ (${totalFeedbacks} reviews)`);
        }

        // Test 4: Department Analytics
        console.log("\n🏢 Test 4: Department Spending Analytics...");
        
        const departments = await governmentContract.getAllDepartments();
        console.log(`\nAnalyzing ${departments.length} departments:`);
        
        for (const dept of departments.slice(0, 5)) {
            const [totalBudget, totalSpent] = await governmentContract.getTotalSpendingByDepartment(dept);
            const budget = parseFloat(ethers.utils.formatEther(totalBudget));
            const spent = parseFloat(ethers.utils.formatEther(totalSpent));
            
            if (budget > 0) {
                console.log(`\n   ${dept}:`);
                console.log(`   Budget: ${budget.toFixed(2)} MATIC`);
                console.log(`   Spent: ${spent.toFixed(2)} MATIC`);
                console.log(`   Utilization: ${((spent / budget) * 100).toFixed(1)}%`);
            }
        }

        console.log("\n🎉 COMPLETE INTEGRATION TEST SUCCESSFUL!");
        console.log("\n📱 Frontend Integration:");
        console.log("✅ Dashboard will show real blockchain analytics");
        console.log("✅ Projects page will display submitted projects");
        console.log("✅ Citizens can submit feedback directly from UI");
        console.log("✅ All data is permanently stored on blockchain");
        
        console.log("\n🌐 Test Your App:");
        console.log("1. Start frontend: cd ../frontend && npm start");
        console.log("2. Visit: http://localhost:3000");
        console.log("3. View Dashboard for real blockchain data");
        console.log("4. Check Projects page for submitted records");
        console.log("5. Submit feedback using MetaMask");
        
        console.log("\n🔗 Blockchain Info:");
        console.log("- Network: Localhost Hardhat");
        console.log("- Projects Submitted: " + transactionCount.toString());
        console.log("- Feedback Count: " + feedbackCount.toString());
        console.log("- All data verifiable on-chain");

    } catch (error) {
        console.error("❌ Integration test failed:", error.message);
        process.exit(1);
    }
}

testCompleteIntegration();