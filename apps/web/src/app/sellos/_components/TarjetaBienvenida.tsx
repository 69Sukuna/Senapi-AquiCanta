import { Lock, Stamp } from 'lucide-react';

interface RangoProgreso {
  id: string;
  nombre: string;
  orden: number;
  alcanzado: boolean;
}

interface TarjetaBienvenidaProps {
  rangos: RangoProgreso[];
  onEscanear: () => void;
  // Ya no es opcional: PasaportePage exige login antes de renderizar esta
  // tarjeta (ver IniciaTuAventura), así que siempre hay un usuario acá.
  usuario: { name: string | null };
}

// Tarjeta de "perfil de jugador" — misma identidad visual (HUD de esquinas,
// panel oscuro, acento dorado) que IniciaTuAventura, para que loguearse y
// entrar al pasaporte se sientan como la misma pantalla de juego.
export function TarjetaBienvenida({ rangos, onEscanear, usuario }: TarjetaBienvenidaProps) {
  const nombre = usuario.name || 'Visitante';

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-(--accent-gold-light) bg-(--brand-negro) p-5! sm:p-6!">
      <span className="absolute top-2.5! left-2.5! h-5 w-5 border-t-2 border-l-2 border-(--accent-gold-light)" />
      <span className="absolute top-2.5! right-2.5! h-5 w-5 border-t-2 border-r-2 border-(--accent-gold-light)" />
      <span className="absolute bottom-2.5! left-2.5! h-5 w-5 border-b-2 border-l-2 border-(--accent-gold-light)" />
      <span className="absolute bottom-2.5! right-2.5! h-5 w-5 border-b-2 border-r-2 border-(--accent-gold-light)" />

      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-(--accent-gold-light) opacity-[0.12] blur-3xl" />

      <div className="relative">
        <span className="font-barlow inline-flex items-center gap-1.5 rounded-full border border-(--accent-gold-light)/40 px-3! py-1! text-[11px] font-bold tracking-[0.25em] text-(--accent-gold-light) uppercase">
          <Stamp size={12} />
          Coleccionista
        </span>

        <div className="mt-3! flex flex-wrap items-center justify-between gap-3!">
          <p className="font-bakbak truncate text-2xl text-(--brand-crema) sm:text-3xl">{nombre}</p>

          {/* Escanear un QR es una acción de celular — en desktop no hay
              con qué usarlo, así que el botón queda oculto ahí. */}
          <button
            onClick={onEscanear}
            className="font-bakbak inline-flex shrink-0 items-center gap-2! rounded-full bg-(--brand-crema) px-5! py-2! text-sm tracking-[0.1em] text-(--brand-negro) uppercase shadow-[0_0_0_3px_rgba(240,168,62,0.5)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(240,168,62,0.55)] md:hidden"
          >
            Escanear
          </button>
        </div>

        {rangos.length > 0 && (
          <div className="mt-4! flex flex-wrap items-center gap-2!">
            <span className="font-barlow text-xs font-semibold tracking-wide text-(--brand-crema)/50 uppercase">Rango:</span>
            {rangos.map((rango) =>
              rango.alcanzado ? (
                <span
                  key={rango.id}
                  className="font-barlow rounded-full bg-(--accent-gold-light) px-3! py-1! text-xs font-bold tracking-wide text-(--brand-negro) uppercase"
                >
                  {rango.nombre}
                </span>
              ) : (
                <span
                  key={rango.id}
                  className="font-barlow inline-flex items-center gap-1! rounded-full border border-(--brand-crema)/20 px-3! py-1! text-xs tracking-wide text-(--brand-crema)/40 uppercase"
                >
                  <Lock size={11} />
                  {rango.nombre}
                </span>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
