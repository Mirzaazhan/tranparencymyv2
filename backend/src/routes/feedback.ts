import { Router, Request, Response } from 'express';
import { blockchainService } from '../utils/blockchain';

const router = Router();

// POST /api/feedback - Submit feedback for a transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    const { transactionId, comment, rating } = req.body;

    // Validation
    if (!transactionId || !comment || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID, comment, and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Comment must be 500 characters or less'
      });
    }

    const txHash = await blockchainService.submitFeedback(
      parseInt(transactionId),
      comment,
      rating
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      txHash
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit feedback' 
    });
  }
});

// GET /api/feedback/transaction/:id - Get feedback for specific transaction
router.get('/transaction/:id', async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    if (isNaN(transactionId) || transactionId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID'
      });
    }

    const feedbacks = await blockchainService.getTransactionFeedbacks(transactionId);
    const rating = await blockchainService.getTransactionRating(transactionId);

    res.json({
      success: true,
      data: {
        feedbacks,
        rating: {
          average: rating.averageRating,
          total: rating.totalFeedbacks
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transaction feedback:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch feedback' 
    });
  }
});

// GET /api/feedback/rating/:id - Get rating summary for transaction
router.get('/rating/:id', async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.id);
    
    if (isNaN(transactionId) || transactionId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID'
      });
    }

    const rating = await blockchainService.getTransactionRating(transactionId);

    res.json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Error fetching transaction rating:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch rating' 
    });
  }
});

export default router;