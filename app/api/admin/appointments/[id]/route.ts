/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';
import { Service } from '@/lib/models/Service';
import { buildWhatsAppMessage, normalizePhone } from '@/lib/whatsapp';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();

  const id = params.id;
  const body = await req.json();
  const action = body.action as 'confirm' | 'reject';

  if (action !== 'confirm' && action !== 'reject') {
    return NextResponse.json(
      { error: 'Acción inválida' },
      { status: 400 }
    );
  }

  const appointment: any = await Appointment.findById(id);
  if (!appointment) {
    return NextResponse.json(
      { error: 'Turno no encontrado' },
      { status: 404 }
    );
  }

  const service: any = await Service.findById(appointment.serviceId);
  if (!service) {
    return NextResponse.json(
      { error: 'Servicio no encontrado' },
      { status: 500 }
    );
  }

  // actualizar estado
  appointment.status = action === 'confirm' ? 'confirmed' : 'rejected';
  await appointment.save();

  const msg = buildWhatsAppMessage(action, {
    clientName: appointment.clientName,
    date: appointment.date,
    startTime: appointment.startTime,
    serviceName: service.name,
  });

  const normalized = normalizePhone(appointment.clientPhone);
  const phoneForWa = normalized.startsWith('+')
    ? normalized.substring(1)
    : normalized;

  const waUrl = `https://wa.me/${phoneForWa}?text=${encodeURIComponent(msg)}`;

  return NextResponse.json(
    {
      ok: true,
      status: appointment.status,
      waUrl,
    },
    { status: 200 }
  );
}
