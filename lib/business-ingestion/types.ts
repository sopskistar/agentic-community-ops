export const supportedBusinessUploadExtensions = [
  ".txt",
  ".pdf",
  ".docx",
  ".csv",
  ".xlsx",
] as const;

export type SupportedBusinessUploadExtension =
  (typeof supportedBusinessUploadExtensions)[number];

export type BusinessUploadKind = "text" | "pdf" | "docx" | "csv" | "xlsx";

export type ParsedBusinessFile = {
  filename: string;
  kind: BusinessUploadKind;
  fileTypeLabel: string;
  sizeBytes: number;
  text: string;
  preview: string;
  extractedCharacterCount: number;
  truncated: boolean;
  pageCount?: number;
  worksheetName?: string;
  availableWorksheets?: string[];
  detectedColumns?: string[];
  importedRowCount?: number;
  truncatedRowCount?: number;
  importedColumnCount?: number;
  extractionSummary: string;
  warnings: string[];
};

export type BusinessFileParseInput = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  worksheetName?: string;
};

export type TabularParseResult = {
  headers: string[];
  rows: string[][];
  importedRowCount: number;
  truncatedRowCount: number;
  importedColumnCount: number;
  truncated: boolean;
  text: string;
};

export const businessUploadLimits = {
  defaultMaxBytes: 4 * 1024 * 1024,
  maxAnalysisCharacters: 12_000,
  previewCharacters: 900,
  maxRows: 200,
  maxColumns: 30,
  maxCellCharacters: 500,
};
