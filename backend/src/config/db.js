import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { ensureInitialSeed } from '../services/seedService.js';
import { enableMemoryFallback } from '../services/memoryFallback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryServer = null;

export async function connectDB() {
  try {
    // If connection is already open, reuse it immediately (essential for serverless)
    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    mongoose.set('strictQuery', false);

    let connected = false;

    // 1. Check if external MongoDB is configured
    if (config.mongodbUri && !config.useMemoryDb && !config.mongodbUri.includes('127.0.0.1')) {
      try {
        console.log(`[DB] Attempting connection to MongoDB at ${config.mongodbUri.replace(/:[^:@]+@/, ':****@')}...`);
        await mongoose.connect(config.mongodbUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log('[DB] Successfully connected to external MongoDB');
        connected = true;
      } catch (externalErr) {
        console.warn(`[DB] Could not connect to external MongoDB: ${externalErr.message}`);
      }
    }

    // 2. Fallback for local environments: persistent embedded MongoDB server
    if (!connected && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.VERCEL) {
      console.log('[DB] Initializing embedded persistent MongoDB server...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const dbPath = path.resolve(__dirname, '../../.data/mongo');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }

        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'industrial_training_certs',
            dbPath: dbPath,
            storageEngine: 'wiredTiger',
          },
        });

        const uri = memoryServer.getUri();
        await mongoose.connect(uri);
        console.log(`[DB] Embedded persistent MongoDB connected at ${uri} (storage: ${dbPath})`);
        connected = true;
      } catch (memErr) {
        console.warn('[DB] Embedded MongoDB init warning:', memErr.message);
        try {
          console.log('[DB] Retrying embedded server without custom dbPath...');
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          memoryServer = await MongoMemoryServer.create({
            instance: {
              dbName: 'industrial_training_certs',
            },
          });
          const uri = memoryServer.getUri();
          await mongoose.connect(uri);
          console.log(`[DB] In-memory MongoDB running at ${uri}`);
          connected = true;
        } catch (innerErr) {
          console.error('[DB] Could not start embedded MongoDB:', innerErr.message);
        }
      }
    }

    // 3. Fallback for serverless / Netlify without any Cloud Database
    if (!connected) {
      console.log('[DB] Activating Standalone In-Memory Datastore (Zero Cloud Database required).');
      enableMemoryFallback();
      connected = true;
    } else {
      // Trigger initial seed check on fresh real database connection
      try {
        await ensureInitialSeed();
      } catch (seedErr) {
        console.warn('[DB] Automatic seed check warning:', seedErr.message);
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB runtime error:', err);
    });

    return mongoose.connection;
  } catch (err) {
    console.error('[DB] Critical database connection error, falling back to in-memory store:', err.message);
    enableMemoryFallback();
    return mongoose.connection;
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error('[DB] Error during database disconnect:', err);
  }
}
