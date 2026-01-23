// lib/prisma.ts  (Next.js mein src/lib/prisma.ts ya lib/prisma.ts)
import { PrismaClient } from '@/generated/prisma/client';  // ← yeh default import (custom path mat use abhi)

// Agar aap custom output use kar rahe ho ("../../generated/prisma/client"), to usko hatao aur @prisma/client install kar lo
// npm install @prisma/client

import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in .env');
}

const pool = new Pool({
  connectionString,
  // optional: max: 10, idleTimeoutMillis: 30000, etc.
});

const adapter = new PrismaPg(pool);

// Singleton (Next.js ke hot-reload ke liye zaroori – multiple instances na bane)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,  // ← yeh line sab kuch fix karegi
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}