import mongoose, { Schema, model } from 'mongoose';

export interface IContactSubmission {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.ContactSubmission ||
  model<IContactSubmission>('ContactSubmission', contactSubmissionSchema);
