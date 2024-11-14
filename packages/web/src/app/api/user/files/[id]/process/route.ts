import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from 'fixitpdf-shared';
import { defaultQueue } from '@/lib/queues';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: fileId } = await params;

  try {
    // Update the file's state to 'processing'
    const updatedFile = await prismaClient.file.update({
      where: { id: fileId },
      data: { state: 'processing' },
    });

    await defaultQueue.add('processFileJob', {
      fileId,
    });

    // Return the updated file data
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error('Error updating file state:', error);
    return NextResponse.json({ error: 'File not found or could not be updated' }, { status: 404 });
  }
}