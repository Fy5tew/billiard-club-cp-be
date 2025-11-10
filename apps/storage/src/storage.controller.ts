import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import type {
  DeleteFileDto,
  GetFileUrlDto,
  UploadedFileDto,
  UploadFileDto,
} from '@app/shared/dtos/storage.dto';
import { StorageMessage } from '@app/shared/services/storage/storage.messages';

import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @MessagePattern(StorageMessage.UPLOAD_FILE)
  async uploadFile(data: UploadFileDto): Promise<UploadedFileDto> {
    return this.storageService.uploadFile(data);
  }

  @MessagePattern(StorageMessage.GET_FILE_URL)
  async getFileUrl(data: GetFileUrlDto): Promise<string> {
    return this.storageService.getFileUrl(data);
  }

  @MessagePattern(StorageMessage.DELETE_FILE)
  async deleteFile(data: DeleteFileDto): Promise<void> {
    return this.storageService.deleteFile(data);
  }
}
