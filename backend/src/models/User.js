import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String, required: true },
    refreshToken: { type: String },
    plan: { type: String, enum: ['FREE', 'LOCKED', 'PREMIUM'], default: 'FREE' },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
