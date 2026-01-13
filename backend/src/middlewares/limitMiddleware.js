import UsageLog from '../models/UsageLog.js';
import User from '../models/User.js';

export const enforceLimits = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        // Count total conversions for this user
        const conversionCount = await UsageLog.countDocuments({
            userId: req.user._id,
            endpoint: 'convert',
            status: 'SUCCESS'
        });

        // 1. FREE Tier: Max 10 conversions lifetime
        if (user.plan === 'FREE' && conversionCount >= 10) {
            return res.status(403).json({
                error: 'LIMIT_EXCEEDED',
                message: 'Free tier limit reached (10 conversions). Upgrade required.'
            });
        }

        // 2. API Key Limits: Max 50 requests if FREE
        if (req.apiKey) {
            if (req.apiKey.usageCount >= 50 && user.plan === 'FREE') {
                return res.status(403).json({
                    error: 'LIMIT_EXCEEDED',
                    message: 'API Key limit reached (50 requests).'
                });
            }
        }

        next();
    } catch (err) {
        console.error('Limit Check Error:', err);
        res.status(500).json({ error: 'Error checking usage limits' });
    }
};
