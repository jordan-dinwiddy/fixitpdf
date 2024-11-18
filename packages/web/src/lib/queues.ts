import { Queue } from 'bullmq';
import { redisClient } from 'fixitpdf-shared-server';
// Initialize a new BullMQ queue

export const defaultQueue = new Queue('defaultQueue', {
  connection: redisClient,
});