import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aqui Canta Bolivia — Plataforma Monorepo',
  description: 'Arquitectura Monorepo con Turborepo, NestJS, Next.js, Prisma y Docker',
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
