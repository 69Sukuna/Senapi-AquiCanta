import { Sparkles } from 'lucide-react';
import { LogoGoogle } from '@/components/BotonLoginGoogle';

// Pantalla de "arranque" tipo videojuego: mientras no haya sesión, esto
// reemplaza todo el pasaporte interactivo (bienvenida/riel/medallas y las
// tarjetas de cada trayecto) tanto en mobile como en desktop — loguearse es
// el "botón de inicio" antes de poder jugar/escanear.
export function IniciaTuAventura({ onLoginGoogle }: { onLoginGoogle: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-(--accent-gold-light) bg-(--brand-negro) px-6! py-10! text-center sm:px-12! sm:py-16!">
      {/* Marco tipo HUD de videojuego, en las 4 esquinas. */}
      <span className="absolute top-3! left-3! h-6 w-6 border-t-2 border-l-2 border-(--accent-gold-light)" />
      <span className="absolute top-3! right-3! h-6 w-6 border-t-2 border-r-2 border-(--accent-gold-light)" />
      <span className="absolute bottom-3! left-3! h-6 w-6 border-b-2 border-l-2 border-(--accent-gold-light)" />
      <span className="absolute bottom-3! right-3! h-6 w-6 border-b-2 border-r-2 border-(--accent-gold-light)" />

      {/* Resplandores decorativos, mismo tono que el resto de Sellos. */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-(--accent-gold-light) opacity-[0.15] blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-(--brand-cafe) opacity-[0.25] blur-3xl" />

      <div className="relative">
        <span className="font-barlow inline-flex items-center gap-1.5 rounded-full border border-(--accent-gold-light)/40 px-3! py-1! text-[11px] font-bold tracking-[0.3em] text-(--accent-gold-light) uppercase">
          <Sparkles size={12} />
          Nivel 1
        </span>

        <h2 className="font-bakbak mt-4! text-3xl leading-none text-(--brand-crema) sm:text-5xl">
          ¡INICIA TU AVENTURA!
        </h2>

        <p className="font-barlow mx-auto! mt-3! max-w-md text-sm text-(--brand-crema)/70 sm:text-base">
          Iniciá sesión con Google para armar tu pasaporte, escanear tus primeros sellos y empezar a desbloquear
          medallas y rangos.
        </p>

        <button
          type="button"
          onClick={onLoginGoogle}
          className="font-bakbak mt-7! inline-flex items-center gap-3! rounded-full bg-(--brand-crema) px-8! py-3.5! text-sm tracking-[0.15em] text-(--brand-negro) uppercase shadow-[0_0_0_3px_rgba(240,168,62,0.5)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_28px_rgba(240,168,62,0.55)]"
        >
          <LogoGoogle size={20} />
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
