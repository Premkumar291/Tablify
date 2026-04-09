import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Loosen CSP for React to work properly
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", "http://localhost:5000", "https://*"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Database
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/convert', conversionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Static Files (Frontend)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Base Route (API)
app.get('/api', (req, res) => {
    res.json({ message: 'Tablify API is running...' });
});

// API 404 handler
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API Route Not Found' });
});

// SPA Fallback - Serve index.html for all non-API routes
app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).json({ error: 'Not Found' });
        }
    });
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