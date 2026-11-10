import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

import {
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { createStorageClient, getStorageConfig } from './storage.config.js';

export interface UploadFileOptions {
  buffer: Buffer;
  mimeType: string;
  folder: string;
}

export interface UploadedFile {
  key: string;
  bucket: string;
  mimeType: string;
  size: number;
}

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StorageService.name);

  private readonly config = getStorageConfig();

  // Internal client: API container -> MinIO container.
  private readonly client = createStorageClient(this.config);

  // Public client: used to generate URLs accessible by browsers.
  private readonly publicClient = createStorageClient(
    this.config,
    this.config.publicEndpoint.replace(/\/+$/, ''),
  );

  private readonly maxFileSize = 5 * 1024 * 1024;

  private readonly allowedMimeTypes = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif'],
  ]);

  async onModuleInit(): Promise<void> {
    await this.initializeBucket();
  }

  onModuleDestroy(): void {
    this.client.destroy();
    this.publicClient.destroy();
  }

  /**
   * Check MinIO connection and initialize the bucket.
   * Retry because MinIO may take longer to become ready.
   */
  private async initializeBucket(): Promise<void> {
    const maxAttempts = 10;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.client.send(
          new HeadBucketCommand({
            Bucket: this.config.bucket,
          }),
        );

        this.logger.log(`MinIO bucket "${this.config.bucket}" is ready.`);

        return;
      } catch (error: any) {
        const statusCode = error.$metadata?.httpStatusCode;

        // A missing bucket should be created.
        if (statusCode === 404 || error.name === 'NotFound') {
          try {
            await this.client.send(
              new CreateBucketCommand({
                Bucket: this.config.bucket,
              }),
            );

            this.logger.log(`MinIO bucket "${this.config.bucket}" created.`);

            return;
          } catch (createError: any) {
            if (
              createError.name === 'BucketAlreadyOwnedByYou' ||
              createError.name === 'BucketAlreadyExists'
            ) {
              return;
            }

            throw createError;
          }
        }

        // Permission errors should not be treated as missing buckets.
        if (statusCode === 403) {
          throw error;
        }

        if (attempt === maxAttempts) {
          this.logger.error('Unable to initialize MinIO bucket.');
          throw new ServiceUnavailableException(
            'MinIO storage is unavailable.',
          );
        }

        this.logger.warn(
          `MinIO connection attempt ${attempt}/${maxAttempts} failed.`,
        );

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  /**
   * Upload an image to MinIO.
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadedFile> {
    const { buffer, mimeType, folder } = options;

    if (!buffer?.length) {
      throw new BadRequestException('File cannot be empty.');
    }

    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException('Maximum image size is 5 MB.');
    }

    const extension = this.allowedMimeTypes.get(mimeType);

    if (!extension) {
      throw new BadRequestException('Unsupported image format.');
    }

    if (!folder || !/^[a-zA-Z0-9_-]+$/.test(folder)) {
      throw new BadRequestException('Invalid storage folder.');
    }

    const key = `${folder}/${randomUUID()}${extension}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      this.logger.log(`File uploaded: ${key}`);

      return {
        key,
        bucket: this.config.bucket,
        mimeType,
        size: buffer.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete file: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Delete an image from MinIO.
   */
  async deleteFile(key: string): Promise<void> {
    if (!key?.trim()) {
      throw new BadRequestException('File key is required.');
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException('Unable to delete file.');
    }
  }

  /**
   * Generate a temporary URL accessible by the browser.
   */
  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return getSignedUrl(this.publicClient, command, {
      expiresIn,
    });
  }

  /**
   * Check whether an object exists.
   */
  async fileExists(key: string): Promise<boolean> {
    if (!key?.trim()) {
      throw new BadRequestException('File key is required.');
    }

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      return true;
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.name === 'NoSuchKey' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }

      throw new InternalServerErrorException('Unable to check file existence.');
    }
  }

  getBucket(): string {
    return this.config.bucket;
  }
}
