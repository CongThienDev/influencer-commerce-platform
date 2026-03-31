import { createAppError } from './errors.js';

export function createIpRateLimiter({ max = 60, windowMs = 60_000 } = {}) {
  const requests = new Map();

  return (req, _res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const entry = requests.get(key) || { count: 0, expiresAt: now + windowMs };

    if (now > entry.expiresAt) {
      entry.count = 0;
      entry.expiresAt = now + windowMs;
    }

    entry.count += 1;
    requests.set(key, entry);

    if (entry.count > max) {
      return next(createAppError(429, 'RATE_LIMITED', 'Too many requests'));
    }

    return next();
  };
}
