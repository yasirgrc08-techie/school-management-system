const { body, query, param } = require('express-validator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const createUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('role').isIn(['ADMIN', 'TEACHER', 'STUDENT']).withMessage('Invalid role'),
];

const updateUserValidation = [
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('role').optional().isIn(['ADMIN', 'TEACHER', 'STUDENT']),
];

const createClassValidation = [
  body('name').trim().notEmpty().withMessage('Class name required'),
  body('section').trim().notEmpty().withMessage('Section required'),
  body('teacherId').isUUID().withMessage('Valid teacher ID required'),
  body('subjectId').isUUID().withMessage('Valid subject ID required'),
];

const createSubjectValidation = [
  body('name').trim().notEmpty().withMessage('Subject name required'),
  body('code').trim().notEmpty().withMessage('Subject code required'),
];

const attendanceValidation = [
  body('classId').isUUID().withMessage('Valid class ID required'),
  body('date').isISO8601().withMessage('Valid date required'),
  body('records').isArray({ min: 1 }).withMessage('At least one attendance record required'),
  body('records.*.studentId').isUUID().withMessage('Valid student ID required'),
  body('records.*.status').isIn(['PRESENT', 'ABSENT', 'LATE']).withMessage('Invalid status'),
];

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  validate,
  loginValidation,
  createUserValidation,
  updateUserValidation,
  createClassValidation,
  createSubjectValidation,
  attendanceValidation,
  paginationValidation,
};
