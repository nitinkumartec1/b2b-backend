import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import packageRoutes from './routes/package.routes.js';
import destinationRoutes from './routes/destination.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import blogRoutes from './routes/blog.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import reviewRoutes from './routes/review.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import adminRoutes from './routes/admin.routes.js';
import categoryRoutes from './routes/category.routes.js';
import searchRoutes from './routes/search.routes.js';
import enquiryRoutes from './routes/enquiry.routes.js';

import Destination from './models/Destination.js';
import Category from './models/Category.js';
import Blog from './models/Blog.js';
import Package from './models/Package.js';

dotenv.config();
const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || '*', 
  credentials: true 
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Prevent NoSQL injections
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(compression()); // Compress responses

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 500,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Health Check
app.get('/api/health', (req, res) => res.json({ 
  success: true, 
  status: 'OK', 
  environment: process.env.NODE_ENV || 'development',
  ts: Date.now() 
}));

// Root and Favicon routes to prevent 404 logs on Vercel
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.png', (req, res) => res.status(204).end());
app.get('/', (req, res) => res.json({ 
  success: true, 
  message: 'B2BHolidays API is running.',
  version: '1.0.0'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Combined homepage data endpoint
app.get('/api/homepage', async (req, res, next) => {
  try {
    const [destinations, bestSellers, categories, trending, fixedDeps, blogs] = await Promise.all([
      Destination.find({ popular: true }).sort({ displayOrder: 1 }).limit(12).lean(),
      Package.find({ bestSelling: true }).sort({ rating: -1 }).limit(12).populate('category', 'name slug').lean(),
      Category.find().sort({ displayOrder: 1 }).lean(),
      Package.find({ trending: true }).sort({ rating: -1 }).limit(4).populate('category', 'name slug').lean(),
      Package.find({ fixedDeparture: true }).sort({ displayOrder: 1 }).limit(4).lean(),
      Blog.find({ published: true }).sort({ createdAt: -1 }).limit(3).lean()
    ]);
    res.json({ success: true, destinations, bestSellers, categories, trending, fixedDeps, blogs });
  } catch (err) {
    next(err);
  }
});

app.use(notFound);
app.use(errorHandler);

export default app;
