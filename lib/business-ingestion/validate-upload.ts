import {
  supportedBusinessUploadExtensions,
  type BusinessUploadKind,
  type SupportedBusinessUploadExtension,
  businessUploadLimits,
} from "./types";

const allowedMimeTypes: Record<SupportedBusinessUploadExtension, string[]> = {
  ".txt": ["text/plain", "application/octet-stream"],
  ".pdf": ["application/pdf", "application/octet-stream"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ],
  ".csv": [
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain",
    "application/octet-stream",
  ],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
  ],
};

const kindByExtension: Record<SupportedBusinessUploadExtension, BusinessUploadKind> = {
  ".txt": "text",
  ".pdf": "pdf",
  ".docx": "docx",
  ".csv": "csv",
  ".xlsx": "xlsx",
};

export type ValidatedBusinessUpload = {
  extension: SupportedBusinessUploadExtension;
  kind: BusinessUploadKind;
  maxBytes: number;
};

export function getBusinessUploadMaxBytes(env = process.env) {
  const configured = Number(env.BUSINESS_UPLOAD_MAX_BYTES);
  return Number.isFinite(configured) && configured > 0
    ? Math.min(configured, 10 * 1024 * 1024)
    : businessUploadLimits.defaultMaxBytes;
}

export function validateBusinessUpload({
  filename,
  mimeType,
  sizeBytes,
  env,
}: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  env?: NodeJS.ProcessEnv;
}): ValidatedBusinessUpload {
  const maxBytes = getBusinessUploadMaxBytes(env);
  const lowerFilename = filename.toLowerCase();

  if (lowerFilename.endsWith(".xlsm")) {
    throw new Error("Macro-enabled XLSM files are not supported.");
  }

  if (lowerFilename.endsWith(".xls")) {
    throw new Error("Legacy XLS files are not supported. Export as XLSX.");
  }

  const extension = getSupportedExtension(filename);

  if (!extension) {
    throw new Error(
      "Unsupported file type. Upload TXT, PDF, DOCX, CSV or XLSX.",
    );
  }

  if (sizeBytes <= 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (sizeBytes > maxBytes) {
    throw new Error(
      `Uploaded file is too large. The current limit is ${maxBytes} bytes.`,
    );
  }

  const normalizedMime = mimeType.toLowerCase().split(";")[0].trim();
  if (normalizedMime && !allowedMimeTypes[extension].includes(normalizedMime)) {
    throw new Error("Uploaded file extension and MIME type do not match.");
  }

  return {
    extension,
    kind: kindByExtension[extension],
    maxBytes,
  };
}

function getSupportedExtension(filename: string) {
  const lowerName = filename.toLowerCase();
  return supportedBusinessUploadExtensions.find((extension) =>
    lowerName.endsWith(extension),
  );
}
