const sensitiveEnvironmentKeys = [
  'DATABASE_URL',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'MINIO_ACCESS_KEY',
  'MINIO_ROOT_USER',
  'MINIO_SECRET_KEY',
  'MINIO_ROOT_PASSWORD',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'MAIL_FROM',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'OBSERVE_APP_KEY',
  'OBSERVE_APP_SECRET',
];

export function redactSensitiveValues(message: string): string {
  const sensitiveValues = sensitiveEnvironmentKeys
    .map((key) => process.env[key])
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => right.length - left.length);

  return sensitiveValues.reduce(
    (redacted, value) => redacted.replaceAll(value, '[REDACTED]'),
    message,
  );
}

export function formatError(error: unknown): string {
  const message =
    error instanceof Error
      ? (error.stack ?? `${error.name}: ${error.message}`)
      : String(error);

  return redactSensitiveValues(message);
}
