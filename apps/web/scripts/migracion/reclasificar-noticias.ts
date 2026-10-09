// Corrige una importación hecha con --noticias=todas antes de que existiera la clasificación
// de posts: archiva las "noticias" que en WordPress eran páginas de programas o formularios,
// y borra las redirecciones que la migración creó hacia ellas (desviarían la URL de un
// programa, p. ej. /derecho/, a esa falsa noticia). Por defecto solo informa.
//
//   npx tsx scripts/migracion/reclasificar-noticias.ts             → muestra qué haría
//   npx tsx scripts/migracion/reclasificar-noticias.ts --aplicar   → archiva y borra esas redirecciones
//
// No borra contenido: archivar se puede revertir desde el panel ("Restaurar como borrador").
// Omite cualquier noticia que una persona haya editado (según la auditoría).

import 'dotenv/config'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { CONTEXTO_ACTOR } from '../../src/audit/hooks'
import { CONTEXTO_TRANSICION } from '../../src/workflow/hooks'
import { clasificarPostWp, type CategoriaWp } from './clasificar'

const APLICAR = process.argv.includes('--aplicar')
const WP = 'https://uap.edu.py/wp-json/wp/v2'
const ACTOR = 'Migración: reclasificación de posts de WordPress'
const DIR = path.dirname(fileURLToPath(import.meta.url))

async function wpJson<T>(ruta: string): Promise<T> {
  const res = await fetch(`${WP}${ruta}`, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`WordPress ${ruta} → HTTP ${res.status}`)
  return res.json() as Promise<T>
}

type PostWp = { slug: string; link: string; categories: number[] }
type Noticia = { id: number; titulo: string; urlOriginal?: string; estado?: string }

async function main() {
  const categorias = await wpJson<CategoriaWp[]>('/categories?per_page=100&_fields=id,slug,parent')
  const posts: PostWp[] = []
  for (let pagina = 1; ; pagina++) {
    const lote = await wpJson<PostWp[]>(`/posts?per_page=100&page=${pagina}&_fields=slug,link,categories`).catch(() => [])
    if (!lote.length) break
    posts.push(...lote)
  }
  const porLink = new Map(posts.map((p) => [p.link, p]))

  const payload = await getPayload({ config })
  // También las ya archivadas: si una ejecución se cortó entre archivar y borrar sus
  // redirecciones, la siguiente termina de borrarlas.
  const { docs } = await payload.find({
    collection: 'noticias',
    where: { urlOriginal: { exists: true } },
    draft: true,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })

  const filas: string[][] = [['url_wordpress', 'titulo', 'tipo', 'motivo', 'accion', 'redirecciones_borradas']]
  const resumen: Record<string, number> = {}
  for (const n of docs as unknown as Noticia[]) {
    const post = porLink.get(String(n.urlOriginal))
    if (!post) continue
    const { tipo, motivo } = clasificarPostWp(post, categorias)
    if (tipo === 'noticia') continue

    const { totalDocs: editadaPorPersonas } = await payload.count({
      collection: 'auditoria',
      where: { and: [{ coleccion: { equals: 'noticias' } }, { documentoId: { equals: String(n.id) } }, { usuario: { exists: true } }] },
      overrideAccess: true,
    })
    const redirecciones = await payload.find({
      collection: 'redirecciones',
      where: { and: [{ 'destino.value': { equals: n.id } }, { 'destino.relationTo': { equals: 'noticias' } }, { origen: { equals: 'migracion' } }] },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    const desdes = redirecciones.docs.map((r) => String((r as { desde?: string }).desde))
    const yaArchivada = n.estado === 'archivado'
    if (yaArchivada && !desdes.length) continue

    let accion = editadaPorPersonas
      ? 'omitida: editada por una persona'
      : yaArchivada
        ? APLICAR ? 'ya archivada; redirecciones borradas' : 'ya archivada; se borrarían sus redirecciones'
        : APLICAR ? 'archivada' : 'se archivaría'
    if (APLICAR && !editadaPorPersonas) {
      try {
        if (!yaArchivada) {
          await payload.update({
            collection: 'noticias',
            id: n.id,
            draft: false,
            data: { _status: 'draft', categoria: null } as never,
            overrideAccess: true,
            context: { [CONTEXTO_ACTOR]: ACTOR, [CONTEXTO_TRANSICION]: 'archivado' },
          })
        }
        for (const r of redirecciones.docs) {
          await payload.delete({ collection: 'redirecciones', id: r.id, overrideAccess: true, context: { [CONTEXTO_ACTOR]: ACTOR } })
        }
      } catch (e) {
        accion = `error: ${e instanceof Error ? e.message : String(e)}`
      }
    }
    resumen[`${tipo} · ${accion.split(':')[0]}`] = (resumen[`${tipo} · ${accion.split(':')[0]}`] ?? 0) + 1
    filas.push([String(n.urlOriginal), n.titulo, tipo, motivo, accion, desdes.join(' ')])
  }

  const csv = filas.map((f) => f.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const dirLotes = path.join(DIR, 'lotes')
  fs.mkdirSync(dirLotes, { recursive: true })
  const archivo = path.join(dirLotes, `reclasificacion-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`)
  fs.writeFileSync(archivo, csv)

  console.log(APLICAR ? 'RECLASIFICACIÓN APLICADA' : 'SIMULACIÓN (sin --aplicar no se cambió nada)')
  for (const [k, v] of Object.entries(resumen)) console.log(`  ${k}: ${v}`)
  console.log(`  Redirecciones hacia esas noticias: ${filas.slice(1).reduce((s, f) => s + (f[5] ? f[5].split(' ').length : 0), 0)}`)
  console.log(`  Detalle: ${path.relative(process.cwd(), archivo)}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
