/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { Appointment } from '@/lib/models/Appointment'; // ajusta path si es distinto
import dbConnect from '@/lib/db';

function buildWhatsAppUrl(appt: any) {
  const phone = (appt.clientPhone || '').replace(/[^\d]/g, '');
  const [year, month, day] = appt.date.split('-');
  const prettyDate = `${day}/${month}/${year}`;

  const serviceText = appt.serviceName ? `Servicio: ${appt.serviceName}\n` : '';

  const baseText =
    appt.status === 'confirmed'
      ? `Hola ${appt.clientName}! 👋\n` +
      `Te confirmo tu turno en Atómica Nails para el día ${prettyDate} a las ${appt.startTime} hs.\n` +
      serviceText +
      `Por favor respondé OK para confirmar. 💅`
      : `Hola ${appt.clientName}, te aviso que el turno del ${prettyDate} a las ${appt.startTime} hs fue actualizado.\n` +
      serviceText;

  const encoded = encodeURIComponent(baseText);

  // si no hay teléfono, devolvemos solo el texto (el FE puede mostrar alerta)
  if (!phone) {
    return `https://wa.me/?text=${encoded}`;
  }

  return `https://wa.me/${phone}?text=${encoded}`;
}
function buildWhatsAppReminderUrl(appt: any) {
  const phone = (appt.clientPhone || '').replace(/[^\d]/g, '');
  const [year, month, day] = appt.date.split('-');
  const prettyDate = `${day}/${month}/${year}`;

  const serviceText = appt.serviceName ? `Servicio: ${appt.serviceName}\n` : '';

  const text =
    `Hola ${appt.clientName}! 👋\n` +
    `Te recuerdo tu turno en Atómica Nails para el día ${prettyDate} a las ${appt.startTime} hs.\n` +
    serviceText +
    `Si NO podés asistir, avisá así liberamos el horario 💅`;

  const encoded = encodeURIComponent(text);

  if (!phone) {
    return `https://wa.me/?text=${encoded}`;
  }

  return `https://wa.me/${phone}?text=${encoded}`;
}


export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();

  const appt = await Appointment.findById(params.id).lean();

  if (!appt) {
    return NextResponse.json(
      { error: 'Turno no encontrado' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    appointment: {
      id: appt._id.toString(),
      clientName: appt.clientName,
      clientPhone: appt.clientPhone,
      date: appt.date,
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
      notes: appt.notes || '',
      // si en tu schema guardás serviceName / serviceColor, usalo:
      serviceName: (appt as any).serviceName || '',
      serviceColor: (appt as any).serviceColor || '#e87dad',
      createdAt: appt.createdAt,
      updatedAt: appt.updatedAt,
    },
  });
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();

  const body = await req.json();
  const action = body.action as
    | 'confirm'
    | 'reject'
    | 'cancel'
    | 'resend'
    | 'remind';
  const appt = await Appointment.findById(params.id);

  if (!appt) {
    return NextResponse.json(
      { error: 'Turno no encontrado' },
      { status: 404 }
    );
  }


  // reenviar mensaje de confirmación / actualización
  if (action === 'resend') {
    const waUrl = buildWhatsAppUrl(appt);
    return NextResponse.json(
      { waUrl, status: appt.status },
      { status: 200 }
    );
  }

  // enviar recordatorio MANUAL (no cambia estado)
  if (action === 'remind') {
    const waUrl = buildWhatsAppReminderUrl(appt);
    return NextResponse.json(
      { waUrl, status: appt.status },
      { status: 200 }
    );
  }


  if (action === 'confirm') {
    appt.status = 'confirmed';
  } else if (action === 'reject') {
    appt.status = 'rejected';
  } else if (action === 'cancel') {
    appt.status = 'cancelled';
  } else {
    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  }

  await appt.save();

  const waUrl = buildWhatsAppUrl(appt);

  return NextResponse.json(
    {
      status: appt.status,
      waUrl,
    },
    { status: 200 }
  );
}
