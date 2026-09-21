'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, LogOut, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/PageHero';
import { PageShell } from '@/components/PageShell';
import { BotonLoginGoogle } from '@/components/BotonLoginGoogle';
import { ROUTES } from '@/lib/routes';
import { login } from '@/lib/auth';
import { useUsuario } from '@/hooks/useUsuario';
import type { VisitanteAutenticado } from '@/lib/authVisitante';

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
      if (usuario.role !== 'ADMIN' && usuario.role !== 'USER') {
        setError('Esta cuenta no tiene acceso al panel de administración.');
        setCargando(false);
        return;
      }
      // Un USER (usuario de departamento) solo tiene la pantalla de Inscritos.
      const porDefecto = usuario.role === 'ADMIN' ? ROUTES.admin.root : ROUTES.admin.inscritos;
      const destino = searchParams.get('next') || porDefecto;
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

  // Sin un `?next=` explícito (ej. entrando por el ícono de perfil del
  // navbar), el destino por defecto es Sellos — es la feature principal que
  // usa este login, en vez de volver a caer en la propia página de /login.
  return (
    <>
      <div className="flex flex-col items-center gap-3! text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-gold-light)/12 text-(--accent-gold-light)">
          <Sparkles size={22} />
        </span>
        <div>
          <p className="font-bold text-(--text-primary)">Continuá con Google</p>
          <p className="mt-0.5! text-sm text-(--text-secondary)">Es gratis y toma un segundo.</p>
        </div>
      </div>

      <div className="mt-5!">
        <BotonLoginGoogle onClick={() => loginConGoogle(next ?? ROUTES.sellos)} />
      </div>
    </>
  );
}

// Si ya hay sesión, no tiene sentido volver a mostrar el botón de Google —
// esto evita que alguien "reabra" el login estando ya logueado sin darse
// cuenta, y de paso es el único lugar donde se puede cerrar sesión.
function SesionActiva({ usuario, onLogout }: { usuario: VisitanteAutenticado; onLogout: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || ROUTES.sellos;

  return (
    <div className="flex flex-col items-center gap-3! text-center">
      {usuario.avatarUrl ? (
        <Image src={usuario.avatarUrl} alt={usuario.name ?? usuario.email} width={56} height={56} className="h-14 w-14 rounded-full" unoptimized />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--accent-gold-light)/12 text-(--accent-gold-light)">
          <Sparkles size={22} />
        </span>
      )}
      <div>
        <p className="font-bold text-(--text-primary)">Ya iniciaste sesión</p>
        <p className="mt-0.5! text-sm text-(--text-secondary)">{usuario.name || usuario.email}</p>
      </div>

      <button
        type="button"
        onClick={() => router.push(next)}
        className="w-full rounded-full bg-[#1e63b8] px-5! py-2.5! text-sm font-bold text-white transition-opacity duration-200 hover:opacity-90"
      >
        Ir a Sellos
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-1.5! text-sm font-semibold text-(--text-muted) underline underline-offset-2 transition-colors duration-200 hover:text-(--text-primary)"
      >
        <LogOut size={14} />
        Cerrar sesión
      </button>
    </div>
  );
}

function ContenidoLogin() {
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const { usuario, cargando, logout } = useUsuario();

  return (
    <div className="mt-10! overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) shadow-xl shadow-black/5">
      <div className="h-1.5! w-full shrink-0" style={{ background: 'linear-gradient(to right, #e30613, #fcee21, #00873e)' }} />

      <div className="p-6! sm:p-8!">
        {cargando ? (
          <div className="py-2! text-center text-sm text-(--text-muted)">Cargando...</div>
        ) : usuario ? (
          <SesionActiva usuario={usuario} onLogout={logout} />
        ) : (
          <SeccionLoginVisitante />
        )}

        <div className="my-6! flex items-center gap-3!">
          <div className="h-px flex-1 bg-(--border)" />
          <span className="text-xs font-semibold tracking-wide text-(--text-muted) uppercase">Equipo organizador</span>
          <div className="h-px flex-1 bg-(--border)" />
        </div>

        {mostrarAdmin ? (
          <FormularioLogin />
        ) : (
          <button
            type="button"
            onClick={() => setMostrarAdmin(true)}
            className="block w-full text-center text-sm font-semibold text-(--text-secondary) underline underline-offset-2 transition-colors duration-200 hover:text-(--text-primary)"
          >
            Ingresar con usuario y contraseña
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell maxWidth="max-w-md">
      <PageHero
        title="Iniciar sesión"
        description="Guardá tu progreso en Sellos y tus reservas en Butacas con tu cuenta de Google."
      />
      <Suspense fallback={null}>
        <ContenidoLogin />
      </Suspense>
    </PageShell>
  );
}
