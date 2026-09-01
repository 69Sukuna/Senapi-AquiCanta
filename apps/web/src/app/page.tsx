'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { CategoriasCarousel } from '@/components/CategoriasCarousel';
import {
  ArrowRight,
  CheckSquare,
  ExternalLink,
  FileText,
  MapPin,
  Mic,
  Mic2,
  Users,
  PenTool,
  Music2,
  Guitar
} from 'lucide-react';

// Mock local (HP-2) — sin fuente en Postgres todavía, todas enlazan a /categorias
const CATEGORIAS_DESTACADAS = [
  {
    slug: 'solista-vocal',
    nombre: 'Solista Vocal',
    descripcion: 'Voces solistas que interpretan el cancionero popular y tradicional boliviano.',
    icon: Mic,
    bg: 'rgba(56, 189, 248, 0.15)',
    color: 'var(--accent-blue)',
    image: '/images/categorias/solista-vocal.jpg',
  },
  {
    slug: 'grupo-vocal-instrumental',
    nombre: 'Grupo Vocal Instrumental',
    descripcion: 'Agrupaciones que combinan voces e instrumentos tradicionales en escena.',
    icon: Users,
    bg: 'rgba(245, 158, 11, 0.15)',
    color: 'var(--accent-gold)',
    image: '/images/categorias/grupo-vocal-instrumental.jpg',
  },
  {
    slug: 'composicion',
    nombre: 'Composición',
    descripcion: 'Obras inéditas de autores y compositores bolivianos.',
    icon: PenTool,
    bg: 'rgba(168, 85, 247, 0.15)',
    color: 'var(--accent-purple)',
    image: '/images/categorias/composicion.jpg',
  },
  {
    slug: 'autoctono',
    nombre: 'Autóctono',
    descripcion: 'Expresiones musicales originarias interpretadas con instrumentos tradicionales.',
    icon: Music2,
    bg: 'rgba(16, 185, 129, 0.15)',
    color: 'var(--accent-green)',
    image: '/images/categorias/autoctono.jpg',
  },
  {
    slug: 'duo-vocal-instrumental',
    nombre: 'Dúo Vocal Instrumental',
    descripcion: 'Parejas de intérpretes que combinan voz e instrumento en un mismo acto.',
    icon: Mic2,
    bg: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    image: '/images/categorias/duo-vocal-instrumental.jpg',
  },
  {
    slug: 'solista-instrumental-melodico',
    nombre: 'Solista Instrumental',
    descripcion: 'Ejecutantes solistas que destacan por su dominio de un instrumento melódico.',
    icon: Guitar,
    bg: 'rgba(56, 189, 248, 0.15)',
    color: 'var(--accent-blue)',
    image: '/images/categorias/solista-instrumental.jpg',
  },
];

interface ApiHealth {
  status: string;
  service: string;
  timestamp: string;
  database: {
    status: string;
    totalUsers: number;
  };
}

export default function Home() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo conectar con la API de NestJS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  return (
    <main className="container">
      {/* Header */}
      <header className="pt-10! pb-16! md:pt-14! md:pb-24!">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Columna de texto */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge badge-gold w-fit mb-4!">
                <span className="pulse-dot" /> XXXIII Edición
              </span>
              <p className="text-sm md:text-base font-semibold tracking-[0.2em] text-white/60 uppercase mb-2!">
                Festival Nacional de la Canción Boliviana
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] bg-linear-to-br from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
                “Aquí… Canta Bolivia”
              </h1>
            </div>

            <p className="text-white/70 text-base leading-relaxed max-w-xl">
              El mayor acontecimiento musical de nuestras culturas populares y tradicionales,
              permite expresar a intérpretes y compositores, obras, saberes y sentimientos de
              su identidad cultural, a los que se invita a participar en el proceso de
              selección en las diferentes categorías.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={ROUTES.inscripciones}
                className="group inline-flex items-center gap-2 px-7! py-3.5! rounded-lg font-semibold text-[#200308] bg-linear-to-br from-[#f4c94f] to-[#e11d2e] shadow-lg shadow-[#e11d2e]/25 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#e11d2e]/35"
              >
                Inscríbete
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href={ROUTES.votacionPrevia}
                className="inline-flex items-center gap-2 px-6! py-3! rounded-lg font-semibold text-[#f4c94f] border border-[#e0a527]/40 bg-[#e0a527]/10 transition-all duration-300 hover:border-[#e0a527]/70 hover:bg-[#e0a527]/20 hover:-translate-y-0.5"
              >
                <CheckSquare size={16} /> Votaciones
              </Link>

              <a
                href="https://drive.google.com/file/d/1ggcf9PPSnQ-7jc0mTFxQqr27Q5ExGJSZ/view?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-3! font-semibold text-white/70 underline-offset-4 transition-colors duration-300 hover:text-[#fdf6ec] hover:underline"
              >
                <FileText size={16} /> Lee la Convocatoria
              </a>
            </div>
          </div>

          {/* Columna de imagen */}
          <div className="relative w-full h-[45vh] min-h-64 max-h-[500px] md:h-[55vh] md:max-h-[560px] rounded-2xl overflow-hidden glass-panel">
            <Image
              src="/images/header.jpg"
              alt="Festival Nacional de la Canción Boliviana - Aquí Canta Bolivia"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </header>

      {/* Categorías destacadas */}
      <section className="py-16! md:py-20! border-t border-[#e0a527]/10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8!">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-white/60 uppercase mb-2!">
              Convocatoria
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent">
              Categorías Destacadas
            </h2>
          </div>
          <Link
            href={ROUTES.categorias}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e0a527]/30 bg-[#e0a527]/10 px-5! py-2.5! text-sm font-semibold text-[#f4c94f] transition-all duration-300 hover:gap-3 hover:border-[#e0a527]/60 hover:bg-[#e0a527]/20 hover:-translate-y-0.5"
          >
            Ver todas las categorías <ExternalLink size={14} />
          </Link>
        </div>

        <CategoriasCarousel categorias={CATEGORIAS_DESTACADAS} href={ROUTES.categorias} />
      </section>

      {/* Sede del festival */}
      <section className="py-16! md:py-20! border-t border-[#e0a527]/10">
        <div className="mb-8!">
          <p className="text-sm font-semibold tracking-[0.2em] text-white/60 uppercase mb-2!">
            Sede del Festival
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-[#fdf6ec] via-[#f4c94f] to-[#ff4d5e] bg-clip-text text-transparent mb-3!">
            Teatro Internacional de Oruro
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-2xl">
            El escenario oficial de "Aquí… Canta Bolivia", en la ciudad de Oruro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="group relative w-full h-80 md:h-96 rounded-2xl overflow-hidden glass-panel">
            <Image
              src="/images/palco.jpg"
              alt="Teatro Internacional de Oruro"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/10 to-transparent px-5! pb-4! pt-10!">
              <span className="text-sm font-semibold text-white">Interior del teatro</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="isolate relative w-full h-80 md:h-96 rounded-2xl overflow-hidden glass-panel">
              <iframe
                src="https://www.google.com/maps?q=Teatro+Internacional+de+Oruro,+Bolivia&output=embed"
                className="absolute inset-0 h-full w-full border-0 grayscale invert-92 contrast-90"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del Teatro Internacional de Oruro"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#3d0a13] mix-blend-color" />
              <span className="pointer-events-none absolute left-4! top-4! inline-flex items-center gap-1.5 rounded-full border border-[#e0a527]/40 bg-[#170406]/90 px-3! py-1.5! text-xs font-bold text-[#f4c94f] backdrop-blur-md">
                <MapPin size={12} /> Oruro, Bolivia
              </span>
            </div>

            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Teatro+Internacional+de+Oruro,+Bolivia"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 self-end rounded-lg border border-[#e0a527]/30 bg-[#e0a527]/10 px-5! py-2.5! text-sm font-semibold text-[#f4c94f] transition-all duration-300 hover:gap-3 hover:border-[#e0a527]/60 hover:bg-[#e0a527]/20 hover:-translate-y-0.5"
            >
              Cómo llegar <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
