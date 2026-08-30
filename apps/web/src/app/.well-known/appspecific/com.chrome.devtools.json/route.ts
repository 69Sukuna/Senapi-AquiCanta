// Chrome DevTools pide este archivo automáticamente al abrirse (función de
// "Workspaces" automáticos). No lo usamos, así que devolvemos un objeto
// vacío con 200 en vez de dejar que truene en 404 y ensucie la terminal.
export async function GET() {
  return Response.json({});
}
