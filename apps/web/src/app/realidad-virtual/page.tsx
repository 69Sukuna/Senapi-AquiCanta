import { EscenaPinturaARCliente } from '@/components/features/realidad-aumentada/EscenaPinturaARCliente';

export default function RealidadVirtualPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <span className="badge badge-gold">Realidad Aumentada</span>
      <h1 className="mt-4 text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl">
        La pintura cobra vida
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
        Apunta tu cámara a la pintura del festival para verla saludarte con voz propia.
      </p>

      <div className="mt-10">
        <EscenaPinturaARCliente />
      </div>
    </main>
  );
}
