import { Router, Request, Response } from 'express';
import { blockchainService } from '../utils/blockchain';

const router = Router();

// GET /api/departments - Get all departments
router.get('/', async (req: Request, res: Response) => {
  try {
    const departments = await blockchainService.getDepartments();
    
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch departments' 
    });
  }
});

// GET /api/departments/:id/spending - Get department spending details
router.get('/:id/spending', async (req: Request, res: Response) => {
  try {
    const departmentId = req.params.id;
    const spending = await blockchainService.getDepartmentSpending(departmentId);
    
    res.json({
      success: true,
      data: spending
    });
  } catch (error) {
    console.error('Error fetching department spending:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch department spending' 
    });
  }
});

// GET /api/departments/:id/transactions - Get transactions for specific department
router.get('/:id/transactions', async (req: Request, res: Response) => {
  try {
    const departmentId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const transactions = await blockchainService.getTransactions(limit + 100, offset);
    const departmentTransactions = transactions.filter(tx => tx.department === departmentId);
    
    res.json({
      success: true,
      data: departmentTransactions.slice(0, limit),
      pagination: {
        limit,
        offset,
        total: departmentTransactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching department transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch department transactions' 
    });
  }
});

export default router;