const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists.' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

module.exports = { errorHandler };
