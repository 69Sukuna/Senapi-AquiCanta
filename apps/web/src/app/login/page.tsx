'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { BotonLoginGoogle } from '@/components/BotonLoginGoogle';
import { ROUTES } from '@/lib/routes';
import { login } from '@/lib/auth';
import { useUsuario } from '@/hooks/useUsuario';

function FormularioLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const usuario = await login(identificador, password);
      if (usuario.role !== 'ADMIN') {
        setError('Esta cuenta no tiene acceso al panel de administración.');
        setCargando(false);
        return;
      }
      const destino = searchParams.get('next') || ROUTES.admin.root;
      router.replace(destino);
    } catch {
      setError('Usuario o contraseña incorrectos.');
      setCargando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex flex-col gap-1 text-sm font-semibold text-(--text-secondary)">
        Correo o nombre de usuario
        <input
          type="text"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          autoComplete="username"
          required
          className="w-full rounded-xl border border-(--border) bg-white px-4! py-2.5! text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-(--text-secondary)">
        Contraseña
        <div className="relative">
          <input
            type={mostrarPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-(--border) bg-white px-4! py-2.5! pr-11! text-(--text-primary) outline-none transition-colors duration-200 focus:border-[#1e63b8]/50"
          />
          <button
            type="button"
            onClick={() => setMostrarPassword((v) => !v)}
            aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
            className="absolute top-1/2 right-3! -translate-y-1/2 text-(--text-muted) transition-colors duration-200 hover:text-(--text-primary)"
          >
            {mostrarPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
      </label>

      {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-full bg-[#1e63b8] px-5! py-2.5! text-sm font-bold text-white transition-opacity duration-200 disabled:opacity-40"
      >
        {cargando ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}

function SeccionLoginVisitante() {
  const searchParams = useSearchParams();
  const { loginConGoogle } = useUsuario();
  const next = searchParams.get('next');

  return <BotonLoginGoogle onClick={() => loginConGoogle(next ?? undefined)} />;
}

function ContenidoLogin() {
  const [mostrarAdmin, setMostrarAdmin] = useState(false);

  return (
    <div className="mt-10! space-y-4">
      <SeccionLoginVisitante />

      {mostrarAdmin ? (
        <FormularioLogin />
      ) : (
        <button
          type="button"
          onClick={() => setMostrarAdmin(true)}
          className="block w-full text-center text-sm font-semibold text-(--text-muted) underline"
        >
          ¿Sos del equipo organizador? Ingresá acá
        </button>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell maxWidth="max-w-md">
      <PageHero
        title="Iniciar sesión"
        description="Iniciá sesión con Google para guardar tu progreso en Sellos y tus reservas en Butacas."
      />
      <Suspense fallback={null}>
        <ContenidoLogin />
      </Suspense>
    </PageShell>
  );
}
