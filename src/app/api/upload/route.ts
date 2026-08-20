import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadToS3, getPresignedUploadUrl } from "@/lib/s3";

// Allowed mime types for security
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB Limit

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Handling Presigned URL Request (JSON body)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { filename, fileType, folder = "properties" } = body;

      if (!filename || !fileType) {
        return NextResponse.json({ error: "filename and fileType are required." }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.includes(fileType)) {
        return NextResponse.json({ error: "Unsupported file format. Please upload JPG, PNG, WEBP, or PDF." }, { status: 400 });
      }

      const extension = filename.split(".").pop() || "jpg";
      const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      const uniqueKey = `${sanitizedFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

      const { uploadUrl, fileUrl } = await getPresignedUploadUrl(uniqueKey, fileType);

      return NextResponse.json({
        success: true,
        uploadUrl,
        fileUrl,
        key: uniqueKey,
      });
    }

    // 2. Handling Direct Multipart Form Upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const folder = (formData.get("folder") as string) || "uploads";

      if (!file) {
        return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `File type ${file.type} is not allowed.` }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: "File size exceeds maximum allowed limit of 5MB." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension = file.name.split(".").pop() || "jpg";
      const sanitizedFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      const uniqueKey = `${sanitizedFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

      const fileUrl = await uploadToS3(buffer, uniqueKey, file.type);

      return NextResponse.json({
        success: true,
        fileUrl,
        key: uniqueKey,
        filename: file.name,
        size: file.size,
        contentType: file.type,
      });
    }

    return NextResponse.json({ error: "Invalid Content-Type header." }, { status: 400 });
  } catch (error: any) {
    console.error("S3 Upload error:", error);
    return NextResponse.json({
      error: error.message || "Failed to upload file to AWS S3.",
    }, { status: 500 });
  }
}
