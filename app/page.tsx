'use client';

import Link from 'next/link';

const PINK = '#e87dad';

export default function Home() {
  return (
    <main className="relative min-h-screen text-slate-100">
      {/* Fondo con imagen del estudio */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/background.webp')", // cambiá esto por tu foto real
        }}
      />

      {/* Overlay negro transparente para contraste */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-6">
        {/* Barra superior */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-black/40"
              style={{ backgroundColor: PINK, color: '#020617' }}
            >
              A
            </div>
            <span className="text-sm font-semibold tracking-wide">
              Atómica Nails
            </span>
          </div>

          <Link
            href="/turnos"
            className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full border border-slate-200/40 hover:bg-slate-100/10"
          >
            Solicitar un turno
          </Link>
        </header>

        {/* Hero */}
        <section className="flex-1 flex items-center">
          <div className="w-full max-w-xl space-y-5">
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]">
              Uñas lindas,
              <br />
              <span style={{ color: PINK }}>turnos sin caos.</span>
            </h1>

            <p className="text-sm text-slate-200/90 max-w-md drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]">
              Pedí tu turno desde el celular, elegí día y horario, y recibí la
              confirmación por WhatsApp. Sin audios eternos, sin “¿tenés un
              lugarcito hoy?”.
            </p>

            <div className="space-y-3">
              <Link
                href="/turnos"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-lg shadow-black/40"
                style={{ backgroundColor: PINK, color: '#020617' }}
              >
                Solicitar un turno
                <span className="text-xs">💅</span>
              </Link>

              <p className="text-[11px] text-slate-200/80 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
                Funciona desde el navegador. No hace falta
                instalar nada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-100/90 mt-2">
              <div className="bg-black/25 border border-slate-100/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <p className="font-semibold text-[11px] mb-1">
                  Agenda ordenada
                </p>
                <p className="text-[11px]">
                  Ves solo los turnos disponibles.
                </p>
              </div>
              <div className="bg-black/25 border border-slate-100/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <p className="font-semibold text-[11px] mb-1">
                  Horarios reales
                </p>
                <p className="text-[11px]">
                  Turnos cada 30 minutos según disponibilidad real del estudio.
                </p>
              </div>
              <div className="bg-black/25 border border-slate-100/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                <p className="font-semibold text-[11px] mb-1">
                  Confirmación por WhatsApp
                </p>
                <p className="text-[11px]">
                  Recibis la confirmación automática en tu chat.
                </p>
              </div>
              
            </div>
          </div>
        </section>

        {/* Footer chiquito */}
        <footer className="mt-4 text-[11px] text-slate-200/75 flex justify-between gap-2">
          <span>Atómica Nails · Reservá tu turno online</span>
          <a href='/dashboard'><span>Soy Atomica</span></a>
          <span className="hidden sm:inline">Hecho a medida del estudio.</span>
        </footer>
      </div>
    </main>
  );
}
