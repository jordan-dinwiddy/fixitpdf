import { prismaClient } from 'fixitpdf-shared';

/**
 * Process the test event job.
 * @param data 
 */
export async function processTestEventJob(data: any): Promise<void> {
  console.log('Processing test event job...');

  const { testeEventId } = data;
  await touchTestEvent(testeEventId);
}

/**
 * Load the event from database and update it.
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