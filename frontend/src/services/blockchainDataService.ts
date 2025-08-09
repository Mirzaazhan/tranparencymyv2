import { ethers } from 'ethers';

// Contract ABIs (simplified for data fetching)
const GovernmentSpendingABI = [
  "function transactionCount() view returns (uint256)",
  "function getTransaction(uint256 _transactionId) view returns (tuple(uint256 id, string department, string projectName, string projectType, uint256 budgetAllocated, uint256 amountSpent, string location, string description, uint256 timestamp, address recordedBy, bool isActive))",
  "function getAllDepartments() view returns (string[] memory)",
  "function getTotalSpendingByDepartment(string memory _department) view returns (uint256 totalBudget, uint256 totalSpent)",
  "function getTransactionsByDateRange(uint256 _startTime, uint256 _endTime) view returns (uint256[] memory)"
];

const CitizenFeedbackABI = [
  "function feedbackCount() view returns (uint256)",
  "function getTransactionFeedbacks(uint256 _transactionId) view returns (uint256[] memory)",
  "function getFeedback(uint256 _feedbackId) view returns (tuple(uint256 id, uint256 transactionId, address citizen, string comment, uint8 rating, uint256 timestamp, bool isActive))",
  "function getTransactionRating(uint256 _transactionId) view returns (uint256 averageRating, uint256 totalFeedbacks)"
];

// Contract addresses (will be loaded dynamically)
const CONTRACT_ADDRESSES = {
  GovernmentSpending: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CitizenFeedback: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
};

// Types
export interface BlockchainTransaction {
  id: string;
  department: string;
  projectName: string;
  projectType: string;
  budgetAllocated: string;
  amountSpent: string;
  location: string;
  description: string;
  timestamp: Date;
  recordedBy: string;
  isActive: boolean;
  utilizationRate: number;
  status: 'Completed' | 'In Progress' | 'Pending';
  rating?: {
    average: number;
    total: number;
  };
}

export interface BlockchainFeedback {
  id: string;
  transactionId: string;
  citizen: string;
  comment: string;
  rating: number;
  timestamp: Date;
  isActive: boolean;
}

export interface DepartmentAnalytics {
  id: string;
  name: string;
  totalBudget: string;
  totalSpent: string;
  utilizationRate: number;
  projectCount: number;
  averageRating: number;
}

class BlockchainDataService {
  private provider: ethers.providers.JsonRpcProvider;
  private governmentContract: ethers.Contract;
  private feedbackContract: ethers.Contract;

  constructor() {
    // Use localhost for development, you can switch to Mumbai for testnet
    this.provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    
    this.governmentContract = new ethers.Contract(
      CONTRACT_ADDRESSES.GovernmentSpending,
      GovernmentSpendingABI,
      this.provider
    );
    
    this.feedbackContract = new ethers.Contract(
      CONTRACT_ADDRESSES.CitizenFeedback,
      CitizenFeedbackABI,
      this.provider
    );
  }

  // Get all transactions with pagination
  async getTransactions(limit: number = 20, offset: number = 0): Promise<BlockchainTransaction[]> {
    try {
      const transactionCount = await this.governmentContract.transactionCount();
      const totalCount = transactionCount.toNumber();
      
      if (totalCount === 0) {
        return [];
      }

      const transactions: BlockchainTransaction[] = [];
      const start = Math.max(1, totalCount - offset - limit + 1);
      const end = Math.min(totalCount, totalCount - offset);

      // Fetch transactions in reverse order (newest first)
      for (let i = end; i >= start; i--) {
        try {
          const tx = await this.governmentContract.getTransaction(i);
          
          if (tx.isActive) {
            // Get rating for this transaction
            let rating;
            try {
              const [averageRating, totalFeedbacks] = await this.feedbackContract.getTransactionRating(i);
              rating = {
                average: averageRating.toNumber() / 100, // Convert from percentage
                total: totalFeedbacks.toNumber()
              };
            } catch (error) {
              rating = { average: 0, total: 0 };
            }

            const budgetAllocated = parseFloat(ethers.utils.formatEther(tx.budgetAllocated));
            const amountSpent = parseFloat(ethers.utils.formatEther(tx.amountSpent));
            const utilizationRate = budgetAllocated > 0 ? (amountSpent / budgetAllocated) * 100 : 0;
            
            // Determine status based on utilization
            let status: 'Completed' | 'In Progress' | 'Pending' = 'Pending';
            if (utilizationRate >= 90) {
              status = 'Completed';
            } else if (utilizationRate > 0) {
              status = 'In Progress';
            }

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
              recordedBy: tx.recordedBy,
              isActive: tx.isActive,
              utilizationRate,
              status,
              rating
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch transaction ${i}:`, error);
        }
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  // Get single transaction by ID
  async getTransaction(id: string): Promise<BlockchainTransaction | null> {
    try {
      const tx = await this.governmentContract.getTransaction(parseInt(id));
      
      if (!tx.isActive) return null;

      // Get rating
      let rating;
      try {
        const [averageRating, totalFeedbacks] = await this.feedbackContract.getTransactionRating(parseInt(id));
        rating = {
          average: averageRating.toNumber() / 100,
          total: totalFeedbacks.toNumber()
        };
      } catch (error) {
        rating = { average: 0, total: 0 };
      }

      const budgetAllocated = parseFloat(ethers.utils.formatEther(tx.budgetAllocated));
      const amountSpent = parseFloat(ethers.utils.formatEther(tx.amountSpent));
      const utilizationRate = budgetAllocated > 0 ? (amountSpent / budgetAllocated) * 100 : 0;
      
      let status: 'Completed' | 'In Progress' | 'Pending' = 'Pending';
      if (utilizationRate >= 90) {
        status = 'Completed';
      } else if (utilizationRate > 0) {
        status = 'In Progress';
      }

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
        isActive: tx.isActive,
        utilizationRate,
        status,
        rating
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  // Get feedback for a specific transaction
  async getTransactionFeedbacks(transactionId: string): Promise<BlockchainFeedback[]> {
    try {
      const feedbackIds = await this.feedbackContract.getTransactionFeedbacks(parseInt(transactionId));
      const feedbacks: BlockchainFeedback[] = [];

      for (const id of feedbackIds) {
        try {
          const feedback = await this.feedbackContract.getFeedback(id.toNumber());
          
          if (feedback.isActive) {
            feedbacks.push({
              id: feedback.id.toString(),
              transactionId: feedback.transactionId.toString(),
              citizen: feedback.citizen,
              comment: feedback.comment,
              rating: feedback.rating,
              timestamp: new Date(feedback.timestamp.toNumber() * 1000),
              isActive: feedback.isActive
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch feedback ${id}:`, error);
        }
      }

      return feedbacks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching transaction feedbacks:', error);
      return [];
    }
  }

  // Get department analytics
  async getDepartmentAnalytics(): Promise<DepartmentAnalytics[]> {
    try {
      const departmentIds = await this.governmentContract.getAllDepartments();
      const analytics: DepartmentAnalytics[] = [];
      const allTransactions = await this.getTransactions(1000); // Get all transactions

      for (const deptId of departmentIds) {
        try {
          const [totalBudget, totalSpent] = await this.governmentContract.getTotalSpendingByDepartment(deptId);
          
          // Count projects and calculate average rating for this department
          const deptTransactions = allTransactions.filter(tx => tx.department === deptId);
          const projectCount = deptTransactions.length;
          
          let averageRating = 0;
          if (projectCount > 0) {
            const ratingsSum = deptTransactions.reduce((sum, tx) => sum + (tx.rating?.average || 0), 0);
            averageRating = ratingsSum / projectCount;
          }

          const budgetNum = parseFloat(ethers.utils.formatEther(totalBudget));
          const spentNum = parseFloat(ethers.utils.formatEther(totalSpent));
          const utilizationRate = budgetNum > 0 ? (spentNum / budgetNum) * 100 : 0;

          // Get human-readable department name
          const deptNames: { [key: string]: string } = {
            'MOH': 'Ministry of Health',
            'MOE': 'Ministry of Education', 
            'MOT': 'Ministry of Transport',
            'MOF': 'Ministry of Finance',
            'MOD': 'Ministry of Defence',
            'MOHA': 'Ministry of Home Affairs',
            'MOSTI': 'Ministry of Science, Technology and Innovation',
            'MOTAC': 'Ministry of Tourism, Arts and Culture'
          };

          analytics.push({
            id: deptId,
            name: deptNames[deptId] || deptId,
            totalBudget: ethers.utils.formatEther(totalBudget),
            totalSpent: ethers.utils.formatEther(totalSpent),
            utilizationRate,
            projectCount,
            averageRating
          });
        } catch (error) {
          console.warn(`Failed to fetch analytics for department ${deptId}:`, error);
        }
      }

      return analytics.sort((a, b) => parseFloat(b.totalBudget) - parseFloat(a.totalBudget));
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      return [];
    }
  }

  // Get overall statistics
  async getOverallStats() {
    try {
      const [transactionCount, feedbackCount] = await Promise.all([
        this.governmentContract.transactionCount(),
        this.feedbackContract.feedbackCount()
      ]);

      const allTransactions = await this.getTransactions(1000);
      const totalBudget = allTransactions.reduce((sum, tx) => sum + parseFloat(tx.budgetAllocated), 0);
      const totalSpent = allTransactions.reduce((sum, tx) => sum + parseFloat(tx.amountSpent), 0);
      
      const activeProjects = allTransactions.filter(tx => tx.status === 'In Progress').length;
      const completedProjects = allTransactions.filter(tx => tx.status === 'Completed').length;
      
      // Calculate average rating across all projects
      const projectsWithRatings = allTransactions.filter(tx => tx.rating && tx.rating.total > 0);
      const averageRating = projectsWithRatings.length > 0 
        ? projectsWithRatings.reduce((sum, tx) => sum + (tx.rating?.average || 0), 0) / projectsWithRatings.length
        : 0;

      return {
        totalProjects: transactionCount.toNumber(),
        totalFeedbacks: feedbackCount.toNumber(),
        totalBudget,
        totalSpent,
        utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        activeProjects,
        completedProjects,
        averageRating,
        departmentCount: (await this.governmentContract.getAllDepartments()).length
      };
    } catch (error) {
      console.error('Error fetching overall stats:', error);
      return {
        totalProjects: 0,
        totalFeedbacks: 0,
        totalBudget: 0,
        totalSpent: 0,
        utilizationRate: 0,
        activeProjects: 0,
        completedProjects: 0,
        averageRating: 0,
        departmentCount: 0
      };
    }
  }

  // Get all feedbacks across all projects (for admin review)
  async getAllFeedbacks(limit: number = 100): Promise<(BlockchainFeedback & { projectName: string; department: string })[]> {
    try {
      const feedbackCount = await this.feedbackContract.feedbackCount();
      const totalCount = feedbackCount.toNumber();
      
      if (totalCount === 0) {
        return [];
      }

      const feedbacks: (BlockchainFeedback & { projectName: string; department: string })[] = [];
      const maxItems = Math.min(totalCount, limit);
      
      // Fetch feedbacks in reverse order (newest first)
      for (let i = totalCount; i >= Math.max(1, totalCount - maxItems + 1); i--) {
        try {
          const feedback = await this.feedbackContract.getFeedback(i);
          
          if (feedback.isActive) {
            // Get project details for this feedback
            const transaction = await this.getTransaction(feedback.transactionId.toString());
            
            feedbacks.push({
              id: feedback.id.toString(),
              transactionId: feedback.transactionId.toString(),
              citizen: feedback.citizen,
              comment: feedback.comment,
              rating: feedback.rating,
              timestamp: new Date(feedback.timestamp.toNumber() * 1000),
              isActive: feedback.isActive,
              projectName: transaction?.projectName || 'Unknown Project',
              department: transaction?.department || 'Unknown Department'
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch feedback ${i}:`, error);
        }
      }

      return feedbacks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Error fetching all feedbacks:', error);
      return [];
    }
  }

  // Check if service is connected
  async isConnected(): Promise<boolean> {
    try {
      await this.provider.getNetwork();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const blockchainDataService = new BlockchainDataService();