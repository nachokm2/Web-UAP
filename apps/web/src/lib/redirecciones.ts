// Mapa de redirecciones (colección Redirecciones del CMS) para el proxy.

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Carrera, Noticia, Posgrado, Redireccion } from '@/payload-types'

import { enCache } from './cache'
import { urlDeDocumento } from './urls'

export type Destino = { tipo: '301' | '302'; url: string } | { tipo: '410' }

function destinoDe(r: Redireccion): Destino | null {
  if (r.tipo === '410') return { tipo: '410' }
  const tipo = r.tipo === '302' ? '302' : '301'
  if (r.destinoTipo === 'url') return r.url ? { tipo, url: r.url } : null
  const ref = r.destino
  if (!ref || typeof ref.value !== 'object') return null
  const doc = ref.value as Carrera | Posgrado | Noticia
  // Un destino no publicado (borrador o archivado) no redirige: evita llevar a un 404.
  if (doc._status !== 'published' || !doc.slug) return null
  return { tipo, url: urlDeDocumento(ref.relationTo, doc.slug) }
}

const mapa = () =>
  enCache(
    'redirecciones:mapa',
    ['redirecciones', 'carreras', 'posgrados', 'noticias'],
    async () => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({ collection: 'redirecciones', depth: 1, limit: 10_000, overrideAccess: true, draft: false })
      const m = new Map<string, Destino>()
      for (const r of docs as Redireccion[]) {
        const d = destinoDe(r)
        if (d) m.set(r.desde.toLowerCase(), d)
      }
      return m
    },
    // El proxy depende también de la invalidación por hooks; el TTL es la red de seguridad.
    60 * 1000,
  )

/** Busca la ruta tal cual y con barra final (las rutas del sitio anterior la llevan). */
export async function buscarRedireccion(ruta: string): Promise<Destino | null> {
  const m = await mapa()
  const r = ruta.toLowerCase()
  return m.get(r) ?? (r.endsWith('/') ? null : m.get(`${r}/`)) ?? null
}
