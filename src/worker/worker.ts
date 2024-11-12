// worker/emailWorker.ts
import { Worker } from 'bullmq';
import redis from '../lib/redis';

console.log('Loading email worker...');
console.log('Redis URL:', process.env.REDIS_URL);

// Define the worker logic
const defaultQueueWorker = new Worker(
  'defaultQueue',
  async (job) => {
    console.log(`Processing job "${job.name}" ...`);
    console.log(job.data);

  },
  { connection: redis }
);

// Error handling
defaultQueueWorker.on('failed', (job, err) => {
  console.error(`Job failed: ${job?.id}, Error: ${err.message}`);
});

console.log('Email worker is running...');