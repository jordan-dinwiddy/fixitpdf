import { generateFileDownloadUrl, prismaClient, UserFileDownloadResponse } from 'fixitpdf-shared';
import { NextRequest, NextResponse } from 'next/server';

interface DownloadUserFileParams {
  id: string;
}

/**
 * Request the download of the given file. Returns the a signed download URL if successful.
 * @param req 
 * @param param1 
 * @returns 
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<DownloadUserFileParams> },
): Promise<NextResponse<UserFileDownloadResponse>> {
  const { id: fileId } = await params;

  // TODO: Need to be sure this is the users file.
  try {
    const file = await prismaClient.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    if (file.state !== 'purchased') {
      return NextResponse.json({
        success: false,
        error: 'File has to be purchased before you can request a download',
      }, { status: 400 });
    }

    // TODO: File should just have this as a prop..
    const processedFileKey = `${file.id}-processed`;

    const downloadUrl = await generateFileDownloadUrl(processedFileKey, file.name);

    // Return the updated file data
    return NextResponse.json({
      success: true,
      data: {
        downloadUrl,
      },
    });
  } catch (error) {
    console.error('Error updating file state:', error);
    return NextResponse.json({ success: false, error: 'Failed to download file' }, { status: 500 });
  }
}