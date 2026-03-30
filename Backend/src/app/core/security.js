import { createAppError } from './errors.js';
import { sendError } from './response.js';
import { verifyAccessToken } from '../utils/token.js';

export function createAuthGuard({ env }) {
  return (req, res, next) => {
    const token = req.cookies?.access_token;
    if (!token) {
      return sendError(
        res,
        createAppError(401, 'UNAUTHORIZED', 'Authentication required')
      );
    }

    try {
      const payload = verifyAccessToken(token, env);
      if (payload?.token_type !== 'access') {
        throw new Error('Invalid token type');
      }
      req.user = payload;
      return next();
    } catch {
      return sendError(
        res,
        createAppError(401, 'UNAUTHORIZED', 'Invalid or expired token')
      );
    }
  };
}

export function createRequireCsrf() {
  return (req, res, next) => {
    const isStateChangingMethod = ['POST', 'PATCH', 'DELETE'].includes(req.method);
    const needsCsrf =
      isStateChangingMethod &&
      (req.path === '/v1/auth/logout' || req.path.startsWith('/v1/admin/'));

    if (!needsCsrf) {
      return next();
    }

    const csrfCookie = req.cookies?.csrf_token;
    const csrfHeader = req.get('X-CSRF-Token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return sendError(
        res,
        createAppError(403, 'FORBIDDEN', 'Invalid CSRF token')
      );
    }

    return next();
  };
}
