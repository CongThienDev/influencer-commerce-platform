import { sendError } from '../core/response.js';

export class AdminController {
  constructor({ adminService }) {
    this.adminService = adminService;
  }

  getDashboardSummary = (req, res) => {
    try {
      const summary = this.adminService.getDashboardSummary(req.user);
      return res.json(summary);
    } catch (error) {
      return sendError(res, error);
    }
  };
}
