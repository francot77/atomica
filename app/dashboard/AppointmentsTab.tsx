/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { AdminAppointment, PINK } from './types';
import Link from 'next/link';
function getWeekRange(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0 domingo, 1 lunes, ...
  const diffToMonday = (day + 6) % 7;

  const monday = new Date(d);
  monday.setDate(d.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (dt: Date) => dt.toISOString().slice(0, 10);
  return { from: format(monday), to: format(sunday) };
}

function getDayName(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];
  return days[d.getDay()];
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

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

function getTodayAndTomorrowStr() {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  const toStr = (dt: Date) => {
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    todayStr: toStr(today),
    tomorrowStr: toStr(tomorrow),
  };
}

export default function AppointmentsTab() {
  const [date, setDate] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [statusFilter, setStatusFilter] = useState<
    'request' | 'confirmed' | 'all'
  >('request');
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [errorAppointments, setErrorAppointments] = useState<string | null>(
    null
  );

  // resumen hoy/mañana
  const [summary, setSummary] = useState<{
    today: AdminAppointment[];
    tomorrow: AdminAppointment[];
  } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  // fecha de hoy para filtros
  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // cargar turnos según filtros
  useEffect(() => {
    if (!date) return;
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, statusFilter, viewMode]);

  // cargar resumen hoy / mañana una vez al montar
  useEffect(() => {
    loadSummary();
  }, []);

  async function handleReminder(appt: AdminAppointment) {
    const ok = window.confirm(
      `¿Enviar recordatorio por WhatsApp a ${appt.clientName} para el turno del ${appt.date} a las ${appt.startTime}?`
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remind' }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || 'Error enviando recordatorio');
        return;
      }

      if (json.waUrl) {
        window.open(json.waUrl, '_blank');
      }
    } catch (e) {
      console.error(e);
      alert('Error enviando recordatorio');
    }
  }


  async function loadAppointments() {
    setLoadingAppointments(true);
    setErrorAppointments(null);

    try {
      const params = new URLSearchParams({
        status: statusFilter,
      });

      if (viewMode === 'day' && date) {
        params.set('date', date);
      } else if (viewMode === 'week' && date) {
        const { from, to } = getWeekRange(date);
        params.set('from', from);
        params.set('to', to);
      }

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setErrorAppointments(json.error || 'Error cargando turnos');
        setAppointments([]);
      } else {
        let appts: AdminAppointment[] = json.appointments || [];

        // filtrar turnos ya pasados de HOY
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);

        appts = appts.filter((a) => {
          if (a.date !== todayStr) return true;
          const end = new Date(`${a.date}T${a.endTime}:00`);
          return end >= now;
        });

        setAppointments(appts);
      }
    } catch (e) {
      console.error(e);
      setErrorAppointments('Error cargando turnos');
      setAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  }

  async function loadSummary() {
    setLoadingSummary(true);
    setErrorSummary(null);

    try {
      const { todayStr, tomorrowStr } = getTodayAndTomorrowStr();

      const [resToday, resTomorrow] = await Promise.all([
        fetch(
          `/api/admin/appointments?status=confirmed&date=${todayStr}`
        ),
        fetch(
          `/api/admin/appointments?status=confirmed&date=${tomorrowStr}`
        ),
      ]);

      const [jsonToday, jsonTomorrow] = await Promise.all([
        resToday.json(),
        resTomorrow.json(),
      ]);

      if (!resToday.ok) {
        throw new Error(jsonToday.error || 'Error hoy');
      }
      if (!resTomorrow.ok) {
        throw new Error(jsonTomorrow.error || 'Error mañana');
      }

      let todayAppts: AdminAppointment[] = jsonToday.appointments || [];
      const tomorrowAppts: AdminAppointment[] =
        jsonTomorrow.appointments || [];

      // mismo filtro de "turnos pasados" para HOY
      const now = new Date();
      const todayIso = now.toISOString().slice(0, 10);

      todayAppts = todayAppts.filter((a) => {
        if (a.date !== todayIso) return true;
        const end = new Date(`${a.date}T${a.endTime}:00`);
        return end >= now;
      });

      setSummary({
        today: todayAppts,
        tomorrow: tomorrowAppts,
      });
    } catch (e) {
      console.error(e);
      setErrorSummary('Error cargando resumen de hoy/mañana');
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }

  async function handleAction(
    appt: AdminAppointment,
    action: 'confirm' | 'reject'
  ) {
    const label =
      action === 'confirm' ? 'confirmar' : 'rechazar';

    const ok = window.confirm(
      `¿Seguro que querés ${label} el turno de ${appt.clientName} el ${appt.date} a las ${appt.startTime}?`
    );

    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/appointments/${appt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || 'Error actualizando el turno');
        return;
      }

      // abre WhatsApp con el mensaje
      window.open(json.waUrl, '_blank');

      // actualiza estado en la lista
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appt.id ? { ...a, status: json.status } : a
        )
      );

      // refresca resumen hoy/mañana si lo estás usando
      loadSummary();
    } catch (e) {
      console.error(e);
      alert('Error actualizando el turno');
    }
  }


  let weekLabel = '';
  if (viewMode === 'week' && date) {
    const { from, to } = getWeekRange(date);
    weekLabel = `Semana del ${from} al ${to}`;
  }

  return (
    <>
      {/* RESUMEN HOY / MAÑANA */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Resumen rápido</h2>
          <button
            onClick={loadSummary}
            className="text-[11px] px-2 py-1 rounded-full border border-slate-700 hover:bg-slate-800"
          >
            Actualizar
          </button>
        </div>

        {loadingSummary && (
          <p className="text-xs text-slate-400">Cargando...</p>
        )}
        {errorSummary && (
          <p className="text-xs text-red-400">{errorSummary}</p>
        )}

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* HOY */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  Hoy (
                  {summary.today[0]
                    ? formatShortDate(summary.today[0].date)
                    : formatShortDate(getTodayAndTomorrowStr().todayStr)}
                  )
                </span>
                <span className="text-[11px] text-slate-400">
                  {summary.today.length} turno
                  {summary.today.length !== 1 ? 's' : ''}
                </span>
              </div>
              {summary.today.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No hay turnos confirmados hoy.
                </p>
              ) : (
                <ul className="space-y-1">
                  {summary.today.map((a) => (
                    <li
                      key={a.id}
                      className="text-[11px] text-slate-200 flex items-center gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span>
                          <span
                            className="font-semibold"
                            style={{ color: PINK }}
                          >
                            {a.startTime}
                          </span>{' '}
                          · {a.clientName}
                        </span>
                        <span className="block text-slate-400 truncate max-w-[160px]">
                          {a.serviceName}
                        </span>
                      </div>

                      <button
                        onClick={() => handleReminder(a)}
                        className="text-[10px] px-2 py-1 rounded-full border border-pink-500 text-pink-300 hover:bg-pink-500/10 whitespace-nowrap"
                      >
                        Recordatorio
                      </button>
                    </li>
                  ))}

                </ul>
              )}
            </div>

            {/* MAÑANA */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">
                  Mañana (
                  {summary.tomorrow[0]
                    ? formatShortDate(summary.tomorrow[0].date)
                    : formatShortDate(getTodayAndTomorrowStr().tomorrowStr)}
                  )
                </span>
                <span className="text-[11px] text-slate-400">
                  {summary.tomorrow.length} turno
                  {summary.tomorrow.length !== 1 ? 's' : ''}
                </span>
              </div>
              {summary.tomorrow.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No hay turnos confirmados mañana.
                </p>
              ) : (
                <ul className="space-y-1">
                  {summary.tomorrow.map((a) => (
                    <li
                      key={a.id}
                      className="text-[11px] text-slate-200 flex items-center gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span>
                          <span
                            className="font-semibold"
                            style={{ color: PINK }}
                          >
                            {a.startTime}
                          </span>{' '}
                          · {a.clientName}
                        </span>
                        <span className="block text-slate-400 truncate max-w-[160px]">
                          {a.serviceName}
                        </span>
                      </div>

                      <button
                        onClick={() => handleReminder(a)}
                        className="text-[10px] px-2 py-1 rounded-full border border-pink-500 text-pink-300 hover:bg-pink-500/10 whitespace-nowrap"
                      >
                        Recordatorio
                      </button>
                    </li>
                  ))}

                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* FILTROS PRINCIPALES */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">
            Fecha base
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-sm rounded-md px-2 py-1"
          />
          <span className="text-[10px] text-slate-500">
            En modo semana se usa para calcular la semana.
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Vista</span>
          <div className="inline-flex rounded-md border border-slate-700 overflow-hidden w-fit">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs ${viewMode === 'day'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-900 text-slate-300'
                }`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs ${viewMode === 'week'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-900 text-slate-300'
                }`}
            >
              Semana
            </button>
          </div>
          {viewMode === 'week' && weekLabel && (
            <p className="text-[10px] text-slate-500">
              {weekLabel}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400">Estado</span>
          <div className="inline-flex rounded-md border border-slate-700 overflow-hidden w-fit">
            <button
              onClick={() => setStatusFilter('request')}
              className={`px-3 py-1 text-xs ${statusFilter === 'request'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-900 text-slate-300'
                }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1 text-xs ${statusFilter === 'confirmed'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-900 text-slate-300'
                }`}
            >
              Confirmados
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs ${statusFilter === 'all'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-900 text-slate-300'
                }`}
            >
              Todos
            </button>
          </div>
        </div>
      </section>

      {/* LISTA DE TURNOS */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Turnos</h2>
          {loadingAppointments && (
            <span className="text-xs text-slate-400">
              Cargando...
            </span>
          )}
        </div>

        {errorAppointments && (
          <p className="text-xs text-red-400">
            {errorAppointments}
          </p>
        )}

        {!loadingAppointments &&
          appointments.length === 0 &&
          !errorAppointments && (
            <p className="text-xs text-slate-400">
              No hay turnos para esta combinación de filtros.
            </p>
          )}

        <div className="space-y-2">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="border-l-4 bg-slate-950 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              style={{ borderLeftColor: a.serviceColor || PINK }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    {a.date} · {getDayName(a.date)}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: PINK }}
                  >
                    {a.startTime}
                  </span>
                  <span className="text-sm font-medium">
                    {a.clientName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === 'request'
                      ? 'bg-pink-500/20 text-pink-300'
                      : a.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-700/50 text-slate-200'
                      }`}
                  >
                    {statusLabel(a.status)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  <span>{a.serviceName}</span>
                  {a.clientPhone && (
                    <>
                      {' '}
                      · <span>{a.clientPhone}</span>
                    </>
                  )}
                </div>
                {a.notes && (
                  <p className="text-xs text-slate-300 mt-1">
                    {a.notes}
                  </p>
                )}
                <div className="mt-1">
                  <Link
                    href={`/dashboard/appointments/${a.id}`}
                    className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>

              {a.status === 'request' && (
                <div className="flex flex-row gap-2 justify-end">
                  <button
                    onClick={() => handleAction(a, 'confirm')}
                    className="text-xs px-3 py-1 rounded-md"
                    style={{
                      backgroundColor: PINK,
                      color: '#0f172a',
                    }}
                  >
                    Confirmar + WhatsApp
                  </button>
                  <button
                    onClick={() => handleAction(a, 'reject')}
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
    </>
  );
}
