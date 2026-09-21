'use client';

import { useState } from 'react';
import { DEPARTAMENTOS, type DepartamentoValue } from '@/lib/departamentos';
import { fetchAdmin } from '@/lib/auth';
import { Campo, botonPrimario, botonSecundario, inputClase } from '../../sellos/_components/ui';
import { ETIQUETA_ROL, mensajeDeError, type RolGestionable, type Usuario } from './tipos';

interface UsuarioModalProps {
  // null = crear una cuenta nueva.
  usuario: Usuario | null;
  // La propia cuenta: no se puede quitar el rol de administrador (lo rechaza
  // la API también).
  esYo: boolean;
  onClose: () => void;
  onGuardado: (usuario: Usuario, eraNuevo: boolean) => void;
}

const ORDEN_DEPARTAMENTOS = Object.keys(DEPARTAMENTOS) as DepartamentoValue[];

export function UsuarioModal({ usuario, esYo, onClose, onGuardado }: UsuarioModalProps) {
  const esNuevo = usuario === null;
  const [name, setName] = useState(usuario?.name ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [username, setUsername] = useState(usuario?.username ?? '');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [role, setRole] = useState<RolGestionable>(usuario?.role ?? 'USER');
  const [departamento, setDepartamento] = useState<string>(usuario?.departamento ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (role === 'USER' && !departamento) {
      setError('Elige el departamento del usuario.');
      return;
    }
    if (esNuevo && password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!esNuevo && password && password.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      const cuerpo: Record<string, string> = {
        email: email.trim(),
        username: username.trim(),
        name: name.trim(),
        role,
        // Un ADMIN no usa departamento (la API lo ignora igual).
        departamento: role === 'USER' ? departamento : '',
      };
      if (password) cuerpo.password = password;

      const res = await fetchAdmin(esNuevo ? '/usuarios' : `/usuarios/${usuario.id}`, {
        method: esNuevo ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });
      if (!res.ok) {
        setError(await mensajeDeError(res, 'No se pudo guardar la cuenta. Intenta de nuevo.'));
        return;
      }
      onGuardado((await res.json()) as Usuario, esNuevo);
    } catch {
      setError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4!"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--border) bg-white p-6! shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={esNuevo ? 'Nueva cuenta' : 'Editar cuenta'}
      >
        <h2 className="text-xl font-extrabold text-(--text-primary)">
          {esNuevo ? 'Nueva cuenta' : 'Editar cuenta'}
          {esYo && <span className="ml-2! text-sm font-semibold text-(--text-muted)">(tu cuenta)</span>}
        </h2>

        <form onSubmit={guardar} className="mt-4! space-y-4">
          <Campo label="Nombre">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClase} maxLength={100} />
          </Campo>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClase}
                required
              />
            </Campo>
            <Campo label="Usuario (opcional)">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClase}
                minLength={3}
                maxLength={40}
                pattern="[a-zA-Z0-9._\-]+"
                title="Letras, números, punto, guion y guion bajo"
              />
            </Campo>
          </div>

          <Campo label={esNuevo ? 'Contraseña' : 'Nueva contraseña (vacío = no cambiarla)'}>
            <div className="flex gap-2">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClase}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required={esNuevo}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                className="shrink-0 rounded-xl border border-(--border) px-3! text-xs font-bold text-(--text-secondary) transition-colors duration-200 hover:text-(--text-primary)"
              >
                {mostrarPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </Campo>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo label="Rol">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RolGestionable)}
                disabled={esYo}
                className={`${inputClase} disabled:opacity-60`}
              >
                {(Object.keys(ETIQUETA_ROL) as RolGestionable[]).map((rol) => (
                  <option key={rol} value={rol}>
                    {ETIQUETA_ROL[rol]}
                  </option>
                ))}
              </select>
            </Campo>

            {role === 'USER' && (
              <Campo label="Departamento">
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className={inputClase}
                  required
                >
                  <option value="">Elige un departamento…</option>
                  {ORDEN_DEPARTAMENTOS.map((valor) => (
                    <option key={valor} value={valor}>
                      {DEPARTAMENTOS[valor].label}
                    </option>
                  ))}
                </select>
              </Campo>
            )}
          </div>

          <p className="text-xs text-(--text-muted)">
            {role === 'ADMIN'
              ? 'El administrador ve y gestiona todas las secciones del panel.'
              : 'Solo verá la pestaña Inscritos, con los inscritos de su departamento. Puede cambiar su estado, pero no editar sus datos.'}
          </p>

          {error && <p className="text-sm font-semibold text-[#d52b1e]">{error}</p>}

          <div className="flex justify-end gap-3 pt-1!">
            <button type="button" onClick={onClose} className={botonSecundario}>
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className={botonPrimario}>
              {guardando ? 'Guardando...' : esNuevo ? 'Crear cuenta' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
