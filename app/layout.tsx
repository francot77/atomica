import './globals.css';
import type { Metadata } from 'next';

const siteUrl = 'https://atomicanails.vercel.app'; // TODO: cambiá por tu dominio real

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Atómica Nails – Agenda de turnos online',
    template: '%s | Atómica Nails',
  },
  description:
    'Reservá turnos de manicura en Atómica Nails desde tu celular. Elegí servicio, fecha y horario y recibí la confirmación por WhatsApp.',
  openGraph: {
    title: 'Atómica Nails – Agenda de turnos online',
    description:
      'Pedí tu turno de uñas de forma simple: seleccioná servicio, fecha y horario desde tu celular.',
    url: '/',
    siteName: 'Atómica Nails',
    images: [
      {
        url: '/background.webp',
        width: 1200,
        height: 630,
        alt: 'Estudio de uñas Atómica Nails',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atómica Nails – Agenda de turnos online',
    description:
      'Reservá turnos de manicura desde tu celular con confirmación por WhatsApp.',
    images: ['/og-atomica-nails.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
