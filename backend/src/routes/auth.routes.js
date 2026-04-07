const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { loginValidation, validate } = require('../middleware/validation');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
