'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PINK = '#e87dad';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(json.error || 'Error de login');
        return;
      }

      router.push(from);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Error de conexión');
    }
  }

  return (
    <main className="min-h-screen relative bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-24 w-72 h-72 rounded-full opacity-40 blur-3xl"
          style={{ backgroundColor: PINK }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: '#22c55e' }}
        />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-sm bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-6 shadow-2xl shadow-black/60 backdrop-blur">
        {/* Header pequeño */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-black/40"
              style={{ backgroundColor: PINK, color: '#020617' }}
            >
              A
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide">
                Atómica Nails
              </h1>
              <p className="text-[11px] text-slate-400">
                Panel de turnos
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-[11px] text-slate-400 hover:text-slate-200"
          >
            Volver al inicio
          </Link>
        </div>

        <h2 className="text-lg font-semibold mb-1">Iniciar sesión</h2>
        <p className="text-xs text-slate-400 mb-4">
          Solo la dueña del estudio puede acceder a este panel para ver y
          confirmar turnos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1 text-slate-200">
              Usuario
            </label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs mb-1 text-slate-200">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full mt-2 rounded-full py-2 text-sm font-medium shadow-md shadow-black/40 disabled:opacity-60"
            style={{ backgroundColor: PINK, color: '#020617' }}
          >
            {loading ? 'Ingresando...' : 'Entrar al panel'}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-4">
          Si cerrás esta ventana, los turnos siguen guardados. Solo es
          necesario entrar cuando quieras ver o confirmar reservas nuevas.
        </p>
      </div>
    </main>
  );
}
