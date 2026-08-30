import Image from 'next/image';

const PALETA_CHIP_RITMO = [
  'linear-gradient(135deg, #e0a527, #b9800f)',
  'linear-gradient(135deg, #e11d2e, #7f0f1e)',
];

function sumaCaracteres(semilla: string): number {
  return semilla.split('').reduce((acumulado, caracter) => acumulado + caracter.charCodeAt(0), 0);
}

function obtenerColorChipRitmo(semilla: string): string {
  return PALETA_CHIP_RITMO[sumaCaracteres(semilla) % PALETA_CHIP_RITMO.length];
}

interface AvatarParticipanteProps {
  nombre: string;
  numero: number;
  ritmo: string;
  imagen: string;
}

export function AvatarParticipante({ nombre, numero, ritmo, imagen }: AvatarParticipanteProps) {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden"
      style={{ background: 'linear-gradient(165deg, #2a0609 0%, #120304 100%)' }}
    >
      <Image
        src={imagen}
        alt={`Foto de ${nombre}`}
        fill
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-contain"
      />

      <span className="vt-numero absolute left-3 top-3 text-lg">{String(numero).padStart(2, '0')}</span>

      <span
        className="vt-chip absolute bottom-3 right-3"
        style={{ background: obtenerColorChipRitmo(ritmo) }}
      >
        {ritmo}
      </span>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{ background: 'linear-gradient(to top, rgba(11,2,2,0.55), transparent)' }}
        aria-hidden="true"
      />
    </div>
  );
}
