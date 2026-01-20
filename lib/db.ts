// =============================================================================
// Database Client
// =============================================================================
// Singleton Prisma client instance with proper handling for development hot-reload
// This prevents exhausting database connections during development
// =============================================================================

import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma Client instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Re-export types for convenience
export type { User, FeatureRequest, Comment, Vote } from '@prisma/client';
export { FeatureRequestStatus } from '@prisma/client';
