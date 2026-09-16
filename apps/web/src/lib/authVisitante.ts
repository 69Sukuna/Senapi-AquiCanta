// Sesión de VISITANTES (Sellos, Butacas) logueados con Google — a propósito
// completamente aparte de lib/auth.ts (panel admin): otra key de
// localStorage y otro endpoint (/auth/visitante/me), así un mismo navegador
// puede tener sesión de admin y de visitante a la vez sin que se pisen.
export interface VisitanteAutenticado {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

const TOKEN_KEY = 'acb_visitor_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function guardarToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage puede fallar (modo privado, storage lleno, etc.) — no es
    // crítico, el login simplemente no persistirá entre recargas.
  }
}

export function logout() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ver comentario en guardarToken.
  }
}

// Arranca el login con Google — el redirect vuelve a /auth/callback y de ahí
// a `redirect` (por defecto, la página actual).
export function loginConGoogle(redirect?: string) {
  const destino = redirect ?? `${window.location.pathname}${window.location.search}`;
  window.location.href = `${API_URL}/auth/google?redirect=${encodeURIComponent(destino)}`;
}

// Valida el token guardado contra la API (no solo que exista) — si el
// visitante fue borrado o el token venció, la API devuelve 401 y esto avisa.
export async function fetchVisitanteActual(): Promise<VisitanteAutenticado | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/visitante/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Wrapper de fetch para llamadas autenticadas de visitante — adjunta el
// Bearer token guardado. La URL es relativa a la API (ej. "/sellos/vincular").
export function fetchVisitante(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}
