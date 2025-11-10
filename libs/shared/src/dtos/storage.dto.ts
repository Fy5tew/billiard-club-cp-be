export class UploadFileDto {
  bucket: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

export class UploadedFileDto {
  etag: string;
  versionId: string | null;
}

export class GetFileUrlDto {
  bucket: string;
  filename: string;
}

export class DeleteFileDto {
  bucket: string;
  filename: string;
}
