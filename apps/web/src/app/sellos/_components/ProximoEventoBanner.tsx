import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const gradientBorderStyle = {
  borderTop: '4px solid',
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

export function ProximoEventoBanner() {
  return (
    <section className="relative h-auto overflow-hidden py-12 sm:h-72 sm:py-16" style={gradientBorderStyle}>
      <Image src="/images/FONDOS/F_FRAV 12.jpg" alt="" fill className="object-cover object-center" />
      <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/10" />

      {/* Versión Mobile: alineada a la izquierda */}
      <div className="relative flex items-center gap-4 pl-6 md:hidden">
        <div>
          <span className="font-barlow block text-lg font-semibold tracking-wide text-white uppercase">Próximos</span>
          <span className="font-bakbak block text-3xl font-black text-white">SELLOS</span>
        </div>
        <ChevronRight className="shrink-0 text-white" size={28} />
        <span className="font-bakbak text-3xl font-black text-white">FRIKICON</span>
      </div>

      {/* Versión Desktop: fila horizontal */}
      <div className="relative mx-auto hidden max-w-6xl items-center justify-start gap-6 px-8 md:flex lg:px-12">
        <div>
          <span className="font-barlow text-2xl! font-semibold tracking-wide text-white uppercase lg:text-4xl!">
            Próximos
          </span>
          <span className="font-bakbak block text-4xl! font-black text-white lg:text-7xl!">SELLOS</span>
        </div>
        <ChevronRight className="shrink-0 text-white" size={56} />
        <span className="font-bakbak text-5xl! font-black text-white lg:text-8xl!">FRIKICON</span>
      </div>
    </section>
  );
}
