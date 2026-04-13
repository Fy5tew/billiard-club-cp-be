import { Request } from 'express';

export type RequestWithCookies = Request & {
  cookies: Record<string, string>;
};

export type UploadedFilePayload = {
  originalname: string;
  filename: string;
  buffer: Buffer;
  mimetype: string;
};
