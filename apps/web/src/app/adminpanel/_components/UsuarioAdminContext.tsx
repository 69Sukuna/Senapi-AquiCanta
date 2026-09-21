'use client';

import { createContext, useContext } from 'react';
import type { UsuarioAutenticado } from '@/lib/auth';

// El layout ya verificó la sesión; las pantallas del panel leen de acá quién
// es el usuario (y su rol/departamento) en vez de volver a pedirlo a la API.
const UsuarioAdminContext = createContext<UsuarioAutenticado | null>(null);

export const UsuarioAdminProvider = UsuarioAdminContext.Provider;

export function useUsuarioAdmin(): UsuarioAutenticado {
  const usuario = useContext(UsuarioAdminContext);
  if (!usuario) {
    throw new Error('useUsuarioAdmin debe usarse dentro del layout del panel de administración');
  }
  return usuario;
}
