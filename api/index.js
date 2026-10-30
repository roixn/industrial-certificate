import app from '../backend/src/server.js';
import { connectDB } from '../backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] DB connection error:', err);
  }

  // Normalize req.url so Express routes reliably on Vercel
  if (req.headers && req.headers['x-matched-path'] && req.headers['x-matched-path'].startsWith('/api')) {
    req.url = req.headers['x-matched-path'];
  } else if (req.url && !req.url.startsWith('/api') && req.url !== '/') {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
}
