export function loadEnv() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3001,
    databaseUrl:
      process.env.DATABASE_URL?.trim() ||
      process.env.MONGODB_URI?.trim() ||
      '',
    encryptionKey: process.env.ENCRYPTION_KEY?.trim() || '',
  };
}

export function isProduction() {
  return (process.env.NODE_ENV || 'development') === 'production';
}
