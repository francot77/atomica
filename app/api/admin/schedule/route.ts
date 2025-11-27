/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { ScheduleDay } from '@/lib/models/ScheduleDay';

export async function GET() {
  await dbConnect();

  const docs = await ScheduleDay.find({}).lean();

  const byWeekday = new Map<number, any>();
  docs.forEach((d: any) => byWeekday.set(d.weekday, d));

  // siempre devolvemos 0..6, aunque estén vacíos
  const days = Array.from({ length: 7 }, (_, weekday) => {
    const doc = byWeekday.get(weekday);
    return {
      weekday,
      blocks: (doc?.blocks || []).map((b: any) => ({
        start: b.start,
        end: b.end,
      })),
    };
  });

  return NextResponse.json({ days }, { status: 200 });
}
