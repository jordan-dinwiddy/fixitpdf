import { authOptions } from '@/lib/auth';
import { CreateUserFileResponse, generateFileUploadUrl, ListUserFilesResponse, prismaClient } from 'fixitpdf-shared';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { UserFile } from 'fixitpdf-shared';

/** 
 * API routes for managing files for the current user.
 * 
 * - GET /api/user/files
 * - POST /api/user/files
 */

const getFilesForUser = async(userId: string): Promise<UserFile[]> => {
  const files = await prismaClient.file.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return files.map((file) => ({
    id: file.id,
    name: file.name,
    fileType: file.fileType,
    state: file.state,
    issueCount: file.issueCount,
    originalFileSizeBytes: file.originalFileSizeBytes || null,
    processedFileSizeBytes: file.processedFileSizeBytes || null,
    costInCredits: file.costInCredits || null,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  }));
};

const createNewFileForUser = async(userId: string, fileName: string, fileType: string): Promise<UserFile> => {
  const newFile = await prismaClient.file.create({
    data: {
      name: fileName,
      fileType: fileType,
      state: 'uploading',
      userId,
    },
  });

  return {
    id: newFile.id,
    name: fileName,
    fileType,
    state: 'uploading',
    issueCount: 0,
    originalFileSizeBytes: null,
    processedFileSizeBytes: null,
    costInCredits: null,
    createdAt: newFile.createdAt.toISOString(),
    updatedAt: newFile.updatedAt.toISOString(),
  };
};


/**
 * Retrieve all files belonging to the current user.
 * 
 * @returns 
 */
export async function GET(): Promise<NextResponse<ListUserFilesResponse>> {
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const files = await getFilesForUser(session.userId);

  return NextResponse.json({ success: true, data: files }, { status: 200 });
}

/**
 * Create a new file in the system. Also returns a pre-signed URL for the file upload.
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: Request): Promise<NextResponse<CreateUserFileResponse>> {
  const session = await getServerSession(authOptions);
  const { fileName, fileType } = await req.json();

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!fileName || !fileType) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }
  

  try {
    // Create the initial record in the database
    const newFile = await createNewFileForUser(session.userId, fileName, fileType);

    // Generate a pre-signed URL for the file upload (the URL will create a new file with the key being the file ID)
    const uploadUrl = await generateFileUploadUrl(newFile.id, fileType);

    return NextResponse.json({ 
      success: true,
      data: {
        file: newFile,
        uploadUrl,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error generating pre-signed URL", error);
    return NextResponse.json({ success: false, error: "Error generating pre-signed URL" }, { status: 500 });
  }
}

