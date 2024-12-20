import { Worker } from 'bullmq';
import { redisClient } from 'fixitpdf-shared-server';
import { processFileJob } from './processors/fileProcessor';
import { sendWelcomeEmailJob } from './processors/sendWelcomeEmailJob';
import { sendNewUserEmailJob } from './processors/sendNewUserEmailJob';
import { sendAdminNewPurchaseEmailJob } from './processors/sendAdminNewPurchaseEmailJob';

console.log('Loading BullMQ default worker...');
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
      case 'sendWelcomeEmailJob':
        await sendWelcomeEmailJob(job.data);
        break;
      case 'sendNewUserEmailJob':
        await sendNewUserEmailJob(job.data);
        break;
      case 'sendAdminNewPurchaseEmailJob':
        await sendAdminNewPurchaseEmailJob(job.data);
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
