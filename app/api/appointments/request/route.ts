/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { createAppointmentRequest } from '@/lib/appointments';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();

  try {
    const { appointment } = await createAppointmentRequest(body);

    return NextResponse.json(
      {
        ok: true,
        appointmentId: appointment._id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('ERROR createAppointmentRequest:', err?.message || err);

    switch (err.message) {
      case 'MISSING_FIELDS':
        return NextResponse.json(
          { error: 'Faltan datos' },
          { status: 400 }
        );
      case 'SERVICE_NOT_FOUND':
        return NextResponse.json(
          { error: 'Servicio no encontrado' },
          { status: 404 }
        );
      case 'TIME_UNAVAILABLE':
        return NextResponse.json(
          { error: 'Horario no disponible' },
          { status: 409 }
        );
      case 'INVALID_TIME':
        return NextResponse.json(
          { error: 'Hora inválida' },
          { status: 400 }
        );
      case 'INVALID_SLOT':
        return NextResponse.json(
          { error: 'Solo se permiten turnos cada 30 minutos' },
          { status: 400 }
        );
      default:
        return NextResponse.json(
          { error: 'Error interno' },
          { status: 500 }
        );
    }
  }
}
