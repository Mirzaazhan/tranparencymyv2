import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireCitizen, optionalAuth } from '../middleware/auth';
import authRoutes from '../routes/auth';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/protected', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/admin-only', authenticate, requireAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin access granted' });
});

app.get('/citizen-access', authenticate, requireCitizen, (req, res) => {
  res.json({ success: true, message: 'Citizen access granted' });
});

app.get('/optional-auth', optionalAuth, (req, res) => {
  res.json({ 
    success: true, 
    authenticated: !!req.user,
    user: req.user || null 
  });
});

const prisma = new PrismaClient();

describe('Auth Middleware', () => {
  let citizenToken: string;
  let adminToken: string;
  let governmentToken: string;

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

    const citizenResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'citizen@test.com',
        password: 'password123',
        name: 'Test Citizen',
        role: 'CITIZEN'
      });
    citizenToken = citizenResponse.body.data.token;

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Test Admin',
        role: 'ADMIN',
        adminCode: process.env.ADMIN_REGISTRATION_CODE || 'GOV2024MALAYSIA'
      });
    adminToken = adminResponse.body.data.token;

    const govResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'gov@test.com',
        password: 'password123',
        name: 'Test Government',
        role: 'GOVERNMENT',
        adminCode: process.env.ADMIN_REGISTRATION_CODE || 'GOV2024MALAYSIA'
      });
    governmentToken = govResponse.body.data.token;
  });

  describe('authenticate middleware', () => {
    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('citizen@test.com');
    });

    test('should deny access without token', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    test('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    test('should deny access with malformed authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('requireAdmin middleware', () => {
    test('should allow admin access', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin access granted');
    });

    test('should allow government access', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${governmentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Admin access granted');
    });

    test('should deny citizen access', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Admin or Government access required');
    });
  });

  describe('requireCitizen middleware', () => {
    test('should allow citizen access', async () => {
      const response = await request(app)
        .get('/citizen-access')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Citizen access granted');
    });

    test('should allow admin access to citizen routes', async () => {
      const response = await request(app)
        .get('/citizen-access')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Citizen access granted');
    });

    test('should allow government access to citizen routes', async () => {
      const response = await request(app)
        .get('/citizen-access')
        .set('Authorization', `Bearer ${governmentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Citizen access granted');
    });

    test('should deny access without authentication', async () => {
      const response = await request(app)
        .get('/citizen-access')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('optionalAuth middleware', () => {
    test('should work with valid token', async () => {
      const response = await request(app)
        .get('/optional-auth')
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(true);
      expect(response.body.user.email).toBe('citizen@test.com');
    });

    test('should work without token', async () => {
      const response = await request(app)
        .get('/optional-auth')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(false);
      expect(response.body.user).toBe(null);
    });

    test('should work with invalid token (graceful failure)', async () => {
      const response = await request(app)
        .get('/optional-auth')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(false);
      expect(response.body.user).toBe(null);
    });
  });
});