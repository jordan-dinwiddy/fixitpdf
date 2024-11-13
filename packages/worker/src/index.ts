// worker/emailWorker.ts
import { Worker } from 'bullmq';
import { redisClient } from 'fixitpdf-shared';
import {
  prismaClient

} from 'fixitpdf-shared';
console.log('Loading email worker...');
console.log('Redis URL:', process.env.REDIS_URL);

// Define the worker logic
const defaultQueueWorker = new Worker(
  'defaultQueue',
  async (job) => {
    console.log(`Processing job "${job.name}" ...`);
    console.log(job.data);

    if (job.name === 'testEventJob') {
      await processTestEventJob(job.data);
    }

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

/**
 * Process the test event job.
 * 
 * @param data 
 */
async function processTestEventJob(data: any): Promise<void> {
  console.log('Processing test event job...');

  const { testeEventId } = data;
  await touchTestEvent(testeEventId);
}

/**
 * Load the event from database and update it.
 * 
 * @param id 
 */
async function touchTestEvent(id: string): Promise<void> {
  const currentTime = new Date();

  const testEvent = await prismaClient.testEvent.findUnique({
    where: { id },
  });

  if (!testEvent) {
    throw new Error("TestEvent not found");
  }

  await prismaClient.testEvent.update({
    where: {
      id,
    },
    data: {
      processedAt: currentTime,
      lagMs: currentTime.getTime() - testEvent.createdAt.getTime(),
    }
  });
}