import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/config.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for reverse proxies (Netlify, Cloudflare, Render, AWS, Nginx)
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Enable inline assets for certificate preview & pdf
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - allow all origins dynamically with credentials for seamless Vercel / Netlify / custom domain support
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookieSecret));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Ensure active database connection for all requests (critical for serverless / cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Industrial Training Certificate Registry API',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Catch-all 404 for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Serve frontend static assets if dist exists
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

// Server startup
let server = null;

export async function startServer() {
  await connectDB();
  return new Promise((resolve) => {
    server = app.listen(config.port, () => {
      console.log(`[Server] Industrial Training Certificate Portal running on port ${config.port}`);
      console.log(`[Server] Environment: ${config.nodeEnv}`);
      console.log(`[Server] API Health: http://localhost:${config.port}/api/health`);
      resolve(server);
    });
  });
}

// Automatically start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer().catch((err) => {
    console.error('[Server Startup Error]', err);
    process.exit(1);
  });
}

export default app;
