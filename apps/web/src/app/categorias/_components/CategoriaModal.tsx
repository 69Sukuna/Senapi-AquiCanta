'use client';

import { useEffect } from 'react';
import { obtenerCategoriaInfo } from '@/lib/categorias';
import { obtenerConvocatoriaCategoria } from '@/lib/convocatoriaCategorias';

interface CategoriaModalProps {
  nombre: string;
  onClose: () => void;
}

function formatearEdad(min: number | null, max: number | null): string {
  if (min == null && max == null) return 'Sin restricción';
  if (min != null && max != null) return `${min} a ${max} años`;
  if (max != null) return `Hasta ${max} años`;
  return `Desde ${min} años`;
}

export function CategoriaModal({ nombre, onClose }: CategoriaModalProps) {
  const info = obtenerCategoriaInfo(nombre);
  const convocatoria = obtenerConvocatoriaCategoria(nombre);

  // Escape para cerrar + bloqueo de scroll del body mientras el modal está abierto.
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', alPresionarTecla);
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPresionarTecla);
      document.body.style.overflow = overflowOriginal;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4! backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-(--border) bg-white shadow-[0_30px_80px_-20px_rgba(27,42,74,0.35)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categoria-modal-titulo"
      >
        <span className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#e30613_0%,#fcee21_50%,#00873e_100%)]" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5! right-5! flex! h-9 w-9 items-center justify-center rounded-full bg-(--bg-primary) text-lg text-(--text-secondary) transition-colors hover:bg-(--border) hover:text-(--text-primary)"
        >
          ✕
        </button>

        <div className="px-6! pt-8! pb-6! sm:px-8!">
          <h2
            id="categoria-modal-titulo"
            className="font-bakbak pr-10! text-2xl leading-snug text-(--brand-negro) sm:text-3xl"
          >
            {nombre}
          </h2>

          {convocatoria?.descripcion && (
            <p className="font-barlow mt-2! text-sm text-(--text-secondary) sm:text-base">
              {convocatoria.descripcion}
            </p>
          )}

          {info && (
            <dl className="mt-6! grid grid-cols-2 gap-4! rounded-2xl bg-(--bg-primary) p-4! sm:grid-cols-4">
              <div>
                <dt className="font-barlow text-xs font-semibold tracking-wide text-(--text-muted) uppercase">
                  Integrantes
                </dt>
                <dd className="mt-1! text-sm font-bold text-(--text-primary)">
                  {info.integrantesMax > 1 ? `${info.integrantesMin} a ${info.integrantesMax}` : 'Individual'}
                </dd>
              </div>
              <div>
                <dt className="font-barlow text-xs font-semibold tracking-wide text-(--text-muted) uppercase">
                  Acompañantes
                </dt>
                <dd className="mt-1! text-sm font-bold text-(--text-primary)">
                  {info.acompanantesMax > 0 ? `Hasta ${info.acompanantesMax}` : 'No admite'}
                </dd>
              </div>
              <div>
                <dt className="font-barlow text-xs font-semibold tracking-wide text-(--text-muted) uppercase">
                  Edad
                </dt>
                <dd className="mt-1! text-sm font-bold text-(--text-primary)">
                  {formatearEdad(info.edadMinima, info.edadMaxima)}
                </dd>
              </div>
              <div>
                <dt className="font-barlow text-xs font-semibold tracking-wide text-(--text-muted) uppercase">
                  Duración máx.
                </dt>
                <dd className="mt-1! text-sm font-bold text-(--text-primary)">{info.duracionMaximaMinutos} min</dd>
              </div>
            </dl>
          )}

          {info?.requiereAdultoResponsable && (
            <p className="font-barlow mt-3! rounded-xl bg-[#fcee21]/15 px-4! py-2.5! text-sm text-(--text-secondary)">
              Categoría infantil: se exige carta de autorización y C.I. de un adulto responsable (padre, madre o
              tutor legal).
            </p>
          )}

          {convocatoria && (
            <>
              {(convocatoria.instrumentosPermitidos.length > 0 ||
                convocatoria.instrumentosNoPermitidos.length > 0) && (
                <div className="mt-6!">
                  <h3 className="font-bakbak text-base text-(--brand-negro)">Instrumentos</h3>
                  <div className="font-barlow mt-2! flex flex-col gap-2!">
                    {convocatoria.instrumentosPermitidos.map((instrumento) => (
                      <p key={instrumento} className="flex items-start gap-2! text-sm text-(--text-secondary)">
                        <span className="mt-0.5! text-[#00873e]" aria-hidden="true">
                          ✓
                        </span>
                        {instrumento}
                      </p>
                    ))}
                    {convocatoria.instrumentosNoPermitidos.map((instrumento) => (
                      <p key={instrumento} className="flex items-start gap-2! text-sm text-(--text-secondary)">
                        <span className="mt-0.5! text-[#e30613]" aria-hidden="true">
                          ✕
                        </span>
                        {instrumento}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6!">
                <h3 className="font-bakbak text-base text-(--brand-negro)">Parámetros de calificación</h3>
                <div className="mt-3! flex flex-col gap-3!">
                  {convocatoria.criterios.map((criterio) => (
                    <div key={criterio.label}>
                      <div className="font-barlow flex items-center justify-between text-sm">
                        <span className="text-(--text-secondary)">{criterio.label}</span>
                        <span className="font-bold text-(--text-primary)">{criterio.porcentaje}%</span>
                      </div>
                      <div className="mt-1! h-1.5 w-full overflow-hidden rounded-full bg-(--bg-primary)">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#e30613_0%,#fcee21_100%)]"
                          style={{ width: `${criterio.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6!">
                <h3 className="font-bakbak text-base text-(--brand-negro)">Documentación requerida</h3>
                <ul className="font-barlow mt-2! flex flex-col gap-1.5! text-sm text-(--text-secondary)">
                  {convocatoria.documentacion.map((doc) => (
                    <li key={doc} className="flex items-start gap-2!">
                      <span className="mt-0.5! text-(--brand-verde)" aria-hidden="true">
                        •
                      </span>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6! rounded-2xl bg-[linear-gradient(90deg,#e30613_0%,#fcee21_100%)] px-5! py-4!">
                <p className="font-barlow text-xs font-semibold tracking-[0.15em] text-white/85 uppercase">Premio</p>
                <p className="font-bakbak mt-1! text-lg text-white">{convocatoria.premio}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
