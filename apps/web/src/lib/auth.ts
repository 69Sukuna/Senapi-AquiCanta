// Autenticación del panel de administración. El token se guarda en
// localStorage (no en una cookie) a propósito: así todo el fetching de datos
// de admin puede vivir en componentes cliente que adjuntan el header
// Authorization ellos mismos, sin la complejidad extra de cookies
// cross-origin entre apps/web (3000) y apps/api (4000).
export interface UsuarioAutenticado {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: 'USER' | 'ARTIST' | 'ADMIN';
}

const TOKEN_KEY = 'acb_admin_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string) {
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
    // ver comentario en setToken.
  }
}

export async function login(identificador: string, password: string): Promise<UsuarioAutenticado> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identificador, password }),
  });

  if (!res.ok) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  const data = await res.json();
  setToken(data.accessToken);
  return data.usuario;
}

// Valida el token guardado contra la API (no solo que exista) — si el
// usuario fue borrado o el token venció, la API devuelve 401 y esto avisa.
export async function fetchUsuarioActual(): Promise<UsuarioAutenticado | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Wrapper de fetch para llamadas admin — adjunta el Bearer token guardado.
// La URL es relativa a la API (ej. "/inscripciones"), no una URL completa.
export function fetchAdmin(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}
