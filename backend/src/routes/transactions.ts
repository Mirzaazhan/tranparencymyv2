import { Router, Request, Response } from 'express';
import { blockchainService } from '../utils/blockchain';

const router = Router();

// GET /api/transactions - Get all transactions with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const department = req.query.department as string;
    const projectType = req.query.projectType as string;
    const location = req.query.location as string;

    let transactions = await blockchainService.getTransactions(limit, offset);

    // Apply filters
    if (department) {
      transactions = transactions.filter(tx => tx.department.toLowerCase().includes(department.toLowerCase()));
    }
    if (projectType) {
      transactions = transactions.filter(tx => tx.projectType.toLowerCase().includes(projectType.toLowerCase()));
    }
    if (location) {
      transactions = transactions.filter(tx => tx.location.toLowerCase().includes(location.toLowerCase()));
    }

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transactions' 
    });
  }
});

// GET /api/transactions/search/:query - Search transactions
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const query = req.params.query.toLowerCase();
    const limit = parseInt(req.query.limit as string) || 100;
    
    const transactions = await blockchainService.getTransactions(limit, 0);
    
    const filteredTransactions = transactions.filter(tx => 
      tx.projectName.toLowerCase().includes(query) ||
      tx.department.toLowerCase().includes(query) ||
      tx.description.toLowerCase().includes(query) ||
      tx.location.toLowerCase().includes(query)
    );

    res.json({
      success: true,
      data: filteredTransactions,
      query,
      total: filteredTransactions.length
    });
  } catch (error) {
    console.error('Error searching transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search transactions' 
    });
  }
});

// GET /api/transactions/:id - Get specific transaction
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid transaction ID' 
      });
    }

    const transaction = await blockchainService.getTransaction(id);
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch transaction' 
    });
  }
});

// GET /api/transactions/stats/summary - Get spending summary statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const transactions = await blockchainService.getTransactions(1000, 0);
    
    const stats = {
      totalProjects: transactions.length,
      totalBudget: transactions.reduce((sum, tx) => sum + parseFloat(tx.budgetAllocated), 0),
      totalSpent: transactions.reduce((sum, tx) => sum + parseFloat(tx.amountSpent), 0),
      averageUtilization: 0,
      departmentCount: new Set(transactions.map(tx => tx.department)).size,
      projectTypes: [...new Set(transactions.map(tx => tx.projectType))]
    };

    stats.averageUtilization = stats.totalBudget > 0 
      ? (stats.totalSpent / stats.totalBudget) * 100 
      : 0;

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching summary stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// GET /api/transactions/stats/by-department - Get spending by department
router.get('/stats/by-department', async (req: Request, res: Response) => {
  try {
    const departments = await blockchainService.getDepartments();
    const departmentStats = [];

    for (const dept of departments) {
      const spending = await blockchainService.getDepartmentSpending(dept.id);
      departmentStats.push({
        ...dept,
        ...spending
      });
    }

    res.json({
      success: true,
      data: departmentStats
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch department statistics' 
    });
  }
});

export default router;