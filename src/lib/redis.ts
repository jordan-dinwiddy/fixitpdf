import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || "", {
  maxRetriesPerRequest: null, // Ensures compatibility with BullMQ
});

export default redis;