'use client';

import { useEffect, useState } from 'react';

type AdminAppointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'request' | 'confirmed' | 'cancelled' | 'rejected';
  notes: string;
};

const PINK = '#e87dad';

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

export default function DashboardPage() {
  const [date, setDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'request' | 'confirmed' | 'all'>('request');
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // setear fecha de hoy al cargar
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    if (!date) return;
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, statusFilter]);

  async function loadAppointments() {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Error cargando turnos');
        setAppointments([]);
      } else {
        setAppointments(json.appointments || []);
      }
    } catch (e) {
      console.error(e);
      setError('Error cargando turnos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: 'confirm' | 'reject') {
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || 'Error actualizando el turno');
        return;
      }

      // abrir WhatsApp en nueva pestaña
      window.open(json.waUrl, '_blank');

      // actualizar estado localmente
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: json.status } : a
        )
      );
    } catch (e) {
      console.error(e);
      alert('Error actualizando el turno');
    }
  }

  function statusLabel(status: AdminAppointment['status']) {
    switch (status) {
      case 'request':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  }

  function statusColor(status: AdminAppointment['status']) {
    switch (status) {
      case 'request':
        return 'border-pink-400';
      case 'confirmed':
        return 'border-emerald-400';
      case 'cancelled':
      case 'rejected':
        return 'border-slate-500';
      default:
        return 'border-slate-600';
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-4">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              <span
                style={{
                  color: PINK,
                }}
              >
                Agenda
              </span>{' '}
              de turnos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Ver y gestionar las solicitudes del día.
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs border border-slate-600 px-3 py-1 rounded-md hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </header>

        {/* Filtros */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-sm rounded-md px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Estado</span>
            <div className="inline-flex rounded-md border border-slate-700 overflow-hidden">
              <button
                onClick={() => setStatusFilter('request')}
                className={`px-3 py-1 text-xs ${
                  statusFilter === 'request'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3 py-1 text-xs ${
                  statusFilter === 'confirmed'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                Confirmados
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs ${
                  statusFilter === 'all'
                    ? 'bg-slate-100 text-slate-900'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                Todos
              </button>
            </div>
          </div>
        </section>

        {/* Lista de turnos */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Turnos</h2>
            {loading && (
              <span className="text-xs text-slate-400">
                Cargando...
              </span>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {!loading && appointments.length === 0 && !error && (
            <p className="text-xs text-slate-400">
              No hay turnos para esta combinación de filtros.
            </p>
          )}

          <div className="space-y-2">
            {appointments.map((a) => (
              <div
                key={a.id}
                className={`border-l-4 ${statusColor(
                  a.status
                )} bg-slate-950 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: PINK }}
                    >
                      {a.startTime}
                    </span>
                    <span className="text-sm font-medium">
                      {a.clientName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
                      {statusLabel(a.status)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    <span>{a.serviceName}</span>
                    {a.clientPhone && (
                      <>
                        {' '}
                        ·{' '}
                        <span>
                          {a.clientPhone}
                        </span>
                      </>
                    )}
                  </div>
                  {a.notes && (
                    <p className="text-xs text-slate-300 mt-1">
                      {a.notes}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                {a.status === 'request' && (
                  <div className="flex flex-row gap-2 justify-end">
                    <button
                      onClick={() => handleAction(a.id, 'confirm')}
                      className="text-xs px-3 py-1 rounded-md"
                      style={{
                        backgroundColor: PINK,
                        color: '#0f172a', // slate-900
                      }}
                    >
                      Confirmar + WhatsApp
                    </button>
                    <button
                      onClick={() => handleAction(a.id, 'reject')}
                      className="text-xs px-3 py-1 rounded-md border border-slate-600 text-slate-100 hover:bg-slate-800"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
