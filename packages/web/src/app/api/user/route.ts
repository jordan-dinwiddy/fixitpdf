import { authOptions } from '@/lib/auth';
import { GetUserInfoResponse, prismaClient } from 'fixitpdf-shared';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/** 
 * API routes for the current logged in user
 * 
 * - GET /api/user/
 */

/**
 * Retrieve user info.
 * 
 * @returns 
 */
export async function GET(): Promise<NextResponse<GetUserInfoResponse>> {
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;

  try {
    // Load user from prisma
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true, data: {
        id: user.id,
        email: user.email,
        creditBalance: user.creditBalance,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving user info:', error);
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 500 });
  }
}
