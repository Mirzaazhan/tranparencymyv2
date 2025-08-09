import { Router, Request, Response } from 'express';
import { AuthService, CreateUserData, LoginData } from '../services/authService';
import { authenticate } from '../middleware/auth';
import { UserRole } from '@prisma/client'; // Import from Prisma instead
const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, adminCode } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Email format validationnp
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const userData: CreateUserData = {
      email: email.toLowerCase(),
      password,
      name,
      role: role || UserRole.CITIZEN,
      adminCode
    };

    const result = await AuthService.register(userData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const loginData: LoginData = {
      email: email.toLowerCase(),
      password
    };

    const result = await AuthService.login(loginData);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (token) {
      await AuthService.logout(token);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    });
  }
});

// GET /api/auth/roles - Get available roles for registration
router.get('/roles', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      roles: [
        { value: UserRole.CITIZEN, label: 'Citizen', requiresCode: false },
        { value: UserRole.ADMIN, label: 'Admin', requiresCode: true },
        { value: UserRole.GOVERNMENT, label: 'Government Official', requiresCode: true }
      ]
    }
  });
});

export default router;