// worker/emailWorker.ts
import { Worker } from 'bullmq';
import { redisClient } from 'fixitpdf-shared';

console.log('Loading email worker...');
console.log('Redis URL:', process.env.REDIS_URL);

// Define the worker logic
const defaultQueueWorker = new Worker(
  'defaultQueue',
  async (job) => {
    console.log(`Processing job "${job.name}" ...`);
    console.log(job.data);

  },
  { connection: redisClient }
);

// Error handling
defaultQueueWorker.on('failed', (job, err) => {
  console.error(`Job failed: ${job?.id}, Error: ${err.message}`);
});

console.log('BullMQ Worker is running...');

console.log(`${new Date().toISOString()} - Worker is running...`);

// Just print hell to the screen every 1 second
setInterval(() => {
  console.log(`${new Date().toISOString()} - Hello from worker`);
}, 1000);

