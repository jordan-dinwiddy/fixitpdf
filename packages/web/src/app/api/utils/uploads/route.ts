import { generateFileUploadUrl } from 'fixitpdf-shared';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { filename, fileType } = await req.json();

  if (!filename || !fileType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { url, key } = await generateFileUploadUrl(fileType);
    return NextResponse.json({ url, key }, { status: 200 });
  } catch (error) {
    console.error("Error generating pre-signed URL", error);
    return NextResponse.json({ error: "Error generating pre-signed URL" }, { status: 500 });
  }
}