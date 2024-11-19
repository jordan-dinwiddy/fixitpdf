import { authOptions } from '@/lib/auth';
import { GetUserMessageBannersResponse } from 'fixitpdf-shared';
import { prismaClient } from 'fixitpdf-shared-server';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/** 
 * User Banners
 * 
 * - GET /api/user/banners
 */

/**
 * List user banners
 * 
 * @returns 
 */
export async function GET(): Promise<NextResponse<GetUserMessageBannersResponse>> {
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
      success: true, data: [
        {
          id: 'welcome_new_user',
          acked: !user.showWelcomeMessage,
        },
      ]
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving user banners', error);
    return NextResponse.json({ success: false, error: 'Unable to retrieve banners' }, { status: 500 });
  }
}
