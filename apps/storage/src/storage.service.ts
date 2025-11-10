import { Injectable } from '@nestjs/common';
import { NestMinioService } from 'nestjs-minio';

import {
  DeleteFileDto,
  GetFileUrlDto,
  UploadedFileDto,
  UploadFileDto,
} from '@app/shared/dtos/storage.dto';

@Injectable()
export class StorageService {
  constructor(private readonly minioService: NestMinioService) {}

  private async ensureBucketExists(bucket: string) {
    const exists = await this.minioService.getMinio().bucketExists(bucket);
    if (!exists) {
      await this.minioService.getMinio().makeBucket(bucket);
    }
  }

  async uploadFile({
    bucket,
    filename,
    buffer,
    mimeType,
  }: UploadFileDto): Promise<UploadedFileDto> {
    await this.ensureBucketExists(bucket);

    return await this.minioService
      .getMinio()
      .putObject(bucket, filename, Buffer.from(buffer), undefined, {
        'Content-Type': mimeType,
      });
  }

  async getFileUrl({ bucket, filename }: GetFileUrlDto): Promise<string> {
    await this.ensureBucketExists(bucket);

    return await this.minioService
      .getMinio()
      .presignedGetObject(bucket, filename);
  }

  async deleteFile({ bucket, filename }: DeleteFileDto): Promise<void> {
    return await this.minioService.getMinio().removeObject(bucket, filename);
  }
}
