import { Queue } from 'bullmq';
import redis from './redis';

// Initialize a new BullMQ queue
export const defaultQueue = new Queue('defaultQueue', {
  connection: redis,
});