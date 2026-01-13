import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import crypto from 'crypto';

const unifiedAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Not authorized. Provide Bearer token or ApiKey' });
    }

    if (authHeader.startsWith('ApiKey')) {
        // API KEY LOGIC
        const key = authHeader.split(' ')[1];
        // Hash the key to find it in DB (SHA256 for deterministic lookup)
        const hash = crypto.createHash('sha256').update(key).digest('hex');

        try {
            const apiKeyRecord = await ApiKey.findOne({ keyHash: hash, revoked: false }).populate('userId');

            if (!apiKeyRecord) {
                return res.status(401).json({ error: 'Invalid or revoked API Key' });
            }

            req.user = apiKeyRecord.userId;
            req.apiKey = apiKeyRecord;
            req.authMethod = 'API_KEY';
            return next();
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Server error during API Key validation' });
        }
    }

    if (authHeader.startsWith('Bearer')) {
        // JWT LOGIC
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ error: 'User not found' });
            }
            req.authMethod = 'JWT';
            return next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    res.status(401).json({ error: 'Not authorized. Invalid Authorization format.' });
};

export default unifiedAuth;
