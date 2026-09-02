'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, type LucideIcon } from 'lucide-react';

export interface CategoriaDestacada {
  slug: string;
  nombre: string;
  descripcion: string;
  icon: LucideIcon;
  bg: string;
  color: string;
  image: string | null;
}

interface CategoriasCarouselProps {
  categorias: CategoriaDestacada[];
  href: string;
}

export function CategoriasCarousel({ categorias, href }: CategoriasCarouselProps) {
  const [active, setActive] = useState(0);
  const total = categorias.length;

  const go = (dir: 1 | -1) => setActive((prev) => (prev + dir + total) % total);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="relative w-full h-120" style={{ perspective: '1600px' }}>
        {categorias.map((categoria, index) => {
          let offset = index - active;
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          const abs = Math.abs(offset);
          const isActive = offset === 0;
          const visible = abs <= 2;

          return (
            <div
              key={categoria.nombre}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: total - abs }}
            >
              <motion.div
                className="w-[270px] sm:w-[300px]"
                style={{ pointerEvents: visible ? 'auto' : 'none' }}
                animate={{
                  x: offset * 160,
                  y: abs * 22,
                  rotate: offset * 10,
                  scale: isActive ? 1 : 1 - abs * 0.1,
                  opacity: visible ? (isActive ? 1 : 0.55) : 0,
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <Link
                  href={`${href}#${categoria.slug}`}
                  onClick={(e) => {
                    if (!isActive) {
                      e.preventDefault();
                      setActive(index);
                    }
                  }}
                  className="glass-panel flex flex-col gap-4 p-6 overflow-hidden group block cursor-pointer"
                >
                  <div className="relative w-full h-40 rounded-xl overflow-hidden -mx-6 -mt-6">
                    {categoria.image ? (
                      <Image
                        src={categoria.image}
                        alt={categoria.nombre}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: categoria.bg }}
                      >
                        <categoria.icon size={40} style={{ color: categoria.color }} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: categoria.bg, color: categoria.color }}
                  >
                    <categoria.icon size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-(--text-primary) mb-1">{categoria.nombre}</h3>
                    <p className="text-sm text-(--text-secondary) leading-relaxed">{categoria.descripcion}</p>
                  </div>

                  <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-[#1e63b8]/25 bg-[#1e63b8]/8 px-4 py-2 text-sm font-semibold text-[#164a8c] transition-all group-hover:gap-2.5 group-hover:border-[#1e63b8]/50 group-hover:bg-[#1e63b8]/15">
                    Ver más <ExternalLink size={14} />
                  </span>
                </Link>
              </motion.div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-8">
        <button
          onClick={() => go(-1)}
          className="w-12 h-12 rounded-full glass-panel border border-(--border) flex items-center justify-center text-(--text-primary) transition-all duration-300 hover:border-[#1e63b8]/40 hover:text-[#1e63b8] hover:scale-110 hover:shadow-lg hover:shadow-[#1e63b8]/15 cursor-pointer"
          aria-label="Categoría anterior"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="flex items-center gap-2">
          {categorias.map((categoria, index) => (
            <button
              key={categoria.nombre}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                index === active ? 'w-7 bg-[#1e63b8]' : 'w-2 bg-(--border) hover:bg-[#1b2a4a]/25'
              }`}
              aria-label={`Ir a ${categoria.nombre}`}
            />
          ))}
        </div>

        <button
          onClick={() => go(1)}
          className="w-12 h-12 rounded-full glass-panel border border-(--border) flex items-center justify-center text-(--text-primary) transition-all duration-300 hover:border-[#1e63b8]/40 hover:text-[#1e63b8] hover:scale-110 hover:shadow-lg hover:shadow-[#1e63b8]/15 cursor-pointer"
          aria-label="Siguiente categoría">
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
