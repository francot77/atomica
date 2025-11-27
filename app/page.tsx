'use client';

import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch('/api/appointments/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || 'Error al crear turno');
      console.log('API ERROR', json);
      return;
    }

    setMessage(`Turno creado. ID: ${json.appointmentId}`);
    e.currentTarget.reset();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-md w-full max-w-md space-y-3"
      >
        <h1 className="text-xl font-semibold mb-2">Crear turno (test)</h1>

        <input
          name="clientName"
          placeholder="Nombre cliente"
          className="border px-2 py-1 w-full"
          required
        />
        <input
          name="clientPhone"
          placeholder="Teléfono"
          className="border px-2 py-1 w-full"
          required
        />
        <input
          name="serviceId"
          placeholder="ID de servicio"
          className="border px-2 py-1 w-full"
          required
        />
        <input
          type="date"
          name="date"
          className="border px-2 py-1 w-full"
          required
        />
        <input
          type="time"
          name="startTime"
          className="border px-2 py-1 w-full"
          required
          step={1800} // 1800s = 30 minutos
        />
        <textarea
          name="notes"
          placeholder="Notas (opcional)"
          className="border px-2 py-1 w-full"
        />

        <button
          disabled={loading}
          className="w-full bg-pink-500 text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Crear turno'}
        </button>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </form>
    </main>
  );
}
