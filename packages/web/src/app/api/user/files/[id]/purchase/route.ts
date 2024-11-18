import { adjustUserCreditBalance } from '@/services/user/userService';
import { PurchaseUserFileResponse } from 'fixitpdf-shared';
import { prismaClient } from 'fixitpdf-shared-server';
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

    // Would like to wrap all of this in a transaction (incl the update file);
    if (file.costInCredits && file.costInCredits > 0) {
      console.log(`Deducting ${file.costInCredits} credits from user ${file.userId} and moving state to purchased ...`);
      await adjustUserCreditBalance(file.userId, (-1 * file.costInCredits), `Purchased file ${fileId}`);
    }

    await prismaClient.file.update({
      where: {
        id: fileId,
      },
      data: {
        state: 'purchased',
      }
    });

    return NextResponse.json({ success: true });

  } catch {
    console.error(`Unable to complete purchase purchase of file ${fileId}. Insufficient balance maybe?`);

    // TODO 15Nov24: Something really weird happens here in `npm run dev` where the error cannot be referenced without
    // causing an error: 'TypeError: The "payload" argument must be of type object. Received null'. In a prod
    // build though this works fine.
    //console.error(e);
    return NextResponse.json({ success: false, error: 'Unable to complete purchase purchase' }, { status: 500 });
  }
}