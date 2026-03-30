import { createAppError } from '../core/errors.js';
import {
  generateCsrfToken,
  generateSessionId,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from '../utils/token.js';
import { validateLoginPayload } from '../schemas/auth.schema.js';

export class AuthService {
  constructor({ env, authSessionModel }) {
    this.env = env;
    this.authSessionModel = authSessionModel;
  }

  login(payload) {
    const { email, password } = validateLoginPayload(payload);

    if (email !== this.env.ADMIN_EMAIL || password !== this.env.ADMIN_PASSWORD) {
      throw createAppError(401, 'UNAUTHORIZED', 'Invalid credentials');
    }

    const user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: this.env.ADMIN_EMAIL,
      role: 'admin',
      name: 'Admin'
    };

    const tokens = this.issueSessionTokens(user);
    const csrfToken = generateCsrfToken();

    return { user, ...tokens, csrfToken };
  }

  refresh(refreshToken) {
    if (!refreshToken) {
      throw createAppError(401, 'UNAUTHORIZED', 'Invalid credentials or session');
    }

    try {
      const payload = verifyRefreshToken(refreshToken, this.env);
      if (payload?.token_type !== 'refresh' || !payload?.session_id) {
        throw createAppError(401, 'UNAUTHORIZED', 'Invalid credentials or session');
      }

      const session = this.authSessionModel.get(payload.session_id);
      const isTokenHashMatch = session?.refreshTokenHash === hashToken(refreshToken);
      const isSessionExpired = !session || session.expiresAt <= Date.now();

      if (!isTokenHashMatch || isSessionExpired) {
        this.authSessionModel.delete(payload.session_id);
        throw createAppError(403, 'FORBIDDEN', 'Refresh token revoked');
      }

      this.authSessionModel.delete(payload.session_id);
      const tokens = this.issueSessionTokens(session.user);
      const csrfToken = generateCsrfToken();

      return { ...tokens, csrfToken };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw createAppError(401, 'UNAUTHORIZED', 'Invalid credentials or session');
    }
  }

  logout(refreshToken) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken, this.env);
      if (payload?.session_id) {
        this.authSessionModel.delete(payload.session_id);
      }
    } catch {
      // Invalid refresh token can be ignored during logout/cleanup.
    }
  }

  issueSessionTokens(user) {
    const sessionId = generateSessionId();
    const refreshToken = signRefreshToken(user, sessionId, this.env);
    const refreshTokenHash = hashToken(refreshToken);

    this.authSessionModel.set(sessionId, {
      user,
      refreshTokenHash,
      expiresAt: Date.now() + this.env.REFRESH_TOKEN_MAX_AGE_MS
    });

    return {
      accessToken: signAccessToken(user, this.env),
      refreshToken
    };
  }
}
