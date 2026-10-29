import { config } from '../config/config.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'record';
    return res.status(409).json({
      success: false,
      message: `A resource with this ${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation failed',
      errors: messages,
    });
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.isOperational || config.nodeEnv === 'development' ? err.message : 'An unexpected server error occurred.',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}
