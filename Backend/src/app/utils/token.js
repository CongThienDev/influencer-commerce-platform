import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function signAccessToken(user, env) {
  return jwt.sign(
    { ...user, token_type: 'access' },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
  );
}

export function signRefreshToken(user, sessionId, env) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      session_id: sessionId,
      token_type: 'refresh'
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );
}

export function verifyAccessToken(token, env) {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token, env) {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSessionId() {
  return crypto.randomUUID();
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}
