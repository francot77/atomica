'use client';

import { useEffect, useState } from 'react';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  color: string;
};

type Slot = {
  startTime: string;
  endTime: string;
};

export default function TurnosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Traer servicios al cargar
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const json = await res.json();
        setServices(json);
      } catch (e) {
        console.error(e);
        setError('Error cargando servicios');
      } finally {
        setLoadingServices(false);
      }
    }
    loadServices();
  }, []);

  async function loadSlots() {
    setError(null);
    setMessage(null);
    setSelectedSlot(null);
    setSlots([]);

    if (!selectedServiceId || !date) {
      setError('Elegí un servicio y una fecha');
      return;
    }

    setLoadingSlots(true);

    try {
      const params = new URLSearchParams({
        date,
        serviceId: selectedServiceId,
      });
      const res = await fetch(`/api/availability?${params.toString()}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Error obteniendo horarios');
      } else {
        setSlots(json.slots || []);
        if ((json.slots || []).length === 0) {
          setMessage('No hay horarios disponibles para ese día.');
        }
      }
    } catch (e) {
      console.error(e);
      setError('Error obteniendo horarios');
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!selectedServiceId || !date || !selectedSlot) {
      setError('Elegí un servicio, una fecha y un horario');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const clientName = String(formData.get('clientName') || '');
    const clientPhone = String(formData.get('clientPhone') || '');
    const notes = String(formData.get('notes') || '');

    if (!clientName || !clientPhone) {
      setError('Completá tu nombre y teléfono');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/appointments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          notes,
          serviceId: selectedServiceId,
          date,
          startTime: selectedSlot.startTime,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Error al solicitar el turno');
      } else {
        setMessage(
          'Tu solicitud fue enviada. Te van a confirmar el turno por WhatsApp.'
        );
        // opcional: limpiar selección
        setSelectedSlot(null);
        setSlots([]);
      }
    } catch (e) {
      console.error(e);
      setError('Error al solicitar el turno');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex justify-center p-4">
      <div className="bg-white rounded-md shadow-md p-4 w-full max-w-lg space-y-4">
        <h1 className="text-xl font-semibold">Sacar turno</h1>
        <p className="text-sm text-slate-600">
          Elegí el servicio, la fecha y uno de los horarios disponibles.
        </p>

        {/* Selección de servicio */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Servicio</label>
          {loadingServices ? (
            <p className="text-sm text-slate-500">Cargando servicios...</p>
          ) : (
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Elegí un servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.price ? `- $${s.price}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selección de fecha */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <button
          onClick={loadSlots}
          className="w-full bg-slate-800 text-white py-2 rounded text-sm"
          disabled={loadingSlots || !selectedServiceId || !date}
        >
          {loadingSlots ? 'Buscando horarios...' : 'Ver horarios disponibles'}
        </button>

        {/* Horarios */}
        {slots.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Horarios disponibles</p>
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected =
                  selectedSlot?.startTime === slot.startTime &&
                  selectedSlot?.endTime === slot.endTime;
                return (
                  <button
                    key={slot.startTime}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`border rounded py-1 text-sm ${
                      isSelected
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {slot.startTime}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form de datos del cliente */}
        {selectedSlot && (
          <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t">
            <p className="text-sm">
              Turno seleccionado:{' '}
              <span className="font-semibold">
                {date} a las {selectedSlot.startTime}
              </span>
            </p>
            <div>
              <label className="block text-sm mb-1">Tu nombre</label>
              <input
                name="clientName"
                className="border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Teléfono (WhatsApp)</label>
              <input
                name="clientPhone"
                className="border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Notas (diseño, color, etc.)
              </label>
              <textarea
                name="notes"
                className="border rounded px-2 py-1 w-full text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-pink-500 text-white py-2 rounded text-sm disabled:opacity-60"
            >
              {submitting ? 'Enviando solicitud...' : 'Solicitar turno'}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </div>
    </main>
  );
}
