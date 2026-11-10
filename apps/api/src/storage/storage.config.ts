import { S3Client } from '@aws-sdk/client-s3';

export interface StorageConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  publicEndpoint: string;
}

export function getStorageConfig(): StorageConfig {
  const port = Number(process.env.MINIO_PORT ?? 9000);

  const config: StorageConfig = {
    endpoint: process.env.MINIO_ENDPOINT ?? 'minio',
    port,
    useSSL: process.env.MINIO_USE_SSL === 'true',

    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',

    bucket: process.env.MINIO_BUCKET ?? 'apulse-images',
    region: process.env.MINIO_REGION ?? 'us-east-1',

    publicEndpoint:
      process.env.MINIO_PUBLIC_ENDPOINT ?? 'http://localhost:9000',
  };

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid MINIO_PORT configuration');
  }

  if (!config.accessKey || !config.secretKey) {
    throw new Error('MinIO credentials are required');
  }

  if (!config.bucket) {
    throw new Error('MINIO_BUCKET is required');
  }

  return config;
}

export function createStorageClient(
  config: StorageConfig,
  endpoint?: string,
): S3Client {
  return new S3Client({
    endpoint:
      endpoint ??
      `${config.useSSL ? 'https' : 'http'}://${config.endpoint}:${config.port}`,

    region: config.region,

    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },

    forcePathStyle: true,
  });
}
