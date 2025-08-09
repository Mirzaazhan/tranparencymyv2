import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

export { prisma };