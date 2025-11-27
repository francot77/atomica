import { Schema, model, models } from 'mongoose';

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    color: { type: String, default: '#f472b6' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = models.Service || model('Service', ServiceSchema);
