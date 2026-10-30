import rateLimit from 'express-rate-limit';

const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { ip: false, trustProxy: false, xForwardedForHeader: false, default: false },
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
});

export const verificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 lookups per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { ip: false, trustProxy: false, xForwardedForHeader: false, default: false },
  message: {
    success: false,
    message: 'Verification request rate limit exceeded. Please try again shortly.',
  },
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { ip: false, trustProxy: false, xForwardedForHeader: false, default: false },
});
