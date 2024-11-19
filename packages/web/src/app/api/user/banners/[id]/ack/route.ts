import { authOptions } from '@/lib/auth';
import { AckUserMessageBannerResponse } from 'fixitpdf-shared';
import { prismaClient } from 'fixitpdf-shared-server';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse<AckUserMessageBannerResponse>> {

  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.userId;

  await prismaClient.user.update({
    where: { id: userId },
    data: { showWelcomeMessage: false },
  });

  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging user banner', error);
    return NextResponse.json({ success: false, error: 'Error acknowledging user banner' }, { status: 500 });
  }
}
