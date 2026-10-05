import {
  ValidationError,
  type CollectionSlug,
  type Field,
  type FieldHook,
  type PayloadRequest,
  type TextFieldSingleValidation,
} from 'payload'

/** "Psicología Clínica" → "psicologia-clinica" */
export function normalizarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** Rutas propias del sitio que ningún contenido puede ocupar. */
export const SLUGS_RESERVADOS = new Set([
  'admin',
  'api',
  'carreras',
  'postgrados',
  'posgrados',
  'noticias',
  'institucional',
  'contacto',
  'estudiantes',
  'investigacion',
  'inscripcion',
  'privacidad',
  'sitemap-xml',
  'robots-txt',
  'wp-content',
  'wp-admin',
  'wp-json',
])

/** Carreras y posgrados comparten el espacio de URL plano /{slug}/ (como el sitio actual). */
export const ESPACIO_URL_PROGRAMAS: CollectionSlug[] = ['carreras', 'posgrados']

type OpcionesSlug = {
  /** Campo desde el que se genera si queda vacío. */
  desde: string
  /** Otras colecciones con las que no puede repetirse. */
  espacioCompartido?: CollectionSlug[]
  /**
   * Si el contenido vive en la raíz del sitio (/{slug}/), no puede usar rutas del sitio
   * (admin, noticias…). No aplica a noticias (/noticias/{slug}/) ni a categorías.
   */
  enRaizDelSitio?: boolean
}

/** Devuelve el problema del slug, o null si es válido. */
async function problemaDeSlug(
  value: string | null | undefined,
  ctx: { req: PayloadRequest; coleccion?: string; id?: number | string; espacioCompartido: CollectionSlug[]; reservados: boolean },
): Promise<string | null> {
  const { req, coleccion, id, espacioCompartido, reservados } = ctx
  if (!value) return 'La dirección web es obligatoria.'
  if (value !== normalizarSlug(value)) return 'Use solo minúsculas, números y guiones, sin tildes.'
  if (reservados && SLUGS_RESERVADOS.has(value)) return `"${value}" está reservado para una sección del sitio.`
  for (const otra of espacioCompartido) {
    if (otra === coleccion) continue
    const { totalDocs } = await req.payload.count({
      collection: otra,
      where: { slug: { equals: value } },
      overrideAccess: true,
      req,
    })
    if (totalDocs > 0) return `Ya existe un contenido en "${otra}" con la dirección "${value}".`
  }
  if (coleccion) {
    const { totalDocs } = await req.payload.count({
      collection: coleccion as CollectionSlug,
      where: { and: [{ slug: { equals: value } }, ...(id !== undefined ? [{ id: { not_equals: id } }] : [])] },
      overrideAccess: true,
      req,
    })
    if (totalDocs > 0) return `Ya existe otro contenido con la dirección "${value}".`
  }
  return null
}

export const campoSlug = ({ desde, espacioCompartido = [], enRaizDelSitio = false }: OpcionesSlug): Field => {
  // Mensaje en línea en el formulario al publicar.
  const validate: TextFieldSingleValidation = async (value, { req, collectionSlug, id }) =>
    (await problemaDeSlug(value, { req, coleccion: collectionSlug, id, espacioCompartido, reservados: enRaizDelSitio })) ?? true

  // Payload no valida campos al guardar borradores: la misma regla se aplica acá,
  // que corre siempre, para que un borrador tampoco pueda ocupar una URL ajena.
  const verificarSiempre: FieldHook = async ({ value, req, collection, originalDoc }) => {
    const problema = await problemaDeSlug(value as string, {
      req,
      coleccion: collection?.slug,
      id: (originalDoc as { id?: number | string } | undefined)?.id,
      espacioCompartido,
      reservados: enRaizDelSitio,
    })
    if (problema) throw new ValidationError({ errors: [{ message: problema, path: 'slug' }] })
    return value
  }

  return {
    name: 'slug',
    label: 'Dirección web',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    validate,
    admin: {
      position: 'sidebar',
      description:
        'Final de la URL, por ejemplo "psicologia" → uap.edu.py/psicologia/. Se completa sola a partir del nombre. Si la cambia en un contenido publicado, se crea una redirección automática.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => normalizarSlug(String(value || (data as Record<string, unknown> | undefined)?.[desde] || '')),
      ],
      beforeChange: [verificarSiempre],
    },
  }
}
