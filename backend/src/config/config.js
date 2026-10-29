import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/industrial_training_certs',
  useMemoryDb: process.env.USE_MEMORY_DB === 'true',
  jwtSecret: process.env.JWT_SECRET || 'industrial_training_secret_jwt_key_2026_default',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'industrial_cookie_secret_key_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  publicVerifyBaseUrl: process.env.PUBLIC_VERIFY_BASE_URL || 'http://localhost:5173/verify',
};
