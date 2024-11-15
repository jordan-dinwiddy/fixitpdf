import { prismaClient, PurchaseUserFileResponse } from 'fixitpdf-shared';
import { NextRequest, NextResponse } from 'next/server';

interface PurchaseUserFileParams {
  id: string;
};

/**
 * Purchase the given file. A file can be purchased after processing and costs a certain amount of credits. A file
 * can only be downloaded after it has been purchased.
 * 
 * @param req 
 * @param param1 
 * @returns 
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<PurchaseUserFileParams> },
): Promise<NextResponse<PurchaseUserFileResponse>> {
  const { id: fileId } = await params;

  // 1. Load the file and check it's in the state 'processed' and the cost to purchase it. 
  // 2. Transactionally deduct purchase cost from user's credits, store transaction record. 
  // 3. Update the file state to 'purchased'.
  try {
    // Look up the file by its primary key
    const file = await prismaClient.file.findUnique({
      where: { id: fileId }, // 'id' is the primary key in the `File` model
    });

    if (!file) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    if (file.state !== 'processed') {
      return NextResponse.json({ success: false, error: 'File is not in the correct state to be purchased' }, { status: 400 });
    }

    console.log(`Deducting ${file.costInCredits} credits from user ${file.userId} and moving state to purchased ...`);

    await prismaClient.file.update({
      where: {
        id: fileId,
      },
      data: {
        state: 'purchased',
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating file state:', error);
    return NextResponse.json({ success: false, error: 'File not found or could not be updated' }, { status: 500 });
  }
}