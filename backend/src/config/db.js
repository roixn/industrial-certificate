import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryServer = null;

export async function connectDB() {
  try {
    // If connection is already open, reuse it immediately (essential for Vercel Serverless)
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    mongoose.set('strictQuery', false);

    let connected = false;

    // Check if external MongoDB is explicitly configured and not forcing memory mode
    if (config.mongodbUri && !config.useMemoryDb) {
      try {
        console.log(`[DB] Attempting connection to MongoDB at ${config.mongodbUri}...`);
        await mongoose.connect(config.mongodbUri, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log('[DB] Successfully connected to external MongoDB');
        connected = true;
      } catch (externalErr) {
        console.warn(`[DB] Could not connect to external MongoDB: ${externalErr.message}`);
      }
    }

    // Fallback or default: persistent embedded MongoDB server
    if (!connected) {
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
        console.error('[DB] Embedded MongoDB init error:', memErr.message);
        // In case persistent engine lock issue, fallback to transient in-memory instance
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
      }
    }

    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB runtime error:', err);
    });

    return mongoose.connection;
  } catch (err) {
    console.error('[DB] Critical database connection error:', err);
    throw err;
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
