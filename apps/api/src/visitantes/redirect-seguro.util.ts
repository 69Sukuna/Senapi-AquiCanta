// Evita que el flujo de login pueda usarse como open-redirect: solo se
// aceptan rutas relativas propias del sitio (empiezan con "/", nunca "//"
// ni un esquema/dominio como "https://otro-sitio.com"). Se valida tanto al
// armar el `state` firmado en /auth/google como, de nuevo, al leerlo en el
// callback — dos veces por las dudas, es una comprobación barata.
export function esRutaInternaSegura(ruta: unknown): ruta is string {
  return typeof ruta === 'string' && ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.includes('://');
}
