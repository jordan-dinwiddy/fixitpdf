import { PrismaClient, Prisma } from '@prisma/client';

// Instantiate the Prisma Client for usage within shared-db or elsewhere
const prismaClient = new PrismaClient();

export type User = Prisma.UserGetPayload<{}>;
export type File = Prisma.FileGetPayload<{}>;

export { prismaClient, Prisma };

export { redisClient } from './redis';
export * from './s3';