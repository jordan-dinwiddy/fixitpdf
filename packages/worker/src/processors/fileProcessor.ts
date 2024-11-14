import { downloadFile, getFileSizeInKB, prismaClient, uploadFile } from 'fixitpdf-shared';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Process the file job.
 * @param data 
 */
export async function processFileJob(data: any): Promise<void> {
  const { fileId } = data;
  const tempDir = tmpdir();
  const originalFilePath = join(tempDir, `${fileId}-original`);
  const fixedFileName = `${fileId}-processed`;
  const fixedFilePath = join(tempDir, fixedFileName);

  const startTime = Date.now();

  try {
    console.log(`Processing file job for file ID: ${fileId}`);

    // Download the file from S3
    console.log(`Downloading file to ${originalFilePath}...`);
    await downloadFile(fileId, originalFilePath);
    const originalFileSize = await getFileSizeInKB(originalFilePath);
    console.log(`File downloaded (${originalFileSize} KB) for file ID: ${fileId}`);

    // Process the file
    console.log(`Processing file and saving to ${fixedFilePath}...`);
    const { issueCount } = await processFile(originalFilePath, fixedFilePath);
    const processedFileSize = await getFileSizeInKB(fixedFilePath);
    console.log(`File processed(${processedFileSize} KB) for file ID: ${fileId}`);

    // Re-upload the fixed file to S3
    console.log('Uploading processed file...');
    await uploadFile(fixedFileName, fixedFilePath);

    // Update the file record in the database
    await prismaClient.file.update({
      where: {
        id: fileId,
      },
      data: {
        state: 'processed',
        issueCount,
      }
    });

    console.log(`Processing file job for file ID ${fileId} completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`Error processing file job for file ID: ${fileId}`, error);
  } finally {
    // Cleanup the temporary files
    await Promise.all([fs.unlink(originalFilePath), fs.unlink(fixedFilePath)]);
  }
}

interface ProcessFileResult {
  issueCount: number;
}

const processFile = async (originalFilePath: string, processedFilePath: string): Promise<ProcessFileResult> => {
  const command = `cp ${originalFilePath} ${processedFilePath}`;
  await execAsync(command);

  return {
    issueCount: 0,
  }
};