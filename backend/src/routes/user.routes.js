const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { createUserValidation, updateUserValidation, paginationValidation, validate } = require('../middleware/validation');

router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List users (paginated)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, TEACHER, STUDENT] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated users list
 */
router.get('/', authorize('ADMIN'), paginationValidation, validate, userController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.get('/:id', authorize('ADMIN'), userController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName, role]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               role: { type: string, enum: [ADMIN, TEACHER, STUDENT] }
 */
router.post('/', authorize('ADMIN'), createUserValidation, validate, userController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 */
router.put('/:id', authorize('ADMIN'), updateUserValidation, validate, userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 */
router.delete('/:id', authorize('ADMIN'), userController.delete);

module.exports = router;
