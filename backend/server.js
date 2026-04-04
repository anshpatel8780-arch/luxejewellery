const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const wishlistRoutes = require('./routes/wishlist');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chat');
const otpRoutes = require('./routes/otp');
const addressRoutes = require('./routes/addresses');
const contactRoutes = require('./routes/contact');
const couponRoutes = require('./routes/coupons');

const { checkCloudinaryConfig } = require('./utils/cloudinary');

const app = express();

// 1. Validate environment variables at startup (Strict for Production)
const validateEnv = () => {
    const required = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('\x1b[31m%s\x1b[0m', `FATAL ERROR: MISSING REQUIRED ENV VARIABLES: ${missing.join(', ')}`);
        process.exit(1);
    }
};
validateEnv();

// Middleware
// 2. Optimized CORS (Allows Local Dev + Production Frontend)
const allowedOrigins = ['http://localhost:4200', process.env.FRONTEND_URL];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('CORS Policy: Access denied from this origin.'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Validate Cloudinary config
checkCloudinaryConfig();

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/chat', chatRoutes);

// Health check (Secure - No secrets exposed)
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const { runSeed } = require('./seed');

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL DATABASE ERROR:', err.message);
      process.exit(1); // Never fallback in production
    }

    if (err.message.includes('ECONNREFUSED') || err.message.includes('missing')) {
      console.log('Local MongoDB not found. Starting in-memory database fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log(`In-memory MongoDB connected successfully at ${uri}`);

      console.log('Seeding in-memory database with initial data...');
      await runSeed();
      console.log('Seeding complete.');
    } else {
      throw err;
    }
  }
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
