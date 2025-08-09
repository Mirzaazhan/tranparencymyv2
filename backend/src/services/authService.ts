import { PrismaClient } from '@prisma/client';

import { UserRole } from '@prisma/client'; // Import from Prisma instead
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  adminCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static ADMIN_CODE = process.env.ADMIN_REGISTRATION_CODE || 'GOV2024MALAYSIA';

  // Register a new user
  static async register(userData: CreateUserData) {
    const { email, password, name, role, adminCode } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate admin registration
    if (role === UserRole.ADMIN || role === UserRole.GOVERNMENT) {
      if (!adminCode || adminCode !== this.ADMIN_CODE) {
        throw new Error('Invalid admin registration code');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || UserRole.CITIZEN
      }
    });

    // Generate JWT token
    const token = this.generateToken({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });

    // Store session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  // Login user
  static async login(loginData: LoginData) {
    const { email, password } = loginData;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    });

    // Store session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  // Verify token and get user
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;

      // Check if session exists and is valid
      const session = await prisma.userSession.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!session || session.expiresAt < new Date() || !session.user.isActive) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      };
    } catch (error) {
      return null;
    }
  }

  // Logout user
  static async logout(token: string) {
    await prisma.userSession.deleteMany({
      where: { token }
    });
  }

  // Generate JWT token
  private static generateToken(user: AuthUser): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Clean expired sessions
  static async cleanExpiredSessions() {
    await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  }
}