// Diferencias campo a campo entre dos versiones de un documento, en un formato
// legible para el registro de auditoría. Función pura: se prueba aislada.

export type CambioDeCampo = {
  campo: string
  anterior: string | null
  nuevo: string | null
}

/** Campos técnicos o sensibles que nunca se registran. */
const IGNORADOS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  '_status',
  'sizes',
  'url',
  'thumbnailURL',
  'filename',
  'filesize',
  'mimeType',
  'width',
  'height',
  'focalX',
  'focalY',
  'prefix',
  'password',
  'hash',
  'salt',
  'resetPasswordToken',
  'resetPasswordExpiration',
  '_verificationToken',
  'loginAttempts',
  'lockUntil',
  'sessions',
  'apiKey',
  'apiKeyIndex',
  'enableAPIKey',
  '_verified',
])

const MAX_LARGO = 2000

type Plano = Record<string, unknown>

function esObjeto(v: unknown): v is Plano {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Texto plano de un valor de Lexical (richText): concatena los nodos de texto. */
export function textoDeRichText(valor: unknown): string {
  const partes: string[] = []
  const visitar = (nodo: unknown) => {
    if (!esObjeto(nodo)) return
    if (typeof nodo.text === 'string') partes.push(nodo.text)
    if (Array.isArray(nodo.children)) {
      nodo.children.forEach(visitar)
      if (['paragraph', 'heading', 'listitem', 'quote'].includes(String(nodo.type))) partes.push('\n')
    }
  }
  if (esObjeto(valor) && esObjeto(valor.root)) visitar(valor.root)
  return partes.join('').replace(/\n{2,}/g, '\n').trim()
}

function esRichText(v: unknown): boolean {
  return esObjeto(v) && esObjeto(v.root) && v.root.type === 'root'
}

/** Una relación puede llegar poblada (objeto) o como ID. Se compara por ID. */
function idDeRelacion(v: unknown): string | null {
  if (esObjeto(v) && ('id' in v || 'value' in v)) {
    if ('relationTo' in v && 'value' in v) return `${v.relationTo}:${idDeRelacion(v.value)}`
    return v.id == null ? null : String(v.id)
  }
  return null
}

function normalizar(v: unknown): unknown {
  if (v === undefined || v === '') return null
  if (esRichText(v)) return textoDeRichText(v) || null
  const id = idDeRelacion(v)
  if (id !== null) return id
  if (Array.isArray(v)) {
    const lista = v.map((item) => {
      const rid = idDeRelacion(item)
      if (rid !== null && !('nombre' in (item as Plano)) && !('titulo' in (item as Plano))) return rid
      return esObjeto(item) ? normalizarObjeto(item) : normalizar(item)
    })
    return lista.length ? lista : null
  }
  if (esObjeto(v)) return normalizarObjeto(v)
  return v
}

function normalizarObjeto(o: Plano): Plano | null {
  const out: Plano = {}
  for (const [k, val] of Object.entries(o)) {
    if (IGNORADOS.has(k)) continue
    const n = normalizar(val)
    if (n !== null) out[k] = n
  }
  return Object.keys(out).length ? out : null
}

function aTexto(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s.length > MAX_LARGO ? s.slice(0, MAX_LARGO) + '…' : s
}

/** Se compara la forma de texto que se guarda: el ID 3 y la relación poblada {id: 3} son iguales. */
function iguales(a: unknown, b: unknown): boolean {
  return aTexto(a) === aTexto(b)
}

/**
 * Compara dos versiones. Los grupos (objetos) se recorren y se informan como
 * "grupo.campo"; los arrays (malla, galería) se informan como un solo campo.
 */
export function diffDocumentos(
  anterior: Plano | null | undefined,
  nuevo: Plano | null | undefined,
  prefijo = '',
): CambioDeCampo[] {
  const a = anterior ?? {}
  const b = nuevo ?? {}
  const claves = new Set([...Object.keys(a), ...Object.keys(b)])
  const cambios: CambioDeCampo[] = []

  for (const clave of claves) {
    if (IGNORADOS.has(clave)) continue
    const va = a[clave]
    const vb = b[clave]
    const campo = prefijo ? `${prefijo}.${clave}` : clave

    if (esObjeto(va) && esObjeto(vb) && !esRichText(va) && !esRichText(vb) && idDeRelacion(va) === null && idDeRelacion(vb) === null) {
      cambios.push(...diffDocumentos(va, vb, campo))
      continue
    }

    const na = normalizar(va)
    const nb = normalizar(vb)
    if (!iguales(na, nb)) cambios.push({ campo, anterior: aTexto(na), nuevo: aTexto(nb) })
  }
  return cambios
}
