import mongoose from 'mongoose';

const UsageLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    apiKeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey' },
    endpoint: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, default: 'SUCCESS' },
    meta: { type: Object } // Store file size, file type, output format
});

export default mongoose.model('UsageLog', UsageLogSchema);
