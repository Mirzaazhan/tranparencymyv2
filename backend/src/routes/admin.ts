import { Router, Request, Response } from 'express';
import { blockchainService } from '../utils/blockchain';

const router = Router();

// POST /api/admin/transaction - Add new transaction (for government officials)
router.post('/transaction', async (req: Request, res: Response) => {
  try {
    const {
      department,
      projectName,
      projectType,
      budgetAllocated,
      amountSpent,
      location,
      description
    } = req.body;

    // Validation
    if (!department || !projectName || !projectType || !budgetAllocated || !location) {
      return res.status(400).json({
        success: false,
        error: 'All required fields must be provided'
      });
    }

    if (parseFloat(budgetAllocated) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget must be greater than 0'
      });
    }

    if (parseFloat(amountSpent || '0') > parseFloat(budgetAllocated)) {
      return res.status(400).json({
        success: false,
        error: 'Amount spent cannot exceed budget'
      });
    }

    const txHash = await blockchainService.recordTransaction({
      department,
      projectName,
      projectType,
      budgetAllocated,
      amountSpent: amountSpent || '0',
      location,
      description: description || ''
    });

    res.json({
      success: true,
      message: 'Transaction recorded successfully',
      txHash
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record transaction' 
    });
  }
});

// GET /api/admin/dashboard - Get admin dashboard statistics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    // Get recent transactions
    const recentTransactions = await blockchainService.getTransactions(10, 0);
    
    // Get department spending
    const departments = await blockchainService.getDepartments();
    const departmentSpending = [];
    
    for (const dept of departments) {
      const spending = await blockchainService.getDepartmentSpending(dept.id);
      departmentSpending.push({
        ...dept,
        ...spending
      });
    }

    // Calculate overall statistics
    const allTransactions = await blockchainService.getTransactions(1000, 0);
    const totalBudget = allTransactions.reduce((sum, tx) => sum + parseFloat(tx.budgetAllocated), 0);
    const totalSpent = allTransactions.reduce((sum, tx) => sum + parseFloat(tx.amountSpent), 0);

    const stats = {
      totalProjects: allTransactions.length,
      totalBudget,
      totalSpent,
      utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      activeDepartments: departments.length,
      recentTransactions,
      departmentSpending: departmentSpending.sort((a, b) => parseFloat(b.totalBudget) - parseFloat(a.totalBudget))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

export default router;