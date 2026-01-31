import mongoose, { Schema, model, Types } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  deliveryAddress: { type: String },
  role: { type: String, enum: ['user', 'admin', 'superadmin', 'developer'], default: 'user' },
  adminSections: {
    type: [String],
    default: [],
  },
  orders: [{ type: Types.ObjectId, ref: 'Order' }],
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || model('User', userSchema);
