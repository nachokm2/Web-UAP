// Importa el contenido del sitio anterior al CMS.
//
//   npx tsx scripts/migracion/importar.ts                 → simulación (no escribe nada)
//   npx tsx scripts/migracion/importar.ts --aplicar       → escribe en la base de DATABASE_URL
//
// Opciones:
//   --solo=configuracion,taxonomias,programas,reglamentos,autoridades,noticias,redirecciones
//                               pasos a pedido (no van por defecto):
//                                 galerias      completa las fotos de noticias ya importadas
//                                 correcciones  aplica scripts/migracion/correcciones.json
//   --noticias=listadas|todas   listadas = las 100 del sitio nuevo (por defecto); todas = los posts de WordPress:
//                               se publican solo los de categorías de noticias; las páginas de programas
//                               y los formularios (que en WordPress también son posts) quedan archivados
//   --estado=publicado|borrador estado con el que se crea el contenido (por defecto publicado, como hoy)
//   --max-pdf-mb=N              no importa PDF más grandes (se informan); por defecto 200
//   --sin-archivos              no descarga ni sube imágenes/PDF (prueba rápida de estructura)
//   --guardar-instantanea=f.json  guarda posts y categorías de WordPress en f.json y termina
//   --wp-instantanea=f.json     usa ese archivo en vez de la API (la API bloquea servidores de datacenter)
//   --precargar-fotos=dir       descarga las fotos de las noticias de WordPress a dir y termina (sin base)
//   --cache=dir                 lee/guarda las descargas en dir (p. ej. la carpeta precargada)
//
// Es idempotente: lo que ya existe (mismo slug, o mismo origen en archivos) se omite.
// Cada ejecución con --aplicar guarda un lote en scripts/migracion/lotes/ para poder revertirla.

import 'dotenv/config'

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { load } from 'cheerio'
import { getPayload, type CollectionSlug, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config'
import { CONTEXTO_ACTOR } from '../../src/audit/hooks'
import { OMITIR_LIMITE_TAMANO } from '../../src/collections/archivos'
import { normalizarRuta } from '../../src/collections/sistema'
import { normalizarSlug } from '../../src/fields/slug'
import { CONTEXTO_TRANSICION } from '../../src/workflow/hooks'
import { extraerAutoridades } from './autoridades'
import { clasificarPostWp, type CategoriaWp } from './clasificar'
import {
  RAIZ_SITIO,
  extraerAgrupaciones,
  extraerAliasesHtaccess,
  extraerDatosDelSitio,
  extraerPrograma,
  extraerReglamentos,
  listarPaginasDePrograma,
  mapearSecciones,
  type ProgramaExtraido,
} from './extraer'
import { htmlALexical, limpiarHtml, textoPlano } from './html'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const WP = 'https://uap.edu.py/wp-json/wp/v2'
const ACTOR = 'Migración del sitio anterior'

// ---------------------------------------------------------------------------
// Opciones

const args = process.argv.slice(2)
const opcion = (nombre: string) => args.find((a) => a.startsWith(`--${nombre}=`))?.split('=')[1]
const APLICAR = args.includes('--aplicar')
const SIN_ARCHIVOS = args.includes('--sin-archivos')
const SOLO = new Set((opcion('solo') ?? 'configuracion,taxonomias,programas,reglamentos,autoridades,noticias,redirecciones').split(','))
const NOTICIAS = (opcion('noticias') ?? 'listadas') as 'listadas' | 'todas'
const ESTADO = (opcion('estado') ?? 'publicado') as 'publicado' | 'borrador'
const MAX_PDF_MB = Number(opcion('max-pdf-mb') ?? 200)
/** Posts y categorías de WordPress leídos de un archivo (--guardar-instantanea) en vez de la API. */
const INSTANTANEA = opcion('wp-instantanea')
const GUARDAR_INSTANTANEA = opcion('guardar-instantanea')
/** Páginas de WordPress que se migran a partir de su HTML (van también en la instantánea). */
const PAGINAS_WP = ['autoridades-del-c-s-u']

// ---------------------------------------------------------------------------
// Reporte y lote (para revertir)

type Entrada = { tipo: string; clave: string; detalle?: string }
const reporte = { creados: [] as Entrada[], omitidos: [] as Entrada[], pendientes: [] as Entrada[], errores: [] as Entrada[] }
const lote: { coleccion: string; id: number | string; updatedAt: string }[] = []

/** En simulación no se escribe: se recuerda lo ya contado para no informarlo dos veces. */
const simulados = new Set<string>()
function simular(tipo: string, clave: string, detalle?: string): null {
  if (!simulados.has(`${tipo}|${clave}`)) {
    simulados.add(`${tipo}|${clave}`)
    reporte.creados.push({ tipo, clave, detalle })
  }
  return null
}

const contexto = () => ({ [CONTEXTO_ACTOR]: ACTOR, [OMITIR_LIMITE_TAMANO]: true })

/** Mensaje de error con el detalle por campo (ValidationError lo trae en data.errors). */
function detalle(e: unknown): string {
  const err = e as { message?: string; data?: { errors?: { path?: string; message?: string }[] } }
  const campos = (err.data?.errors ?? []).map((x) => `${x.path}: ${x.message}`).join('; ')
  return campos ? `${err.message} (${campos})` : String(err.message ?? e)
}

function registrarCreado(coleccion: string, doc: { id: number | string; updatedAt?: string }, clave: string) {
  reporte.creados.push({ tipo: coleccion, clave })
  lote.push({ coleccion, id: doc.id, updatedAt: doc.updatedAt ?? '' })
}

// ---------------------------------------------------------------------------
// Red: descargas con caché local y reintentos

// --cache=dir: carpeta de descargas (p. ej. una precargada con --precargar-fotos y enviada al servidor).
const CACHE = opcion('cache') ? path.resolve(opcion('cache')!) : path.join(DIR, '.cache')
const archivoEnCache = (url: string) => path.join(CACHE, crypto.createHash('sha1').update(url).digest('hex'))

async function descargar(url: string): Promise<Buffer> {
  fs.mkdirSync(CACHE, { recursive: true })
  const archivo = archivoEnCache(url)
  if (fs.existsSync(archivo)) return fs.readFileSync(archivo)
  let ultimo: unknown
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(300_000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      // El anti-bots del hosting responde una página HTML con estado 200: no es el archivo.
      if ((res.headers.get('content-type') ?? '').includes('text/html')) throw new Error('el servidor respondió HTML (¿bloqueo anti-bots?)')
      const buf = Buffer.from(await res.arrayBuffer())
      fs.writeFileSync(archivo, buf)
      return buf
    } catch (e) {
      ultimo = e
      await new Promise((r) => setTimeout(r, 1000 * intento))
    }
  }
  throw new Error(`No se pudo descargar ${url}: ${ultimo}`)
}

class FinDePaginas extends Error {}

async function wpJson<T>(ruta: string): Promise<T> {
  const res = await fetch(`${WP}${ruta}`, { signal: AbortSignal.timeout(60_000) })
  // WordPress responde 400 rest_post_invalid_page_number al pasar la última página.
  if (res.status === 400 && /[?&]page=/.test(ruta)) throw new FinDePaginas()
  if (!res.ok) throw new Error(`WordPress ${ruta} → HTTP ${res.status}`)
  if (!(res.headers.get('content-type') ?? '').includes('json')) {
    // Pasa desde servidores de datacenter (Railway): el anti-bots del hosting responde una página HTML.
    throw new Error(`WordPress ${ruta} respondió HTML en lugar de JSON (¿bloqueo anti-bots?). Use --wp-instantanea.`)
  }
  return res.json() as Promise<T>
}

async function tamanoRemoto(url: string): Promise<number | null> {
  const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(60_000) }).catch(() => null)
  const largo = res?.headers.get('content-length')
  return largo ? Number(largo) : null
}

const mediaWp = new Map<string, { source_url: string; title: string }>()
async function resolverMediaWp(id: string) {
  if (!mediaWp.has(id)) {
    const m = await wpJson<{ source_url: string; title: { rendered: string } }>(`/media/${id}?_fields=source_url,title`)
    mediaWp.set(id, { source_url: m.source_url, title: load(m.title.rendered).text() })
  }
  return mediaWp.get(id)!
}

// ---------------------------------------------------------------------------
// Archivos (Imágenes y Documentos), idempotentes por `origen`

async function buscarPorOrigen(payload: Payload, coleccion: 'medios' | 'documentos', origen: string) {
  const { docs } = await payload.find({ collection: coleccion, where: { origen: { equals: origen } }, limit: 1, depth: 0, overrideAccess: true })
  return docs[0] as { id: number } | undefined
}

const MIME_IMAGEN: Record<string, string> = { jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

async function asegurarImagen(payload: Payload, origen: string, alt: string): Promise<number | null> {
  if (SIN_ARCHIVOS) return null
  const existente = await buscarPorOrigen(payload, 'medios', origen)
  if (existente) return existente.id
  if (!APLICAR) return simular('medios', origen)
  try {
    const data = /^https?:/.test(origen) ? await descargar(origen) : fs.readFileSync(path.join(RAIZ_SITIO, origen))
    const meta = await sharp(data).metadata()
    const mimetype = MIME_IMAGEN[meta.format ?? '']
    if (!mimetype) throw new Error(`formato no admitido (${meta.format ?? 'desconocido'})`)
    const nombre = path.basename(decodeURIComponent(origen.split('?')[0])).replace(/\.[a-z0-9]+$/i, '') + '.' + (meta.format === 'jpeg' ? 'jpg' : meta.format)
    const doc = await payload.create({
      collection: 'medios',
      data: { alt, origen },
      file: { data, mimetype, name: nombre, size: data.length },
      overrideAccess: true,
      context: contexto(),
    })
    registrarCreado('medios', doc, origen)
    return doc.id
  } catch (e) {
    reporte.errores.push({ tipo: 'medios', clave: origen, detalle: detalle(e) })
    return null
  }
}

async function asegurarDocumento(
  payload: Payload,
  origen: string,
  titulo: string,
  tipo: 'brochure' | 'reglamento' | 'malla' | 'otro',
): Promise<number | null> {
  if (SIN_ARCHIVOS) return null
  const existente = await buscarPorOrigen(payload, 'documentos', origen)
  if (existente) return existente.id
  const bytes = await tamanoRemoto(origen)
  if (bytes && bytes > MAX_PDF_MB * 1024 * 1024) {
    reporte.pendientes.push({ tipo: 'documentos', clave: origen, detalle: `${Math.round(bytes / 1048576)} MB supera --max-pdf-mb=${MAX_PDF_MB}` })
    return null
  }
  if (!APLICAR) return simular('documentos', origen, bytes ? `${Math.round(bytes / 1048576)} MB` : undefined)
  try {
    const data = await descargar(origen)
    const doc = await payload.create({
      collection: 'documentos',
      data: { titulo, tipo, origen },
      file: { data, mimetype: 'application/pdf', name: path.basename(decodeURIComponent(origen)), size: data.length },
      overrideAccess: true,
      context: contexto(),
    })
    registrarCreado('documentos', doc, origen)
    return doc.id
  } catch (e) {
    reporte.errores.push({ tipo: 'documentos', clave: origen, detalle: detalle(e) })
    return null
  }
}

// ---------------------------------------------------------------------------
// Taxonomías

async function asegurarPorNombre(payload: Payload, coleccion: 'facultades' | 'sedes' | 'categorias', nombre: string, extra: Record<string, unknown> = {}) {
  const { docs } = await payload.find({ collection: coleccion, where: { nombre: { equals: nombre } }, limit: 1, depth: 0, overrideAccess: true })
  if (docs[0]) return docs[0].id as number
  if (!APLICAR) return simular(coleccion, nombre)
  const doc = await payload.create({ collection: coleccion, data: { nombre, ...extra } as never, overrideAccess: true, context: contexto() })
  registrarCreado(coleccion, doc, nombre)
  return doc.id as number
}

// ---------------------------------------------------------------------------
// Pasos

async function importarConfiguracion(payload: Payload) {
  const d = extraerDatosDelSitio()
  const actual = await payload.findGlobal({ slug: 'configuracion', overrideAccess: true, depth: 0 })
  if (actual.telefono || actual.email) {
    reporte.omitidos.push({ tipo: 'configuracion', clave: 'configuracion', detalle: 'ya tiene datos cargados' })
    return
  }
  reporte.creados.push({ tipo: 'configuracion', clave: 'datos de contacto, redes, leyenda y formulario' })
  if (!APLICAR) return
  await payload.updateGlobal({
    slug: 'configuracion',
    data: {
      telefono: d.telefono,
      whatsapp: d.whatsapp,
      email: d.email,
      direccion: d.direccion,
      redes: d.redes,
      campusVirtualUrl: d.campusVirtualUrl,
      leyendaInstitucional: d.leyendaInstitucional,
      bitrixFormulario: d.bitrixFormulario,
      bitrixLoaderUrl: d.bitrixLoaderUrl,
    },
    overrideAccess: true,
    context: contexto(),
  })
  reporte.pendientes.push({ tipo: 'configuracion', clave: 'leyendaInstitucional', detalle: 'confirmar el texto MEC/ANEAES con Secretaría General' })
}

const COLECCION_DE = (p: ProgramaExtraido): 'carreras' | 'posgrados' => (p.tipo === 'carrera' ? 'carreras' : 'posgrados')

async function importarProgramas(payload: Payload) {
  const grupos = extraerAgrupaciones()
  const sedeCentral = await asegurarPorNombre(payload, 'sedes', 'Sede Central', { direccion: extraerDatosDelSitio().direccion, ciudad: 'Asunción' })
  let orden = 0

  for (const archivo of listarPaginasDePrograma()) {
    const p = extraerPrograma(archivo)
    const coleccion = COLECCION_DE(p)
    orden += 10
    try {
      const slug = normalizarSlug(p.slug)
      const { docs } = await payload.find({ collection: coleccion, where: { slug: { equals: slug } }, draft: true, limit: 1, depth: 0, overrideAccess: true })
      if (docs[0]) {
        reporte.omitidos.push({ tipo: coleccion, clave: slug, detalle: 'ya existe' })
        continue
      }

      const c = mapearSecciones(p.secciones)
      const grupo = grupos.get(p.archivo)
      const grupoId = grupo ? await asegurarPorNombre(payload, 'facultades', grupo) : null
      const imagenPrincipal = p.imagenHero ? await asegurarImagen(payload, p.imagenHero, `Imagen de portada de ${p.nombre}`) : null

      let brochure: number | null = null
      if (p.brochure) {
        const origen = 'wpMediaId' in p.brochure ? (await resolverMediaWp(p.brochure.wpMediaId)).source_url : p.brochure.url
        brochure = await asegurarDocumento(payload, origen, `Brochure ${p.nombre}`, 'brochure')
      } else {
        reporte.pendientes.push({ tipo: coleccion, clave: slug, detalle: 'sin brochure en el sitio actual' })
      }
      if (p.modalidadTexto && !p.modalidad) reporte.pendientes.push({ tipo: coleccion, clave: slug, detalle: `modalidad ambigua: "${p.modalidadTexto}"` })
      if (!p.modalidadTexto) reporte.pendientes.push({ tipo: coleccion, clave: slug, detalle: 'sin modalidad' })
      c.omitidas.forEach((o) => reporte.omitidos.push({ tipo: `${coleccion}.seccion`, clave: `${slug} · ${o.titulo}`, detalle: o.motivo }))

      const rich = (html: string | null) => htmlALexical(html, payload.config)
      const data = {
        nombre: p.nombre,
        slug,
        tituloOtorgado: p.tituloOtorgado,
        duracion: p.duracion,
        // Sin modalidad explícita queda vacía: "Sede: Central" no alcanza para afirmarla.
        modalidad: p.modalidad,
        sedes: p.sede && sedeCentral ? [sedeCentral] : [],
        descripcionCorta: textoPlano(c.descripcion ?? c.objetivo, 300),
        descripcion: await rich(c.descripcion),
        objetivo: await rich(c.objetivo),
        perfilIngreso: await rich(c.perfilIngreso),
        perfilEgreso: await rich(c.perfilEgreso),
        campoLaboral: await rich(c.campoLaboral),
        requisitos: await rich(c.requisitos),
        seccionesAdicionales: await Promise.all(c.adicionales.map(async (a) => ({ titulo: a.titulo, contenido: await rich(a.html) }))),
        malla: p.malla.map((m) => ({ nombre: m.nombre, asignaturas: m.asignaturas.map((nombre) => ({ nombre })) })),
        imagenPrincipal,
        brochure,
        orden,
        ...(coleccion === 'carreras'
          ? { facultad: grupoId }
          : {
              tipo: p.tipo,
              area: grupoId,
              objetivosEspecificos: await rich(c.objetivosEspecificos),
              dirigidoA: await rich(c.dirigidoA),
              certificacion: await rich(c.certificacion),
            }),
        _status: ESTADO === 'publicado' ? 'published' : 'draft',
      }

      if (!APLICAR) {
        reporte.creados.push({ tipo: coleccion, clave: slug })
        continue
      }
      const doc = await payload.create({
        collection: coleccion,
        data: data as never,
        draft: ESTADO !== 'publicado',
        overrideAccess: true,
        context: contexto(),
      })
      registrarCreado(coleccion, doc, slug)
    } catch (e) {
      reporte.errores.push({ tipo: coleccion, clave: p.slug, detalle: detalle(e) })
    }
  }
}

async function importarReglamentos(payload: Payload) {
  for (const r of extraerReglamentos()) {
    try {
      const origen = r.url ?? (r.wpMediaId ? (await resolverMediaWp(r.wpMediaId)).source_url : null)
      if (!origen) {
        reporte.errores.push({ tipo: 'reglamentos', clave: r.titulo, detalle: 'sin URL ni ID de WordPress' })
        continue
      }
      await asegurarDocumento(payload, origen, r.titulo, 'reglamento')
    } catch (e) {
      reporte.errores.push({ tipo: 'reglamentos', clave: r.titulo, detalle: detalle(e) })
    }
  }
}

type PostWp = {
  id: number
  slug: string
  date_gmt: string
  link: string
  categories?: number[]
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[]
    'wp:term'?: { taxonomy: string; name: string }[][]
  }
}

let categoriasWp: CategoriaWp[] = []

/** HTML de una página de WordPress (de la instantánea si se indicó, si no de la API). */
async function paginaWp(slug: string): Promise<string | null> {
  if (INSTANTANEA) {
    const guardada = JSON.parse(fs.readFileSync(INSTANTANEA, 'utf8')) as { paginas?: Record<string, string> }
    return guardada.paginas?.[slug] ?? null
  }
  const [p] = await wpJson<{ content: { rendered: string } }[]>(`/pages?slug=${slug}&_fields=content`)
  return p?.content.rendered ?? null
}

async function postsDeWordpress(): Promise<PostWp[]> {
  const campos = '_fields=id,slug,date_gmt,link,categories,title,excerpt,content,_links,_embedded&_embed=wp:featuredmedia,wp:term'
  if (NOTICIAS === 'todas') {
    if (INSTANTANEA) {
      const guardada = JSON.parse(fs.readFileSync(INSTANTANEA, 'utf8')) as { categorias: CategoriaWp[]; posts: PostWp[] }
      categoriasWp = guardada.categorias
      return guardada.posts
    }
    categoriasWp = await wpJson<CategoriaWp[]>('/categories?per_page=100&_fields=id,slug,parent')
    const todos: PostWp[] = []
    for (let pagina = 1; ; pagina++) {
      let lote: PostWp[]
      try {
        lote = await wpJson<PostWp[]>(`/posts?per_page=50&page=${pagina}&${campos}`)
      } catch (e) {
        if (e instanceof FinDePaginas) break
        throw e
      }
      if (!lote.length) break
      todos.push(...lote)
    }
    return todos
  }
  const listadas = JSON.parse(fs.readFileSync(path.join(RAIZ_SITIO, 'data/noticias.json'), 'utf8')) as { url_original: string }[]
  const posts: PostWp[] = []
  for (const n of listadas) {
    const slug = n.url_original.split('/').filter(Boolean).pop()!
    const [post] = await wpJson<PostWp[]>(`/posts?slug=${encodeURIComponent(slug)}&${campos}`)
    if (post) posts.push(post)
    else reporte.errores.push({ tipo: 'noticias', clave: n.url_original, detalle: 'no existe en WordPress' })
  }
  return posts
}

async function importarNoticias(payload: Payload) {
  const posts = await postsDeWordpress()
  const usados = new Set<string>()
  for (const post of posts) {
    const titulo = load(post.title.rendered).text().trim()
    let slug = normalizarSlug(titulo)
    if (usados.has(slug)) slug = `${slug}-${post.date_gmt.slice(0, 10)}`
    usados.add(slug)
    try {
      const { docs } = await payload.find({ collection: 'noticias', where: { urlOriginal: { equals: post.link } }, draft: true, limit: 1, depth: 0, overrideAccess: true })
      if (docs[0]) {
        reporte.omitidos.push({ tipo: 'noticias', clave: slug, detalle: 'ya existe' })
        continue
      }
      const destacada = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
      const imagenDestacada = destacada ? await asegurarImagen(payload, destacada, post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || titulo) : null
      const { imagenes } = limpiarHtml(post.content.rendered)
      const galeria: number[] = []
      for (const url of imagenes.filter((u) => u !== destacada)) {
        const id = await asegurarImagen(payload, url, titulo)
        if (id) galeria.push(id)
      }
      // En WordPress las páginas de programas y los formularios también son posts: se conservan
      // archivados (no públicos, sin categoría de noticias) para no perder su contenido.
      const { tipo, motivo } = NOTICIAS === 'todas' ? clasificarPostWp(post, categoriasWp) : { tipo: 'noticia' as const, motivo: '' }
      const esNoticia = tipo === 'noticia'
      const categoriaNombre = esNoticia
        ? post._embedded?.['wp:term']?.flat().find((t) => t.taxonomy === 'category' && !/sin categor|uncategorized/i.test(t.name))?.name
        : undefined
      const categoria = categoriaNombre ? await asegurarPorNombre(payload, 'categorias', load(categoriaNombre).text()) : null
      if (!esNoticia) reporte.pendientes.push({ tipo: 'noticias', clave: post.link, detalle: `archivada: ${motivo}` })

      if (!APLICAR) {
        reporte.creados.push({ tipo: esNoticia ? 'noticias' : 'noticias (archivadas)', clave: slug })
        continue
      }
      const publicar = esNoticia && ESTADO === 'publicado'
      const doc = await payload.create({
        collection: 'noticias',
        data: {
          titulo,
          slug,
          bajada: textoPlano(post.excerpt.rendered, 300),
          contenido: await htmlALexical(post.content.rendered, payload.config),
          imagenDestacada,
          galeria,
          categoria,
          fechaPublicacion: new Date(`${post.date_gmt}Z`).toISOString(),
          urlOriginal: post.link,
          _status: publicar ? 'published' : 'draft',
        } as never,
        draft: !publicar,
        overrideAccess: true,
        context: esNoticia ? contexto() : { ...contexto(), [CONTEXTO_TRANSICION]: 'archivado' },
      })
      registrarCreado('noticias', doc, slug)
    } catch (e) {
      reporte.errores.push({ tipo: 'noticias', clave: slug, detalle: detalle(e) })
    }
  }
}

async function asegurarRedireccion(payload: Payload, origen: string, destino: { relationTo: CollectionSlug; value: number }) {
  // Se busca con la misma normalización con que se guarda (minúsculas, barra final).
  const desde = normalizarRuta(origen)
  const { docs } = await payload.find({ collection: 'redirecciones', where: { desde: { equals: desde } }, limit: 1, depth: 0, overrideAccess: true })
  if (docs[0]) {
    reporte.omitidos.push({ tipo: 'redirecciones', clave: desde, detalle: 'ya existe' })
    return
  }
  if (!APLICAR) {
    reporte.creados.push({ tipo: 'redirecciones', clave: desde })
    return
  }
  try {
    const doc = await payload.create({
      collection: 'redirecciones',
      data: { desde, tipo: '301', destinoTipo: 'interno', destino, origen: 'migracion' } as never,
      overrideAccess: true,
      context: contexto(),
    })
    registrarCreado('redirecciones', doc, desde)
  } catch (e) {
    reporte.errores.push({ tipo: 'redirecciones', clave: desde, detalle: detalle(e) })
  }
}

async function importarRedirecciones(payload: Payload) {
  // Alias del .htaccess (slug viejo de WordPress → programa).
  for (const alias of extraerAliasesHtaccess()) {
    const coleccion = alias.archivo.includes('/carreras/') ? 'carreras' : 'posgrados'
    const slug = path.basename(alias.archivo, '.html')
    const { docs } = await payload.find({ collection: coleccion, where: { slug: { equals: slug } }, draft: true, limit: 1, depth: 0, overrideAccess: true })
    if (!docs[0]) {
      reporte.pendientes.push({ tipo: 'redirecciones', clave: alias.desde, detalle: `falta el programa ${slug}` })
      continue
    }
    await asegurarRedireccion(payload, alias.desde, { relationTo: coleccion, value: docs[0].id as number })
  }
  // Noticias: URL plana de WordPress (/{slug}/) → nueva URL /noticias/{slug}/. Las archivadas
  // (páginas de programas y formularios de WordPress) no: su URL antigua la resuelve el programa
  // con la misma dirección o queda pendiente de decisión.
  const { docs: noticias } = await payload.find({
    collection: 'noticias',
    where: { and: [{ urlOriginal: { exists: true } }, { estado: { not_equals: 'archivado' } }] },
    draft: true,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  for (const n of noticias) {
    const desde = new URL(String(n.urlOriginal)).pathname
    if (desde === `/noticias/${n.slug}/`) continue
    await asegurarRedireccion(payload, desde, { relationTo: 'noticias', value: n.id as number })
  }
}

// ---------------------------------------------------------------------------
// Pasos a pedido sobre contenido ya importado. Nunca pisan lo que editó una persona.

async function editadoPorPersonas(payload: Payload, coleccion: string, id: number | string) {
  const { totalDocs } = await payload.count({
    collection: 'auditoria',
    where: { and: [{ coleccion: { equals: coleccion } }, { documentoId: { equals: String(id) } }, { usuario: { exists: true } }] },
    overrideAccess: true,
  })
  return totalDocs > 0
}

/**
 * Fotos de las noticias según WordPress (incluidas las de slideshows de Elementor, que la
 * primera importación no leía). Completa la galería de las noticias publicadas; la primera
 * foto es la que el sitio muestra arriba de la nota, como en WordPress.
 */
async function completarGalerias(payload: Payload) {
  for (const post of await postsDeWordpress()) {
    const { docs } = await payload.find({ collection: 'noticias', where: { urlOriginal: { equals: post.link } }, draft: true, limit: 1, depth: 0, overrideAccess: true })
    const n = docs[0] as { id: number; slug: string; titulo: string; estado?: string; galeria?: (number | { id: number })[] } | undefined
    if (!n || n.estado !== 'publicado') continue
    const destacada = post._embedded?.['wp:featuredmedia']?.[0]?.source_url
    const deseadas = limpiarHtml(post.content.rendered).imagenes.filter((u) => u !== destacada)
    const actuales = (n.galeria ?? []).map((g) => (typeof g === 'object' ? g.id : g))
    if (!deseadas.length) continue
    if (await editadoPorPersonas(payload, 'noticias', n.id)) {
      reporte.pendientes.push({ tipo: 'galerias', clave: n.slug, detalle: 'editada por una persona: no se toca' })
      continue
    }
    const ids: number[] = []
    for (const url of deseadas) {
      const id = await asegurarImagen(payload, url, n.titulo)
      if (id) ids.push(id)
    }
    if (!APLICAR) {
      if (deseadas.length !== actuales.length) reporte.creados.push({ tipo: 'galerias', clave: n.slug, detalle: `${actuales.length} → ${deseadas.length} fotos` })
      continue
    }
    if (ids.length === actuales.length && ids.every((id, i) => id === actuales[i])) {
      reporte.omitidos.push({ tipo: 'galerias', clave: n.slug, detalle: 'ya completa' })
      continue
    }
    try {
      await payload.update({
        collection: 'noticias',
        id: n.id,
        draft: false,
        data: { galeria: ids, _status: 'published' } as never,
        overrideAccess: true,
        context: contexto(),
      })
      reporte.creados.push({ tipo: 'galerias', clave: n.slug, detalle: `${actuales.length} → ${ids.length} fotos` })
    } catch (e) {
      reporte.errores.push({ tipo: 'galerias', clave: n.slug, detalle: detalle(e) })
    }
  }
}

/** Autoridades según la página de WordPress (la nómina vigente; el sitio estático estaba desactualizado). */
async function importarAutoridades(payload: Payload) {
  const html = await paginaWp('autoridades-del-c-s-u')
  if (!html) {
    reporte.errores.push({ tipo: 'autoridades', clave: 'autoridades-del-c-s-u', detalle: 'no se encontró la página en WordPress' })
    return
  }
  const autoridades = extraerAutoridades(html)
  for (const [i, a] of autoridades.entries()) {
    const clave = `${a.cargo} · ${a.nombre}`
    const { docs } = await payload.find({
      collection: 'autoridades',
      where: { and: [{ grupo: { equals: a.grupo } }, { cargo: { equals: a.cargo } }, { nombre: { equals: a.nombre } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (docs[0]) {
      reporte.omitidos.push({ tipo: 'autoridades', clave, detalle: 'ya existe' })
      continue
    }
    const foto = a.foto ? await asegurarImagen(payload, a.foto, a.nombre) : null
    if (!APLICAR) {
      reporte.creados.push({ tipo: 'autoridades', clave })
      continue
    }
    try {
      const doc = await payload.create({
        collection: 'autoridades',
        data: { nombre: a.nombre, cargo: a.cargo, grupo: a.grupo, foto, orden: (i + 1) * 10, activo: true },
        overrideAccess: true,
        context: contexto(),
      })
      registrarCreado('autoridades', doc, clave)
    } catch (e) {
      reporte.errores.push({ tipo: 'autoridades', clave, detalle: detalle(e) })
    }
  }
}

type Correcciones = {
  imagenesPrograma?: { coleccion: 'carreras' | 'posgrados'; slug: string; imagen: string; motivo: string }[]
  redirecciones?: { desde: string; tipo: '301' | '410'; url?: string; motivo: string }[]
}

/** Decisiones de la revisión del equipo (scripts/migracion/correcciones.json). */
async function aplicarCorrecciones(payload: Payload) {
  const correcciones = JSON.parse(fs.readFileSync(path.join(DIR, 'correcciones.json'), 'utf8')) as Correcciones

  for (const c of correcciones.imagenesPrograma ?? []) {
    const { docs } = await payload.find({ collection: c.coleccion, where: { slug: { equals: c.slug } }, draft: true, limit: 1, depth: 1, overrideAccess: true })
    const p = docs[0] as { id: number; nombre: string; _status?: string; imagenPrincipal?: { origen?: string } | null } | undefined
    if (!p) {
      reporte.errores.push({ tipo: 'correcciones', clave: c.slug, detalle: 'no existe el programa' })
      continue
    }
    if (p.imagenPrincipal?.origen === c.imagen) {
      reporte.omitidos.push({ tipo: 'correcciones', clave: c.slug, detalle: 'ya tiene esa imagen' })
      continue
    }
    if (await editadoPorPersonas(payload, c.coleccion, p.id)) {
      reporte.pendientes.push({ tipo: 'correcciones', clave: c.slug, detalle: 'editado por una persona: no se toca' })
      continue
    }
    const imagen = await asegurarImagen(payload, c.imagen, p.nombre)
    if (!APLICAR) {
      reporte.creados.push({ tipo: 'correcciones', clave: c.slug, detalle: c.motivo })
      continue
    }
    if (!imagen) continue
    try {
      await payload.update({
        collection: c.coleccion,
        id: p.id,
        draft: false,
        data: { imagenPrincipal: imagen, _status: p._status === 'published' ? 'published' : 'draft' } as never,
        overrideAccess: true,
        context: contexto(),
      })
      reporte.creados.push({ tipo: 'correcciones', clave: c.slug, detalle: c.motivo })
    } catch (e) {
      reporte.errores.push({ tipo: 'correcciones', clave: c.slug, detalle: detalle(e) })
    }
  }

  for (const r of correcciones.redirecciones ?? []) {
    const desde = normalizarRuta(r.desde)
    const { docs } = await payload.find({ collection: 'redirecciones', where: { desde: { equals: desde } }, limit: 1, depth: 0, overrideAccess: true })
    if (docs[0]) {
      reporte.omitidos.push({ tipo: 'redirecciones', clave: desde, detalle: 'ya existe' })
      continue
    }
    if (!APLICAR) {
      reporte.creados.push({ tipo: 'redirecciones', clave: desde, detalle: r.motivo })
      continue
    }
    try {
      const doc = await payload.create({
        collection: 'redirecciones',
        data: { desde, tipo: r.tipo, ...(r.tipo === '410' ? {} : { destinoTipo: 'url', url: r.url }), origen: 'migracion' } as never,
        overrideAccess: true,
        context: contexto(),
      })
      registrarCreado('redirecciones', doc, desde)
    } catch (e) {
      reporte.errores.push({ tipo: 'redirecciones', clave: desde, detalle: detalle(e) })
    }
  }
}

// ---------------------------------------------------------------------------

function imprimirReporte() {
  const porTipo = (lista: Entrada[]) =>
    Object.entries(lista.reduce<Record<string, number>>((acc, e) => ((acc[e.tipo] = (acc[e.tipo] ?? 0) + 1), acc), {}))
      .map(([t, n]) => `${t}: ${n}`)
      .join(', ') || '—'
  console.log(`\n${APLICAR ? 'IMPORTACIÓN' : 'SIMULACIÓN (sin --aplicar no se escribió nada)'}`)
  console.log(`  ${APLICAR ? 'Creados' : 'Se crearían'}: ${porTipo(reporte.creados)}`)
  console.log(`  Omitidos: ${porTipo(reporte.omitidos)}`)
  console.log(`  Pendientes de revisión: ${reporte.pendientes.length}`)
  console.log(`  Errores: ${reporte.errores.length}`)
  reporte.errores.slice(0, 20).forEach((e) => console.log(`    ✗ ${e.tipo} ${e.clave}: ${e.detalle}`))

  const dirLotes = path.join(DIR, 'lotes')
  fs.mkdirSync(dirLotes, { recursive: true })
  const marca = new Date().toISOString().replace(/[:.]/g, '-')
  const archivo = path.join(dirLotes, `${APLICAR ? 'lote' : 'simulacion'}-${marca}.json`)
  fs.writeFileSync(archivo, JSON.stringify({ aplicado: APLICAR, base: (process.env.DATABASE_URL ?? '').replace(/\/\/[^@]*@/, '//***@'), opciones: args, lote, reporte }, null, 2))
  console.log(`  Detalle: ${path.relative(process.cwd(), archivo)}`)
}

async function main() {
  const precargar = opcion('precargar-fotos')
  if (precargar) {
    // Para servidores a los que WordPress bloquea: las fotos se bajan desde una red que no
    // está bloqueada y la carpeta viaja con el código (luego --cache=esa carpeta).
    fs.mkdirSync(precargar, { recursive: true })
    let ok = 0
    const fallidas: string[] = []
    for (const post of await postsDeWordpress()) {
      if (NOTICIAS === 'todas' && clasificarPostWp(post, categoriasWp).tipo !== 'noticia') continue
      for (const url of limpiarHtml(post.content.rendered).imagenes) {
        try {
          await descargar(url)
          fs.copyFileSync(archivoEnCache(url), path.join(precargar, path.basename(archivoEnCache(url))))
          ok++
        } catch {
          fallidas.push(url)
        }
      }
    }
    console.log(`Fotos precargadas: ${ok} en ${precargar}; fallidas: ${fallidas.length}`)
    fallidas.slice(0, 10).forEach((u) => console.log('  ✗', u))
    process.exit(fallidas.length ? 1 : 0)
  }
  if (GUARDAR_INSTANTANEA) {
    const posts = await postsDeWordpress()
    const paginas: Record<string, string> = {}
    for (const slug of PAGINAS_WP) {
      const [p] = await wpJson<{ content: { rendered: string } }[]>(`/pages?slug=${slug}&_fields=content`)
      if (p) paginas[slug] = p.content.rendered
    }
    fs.writeFileSync(GUARDAR_INSTANTANEA, JSON.stringify({ categorias: categoriasWp, posts, paginas }))
    console.log(`Instantánea de WordPress: ${posts.length} posts, ${categoriasWp.length} categorías → ${GUARDAR_INSTANTANEA}`)
    process.exit(0)
  }
  const payload = await getPayload({ config })
  console.log(`Base: ${(process.env.DATABASE_URL ?? '').replace(/\/\/[^@]*@/, '//***@')} · ${APLICAR ? 'APLICANDO' : 'simulación'}`)
  const pasos: [string, (p: Payload) => Promise<void>][] = [
    ['configuracion', importarConfiguracion],
    ['programas', importarProgramas],
    ['reglamentos', importarReglamentos],
    ['autoridades', importarAutoridades],
    ['noticias', importarNoticias],
    ['redirecciones', importarRedirecciones],
    ['galerias', completarGalerias],
    ['correcciones', aplicarCorrecciones],
  ]
  for (const [nombre, paso] of pasos) {
    if (!SOLO.has(nombre)) continue
    console.log(`→ ${nombre}…`)
    try {
      await paso(payload)
    } catch (e) {
      // Un paso que falla no impide guardar el reporte ni el lote de lo ya creado.
      reporte.errores.push({ tipo: nombre, clave: '(paso interrumpido)', detalle: detalle(e) })
    }
  }
  imprimirReporte()
  process.exit(reporte.errores.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
