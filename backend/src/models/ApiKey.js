import mongoose from 'mongoose';

const ApiKeySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    keyHash: { type: String, required: true }, // Store hashed key only
    name: { type: String, default: 'My API Key' },
    prefix: { type: String, required: true }, // To identify key type/user later if needed
    createdAt: { type: Date, default: Date.now },
    revoked: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 }
});

export default mongoose.model('ApiKey', ApiKeySchema);
