import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import ApiKey from '../models/ApiKey.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
    const refreshToken = jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY });
    return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            // If user exists, just login for the test (or return error)
            // For test script simplicity, let's just error, but clean up the test script to handle it.
            return res.status(400).json({ error: 'User already exists' });
        }

        user = await User.create({ email, password });
        const tokens = generateTokens(user._id);

        // Save refresh token
        await RefreshToken.create({
            userId: user._id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        res.status(201).json({ user: { id: user._id, email: user.email, plan: user.plan }, tokens });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const tokens = generateTokens(user._id);

        await RefreshToken.create({
            userId: user._id,
            token: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json({ user: { id: user._id, email: user.email, plan: user.plan }, tokens });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const storedToken = await RefreshToken.findOne({ token, revoked: false });
        if (!storedToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Rotate
        storedToken.revoked = true;
        await storedToken.save();

        const newTokens = generateTokens(decoded.id);

        await RefreshToken.create({
            userId: decoded.id,
            token: newTokens.refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json(newTokens);
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const generateApiKey = async (req, res) => {
    try {
        const rawKey = 'sk_' + crypto.randomBytes(24).toString('hex');
        const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

        const apiKey = await ApiKey.create({
            userId: req.user._id,
            prefix: rawKey.substring(0, 7),
            keyHash: hash
        });

        res.status(201).json({ apiKey: rawKey, message: 'Store this key safely. It will not be shown again.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getApiKeys = async (req, res) => {
    try {
        const keys = await ApiKey.find({ userId: req.user._id }).select('-keyHash');
        res.json(keys);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
