import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './src/config/db.js';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import conversionRoutes from './src/routes/conversionRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';

import rateLimit from 'express-rate-limit';

// App Init
const app = express();
const PORT = process.env.PORT || 5000;

// Global Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/convert', conversionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Tablify API is running...' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server Error', message: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});