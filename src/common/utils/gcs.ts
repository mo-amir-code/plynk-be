import { Storage } from "@google-cloud/storage";
import { AppError } from "./app-error";
import { HttpStatus } from "../enums/http-status.enum";
import logger from "../logger";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GCS_BUCKET_NAME || "";
const bucket = storage.bucket(bucketName);

export const uploadToGCS = async (
  file: Express.Multer.File,
  destination: string
): Promise<string> => {
  if (!bucketName) {
    throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, "GCS bucket is not configured");
  }

  const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
  const filePath = `${destination}/${fileName}`;
  const blob = bucket.file(filePath);

  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
    metadata: { cacheControl: "public, max-age=31536000" },
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      logger.error({ error: err.message, fileName }, "GCS upload error");
      reject(new AppError(HttpStatus.INTERNAL_SERVER_ERROR, `GCS Upload: ${err.message}`));
    });

    blobStream.on("finish", () => {
      resolve(`https://storage.googleapis.com/${bucketName}/${filePath}`);
    });

    blobStream.end(file.buffer);
  });
};

export const deleteFromGCS = async (url: string): Promise<void> => {
  try {
    if (!bucketName) return;

    const parts = url.split(`${bucketName}/`);
    if (parts.length < 2) return;
    
    await bucket.file(parts[1]).delete();
  } catch (err: any) {
    logger.error({ error: err.message, url }, "GCS Delete Error");
  }
};
