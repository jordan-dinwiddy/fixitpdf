import { downloadFile, getFileSize, prismaClient, uploadFile } from 'fixitpdf-shared-server';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const determineCostInCredits = (originalFileSizeBytes: number): number => {
  // Examples:
  //  - [0 -> 5 MB]      => 3 credits
  //  - [5 MB => 10 MB]  => 4 credits
  //  - [10 MB -> 15 MB] => 5 credits
  //  - [15 MB -> 20 MB] => 6 credits
  //  - [20 MB -> 25 MB] => 7 credits
  //  - [25 MB -> 30 MB] => 8 credits
  //  - [30 MB -> 35 MB] => 9 credits
  //  - [35 MB -> 40 MB] => 10 credits
  //  - [40 MB -> 45 MB] => 11 credits
  //  - [45 MB -> 50 MB] => 12 credits

  return 2 + Math.ceil((originalFileSizeBytes / 1024 / 1024) / 5);
}

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
    const originalFileSizeBytes = await getFileSize(originalFilePath);
    console.log(`File downloaded (${Math.round(originalFileSizeBytes / 1024)} KB) for file ID: ${fileId}`);

    // Process the file
    console.log(`Processing file and saving to ${fixedFilePath}...`);
    const processFileResult = await processFile(originalFilePath, fixedFilePath);
    console.log('Process file result:', processFileResult);

    if (!processFileResult.success) {
      console.error(`Error processing file: ${fileId}, marking as failed`);

      // Update the file record in the database
      await prismaClient.file.update({
        where: {
          id: fileId,
        },
        data: {
          state: 'processing_failed',
        }
      });

      return;
    }

    console.log(`File processed successfully with ${processFileResult.issueCount} issues for file ID: ${fileId}`);

    const processedFileSizeBytes = await getFileSize(fixedFilePath);
    console.log(`Processed file size = ${Math.round(processedFileSizeBytes / 1024)} KB`);

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
        issueCount: processFileResult.issueCount || 0,
        originalFileSizeBytes,
        processedFileSizeBytes,
        costInCredits: determineCostInCredits(originalFileSizeBytes),
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
  success: boolean;
  output?: string;
  issueCount?: number;
  error?: string;
}

const processFile = async (originalFilePath: string, processedFilePath: string): Promise<ProcessFileResult> => {
  const command = `/usr/local/bin/pdf_annotation_fix ${originalFilePath} ${processedFilePath}`;

  try {
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      // Handle any error output from the command itself
      return { success: false, output: stdout.trim(), error: stderr.trim() };
    }

    // Parse the stdout output
    const match = stdout.trim().match(/recovered (\d+) annotations/);

    if (match && match[1]) {
      const issueCount = parseInt(match[1], 10);
      return { success: true, output: stdout.trim(), issueCount };
    } else {
      // If output does not match expected format, return an error
      return { success: false, output: stdout.trim(), error: stderr.trim() };
    }
  } catch (error) {
    // Handle execution error
    return { success: false, error: (error as Error).message };
  }
};