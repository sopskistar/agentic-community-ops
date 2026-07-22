import { apiErrorResponse } from "../../../../lib/api/responses";
import {
  createAnalysisContent,
  ingestBusinessFile,
} from "../../../../lib/business-ingestion/ingest-business-file";
import { getBusinessUploadMaxBytes } from "../../../../lib/business-ingestion/validate-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const maxBytes = getBusinessUploadMaxBytes();
  if (contentLength > maxBytes + 10_000) {
    return apiErrorResponse({
      code: "BUSINESS_UPLOAD_TOO_LARGE",
      message: `Uploaded file is too large. The current limit is ${maxBytes} bytes.`,
      status: 413,
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const worksheetName =
      typeof formData.get("worksheetName") === "string"
        ? String(formData.get("worksheetName"))
        : undefined;

    if (!(file instanceof File)) {
      return apiErrorResponse({
        code: "BUSINESS_UPLOAD_MISSING_FILE",
        message: "Upload a supported file before analysis.",
        status: 400,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await ingestBusinessFile({
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      buffer,
      worksheetName,
    });

    return Response.json({
      extraction: {
        ...parsed,
        analysisContent: createAnalysisContent(parsed),
      },
    });
  } catch (error) {
    return apiErrorResponse({
      code: "BUSINESS_UPLOAD_PARSE_FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Uploaded file could not be processed.",
      status: 400,
    });
  }
}
