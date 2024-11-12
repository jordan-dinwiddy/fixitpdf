import { Redis } from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null, // Ensures compatibility with BullMQ
});

export { redisClient };