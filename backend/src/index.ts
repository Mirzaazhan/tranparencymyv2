import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';

// import transactionRoutes from './routes/transactions';
// import departmentRoutes from './routes/departments';
// import feedbackRoutes from './routes/feedback';
// import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes - Simple test routes first
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 25,
      totalBudget: 150000000,
      totalSpent: 90000000,
      averageUtilization: 60.0,
      departmentCount: 8
    }
  });
});

app.get('/api/test2', (req, res) => {
  res.json({ message: 'Test 2 API working!' });
});

app.get('/api/simple', (req, res) => {
  console.log('Simple API called');
  res.json({ message: 'Simple API working!' });
});

// Simple test endpoints first
app.get('/api/transactions/stats/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 25,
      totalBudget: 150000000,
      totalSpent: 90000000,
      averageUtilization: 60.0,
      departmentCount: 8
    }
  });
});

app.get('/api/transactions/stats/by-department', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'MOH',
        name: 'Ministry of Health',
        nameMs: 'Kementerian Kesihatan',
        totalBudget: '25000000',
        totalSpent: '18000000',
        utilizationRate: 72.0,
        projectCount: 5
      },
      {
        id: 'MOE',
        name: 'Ministry of Education',
        nameMs: 'Kementerian Pendidikan',
        totalBudget: '30000000',
        totalSpent: '22000000',
        utilizationRate: 73.3,
        projectCount: 4
      },
      {
        id: 'MOT',
        name: 'Ministry of Transport',
        nameMs: 'Kementerian Pengangkutan',
        totalBudget: '40000000',
        totalSpent: '25000000',
        utilizationRate: 62.5,
        projectCount: 6
      }
    ]
  });
});

app.get('/api/transactions', (req, res) => {
  console.log('GET /api/transactions called');
  res.json({
    success: true,
    data: [
      {
        id: '1',
        department: 'MOH',
        projectName: 'Kuala Lumpur Hospital Equipment Modernization',
        projectType: 'Healthcare',
        budgetAllocated: '5000000',
        amountSpent: '3500000',
        location: 'Kuala Lumpur',
        timestamp: new Date()
      }
    ],
    pagination: { limit: 20, offset: 0, total: 1 }
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Add working endpoints first
app.get('/api/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 25,
      totalBudget: 150000000,
      totalSpent: 90000000,
      averageUtilization: 60.0,
      departmentCount: 8
    }
  });
});

// Commented out complex routes for now
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/departments', departmentRoutes);
// app.use('/api/feedback', feedbackRoutes);
// app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'TransparensiMY Backend'
  });
});

// Add mock data right after health check
app.get('/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 25,
      totalBudget: 150000000,
      totalSpent: 90000000,
      averageUtilization: 60.0,
      departmentCount: 8
    }
  });
});

// Mock data endpoints that work
app.get('/api/mock-summary', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 25,
      totalBudget: 150000000,
      totalSpent: 90000000,
      averageUtilization: 60.0,
      departmentCount: 8
    }
  });
});

app.get('/api/mock-departments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'MOH',
        name: 'Ministry of Health',
        nameMs: 'Kementerian Kesihatan',
        totalBudget: '25000000',
        totalSpent: '18000000',
        utilizationRate: 72.0,
        projectCount: 5
      },
      {
        id: 'MOE',
        name: 'Ministry of Education',
        nameMs: 'Kementerian Pendidikan',
        totalBudget: '30000000',
        totalSpent: '22000000',
        utilizationRate: 73.3,
        projectCount: 4
      },
      {
        id: 'MOT',
        name: 'Ministry of Transport',
        nameMs: 'Kementerian Pengangkutan',
        totalBudget: '40000000',
        totalSpent: '25000000',
        utilizationRate: 62.5,
        projectCount: 6
      }
    ]
  });
});

app.get('/api/mock-transactions', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        department: 'MOH',
        projectName: 'Kuala Lumpur Hospital Equipment Modernization',
        projectType: 'Healthcare',
        budgetAllocated: '5000000',
        amountSpent: '3500000',
        location: 'Kuala Lumpur',
        timestamp: new Date()
      },
      {
        id: '2',
        department: 'MOE',
        projectName: 'Selangor School Digital Learning Initiative',
        projectType: 'Education',
        budgetAllocated: '8000000',
        amountSpent: '6200000',
        location: 'Selangor',
        timestamp: new Date()
      },
      {
        id: '3',
        department: 'MOT',
        projectName: 'Penang Bridge Maintenance Project',
        projectType: 'Infrastructure',
        budgetAllocated: '12000000',
        amountSpent: '8500000',
        location: 'Penang',
        timestamp: new Date()
      }
    ],
    pagination: { limit: 20, offset: 0, total: 3 }
  });
});

// Add a test route right after mounting auth routes to debug
app.get('/api/auth-test', (req, res) => {
  res.json({ message: 'Auth test route works!' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - MUST BE LAST!
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 TransparensiMY Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Auth test: http://localhost:${PORT}/api/auth-test`);
  console.log(`🔐 Auth roles: http://localhost:${PORT}/api/auth/roles`);
});

// Add error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});