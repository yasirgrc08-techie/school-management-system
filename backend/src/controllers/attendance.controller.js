const attendanceService = require('../services/attendance.service');

class AttendanceController {
  async markAttendance(req, res, next) {
    try {
      const { classId, date, records } = req.body;
      const result = await attendanceService.markAttendance(classId, date, records);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByClass(req, res, next) {
    try {
      const { page, limit, date, startDate, endDate } = req.query;
      const result = await attendanceService.getByClass(req.params.classId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        date,
        startDate,
        endDate,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByStudent(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await attendanceService.getByStudent(req.params.studentId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const result = await attendanceService.getSummary(req.params.classId, startDate, endDate);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();
