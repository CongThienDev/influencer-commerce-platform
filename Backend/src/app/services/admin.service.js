import { createAppError } from '../core/errors.js';

export class AdminService {
  getDashboardSummary(user) {
    if (user.role !== 'admin') {
      throw createAppError(403, 'FORBIDDEN', 'Admin role required');
    }

    return {
      total_revenue: 0,
      total_orders: 0,
      total_commission: 0,
      top_influencers: []
    };
  }
}
