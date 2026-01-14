import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '60m' });
    const refreshToken = jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '14d' });
    return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        user = await User.create({ email, password, name });
        const tokens = generateTokens(user._id);

        // Save refresh token to user
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, plan: user.plan }, tokens });
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

        // Update refresh token
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.json({ user: { id: user._id, email: user.email, name: user.name, plan: user.plan }, tokens });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Token required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newTokens = generateTokens(user._id);

        // Rotate token
        user.refreshToken = newTokens.refreshToken;
        await user.save();

        res.json(newTokens);
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

export const generateApiKey = async (req, res) => {
    const { name } = req.body;
    try {
        // Enforce Limits: 5 keys for FREE
        const user = await User.findById(req.user._id);
        const count = await ApiKey.countDocuments({ userId: req.user._id, revoked: false });

        if (user.plan === 'FREE' && count >= 5) {
            return res.status(403).json({ error: 'Limit reached: You can only have 5 active API keys on the Free plan.' });
        }

        const rawKey = 'sk_' + crypto.randomBytes(24).toString('hex');
        const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

        const apiKey = await ApiKey.create({
            userId: req.user._id,
            prefix: rawKey.substring(0, 7),
            keyHash: hash,
            name: name || 'My API Key'
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
