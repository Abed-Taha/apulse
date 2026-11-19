import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  S3Client,
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
  private readonly client = this.config.enabled
    ? createStorageClient(this.config)
    : null;

  // Public client: used to generate URLs accessible by browsers.
  private readonly publicClient = this.config.enabled
    ? createStorageClient(
        this.config,
        this.config.publicEndpoint.replace(/\/+$/, ''),
      )
    : null;

  private readonly maxFileSize = 5 * 1024 * 1024;

  private readonly allowedMimeTypes = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif'],
  ]);

  async onModuleInit(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.log('Storage is disabled.');
      return;
    }

    await this.initializeBucket();
  }

  onModuleDestroy(): void {
    this.client?.destroy();
    this.publicClient?.destroy();
  }

  /**
   * Check MinIO connection and initialize the bucket.
   * Retry because MinIO may take longer to become ready.
   */

  private async initializeBucket(): Promise<void> {
    const maxAttempts = 3;
    const retryDelay = 2000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.getClient().send(
          new HeadBucketCommand({
            Bucket: this.config.bucket,
          }),
        );

        this.logger.log(`MinIO bucket "${this.config.bucket}" is ready.`);

        return;
      } catch (error: any) {
        let initializationError: any = error;
        const statusCode = error.$metadata?.httpStatusCode;

        // Create the bucket if it doesn't exist.
        if (statusCode === 404 || error.name === 'NotFound') {
          try {
            await this.getClient().send(
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
              this.logger.log(
                `MinIO bucket "${this.config.bucket}" already exists.`,
              );
              return;
            }

            initializationError = createError;
          }
        }

        // Don't retry permission errors.
        if (
          initializationError.$metadata?.httpStatusCode === 403 ||
          initializationError.name === 'AccessDenied'
        ) {
          this.logger.warn(
            'MinIO access denied. Storage functionality may be unavailable.',
          );
          return;
        }

        if (attempt === maxAttempts) {
          this.logger.warn(
            `Unable to initialize MinIO after ${maxAttempts} attempts. ` +
              'The API will continue starting without storage availability.',
          );

          this.logger.debug(
            initializationError instanceof Error
              ? initializationError.message
              : String(error),
          );

          return;
        }

        this.logger.warn(
          `MinIO initialization attempt ${attempt}/${maxAttempts} failed. Retrying...`,
        );

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Upload an image to MinIO.
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadedFile> {
    const client = this.getClient();
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
      await client.send(
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
    const client = this.getClient();

    if (!key?.trim()) {
      throw new BadRequestException('File key is required.');
    }

    try {
      await client.send(
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
    const client = this.getPublicClient();
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    return getSignedUrl(client, command, {
      expiresIn,
    });
  }

  /**
   * Check whether an object exists.
   */
  async fileExists(key: string): Promise<boolean> {
    const client = this.getClient();

    if (!key?.trim()) {
      throw new BadRequestException('File key is required.');
    }

    try {
      await client.send(
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

  private getClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableException('Storage is disabled.');
    }

    return this.client;
  }

  private getPublicClient(): S3Client {
    if (!this.publicClient) {
      throw new ServiceUnavailableException('Storage is disabled.');
    }

    return this.publicClient;
  }
}
