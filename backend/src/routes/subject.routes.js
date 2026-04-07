const router = require('express').Router();
const subjectController = require('../controllers/subject.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createSubjectValidation, paginationValidation, validate } = require('../middleware/validation');

router.use(authenticate);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: List subjects (paginated)
 *     tags: [Subjects]
 */
router.get('/', paginationValidation, validate, subjectController.getAll);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     tags: [Subjects]
 */
router.get('/:id', subjectController.getById);

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 */
router.post('/', authorize('ADMIN'), createSubjectValidation, validate, subjectController.create);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update subject
 *     tags: [Subjects]
 */
router.put('/:id', authorize('ADMIN'), subjectController.update);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete subject
 *     tags: [Subjects]
 */
router.delete('/:id', authorize('ADMIN'), subjectController.delete);

module.exports = router;
