// `typ` es una segunda capa de defensa además de que este JWT se firma con
// un secreto (VISITOR_JWT_SECRET) totalmente distinto al de admin — incluso
// si algún día se reutilizara el mismo secreto por error, este campo evita
// que un payload de otro sistema se acepte acá.
export interface VisitantePayload {
  sub: string;
  typ: 'visitante';
}

export interface VisitanteAutenticado {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

// Perfil ya extraído por GoogleStrategy — a propósito no incluye el
// accessToken/refreshToken que da Google, esos no se persisten ni se pasan
// más allá de la propia estrategia.
export interface PerfilGoogle {
  googleId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerificado: boolean;
}
