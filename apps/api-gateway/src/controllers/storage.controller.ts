import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { StorageClient } from '@app/shared/services/storage/storage.client';

import { PublicRoute } from '../auth/auth.decorators';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageClient: StorageClient) {}

  @PublicRoute()
  @Get()
  home(@Query('bucket') bucket: string) {
    return `<form action="/storage/upload?bucket=${bucket}" method="POST" enctype="multipart/form-data">
  <input type="file" name="file" required> 
  <button type="submit">Загрузить файл</button>
</form>`;
  }

  @PublicRoute()
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async upload(
    @Query('bucket') bucket: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.storageClient.uploadFile({
      bucket,
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });
  }

  @PublicRoute()
  @Get('get-url')
  async getUrl(
    @Query('bucket') bucket: string,
    @Query('filename') filename: string,
  ) {
    return await this.storageClient.getFileUrl({ bucket, filename });
  }
}
