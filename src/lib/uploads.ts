import path from "path";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateImageUpload(file: File | null, options?: { required?: boolean }) {
  if (!file || file.size === 0) {
    if (options?.required) {
      return "File gambar wajib diunggah.";
    }

    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Format gambar harus JPG, PNG, atau WEBP.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran gambar maksimal 5MB.";
  }

  return null;
}

export async function saveImageUpload(
  file: File,
  options?: {
    folder?: string;
  }
) {
  const validationError = validateImageUpload(file, { required: true });

  if (validationError) {
    throw new Error(validationError);
  }

  const uploadFolder = options?.folder || "uploads";
  const uploadDir = path.join(process.cwd(), "public", uploadFolder);
  await fs.mkdir(uploadDir, { recursive: true });

  const extension =
    path.extname(file.name) || {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    }[file.type] || "";

  const baseName = sanitizeFileName(path.basename(file.name, path.extname(file.name)));
  const finalFileName = `${Date.now()}-${randomUUID()}-${baseName || "file"}${extension}`;
  const filePath = path.join(uploadDir, finalFileName);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(bytes));

  return `/${uploadFolder}/${finalFileName}`;
}

export async function deleteUploadedFileByUrl(fileUrl: string | null | undefined) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
