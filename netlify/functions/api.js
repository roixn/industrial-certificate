import serverless from 'serverless-http';
import app from '../../backend/src/server.js';
import { connectDB } from '../../backend/src/config/db.js';

let serverlessHandler;

export const handler = async (event, context) => {
  // Prevent Lambda from hanging if database connection has background timers
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();
  } catch (err) {
    console.error('[Netlify Function] Database connection error:', err);
  }

  if (!serverlessHandler) {
    serverlessHandler = serverless(app);
  }

  // Normalize path so Express always matches /api/* routes
  if (event.path && !event.path.startsWith('/api')) {
    const cleanPath = event.path.replace(/^\/\.netlify\/functions\/api/, '');
    event.path = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  }

  return serverlessHandler(event, context);
};
