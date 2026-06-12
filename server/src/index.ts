import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postRouter from './routes/posts';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configure CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming API calls in dev mode
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/posts', postRouter);

// Service Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Fallback 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found` });
});

// Centralized error handling
app.use(errorHandler);

// Launch HTTP Server
app.listen(port, () => {
  console.log(`[Server] Blogging Platform REST API running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${port}`);
});
