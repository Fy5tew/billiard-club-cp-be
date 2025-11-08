export type UploadFileDto = {
  bucket: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
};

export type UploadedFileDto = {
  etag: string;
  versionId: string | null;
};

export type GetFileUrlDto = { bucket: string; filename: string };
