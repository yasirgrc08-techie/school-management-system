const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const classRoutes = require('./routes/class.routes');
const subjectRoutes = require('./routes/subject.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
