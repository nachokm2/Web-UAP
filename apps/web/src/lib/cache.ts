// Caché de datos en memoria para el sitio público.
//
// Payload y Next corren en el mismo proceso, así que los hooks de Payload pueden
// invalidar esta caché al instante cuando se publica algo. El vencimiento (TTL)
// acota cuánto puede durar un dato desactualizado si algún día hay más de una
// réplica (cada una tendría su propia caché).

type Entrada = { valor: Promise<unknown>; vence: number; etiquetas: string[] }

const TTL_POR_DEFECTO_MS = 5 * 60 * 1000
// Tope de entradas: las claves incluyen datos de la URL (slug, página), así que sin tope
// cualquier dirección inventada agregaría una entrada que solo se borra al invalidar.
export const MAX_ENTRADAS = 2000
// En globalThis: el proxy y las rutas se empaquetan por separado y cada paquete tendría
// su propia copia del módulo; así comparten una sola caché por proceso.
const global = globalThis as typeof globalThis & { __cacheSitioUap?: Map<string, Entrada> }
const entradas = (global.__cacheSitioUap ??= new Map<string, Entrada>())

export async function enCache<T>(clave: string, etiquetas: string[], cargar: () => Promise<T>, ttlMs = TTL_POR_DEFECTO_MS): Promise<T> {
  const ahora = Date.now()
  const existente = entradas.get(clave)
  if (existente && existente.vence > ahora) return existente.valor as Promise<T>
  const valor = cargar()
  if (entradas.size >= MAX_ENTRADAS) liberarEspacio(ahora)
  entradas.set(clave, { valor, vence: ahora + ttlMs, etiquetas })
  // Un error no queda guardado: el próximo pedido vuelve a intentar.
  valor.catch(() => entradas.delete(clave))
  return valor
}

/** Borra lo vencido y, si no alcanza, las entradas más antiguas (el Map conserva el orden de inserción). */
function liberarEspacio(ahora: number): void {
  for (const [clave, entrada] of entradas) {
    if (entrada.vence <= ahora) entradas.delete(clave)
  }
  for (const clave of entradas.keys()) {
    if (entradas.size < MAX_ENTRADAS) break
    entradas.delete(clave)
  }
}

export const cantidadEnCache = (): number => entradas.size

/** Invalida todo lo que tenga alguna de estas etiquetas (por ejemplo, "carreras"). */
export function invalidarCache(...etiquetas: string[]): void {
  for (const [clave, entrada] of entradas) {
    if (entrada.etiquetas.some((e) => etiquetas.includes(e))) entradas.delete(clave)
  }
}

export function limpiarCacheCompleta(): void {
  entradas.clear()
}
