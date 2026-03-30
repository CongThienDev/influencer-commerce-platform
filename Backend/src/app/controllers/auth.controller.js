import { sendError } from '../core/response.js';

export class AuthController {
  constructor({ authService, authCookieService }) {
    this.authService = authService;
    this.authCookieService = authCookieService;
  }

  login = (req, res) => {
    try {
      const result = this.authService.login(req.body || {});
      this.authCookieService.setAuthCookies(res, result);
      return res.json({
        success: true,
        user: result.user
      });
    } catch (error) {
      return sendError(res, error);
    }
  };

  refresh = (req, res) => {
    try {
      const result = this.authService.refresh(req.cookies?.refresh_token);
      this.authCookieService.setAuthCookies(res, result);
      return res.json({ success: true });
    } catch (error) {
      this.authCookieService.clearAuthCookies(res);
      return sendError(res, error);
    }
  };

  me = (req, res) =>
    res.json({
      authenticated: true,
      user: req.user
    });

  logout = (req, res) => {
    this.authService.logout(req.cookies?.refresh_token);
    this.authCookieService.clearAuthCookies(res);
    return res.json({ success: true });
  };
}
