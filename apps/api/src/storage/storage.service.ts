import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
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
  S3ServiceException,
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

  private readonly client = createStorageClient(this.config);

  private readonly publicClient = createStorageClient(
    this.config,
    this.config.publicEndpoint.replace(/\/+$/, ''),
  );

  private readonly maxFileSize = 5 * 1024 * 1024;

  private readonly maxInitializationAttempts = 3;

  private readonly retryDelay = 2000;

  private readonly allowedMimeTypes = new Map<string, string>([
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
   * Initialize the storage bucket.
   * Retry when the storage service is temporarily unavailable.
   */

  private async initializeBucket(): Promise<void> {
    for (
      let attempt = 1;
      attempt <= this.maxInitializationAttempts;
      attempt++
    ) {
      let initializationError: unknown;

      try {
        await this.client.send(
          new HeadBucketCommand({
            Bucket: this.config.bucket,
          }),
        );

        this.logger.log(`Bucket "${this.config.bucket}" is ready.`);
        return;
      } catch (error: unknown) {
        initializationError = error;
      }

      if (this.isNotFound(initializationError)) {
        try {
          await this.client.send(
            new CreateBucketCommand({
              Bucket: this.config.bucket,
            }),
          );

          this.logger.log(`Bucket "${this.config.bucket}" created.`);
          return;
        } catch (createError: unknown) {
          if (this.isBucketAlreadyExists(createError)) {
            this.logger.log(`Bucket "${this.config.bucket}" already exists.`);
            return;
          }

          initializationError = createError;
        }
      }

      if (this.isAccessDenied(initializationError)) {
        this.logger.warn(
          'Storage access denied. Storage functionality may be unavailable.',
        );
        return;
      }

      if (attempt === this.maxInitializationAttempts) {
        this.logger.warn(
          `Unable to initialize storage after ${this.maxInitializationAttempts} attempts.`,
        );

        this.logError('Storage initialization failed', initializationError);
        return;
      }

      this.logger.warn(
        `Storage initialization attempt ${attempt}/${this.maxInitializationAttempts} failed. Retrying...`,
      );

      await this.delay(this.retryDelay);
    }
  }

  /**
   * Upload an image to storage.
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
    } catch (error: unknown) {
      this.logError(`Failed to upload file: ${key}`, error);

      throw new InternalServerErrorException('Unable to upload file.');
    }
  }

  /**
   * Delete an image from storage.
   */
  async deleteFile(key: string): Promise<void> {
    this.validateKey(key);

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      this.logger.log(`File deleted: ${key}`);
    } catch (error: unknown) {
      this.logError(`Failed to delete file: ${key}`, error);

      throw new InternalServerErrorException('Unable to delete file.');
    }
  }

  /**
   * Generate a temporary URL accessible by the browser.
   */
  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    this.validateKey(key);

    if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
      throw new BadRequestException('Invalid URL expiration time.');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      return await getSignedUrl(this.publicClient, command, {
        expiresIn,
      });
    } catch (error: unknown) {
      this.logError(`Failed to generate file URL: ${key}`, error);

      throw new InternalServerErrorException('Unable to generate file URL.');
    }
  }

  /**
   * Check whether an object exists.
   */
  async fileExists(key: string): Promise<boolean> {
    this.validateKey(key);

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      return true;
    } catch (error: unknown) {
      if (this.isNotFound(error)) {
        return false;
      }

      this.logError(`Failed to check file existence: ${key}`, error);

      throw new InternalServerErrorException('Unable to check file existence.');
    }
  }

  getBucket(): string {
    return this.config.bucket;
  }

  private validateKey(key: string): void {
    if (!key?.trim()) {
      throw new BadRequestException('File key is required.');
    }
  }

  private isNotFound(error: unknown): boolean {
    if (!(error instanceof S3ServiceException)) {
      return false;
    }

    return (
      error.name === 'NotFound' ||
      error.name === 'NoSuchKey' ||
      error.$metadata.httpStatusCode === 404
    );
  }

  private isAccessDenied(error: unknown): boolean {
    return (
      error instanceof S3ServiceException &&
      (error.name === 'AccessDenied' || error.$metadata.httpStatusCode === 403)
    );
  }

  private isBucketAlreadyExists(error: unknown): boolean {
    return (
      error instanceof S3ServiceException &&
      (error.name === 'BucketAlreadyOwnedByYou' ||
        error.name === 'BucketAlreadyExists')
    );
  }

  private logError(message: string, error: unknown): void {
    this.logger.error(
      message,
      error instanceof Error ? error.stack : String(error),
    );
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
