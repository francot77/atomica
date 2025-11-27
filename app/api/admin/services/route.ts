/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Service } from '@/lib/models/Service';

export async function GET(req: NextRequest) {
  await dbConnect();

  const services = await Service.find({})
    .sort({ name: 1 })
    .lean();

  const result = services.map((s: any) => ({
    id: String(s._id),
    name: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price,
    color: s.color,
    active: s.active,
  }));

  return NextResponse.json({ services: result }, { status: 200 });
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  const { name, durationMinutes, price, color, active } = body;

  if (!name || !durationMinutes) {
    return NextResponse.json(
      { error: 'Nombre y duración son obligatorios' },
      { status: 400 }
    );
  }

  const service = await Service.create({
    name,
    durationMinutes,
    price: price ?? 0,
    color: color || '#e87dad',
    active: active ?? true,
  });

  return NextResponse.json(
    {
      id: String(service._id),
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price,
      color: service.color,
      active: service.active,
    },
    { status: 201 }
  );
}
