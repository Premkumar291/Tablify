import User from '../models/User.js';
import ApiKey from '../models/ApiKey.js';
import UsageLog from '../models/UsageLog.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUserStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const conversionCount = await UsageLog.countDocuments({ endpoint: 'convert', status: 'SUCCESS' });
        res.json({ totalUsers: userCount, totalConversions: conversionCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const revokeUserKeys = async (req, res) => {
    try {
        const { userId } = req.body;
        await ApiKey.updateMany({ userId }, { revoked: true });
        res.json({ message: `All keys for user ${userId} revoked.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUserPlan = async (req, res) => {
    try {
        const { userId, plan } = req.body;
        if (!['FREE', 'LOCKED', 'PREMIUM'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        await User.findByIdAndUpdate(userId, { plan });
        res.json({ message: `User plan updated to ${plan}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
