// 1. PURGE AND LOCK TEST ENVIRONMENT
delete process.env.DATABASE_URL;
delete process.env.DIRECT_URL;

const TEST_DB_URL = "postgresql://user:password@localhost:5433/plynk_test?schema=public";

process.env.DATABASE_URL = TEST_DB_URL;
process.env.DIRECT_URL = TEST_DB_URL; // Overriding
process.env.JWT_SECRET = "test-secret-key-12345";
process.env.NODE_ENV = "test";
process.env.PRISMA_NO_DOTENV = 'true';

import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { execSync } from 'child_process';

// 2. Import Prisma after env is set
const { default: prisma } = await import('../config/prisma');

// Mock GCS Utility
vi.mock('../common/utils/gcs', () => ({
  uploadToGCS: vi.fn(async () => 'https://storage.googleapis.com/test-bucket/test-file.png'),
  deleteFromGCS: vi.fn(async () => {}),
}));

// Mock Email Utility
vi.mock('../common/utils/email', () => ({
  sendEmail: vi.fn(async () => {}),
}));

beforeAll(async () => {
  try {
    const TEST_DB_URL = "postgresql://user:password@localhost:5433/plynk_test?schema=public";
    
    console.log('Forcefully locking Prisma to localhost:5433...');
    
    // We use --accept-data-loss and --schema to ensure we're targeting the right place
    // We pass ONLY the test DB URL to the environment to prevent any Supabase leakage
    execSync('npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma', {
      env: { 
        ...process.env,
        DATABASE_URL: TEST_DB_URL,
        // This prevents Prisma from reading your root .env file
        PRISMA_NO_DOTENV: 'true' 
      },
      stdio: 'inherit'
    });
    
    console.log('Test database is ready and secured.');
  } catch (error) {
    console.error('CRITICAL: Failed to sync test database. Ensure Docker is running on Port 5433.');
    process.exit(1);
  }
});

beforeEach(async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

  const tables = tablenames
    .map(({ tablename }) => `"${tablename}"`)
    .join(', ');

  if (tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      // Cleanup might fail if tables are already empty
    }
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
