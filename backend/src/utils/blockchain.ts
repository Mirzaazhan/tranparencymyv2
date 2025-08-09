import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export class BlockchainService {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  private governmentSpendingContract: ethers.Contract | null = null;
  private citizenFeedbackContract: ethers.Contract | null = null;

  constructor() {
    // Initialize provider
    const rpcUrl = process.env.NODE_ENV === 'development' 
      ? 'http://127.0.0.1:8545'  // Use local hardhat network for development
      : process.env.MUMBAI_RPC_URL || 'https://polygon-mumbai.g.alchemy.com/v2/demo';
      
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // Initialize signer if private key is provided
    if (process.env.PRIVATE_KEY) {
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    }

    this.initializeContracts();
  }

  private async initializeContracts() {
    try {
      // Load contract addresses and ABIs
      const contractAddresses = await import('../config/contracts.json');
      const governmentSpendingABI = await import('../../artifacts/contracts/GovernmentSpending.sol/GovernmentSpending.json');
      const citizenFeedbackABI = await import('../../artifacts/contracts/CitizenFeedback.sol/CitizenFeedback.json');

      if (this.signer) {
        this.governmentSpendingContract = new ethers.Contract(
          contractAddresses.GovernmentSpending,
          governmentSpendingABI.abi,
          this.signer
        );

        this.citizenFeedbackContract = new ethers.Contract(
          contractAddresses.CitizenFeedback,
          citizenFeedbackABI.abi,
          this.signer
        );
      }
    } catch (error) {
      console.warn('Contract initialization failed. Make sure contracts are deployed.');
    }
  }

  async getTransactions(limit: number = 100, offset: number = 0) {
    if (!this.governmentSpendingContract) {
      throw new Error('Government spending contract not initialized');
    }

    try {
      const transactionCount = await this.governmentSpendingContract.transactionCount();
      const transactions = [];

      const start = Math.max(1, transactionCount.toNumber() - offset - limit + 1);
      const end = Math.min(transactionCount.toNumber(), transactionCount.toNumber() - offset);

      for (let i = end; i >= start; i--) {
        const tx = await this.governmentSpendingContract.getTransaction(i);
        if (tx.isActive) {
          transactions.push({
            id: tx.id.toString(),
            department: tx.department,
            projectName: tx.projectName,
            projectType: tx.projectType,
            budgetAllocated: ethers.utils.formatEther(tx.budgetAllocated),
            amountSpent: ethers.utils.formatEther(tx.amountSpent),
            location: tx.location,
            description: tx.description,
            timestamp: new Date(tx.timestamp.toNumber() * 1000),
            recordedBy: tx.recordedBy
          });
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(id: number) {
    if (!this.governmentSpendingContract) {
      throw new Error('Government spending contract not initialized');
    }

    try {
      const tx = await this.governmentSpendingContract.getTransaction(id);
      
      return {
        id: tx.id.toString(),
        department: tx.department,
        projectName: tx.projectName,
        projectType: tx.projectType,
        budgetAllocated: ethers.utils.formatEther(tx.budgetAllocated),
        amountSpent: ethers.utils.formatEther(tx.amountSpent),
        location: tx.location,
        description: tx.description,
        timestamp: new Date(tx.timestamp.toNumber() * 1000),
        recordedBy: tx.recordedBy,
        isActive: tx.isActive
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async recordTransaction(transactionData: {
    department: string;
    projectName: string;
    projectType: string;
    budgetAllocated: string;
    amountSpent: string;
    location: string;
    description: string;
  }) {
    if (!this.governmentSpendingContract) {
      throw new Error('Government spending contract not initialized');
    }

    try {
      const tx = await this.governmentSpendingContract.recordTransaction(
        transactionData.department,
        transactionData.projectName,
        transactionData.projectType,
        ethers.utils.parseEther(transactionData.budgetAllocated),
        ethers.utils.parseEther(transactionData.amountSpent),
        transactionData.location,
        transactionData.description
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  }

  async getDepartments() {
    if (!this.governmentSpendingContract) {
      throw new Error('Government spending contract not initialized');
    }

    try {
      const departmentIds = await this.governmentSpendingContract.getAllDepartments();
      const departments = [];

      for (const id of departmentIds) {
        const dept = await this.governmentSpendingContract.getDepartment(id);
        if (dept.isActive) {
          departments.push({
            id,
            name: dept.name,
            nameMs: dept.nameMs,
            isActive: dept.isActive
          });
        }
      }

      return departments;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  async getDepartmentSpending(departmentId: string) {
    if (!this.governmentSpendingContract) {
      throw new Error('Government spending contract not initialized');
    }

    try {
      const [totalBudget, totalSpent] = await this.governmentSpendingContract.getTotalSpendingByDepartment(departmentId);
      
      return {
        department: departmentId,
        totalBudget: ethers.utils.formatEther(totalBudget),
        totalSpent: ethers.utils.formatEther(totalSpent),
        utilizationRate: totalBudget.gt(0) ? (totalSpent.mul(100).div(totalBudget)).toNumber() : 0
      };
    } catch (error) {
      console.error('Error fetching department spending:', error);
      throw error;
    }
  }

  async submitFeedback(transactionId: number, comment: string, rating: number) {
    if (!this.citizenFeedbackContract) {
      throw new Error('Citizen feedback contract not initialized');
    }

    try {
      const tx = await this.citizenFeedbackContract.submitFeedback(
        transactionId,
        comment,
        rating
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getTransactionFeedbacks(transactionId: number) {
    if (!this.citizenFeedbackContract) {
      throw new Error('Citizen feedback contract not initialized');
    }

    try {
      const feedbackIds = await this.citizenFeedbackContract.getTransactionFeedbacks(transactionId);
      const feedbacks = [];

      for (const id of feedbackIds) {
        const feedback = await this.citizenFeedbackContract.getFeedback(id.toNumber());
        if (feedback.isActive) {
          feedbacks.push({
            id: feedback.id.toString(),
            transactionId: feedback.transactionId.toString(),
            citizen: feedback.citizen,
            comment: feedback.comment,
            rating: feedback.rating,
            timestamp: new Date(feedback.timestamp.toNumber() * 1000)
          });
        }
      }

      return feedbacks;
    } catch (error) {
      console.error('Error fetching transaction feedbacks:', error);
      throw error;
    }
  }

  async getTransactionRating(transactionId: number) {
    if (!this.citizenFeedbackContract) {
      throw new Error('Citizen feedback contract not initialized');
    }

    try {
      const [averageRating, totalFeedbacks] = await this.citizenFeedbackContract.getTransactionRating(transactionId);
      
      return {
        averageRating: averageRating.toNumber() / 100, // Convert from percentage back to decimal
        totalFeedbacks: totalFeedbacks.toNumber()
      };
    } catch (error) {
      console.error('Error fetching transaction rating:', error);
      throw error;
    }
  }

  // Create a signer with any private key (for client transactions)
  createSigner(privateKey: string) {
    return new ethers.Wallet(privateKey, this.provider);
  }

  // Record transaction with custom signer
  async recordTransactionWithSigner(signer: ethers.Signer, transactionData: {
    department: string;
    projectName: string;
    projectType: string;
    budgetAllocated: string;
    amountSpent: string;
    location: string;
    description: string;
  }) {
    try {
      // Load contract addresses and ABIs
      const contractAddresses = await import('../config/contracts.json');
      const governmentSpendingABI = await import('../../artifacts/contracts/GovernmentSpending.sol/GovernmentSpending.json');

      const contract = new ethers.Contract(
        contractAddresses.GovernmentSpending,
        governmentSpendingABI.abi,
        signer
      );

      const tx = await contract.recordTransaction(
        transactionData.department,
        transactionData.projectName,
        transactionData.projectType,
        ethers.utils.parseEther(transactionData.budgetAllocated),
        ethers.utils.parseEther(transactionData.amountSpent),
        transactionData.location,
        transactionData.description
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error recording transaction with signer:', error);
      throw error;
    }
  }

  // Submit feedback with custom signer
  async submitFeedbackWithSigner(signer: ethers.Signer, transactionId: number, comment: string, rating: number) {
    try {
      // Load contract addresses and ABIs
      const contractAddresses = await import('../config/contracts.json');
      const citizenFeedbackABI = await import('../../artifacts/contracts/CitizenFeedback.sol/CitizenFeedback.json');

      const contract = new ethers.Contract(
        contractAddresses.CitizenFeedback,
        citizenFeedbackABI.abi,
        signer
      );

      const tx = await contract.submitFeedback(
        transactionId,
        comment,
        rating
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error submitting feedback with signer:', error);
      throw error;
    }
  }

  // Estimate gas for transaction
  async estimateGas(method: string, args: any[], contractType: 'spending' | 'feedback' = 'spending') {
    try {
      // Load contract addresses and ABIs
      const contractAddresses = await import('../config/contracts.json');
      
      let contract;
      if (contractType === 'spending') {
        const governmentSpendingABI = await import('../../artifacts/contracts/GovernmentSpending.sol/GovernmentSpending.json');
        contract = new ethers.Contract(
          contractAddresses.GovernmentSpending,
          governmentSpendingABI.abi,
          this.provider
        );
      } else {
        const citizenFeedbackABI = await import('../../artifacts/contracts/CitizenFeedback.sol/CitizenFeedback.json');
        contract = new ethers.Contract(
          contractAddresses.CitizenFeedback,
          citizenFeedbackABI.abi,
          this.provider
        );
      }

      const gasLimit = await contract.estimateGas[method](...args);
      const gasPrice = await this.provider.getGasPrice();
      const totalGasCost = gasLimit.mul(gasPrice);

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        totalCostEth: ethers.utils.formatEther(totalGasCost),
        totalCostWei: totalGasCost.toString()
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }
}

export const blockchainService = new BlockchainService();