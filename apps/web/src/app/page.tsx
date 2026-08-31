'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { CategoriasCarousel } from '@/components/CategoriasCarousel';
import {
  Server,
  Database,
  Layers,
  Cpu,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Box,
  CloudUpload,
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
      <header className="py-10">
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          {/* Columna de texto */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="badge badge-gold w-fit mb-4">
                <span className="pulse-dot" /> XXXIII Edición
              </span>
              <h1 className="text-sm md:text-base font-semibold tracking-[0.2em] text-white/60 uppercase mb-2">
                Festival Nacional de la Canción Boliviana
              </h1>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] bg-linear-to-br from-white via-[#f4c94f] to-[#e0a527] bg-clip-text text-transparent">
                “Aquí… Canta Bolivia”
              </h1>
            </div>

            <p className="text-white/70 text-base leading-relaxed max-w-xl">
              El mayor acontecimiento musical de nuestras culturas populares y tradicionales,
              permite expresar a intérpretes y compositores, obras, saberes y sentimientos de
              su identidad cultural, a los que se invita a participar en el proceso de
              selección en las diferentes categorías.
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <button
                className="
                  px-6 py-3 rounded-lg font-semibold
                  text-white
                  bg-[#D52B1E]
                  shadow-md shadow-black/30
                  transition-all duration-300
                  hover:brightness-110
                  hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-black/40
                  cursor-pointer
                "
              >
                Votaciones
              </button>

              <button
                className="
                  px-6 py-3 rounded-lg font-semibold
                  text-[#3D2B00]
                  bg-[#F9E300]
                  shadow-md shadow-black/30
                  transition-all duration-300
                  hover:brightness-110
                  hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-black/40
                  cursor-pointer
                "
              >
                Lee la Convocatoria
              </button>

              <button
                className="
                  px-6 py-3 rounded-lg font-semibold
                  text-white
                  bg-[#007A33]
                  shadow-md shadow-black/30
                  transition-all duration-300
                  hover:brightness-110
                  hover:-translate-y-0.5
                  hover:shadow-lg hover:shadow-black/40
                  cursor-pointer
                "
              >
                Inscríbete
              </button>
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
      <section className="py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-sm font-semibold tracking-[0.2em] text-white/60 uppercase mb-2">
              Convocatoria
            </h2>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Categorías Destacadas
            </h2>
          </div>
          <Link
            href={ROUTES.categorias}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e0a527]/30 bg-[#e0a527]/10 px-5 py-2.5 text-sm font-semibold text-[#f4c94f] transition-all duration-300 hover:gap-3 hover:border-[#e0a527]/60 hover:bg-[#e0a527]/20 hover:-translate-y-0.5"
          >
            Ver todas las categorías <ExternalLink size={14} />
          </Link>
        </div>

        <CategoriasCarousel categorias={CATEGORIAS_DESTACADAS} href={ROUTES.categorias} />
      </section>

      {/* Sede del festival */}
      <section className="py-10">
        <div className="mb-8">
          <h2 className="text-sm font-semibold tracking-[0.2em] text-white/60 uppercase mb-2">
            Sede del Festival
          </h2>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Teatro Internacional de Oruro
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-2xl">
            El escenario oficial de "Aquí… Canta Bolivia", en la ciudad de Oruro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden glass-panel">
            <Image
              src="/images/palco.jpg"
              alt="Teatro Internacional de Oruro"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden glass-panel">
            <iframe
              src="https://www.google.com/maps?q=Teatro+Internacional+de+Oruro,+Bolivia&output=embed"
              className="absolute inset-0 w-full h-full border-0 grayscale invert-92 contrast-90"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del Teatro Internacional de Oruro"
            />
          </div>
        </div>

        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Teatro+Internacional+de+Oruro,+Bolivia"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#e0a527]/30 bg-[#e0a527]/10 px-5 py-2.5 text-sm font-semibold text-[#f4c94f] transition-all duration-300 hover:gap-3 hover:border-[#e0a527]/60 hover:bg-[#e0a527]/20 hover:-translate-y-0.5"
        >
          Cómo llegar <ExternalLink size={14} />
        </a>
      </section>

    </main>
  );
}
