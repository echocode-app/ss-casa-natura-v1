import mongoose, { Schema, model, Types } from 'mongoose';

const passwordResetTokenSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PasswordResetToken ||
  model('PasswordResetToken', passwordResetTokenSchema);
