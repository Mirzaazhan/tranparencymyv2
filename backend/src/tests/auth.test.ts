import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../routes/auth';
import { AuthService } from '../services/authService';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const prisma = new PrismaClient();

describe('Auth Routes', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.userSession.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new citizen user successfully', async () => {
      const userData = {
        email: 'citizen@test.com',
        password: 'password123',
        name: 'Test Citizen',
        role: 'CITIZEN'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.token).toBeDefined();
    });

    test('should register admin user with valid admin code', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        role: 'ADMIN',
        adminCode: process.env.ADMIN_REGISTRATION_CODE || 'GOV2024MALAYSIA'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('ADMIN');
    });

    test('should fail to register admin without admin code', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        role: 'ADMIN'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid admin registration code');
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email format');
    });

    test('should fail with weak password', async () => {
      const userData = {
        email: 'user@test.com',
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Password must be at least 6 characters long');
    });

    test('should fail with missing required fields', async () => {
      const userData = {
        email: 'user@test.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email, password, and name are required');
    });

    test('should fail when registering duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'Test User'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        email: 'login@test.com',
        password: 'password123',
        name: 'Login Test User'
      };
      await request(app).post('/api/auth/register').send(userData);
    });

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    let userToken: string;
    let userId: number;

    beforeEach(async () => {
      const userData = {
        email: 'me@test.com',
        password: 'password123',
        name: 'Me Test User'
      };
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      userToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user.id;
    });

    test('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('me@test.com');
      expect(response.body.data.user.name).toBe('Me Test User');
      expect(response.body.data.user.id).toBe(userId);
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let userToken: string;

    beforeEach(async () => {
      const userData = {
        email: 'logout@test.com',
        password: 'password123',
        name: 'Logout Test User'
      };
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      userToken = registerResponse.body.data.token;
    });

    test('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);

      expect(meResponse.body.error).toBe('Invalid or expired token');
    });

    test('should fail without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/auth/roles', () => {
    test('should return available roles', async () => {
      const response = await request(app)
        .get('/api/auth/roles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.roles).toHaveLength(3);
      expect(response.body.data.roles).toEqual([
        { value: 'CITIZEN', label: 'Citizen', requiresCode: false },
        { value: 'ADMIN', label: 'Admin', requiresCode: true },
        { value: 'GOVERNMENT', label: 'Government Official', requiresCode: true }
      ]);
    });
  });
});