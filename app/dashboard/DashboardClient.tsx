'use client';

import { useState } from 'react'

import { PINK } from './types';
import AppointmentsTab from './AppointmentsTab';
import ServicesTab from './ServicesTab';
import ScheduleTab from './ScheduleTab';
import CalendarTab from './CalendarTab';

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

export default function DashboardClient() {
  const [tab, setTab] = useState<
    'appointments' | 'services' | 'schedule' | 'calendar'
  >('appointments');

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-4">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span style={{ color: PINK }}>Atómica</span> Nails
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Panel para administrar turnos, servicios y horarios.
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs border border-slate-600 px-3 py-1 rounded-md hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Tabs */}
        <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/60 p-1 text-xs">
          <button
            onClick={() => setTab('appointments')}
            className={`px-4 py-1.5 rounded-full ${tab === 'appointments'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-300'
              }`}
          >
            Turnos
          </button>
          <button
            onClick={() => setTab('services')}
            className={`px-4 py-1.5 rounded-full ${tab === 'services'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-300'
              }`}
          >
            Servicios
          </button>
          <button
            onClick={() => setTab('schedule')}
            className={`px-4 py-1.5 rounded-full ${tab === 'schedule'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-300'
              }`}
          >
            Horarios
          </button>
          <button
            onClick={() => setTab('calendar')}
            className={`px-4 py-1.5 rounded-full ${tab === 'calendar'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-300'
              }`}
          >
            Calendario
          </button>
        </div>

        {tab === 'appointments' && <AppointmentsTab />}
        {tab === 'services' && <ServicesTab />}
        {tab === 'schedule' && <ScheduleTab />}
        {tab === 'calendar' && <CalendarTab />}
      </div>
    </main>
  );
}
