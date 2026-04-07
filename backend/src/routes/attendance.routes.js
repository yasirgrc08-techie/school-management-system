const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { attendanceValidation, paginationValidation, validate } = require('../middleware/validation');

router.use(authenticate);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Mark attendance for a class
 *     tags: [Attendance]
 */
router.post('/', authorize('ADMIN', 'TEACHER'), attendanceValidation, validate, attendanceController.markAttendance);

/**
 * @swagger
 * /api/attendance/class/{classId}:
 *   get:
 *     summary: Get attendance records for a class
 *     tags: [Attendance]
 */
router.get('/class/:classId', paginationValidation, validate, attendanceController.getByClass);

/**
 * @swagger
 * /api/attendance/student/{studentId}:
 *   get:
 *     summary: Get attendance records for a student
 *     tags: [Attendance]
 */
router.get('/student/:studentId', attendanceController.getByStudent);

/**
 * @swagger
 * /api/attendance/summary/{classId}:
 *   get:
 *     summary: Get attendance summary for a class
 *     tags: [Attendance]
 */
router.get('/summary/:classId', attendanceController.getSummary);

module.exports = router;
