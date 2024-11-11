// src/app/api/utils/users/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { BaseResponse } from '@/types/responses';

export type ListUsersResponse = BaseResponse<Prisma.UserGetPayload<{ include: { files: true } }>[]>;

/**
 * List available users.
 * 
 * @returns 
 */
export async function GET(): Promise<NextResponse<ListUsersResponse>> {
  try {
    // Fetch all users and include their associated files
    const users = await prisma.user.findMany({
      include: {
        files: true,
      },
    });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve users' }, { status: 500 });
  }
}