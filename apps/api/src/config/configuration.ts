/**
 * Quản lý cấu hình tập trung – đọc từ biến môi trường (xem .env.example).
 * Không hard-code secret trong mã nguồn.
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwt: { secret: string; expiresIn: string };
  corsOrigins: string[];
  payment: { walletLimit: number };
  logLevel: string;
}

export default (): AppConfig => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const secret = process.env.JWT_SECRET ?? 'dev-only-secret-change-me-please-32chars';
  if (nodeEnv === 'production' && (!process.env.JWT_SECRET || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set (>= 32 chars) in production');
  }
  return {
    nodeEnv,
    port: parseInt(process.env.API_PORT ?? process.env.PORT ?? '4000', 10),
    databaseUrl:
      process.env.DATABASE_URL ??
      'postgresql://brewlite:brewlite_dev_password@localhost:5432/brewlite',
    jwt: { secret, expiresIn: process.env.JWT_EXPIRES_IN ?? '1d' },
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    payment: { walletLimit: parseInt(process.env.PAYMENT_WALLET_LIMIT ?? '500000', 10) },
    logLevel: process.env.LOG_LEVEL ?? 'log',
  };
};
