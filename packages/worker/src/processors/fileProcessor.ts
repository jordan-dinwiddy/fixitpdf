import { prismaClient } from 'fixitpdf-shared';

/**
 * Process the file job.
 * @param data 
 */
export async function processFileJob(data: any): Promise<void> {
  const { fileId } = data;

  console.log(`Processing file job for file ID: ${fileId}`);

  // Generate a random delay between 1 and 10 seconds
  const randomDelaySecs = Math.floor(Math.random() * 10) + 1;

  // Generate a random issue count between 0 and 20
  const issueCount = Math.floor(Math.random() * 20);

  setTimeout(async () => {
    await prismaClient.file.update({
      where: {
        id: fileId,
      },
      data: {
        state: 'processed',
        issueCount,
      }
    });

    console.log(`File job for file ID ${fileId} completed`);
  }, randomDelaySecs * 1000);
}