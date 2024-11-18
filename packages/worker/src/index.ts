import { Worker } from 'bullmq';
import { redisClient } from 'fixitpdf-shared-server';
import { processFileJob } from './processors/fileProcessor';

console.log('Loading email worker...');
console.log('Redis URL:', process.env.REDIS_URL);
console.log(`${new Date().toISOString()} - Worker is running...`);

// Define the worker logic
const defaultQueueWorker = new Worker(
  'defaultQueue',
  async (job) => {
    console.log(`Processing job "${job.name}" ...`);
    console.log(job.data);

    switch (job.name) {
      case 'processFileJob':
        await processFileJob(job.data);
        break;
      default:
        console.error(`Unknown job name: ${job.name}`);
    }
  },
  { connection: redisClient }
);

// Error handling
defaultQueueWorker.on('failed', (job, err) => {
  console.error(`Job failed: ${job?.id}, Error: ${err.message}`);
});

// Just print hell to the screen every 1 second
setInterval(() => {
  console.log(`${new Date().toISOString()} - Hello from worker`);
}, 10000);
