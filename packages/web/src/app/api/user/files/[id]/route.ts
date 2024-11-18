import { DeleteUserFileResponse } from 'fixitpdf-shared';
import { prismaClient } from 'fixitpdf-shared-server';
import { NextRequest, NextResponse } from 'next/server';

interface DeleteUserFileParams {
  id: string;
}

/**
 * Delete a given file.
 * 
 * @param req 
 * @param param1 
 * @returns 
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<DeleteUserFileParams> },
): Promise<NextResponse<DeleteUserFileResponse>> {
  const { id: fileId } = await params;

  try {
    // Soft delete the file
    await prismaClient.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating file state:', error);
    return NextResponse.json({ success: false, error: 'File not found or could not be updated' }, { status: 404 });
  }
}