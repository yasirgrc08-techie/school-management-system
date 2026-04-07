const router = require('express').Router();
const classController = require('../controllers/class.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createClassValidation, paginationValidation, validate } = require('../middleware/validation');

router.use(authenticate);

/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: List classes (paginated)
 *     tags: [Classes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: teacherId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 */
router.get('/', paginationValidation, validate, classController.getAll);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID with enrolled students
 *     tags: [Classes]
 */
router.get('/:id', classController.getById);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 */
router.post('/', authorize('ADMIN'), createClassValidation, validate, classController.create);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update class
 *     tags: [Classes]
 */
router.put('/:id', authorize('ADMIN'), classController.update);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete class
 *     tags: [Classes]
 */
router.delete('/:id', authorize('ADMIN'), classController.delete);

/**
 * @swagger
 * /api/classes/{id}/enroll:
 *   post:
 *     summary: Enroll a student in a class
 *     tags: [Classes]
 */
router.post('/:id/enroll', authorize('ADMIN'), classController.enrollStudent);

/**
 * @swagger
 * /api/classes/{id}/unenroll/{studentId}:
 *   delete:
 *     summary: Remove a student from a class
 *     tags: [Classes]
 */
router.delete('/:id/unenroll/:studentId', authorize('ADMIN'), classController.unenrollStudent);

module.exports = router;
