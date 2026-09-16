import { Lock } from 'lucide-react';

interface RangoProgreso {
  id: string;
  nombre: string;
  orden: number;
  alcanzado: boolean;
}

interface TarjetaBienvenidaProps {
  rangos: RangoProgreso[];
  onEscanear: () => void;
  // Sellos sigue funcionando anónimo por defecto — `usuario` es opcional,
  // solo cambia el nombre mostrado y ofrece loguearse para no perder el
  // progreso al cambiar de dispositivo.
  usuario?: { name: string | null } | null;
  onLoginGoogle?: () => void;
}

export function TarjetaBienvenida({ rangos, onEscanear, usuario, onLoginGoogle }: TarjetaBienvenidaProps) {
  const nombre = usuario?.name || 'Visitante';

  return (
    <div className="glass-panel rounded-2xl! p-5!">
      <div className="flex items-center justify-between gap-2!">
        <p className="text-sm text-(--text-secondary)">¡Bienvenido!</p>
        {!usuario && onLoginGoogle && (
          <button
            type="button"
            onClick={onLoginGoogle}
            className="text-xs font-semibold text-(--accent-blue) underline underline-offset-2"
          >
            Iniciar sesión con Google
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3!">
        <p className="font-bakbak truncate text-2xl text-(--text-primary)">{nombre}</p>

        <button
          onClick={onEscanear}
          className="inline-flex shrink-0 items-center gap-2! rounded-full border-2 border-(--text-primary) px-5! py-2! text-sm font-bold tracking-wide text-(--text-primary) uppercase transition-colors hover:bg-(--text-primary) hover:text-white"
        >
          Escanear
        </button>
      </div>

      {rangos.length > 0 && (
        <div className="mt-2! flex flex-wrap items-center gap-2!">
          <span className="text-sm text-(--text-secondary)">Rango:</span>
          {rangos.map((rango) =>
            rango.alcanzado ? (
              <span
                key={rango.id}
                className="rounded-full bg-(--text-primary) px-3! py-1! text-xs font-bold tracking-wide text-white uppercase"
              >
                {rango.nombre}
              </span>
            ) : (
              <span
                key={rango.id}
                className="inline-flex items-center gap-1! rounded-full border border-(--border) px-3! py-1! text-xs tracking-wide text-(--text-muted) uppercase"
              >
                <Lock size={11} />
                {rango.nombre}
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}
