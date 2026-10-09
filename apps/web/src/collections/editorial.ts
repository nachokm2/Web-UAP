// Configuración compartida por las colecciones con workflow editorial
// (Carreras, Posgrados, Noticias): versiones, acceso, workflow y auditoría.

import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig, CollectionSlug } from 'payload'

import { conAcceso, edicionDeSeccion, eliminacionDefinitiva, lecturaEditorial } from '../access'
import type { Seccion } from '../access/roles'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'
import { endpointTransicion, reglasDeEdicion, sincronizarEstado } from '../workflow/hooks'

type Opciones = {
  slug: CollectionSlug
  seccion: Seccion
  /** Ruta pública del documento a partir del slug, para la redirección automática. */
  rutaPublica: (slug: string) => string
  conFechaDePublicacion?: boolean
}

const CONTEXTO_SLUG_PUBLICADO = 'slugPublicadoAnterior'

/** Al publicar, recuerda con qué slug estaba publicado antes el documento. */
const recordarSlugPublicado =
  (coleccion: CollectionSlug): CollectionBeforeChangeHook =>
  async ({ data, operation, originalDoc, req }) => {
    if (operation !== 'update' || data._status !== 'published' || !originalDoc?.id) return data
    const publicado = (await req.payload
      .findByID({ collection: coleccion, id: originalDoc.id, draft: false, depth: 0, overrideAccess: true, req })
      .catch(() => null)) as { slug?: string; _status?: string } | null
    // Se escribe en req.context (no en el `context` del hook): las operaciones anidadas lo reemplazan por una copia.
    if (publicado?._status === 'published' && publicado.slug) req.context[CONTEXTO_SLUG_PUBLICADO] = publicado.slug
    return data
  }

/** Si cambia el slug de algo publicado, la URL anterior pasa a redirigir (301) a la nueva. */
const redirigirSlugAnterior =
  (coleccion: CollectionSlug, rutaPublica: (slug: string) => string): CollectionAfterChangeHook =>
  async ({ doc, req }) => {
    const anterior = req.context[CONTEXTO_SLUG_PUBLICADO] as string | undefined
    if (doc._status !== 'published' || !anterior || anterior === doc.slug) return doc
    const desde = rutaPublica(anterior)
    const existente = await req.payload.find({
      collection: 'redirecciones',
      where: { desde: { equals: desde } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const data = {
      desde,
      tipo: '301',
      destinoTipo: 'interno',
      destino: { relationTo: coleccion, value: doc.id },
      origen: 'automatica',
    } as never
    if (existente.docs[0]) {
      await req.payload.update({ collection: 'redirecciones', id: existente.docs[0].id, data, overrideAccess: true, req })
    } else {
      await req.payload.create({ collection: 'redirecciones', data, overrideAccess: true, req })
    }
    return doc
  }

export const opcionesEditoriales = ({
  slug,
  seccion,
  rutaPublica,
  conFechaDePublicacion,
}: Opciones): Pick<CollectionConfig, 'access' | 'endpoints' | 'hooks' | 'versions'> & {
  adminComponents: NonNullable<NonNullable<CollectionConfig['admin']>['components']>
} => ({
  access: {
    read: lecturaEditorial({ conFechaDePublicacion }),
    readVersions: conAcceso,
    create: edicionDeSeccion(seccion),
    update: edicionDeSeccion(seccion),
    delete: eliminacionDefinitiva,
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 50,
  },
  endpoints: [endpointTransicion(slug, seccion)],
  hooks: {
    beforeOperation: [reglasDeEdicion],
    beforeChange: [sincronizarEstado, recordarSlugPublicado(slug)],
    afterChange: [auditarCambios, redirigirSlugAnterior(slug, rutaPublica)],
    afterDelete: [auditarEliminacion],
  },
  adminComponents: {
    edit: {
      PublishButton: '@/components/admin/BotonesWorkflow#BotonPublicar',
      UnpublishButton: '@/components/admin/BotonesWorkflow#BotonDespublicar',
    },
  },
})
