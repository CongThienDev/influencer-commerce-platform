export class AuthCookieService {
  constructor({ env }) {
    this.env = env;
  }

  setAuthCookies(res, { accessToken, refreshToken, csrfToken }) {
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: this.env.IS_PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: this.env.ACCESS_TOKEN_MAX_AGE_MS
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.env.IS_PROD,
      sameSite: 'lax',
      path: '/v1/auth',
      maxAge: this.env.REFRESH_TOKEN_MAX_AGE_MS
    });

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: this.env.IS_PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: this.env.CSRF_TOKEN_MAX_AGE_MS
    });
  }

  clearAuthCookies(res) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.env.IS_PROD,
      sameSite: 'lax',
      path: '/'
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.env.IS_PROD,
      sameSite: 'lax',
      path: '/v1/auth'
    });

    res.clearCookie('csrf_token', {
      httpOnly: false,
      secure: this.env.IS_PROD,
      sameSite: 'lax',
      path: '/'
    });
  }
}
