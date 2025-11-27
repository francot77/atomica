/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Appointment } from '@/lib/models/Appointment';
import { Service } from '@/lib/models/Service';

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || '';
  const status = searchParams.get('status') || 'request'; // por defecto pendientes

  const query: any = {};
  if (date) query.date = date;
  if (status !== 'all') query.status = status;

  const appointments = await Appointment.find(query)
    .sort({ date: 1, startTime: 1 })
    .lean();

  // traer los servicios para mapear nombres
  const serviceIds = Array.from(
    new Set(appointments.map((a: any) => String(a.serviceId)))
  );

  const services = await Service.find({ _id: { $in: serviceIds } })
    .select('_id name')
    .lean();

  const serviceMap = new Map<string, string>();
  services.forEach((s: any) => {
    serviceMap.set(String(s._id), s.name);
  });

  const result = appointments.map((a: any) => ({
    id: String(a._id),
    clientName: a.clientName,
    clientPhone: a.clientPhone,
    serviceId: String(a.serviceId),
    serviceName: serviceMap.get(String(a.serviceId)) || 'Servicio',
    date: a.date,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    notes: a.notes || '',
    createdAt: a.createdAt,
  }));

  return NextResponse.json({ appointments: result }, { status: 200 });
}
