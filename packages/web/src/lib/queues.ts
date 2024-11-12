import { Queue } from 'bullmq';
import { redisClient } from 'fixitpdf-shared';
// Initialize a new BullMQ queue

export const defaultQueue = new Queue('defaultQueue', {
  connection: redisClient,
});