import Image from 'next/image';

interface MedallaProgreso {
  id: string;
  nombre: string;
  descripcion: string;
  umbral: number;
  alcanzada: boolean;
}

interface MedallasRangoProps {
  medallas: MedallaProgreso[];
}

// Una imagen por nivel, en el mismo orden en que vengan las medallas — no
// depende de sus nombres, solo de la posición (1ª = más fácil, 4ª = más
// difícil), que es como está pensada la progresión Aficionado→Gran Maestro.
const IMAGENES_MEDALLA = [
  '/sellos/MEDALLAS/MADERA.png',
  '/sellos/MEDALLAS/CONDOR PLATA.png',
  '/sellos/MEDALLAS/LOCOMOTORA GOLD.png',
  '/sellos/MEDALLAS/QUIRQUINCHO RUBI.png',
];

// Medallas: reconocimiento por CANTIDAD de sellos escaneados (a diferencia de
// los rangos de TarjetaBienvenida, que exigen eventos específicos). Los datos
// (nombre, descripción, umbral) vienen de la base — pensado para poder
// administrarse desde un panel más adelante sin tocar este componente.
export function MedallasRango({ medallas }: MedallasRangoProps) {
  return (
    <div>
      <p className="font-bold text-(--text-primary)">Medallas</p>
      <p className="mb-4! text-sm text-(--text-secondary)">Consigue más sellos para desbloquear nuevas medallas.</p>

      <div className="grid grid-cols-2 gap-4! sm:grid-cols-4">
        {medallas.map((medalla, i) => (
          <div key={medalla.id} className="flex flex-col items-center gap-1! text-center">
            <div className={`relative h-20 w-20 ${medalla.alcanzada ? '' : 'opacity-35 grayscale'}`}>
              <Image
                src={IMAGENES_MEDALLA[i % IMAGENES_MEDALLA.length]}
                alt={medalla.nombre}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm font-bold text-(--text-primary)">{medalla.nombre}</p>
            <p className="text-xs text-(--text-muted)">{medalla.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
