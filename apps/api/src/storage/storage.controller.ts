import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { StorageService } from './storage.service.js';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('url')
  async getFileUrl(@Query('key') key?: string): Promise<{ url: string }> {
    if (!key?.trim()) {
      throw new BadRequestException('File key is required.');
    }

    return { url: await this.storageService.getFileUrl(key) };
  }
}
