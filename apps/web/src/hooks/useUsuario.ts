'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchVisitanteActual,
  loginConGoogle as loginConGoogleLib,
  logout as logoutLib,
  type VisitanteAutenticado,
} from '@/lib/authVisitante';

// Sesión del visitante logueado con Google, compartida entre Sellos y
// Butacas. `usuario === null` (con `cargando === false`) significa
// "todavía no se logueó" — ambas features siguen funcionando sin login,
// este hook solo expone si hay uno activo.
export function useUsuario() {
  const [usuario, setUsuario] = useState<VisitanteAutenticado | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchVisitanteActual()
      .then(setUsuario)
      .finally(() => setCargando(false));
  }, []);

  const loginConGoogle = useCallback((redirect?: string) => {
    loginConGoogleLib(redirect);
  }, []);

  const logout = useCallback(() => {
    logoutLib();
    setUsuario(null);
  }, []);

  return { usuario, cargando, loginConGoogle, logout };
}
