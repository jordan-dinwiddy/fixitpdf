import { NextRequest, NextResponse } from 'next/server';
import { ProcessUserFileResponse } from 'fixitpdf-shared';
import { prismaClient } from 'fixitpdf-shared-server';
import { defaultQueue } from '@/lib/queues';

interface ProcessUserFileParams {
  id: string;
}

/**
 * API request is made by the client once the user has uploaded a file and is ready to process it.
 * 
 * Processing a file involves a BullMQ worker downloading it, finding lost annotations, and then re-uploading it.
 * 
 * @param req 
 * @param param1 
 * @returns 
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<ProcessUserFileParams> },
): Promise<NextResponse<ProcessUserFileResponse>> {
  const { id: fileId } = await params;

  try {
    // Update the file's state to 'processing'
    await prismaClient.file.update({
      where: { id: fileId },
      data: { state: 'processing' },
    });

    await defaultQueue.add('processFileJob', {
      fileId,
    });

    // Return the updated file data
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering processing of file:', error);
    return NextResponse.json({ success: false, error: 'File not found or could not be updated' }, { status: 500 });
  }
}