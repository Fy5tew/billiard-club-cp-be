import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  GetFileUrlDto,
  UploadedFileDto,
  UploadFileDto,
} from '@app/shared/dtos/storage.dto';

import { Service } from '../services.types';
import { StorageMessage } from './storage.messages';

@Injectable()
export class StorageClient {
  constructor(@Inject(Service.STORAGE) private readonly client: ClientProxy) {}

  async uploadFile(data: UploadFileDto): Promise<UploadedFileDto> {
    return firstValueFrom(
      this.client.send<UploadedFileDto, UploadFileDto>(
        StorageMessage.UPLOAD_FILE,
        data,
      ),
    );
  }

  async getFileUrl(data: GetFileUrlDto): Promise<string> {
    return firstValueFrom(
      this.client.send<string, GetFileUrlDto>(
        StorageMessage.GET_FILE_URL,
        data,
      ),
    );
  }
}
