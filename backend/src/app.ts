import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Render terminates HTTPS at one trusted reverse proxy. Use the real client IP
// for rate limiting rather than grouping visitors under the proxy address.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet());

// Secure CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGIN || '').split(',')
  : '*'; // allow all in dev/test

app.use(cors({ origin: corsOrigins }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General API protection; authentication has a separate stricter limiter
// in auth.routes.ts (20 attempts per 15 minutes).
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// API Routes
app.use('/api', routes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
