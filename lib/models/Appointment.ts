import { Schema, model, models } from 'mongoose';

const AppointmentSchema = new Schema(
  {
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: String, required: true },      // "YYYY-MM-DD"
    startTime: { type: String, required: true }, // "HH:mm"
    endTime: { type: String, required: true },   // "HH:mm"
    status: {
      type: String,
      enum: ['request', 'confirmed', 'cancelled', 'rejected'],
      default: 'request',
    },
    notes: { type: String },
     reminderSent: {
    type: Boolean,
    default: false,
  },
  lastReminderAt: {
    type: Date,
  }
  },
  { timestamps: true }
);

export const Appointment =
  models.Appointment || model('Appointment', AppointmentSchema);
