// Piezas visuales compartidas entre las secciones de /inscripciones (el
// wizard en page.tsx y las secciones de diseño en esta misma carpeta), para
// que todas usen la misma tarjeta blanca con cinta tricolor.

// Panel de contenido: tarjeta blanca con una fina cinta tricolor arriba,
// mismo detalle que Navbar/Footer.
export const panelClass =
  'relative overflow-hidden rounded-2xl border border-(--border) bg-white shadow-[0_1px_2px_rgba(27,42,74,0.06),0_10px_24px_-12px_rgba(27,42,74,0.14)]';

export function TelonDecor() {
  return (
    <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#d52b1e_0%,#e08f1f_42%,#2e7d46_100%)]" />
  );
}
