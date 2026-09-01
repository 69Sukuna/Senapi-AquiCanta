// Los 9 departamentos de Bolivia. No representamos la bandera oficial de
// cada uno (para no arriesgarnos a reproducirla mal) — en su lugar, cada
// departamento tiene un color propio con algo de sentido: Oruro en el dorado
// del sitio por ser la sede del festival, Potosí en plata por el Cerro Rico,
// Chuquisaca en blanco por "la Ciudad Blanca", Santa Cruz/Cochabamba en
// verdes agrícolas, Beni/Pando en tonos amazónicos, Tarija en el morado de
// sus viñedos, La Paz en el carmesí institucional del sitio.
export const DEPARTAMENTOS = {
  LA_PAZ: { label: 'La Paz', color: '#ff4d5e' },
  COCHABAMBA: { label: 'Cochabamba', color: '#4ade80' },
  SANTA_CRUZ: { label: 'Santa Cruz', color: '#22c55e' },
  ORURO: { label: 'Oruro', color: '#f4c94f' },
  POTOSI: { label: 'Potosí', color: '#cbd5e1' },
  CHUQUISACA: { label: 'Chuquisaca', color: '#fdf6ec' },
  TARIJA: { label: 'Tarija', color: '#c084fc' },
  BENI: { label: 'Beni', color: '#38bdf8' },
  PANDO: { label: 'Pando', color: '#2dd4bf' },
} as const;

export type DepartamentoValue = keyof typeof DEPARTAMENTOS;

export function getDepartamentoInfo(departamento: string | null | undefined) {
  if (!departamento) return null;
  return DEPARTAMENTOS[departamento as DepartamentoValue] ?? null;
}
