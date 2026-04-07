const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getStats(req, res, next) {
    try {
      let stats;
      switch (req.user.role) {
        case 'ADMIN':
          stats = await dashboardService.getAdminStats();
          break;
        case 'TEACHER':
          stats = await dashboardService.getTeacherStats(req.user.id);
          break;
        case 'STUDENT':
          stats = await dashboardService.getStudentStats(req.user.id);
          break;
        default:
          return res.status(403).json({ error: 'Unknown role' });
      }
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
