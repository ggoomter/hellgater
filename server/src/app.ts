import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HELLGATER API Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
import apiRoutes from './routes/index.js';

app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Welcome to HELLGATER API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      characters: '/api/v1/characters',
    },
  });
});

app.use('/api/v1', apiRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
