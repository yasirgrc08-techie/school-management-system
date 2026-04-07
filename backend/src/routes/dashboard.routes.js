const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard statistics (role-based)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard stats based on user role
 */
router.get('/', dashboardController.getStats);

module.exports = router;
