interface EstadisticaItem {
  etiqueta: string;
  actual: number;
  total: number;
}

interface MisEstadisticasProps {
  items: EstadisticaItem[];
}

// TODO (diseño): lista de filas etiqueta + barra + fracción (mismo patrón
// que BarraProgreso ya usa en PasaportePage.tsx, y que también aparece en
// components/features/gestion-jurado/SelectorJuez.tsx:37-50). El mockup
// trae 4 filas (Eventos visitados, Sellos escaneados, Rangos desbloqueados,
// Logros conseguidos) — "Logros" no está definido en el modelo todavía
// (no hay tabla de logros), así que PasaportePage solo pasa las 3 primeras
// hasta que se decida qué cuenta como un logro.
export function MisEstadisticas({ items }: MisEstadisticasProps) {
  return (
    <div className="glass-panel rounded-2xl! p-5!">
      <p className="font-bold text-(--text-primary)">Mis estadísticas</p>
      <p className="mb-4! text-sm text-(--text-secondary)">Revisa todos los datos más relevantes sobre tu progreso.</p>
      <div className="flex flex-col gap-3!">
        {items.map(({ etiqueta, actual, total }) => {
          const porcentaje = total > 0 ? Math.round((actual / total) * 100) : 0;
          return (
            <div key={etiqueta} className="flex flex-col gap-1.5!">
              <div className="flex items-center justify-between gap-2! text-sm">
                <span className="text-(--text-secondary)">{etiqueta}</span>
                <span className="font-semibold text-(--text-primary)">
                  {actual}/{total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-(--border)">
                <div
                  className="h-full rounded-full bg-(--accent-green) transition-[width] duration-500 ease-out"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
