import { Schema, models, model } from 'mongoose';

const BlockSchema = new Schema(
  {
    start: { type: String, required: true }, // 'HH:MM'
    end: { type: String, required: true },   // 'HH:MM'
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const ScheduleDaySchema = new Schema(
  {
    // 0 = domingo, 1 = lunes, ... 6 = sábado
    weekday: { type: Number, required: true, unique: true },
    blocks: { type: [BlockSchema], default: [] },
  },
  { timestamps: true }
);

export const ScheduleDay =
  models.ScheduleDay || model('ScheduleDay', ScheduleDaySchema);
