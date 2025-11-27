/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAvailability } from '@/lib/appointments';

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || '';
  const serviceId = searchParams.get('serviceId') || '';

  try {
    const slots = await getAvailability(date, serviceId);
    return NextResponse.json({ slots }, { status: 200 });
  } catch (err: any) {
    console.error('ERROR getAvailability:', err?.message || err);

    switch (err.message) {
      case 'MISSING_FIELDS':
        return NextResponse.json(
          { error: 'Falta fecha o servicio' },
          { status: 400 }
        );
      case 'SERVICE_NOT_FOUND':
        return NextResponse.json(
          { error: 'Servicio no encontrado' },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          { error: 'Error interno' },
          { status: 500 }
        );
    }
  }
}
