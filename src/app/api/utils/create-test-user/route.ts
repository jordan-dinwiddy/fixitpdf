import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { BaseResponse } from '@/types/responses';

interface CreateUserData {
  message: string;
  user: Prisma.UserGetPayload<{ include: { files: true } }>;
}

type CreateUserResponse = BaseResponse<CreateUserData>;

/**
 * A test API to create a new random user (with some files)
 * 
 * @returns 
 */
export async function POST(): Promise<NextResponse<CreateUserResponse>> {
  try {
    // Generate random user data
    const randomEmail = `user${Math.floor(Math.random() * 10000)}@example.com`;
    const randomName = `User${Math.floor(Math.random() * 10000)}`;

    // Create a new user with random data
    const newUser = await prisma.user.create({
      data: {
        email: randomEmail,
        name: randomName,
        files: {
          create: [
            { url: `https://example.com/file${Math.floor(Math.random() * 100)}.pdf` },
            { url: `https://example.com/file${Math.floor(Math.random() * 100)}.pdf` },
          ],
        },
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json(
      { success: true, data: { message: 'User created successfully', user: newUser } },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}

