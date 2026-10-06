// Acceso a datos del sitio público. Solo contenido publicado (se aplican las
// reglas de acceso del público: overrideAccess false, sin usuario).

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Autoridad, Carrera, Configuracion, Documento, Facultad, Noticia, Posgrado } from '@/payload-types'

import { enCache } from './cache'

const payload = () => getPayload({ config })
const publico = { overrideAccess: false, draft: false } as const

export type Programa = (Carrera & { coleccion: 'carreras' }) | (Posgrado & { coleccion: 'posgrados' })

export const obtenerConfiguracion = () =>
  enCache('configuracion', ['configuracion'], async () =>
    (await payload()).findGlobal({ slug: 'configuracion', depth: 1, overrideAccess: false }) as Promise<Configuracion>,
  )

export const listarCarreras = () =>
  enCache('carreras:lista', ['carreras', 'facultades', 'medios'], async () => {
    const { docs } = await (await payload()).find({ collection: 'carreras', ...publico, depth: 1, limit: 500, sort: 'orden' })
    return docs
  })

export const listarPosgrados = () =>
  enCache('posgrados:lista', ['posgrados', 'facultades', 'medios'], async () => {
    const { docs } = await (await payload()).find({ collection: 'posgrados', ...publico, depth: 1, limit: 500, sort: 'orden' })
    return docs
  })

export const listarFacultades = () =>
  enCache('facultades', ['facultades'], async () => {
    const { docs } = await (await payload()).find({ collection: 'facultades', depth: 0, limit: 200, sort: 'orden', overrideAccess: false })
    return docs as Facultad[]
  })

/** Carrera o posgrado por slug (comparten el espacio de URL /{slug}/). */
export const obtenerPrograma = (slug: string) =>
  enCache(`programa:${slug}`, ['carreras', 'posgrados', 'facultades', 'medios', 'documentos', 'sedes'], async (): Promise<Programa | null> => {
    const p = await payload()
    for (const coleccion of ['carreras', 'posgrados'] as const) {
      const { docs } = await p.find({ collection: coleccion, where: { slug: { equals: slug } }, ...publico, depth: 2, limit: 1 })
      if (docs[0]) return { ...docs[0], coleccion } as Programa
    }
    return null
  })

export const POR_PAGINA_NOTICIAS = 12

export const listarNoticias = (pagina = 1) =>
  enCache(
    `noticias:pagina:${pagina}`,
    ['noticias', 'categorias', 'medios'],
    async () =>
      (await payload()).find({
        collection: 'noticias',
        ...publico,
        depth: 1,
        limit: POR_PAGINA_NOTICIAS,
        page: pagina,
        sort: '-fechaPublicacion',
      }),
    // Corto: las noticias programadas deben aparecer a su hora sin esperar 5 minutos.
    60 * 1000,
  )

export const obtenerNoticia = (slug: string) =>
  enCache(
    `noticia:${slug}`,
    ['noticias', 'categorias', 'medios'],
    async () => {
      const { docs } = await (await payload()).find({ collection: 'noticias', where: { slug: { equals: slug } }, ...publico, depth: 2, limit: 1 })
      return (docs[0] as Noticia | undefined) ?? null
    },
    60 * 1000,
  )

export const listarAutoridades = () =>
  enCache('autoridades', ['autoridades', 'medios'], async () => {
    const { docs } = await (await payload()).find({
      collection: 'autoridades',
      where: { activo: { equals: true } },
      depth: 1,
      limit: 300,
      sort: 'orden',
      overrideAccess: false,
    })
    return docs as Autoridad[]
  })

export const listarReglamentos = () =>
  enCache('reglamentos', ['documentos'], async () => {
    const { docs } = await (await payload()).find({
      collection: 'documentos',
      where: { tipo: { equals: 'reglamento' } },
      depth: 0,
      limit: 500,
      sort: 'titulo',
      overrideAccess: false,
    })
    return docs as Documento[]
  })

/** Para el sitemap: todo lo publicado con su última modificación. */
export const listarParaSitemap = () =>
  enCache('sitemap', ['carreras', 'posgrados', 'noticias'], async () => {
    const p = await payload()
    const campos = { slug: true, updatedAt: true } as const
    const [carreras, posgrados, noticias] = await Promise.all([
      p.find({ collection: 'carreras', ...publico, depth: 0, limit: 1000, select: campos }),
      p.find({ collection: 'posgrados', ...publico, depth: 0, limit: 1000, select: campos }),
      p.find({ collection: 'noticias', ...publico, depth: 0, limit: 5000, select: campos }),
    ])
    return { carreras: carreras.docs, posgrados: posgrados.docs, noticias: noticias.docs }
  })
