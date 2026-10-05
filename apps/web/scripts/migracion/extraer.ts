// Extracción del contenido del sitio estático (HTML) a datos normalizados.
// Funciones puras: leen archivos y devuelven objetos; no escriben nada.
// Regla: no se inventa contenido. Lo que no se puede mapear se informa.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { load } from 'cheerio'

/** Raíz del sitio estático (la raíz del repositorio). */
export const RAIZ_SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')

export type TipoPrograma = 'carrera' | 'diplomado' | 'especializacion' | 'maestria' | 'doctorado' | 'maestria_doctorado'
export type Modalidad = 'presencial' | 'virtual' | 'hibrida' | 'presencial_y_distancia'

export type Seccion = { titulo: string; html: string; texto: string }

export type ProgramaExtraido = {
  archivo: string
  slug: string
  nombre: string
  tipo: TipoPrograma
  tituloOtorgado: string | null
  duracion: string | null
  modalidadTexto: string | null
  modalidad: Modalidad | null
  sede: string | null
  /** Ruta de la imagen hero relativa a la raíz del sitio. */
  imagenHero: string | null
  brochure: { wpMediaId: string } | { url: string } | null
  secciones: Seccion[]
  malla: { nombre: string; asignaturas: string[] }[]
}

const limpio = (s: string) => s.replace(/\s+/g, ' ').trim()

export function tipoDesdeNombre(nombre: string, archivo: string): TipoPrograma {
  const t = `${nombre} ${archivo}`.toLowerCase()
  if (archivo.includes('/carreras/')) return 'carrera'
  if (/maestr[ií]a y doctorado|maestria-y-doctorado/.test(t)) return 'maestria_doctorado'
  if (/doctorado/.test(t)) return 'doctorado'
  if (/maestr[ií]a|master/.test(t)) return 'maestria'
  if (/especializaci[oó]n/.test(t)) return 'especializacion'
  return 'diplomado'
}

/** Texto de la "pill" de modalidad → valor de la lista cerrada. null si es ambiguo. */
export function mapearModalidad(texto: string | null): Modalidad | null {
  if (!texto) return null
  const t = texto.toLowerCase()
  if (/presencial y a distancia/.test(t)) return 'presencial_y_distancia'
  if (/h[ií]brid/.test(t)) return 'hibrida'
  if (/virtual|online|en l[ií]nea|eva\b/.test(t)) return 'virtual'
  if (/presencial/.test(t)) return 'presencial'
  return null
}

function rutaDesdePagina(paginaAbs: string, ref: string): string {
  return path.relative(RAIZ_SITIO, path.resolve(path.dirname(paginaAbs), ref)).split(path.sep).join('/')
}

export function extraerPrograma(archivoAbs: string): ProgramaExtraido {
  const $ = load(fs.readFileSync(archivoAbs, 'utf8'))
  const archivo = path.relative(RAIZ_SITIO, archivoAbs).split(path.sep).join('/')
  const hero = $('section.career-hero-glass').first()
  const nombre = limpio(hero.find('h1').first().text())

  const pills: Record<string, string> = {}
  hero.find('.info-pill').each((_, el) => {
    const etiqueta = limpio($(el).find('.pill-label').text()).toLowerCase()
    const valor = limpio($(el).find('.pill-value').text())
    if (etiqueta && valor) pills[etiqueta] = valor
  })
  const pill = (...claves: string[]) => {
    for (const c of claves) if (pills[c]) return pills[c]
    return null
  }

  const estiloHero = hero.attr('style') ?? ''
  const urlHero = /url\(['"]?([^'")]+)['"]?\)/.exec(estiloHero)?.[1] ?? null

  const boton = hero.find('a.brochure-btn-glass').first()
  const wpMediaId = boton.attr('data-brochure-id')
  const hrefBrochure = boton.attr('href')
  const brochure = wpMediaId
    ? { wpMediaId }
    : hrefBrochure && hrefBrochure !== '#'
      ? { url: hrefBrochure }
      : null

  const secciones: Seccion[] = []
  $('main .glass-card').each((_, el) => {
    const card = $(el)
    const titulo = limpio(card.children('h2').first().text())
    if (!titulo) return
    const cuerpo = card.clone()
    cuerpo.children('h2').first().remove()
    cuerpo.find('[style]').removeAttr('style')
    const html = (cuerpo.html() ?? '').trim()
    secciones.push({ titulo, html, texto: limpio(cuerpo.text()) })
  })

  const malla: ProgramaExtraido['malla'] = []
  $('#malla-tabs .malla-tab').each((i, el) => {
    const nombrePeriodo = limpio($(el).text()).replace(/°+/g, '°')
    const panel = $(`.malla-panel[data-semester="${$(el).attr('data-sem') ?? i}"]`)
    const asignaturas = panel
      .find('li')
      .map((_, li) => limpio($(li).text()))
      .get()
      .filter(Boolean)
    malla.push({ nombre: nombrePeriodo, asignaturas })
  })

  const modalidadTexto = pill('modalidad')
  return {
    archivo,
    slug: path.basename(archivoAbs, '.html'),
    nombre,
    tipo: tipoDesdeNombre(nombre, archivo),
    tituloOtorgado: pill('título otorgado', 'título', 'titulo otorgado', 'titulo'),
    duracion: pill('duración', 'duracion'),
    modalidadTexto,
    modalidad: mapearModalidad(modalidadTexto),
    sede: pill('sede'),
    imagenHero: urlHero ? rutaDesdePagina(archivoAbs, urlHero) : null,
    brochure,
    secciones,
    malla,
  }
}

// ---------------------------------------------------------------------------
// Mapeo de secciones a campos del CMS

export type CamposDeContenido = {
  descripcion: string | null
  objetivo: string | null
  objetivosEspecificos: string | null
  dirigidoA: string | null
  requisitos: string | null
  certificacion: string | null
  perfilIngreso: string | null
  perfilEgreso: string | null
  campoLaboral: string | null
  adicionales: { titulo: string; html: string }[]
  omitidas: { titulo: string; motivo: string }[]
}

const REGLAS: [RegExp, keyof Omit<CamposDeContenido, 'adicionales' | 'omitidas'>][] = [
  [/^sobre el programa$/i, 'descripcion'],
  [/^objetivos? (general(es)?)?$|^objetivos?$/i, 'objetivo'],
  [/^objetivos? espec[ií]ficos?$/i, 'objetivosEspecificos'],
  [/^dirigido a$|^a qui[eé]n va dirigid/i, 'dirigidoA'],
  [/^requisitos/i, 'requisitos'],
  [/certificaci[oó]n/i, 'certificacion'],
  [/^perfil de ingreso/i, 'perfilIngreso'],
  [/^perfil (del|de) (graduado|egresado|egreso)|^perfil de egreso/i, 'perfilEgreso'],
  [/^campo (laboral|ocupacional)/i, 'campoLaboral'],
]

/** Similitud de Jaccard entre conjuntos de palabras (para detectar textos duplicados). */
export function similitud(a: string, b: string): number {
  const palabras = (s: string) => new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]{3,}/g) ?? [])
  const A = palabras(a)
  const B = palabras(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const w of A) if (B.has(w)) inter++
  return inter / (A.size + B.size - inter)
}

export function mapearSecciones(secciones: Seccion[]): CamposDeContenido {
  const out: CamposDeContenido = {
    descripcion: null,
    objetivo: null,
    objetivosEspecificos: null,
    dirigidoA: null,
    requisitos: null,
    certificacion: null,
    perfilIngreso: null,
    perfilEgreso: null,
    campoLaboral: null,
    adicionales: [],
    omitidas: [],
  }
  const textoDe: Partial<Record<keyof CamposDeContenido, string>> = {}

  for (const s of secciones) {
    if (!s.texto) {
      out.omitidas.push({ titulo: s.titulo, motivo: 'sección vacía' })
      continue
    }
    // "Descripción del Diplomado" repite casi siempre "Sobre el Programa": no se duplica.
    if (/^descripci[oó]n del/i.test(s.titulo)) {
      if (textoDe.descripcion && similitud(textoDe.descripcion, s.texto) >= 0.8) {
        out.omitidas.push({ titulo: s.titulo, motivo: 'repite "Sobre el Programa"' })
        continue
      }
      if (!out.descripcion) {
        out.descripcion = s.html
        textoDe.descripcion = s.texto
        continue
      }
    }
    const regla = REGLAS.find(([re]) => re.test(s.titulo))
    if (regla && !out[regla[1]]) {
      out[regla[1]] = s.html
      textoDe[regla[1]] = s.texto
    } else {
      out.adicionales.push({ titulo: s.titulo, html: s.html })
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Datos del sitio

/** Facultad (carreras) o área (posgrados) según los listados. Clave: ruta del archivo. */
export function extraerAgrupaciones(): Map<string, string> {
  const grupos = new Map<string, string>()

  const carreras = load(fs.readFileSync(path.join(RAIZ_SITIO, 'pages/carreras.html'), 'utf8'))
  carreras('.faculty-section').each((_, sec) => {
    const facultad = limpio(carreras(sec).find('.faculty-title').first().text())
    carreras(sec)
      .find('.career-card h3 a')
      .each((__, a) => {
        grupos.set(`pages/${carreras(a).attr('href')}`, facultad)
      })
  })

  const posgrados = load(fs.readFileSync(path.join(RAIZ_SITIO, 'pages/posgrados.html'), 'utf8'))
  posgrados('.faculty-section').each((_, sec) => {
    let area: string | null = null
    posgrados(sec)
      .find('.posgrado-subtitle, .career-card')
      .each((__, el) => {
        const nodo = posgrados(el)
        if (nodo.hasClass('posgrado-subtitle')) area = limpio(nodo.text())
        else if (area) {
          const href = nodo.find('h3 a').attr('href')
          if (href) grupos.set(`pages/${href}`, area)
        }
      })
  })
  return grupos
}

export function listarPaginasDePrograma(): string[] {
  const dirs = ['pages/carreras', 'pages/posgrados']
  return dirs.flatMap((d) =>
    fs
      .readdirSync(path.join(RAIZ_SITIO, d))
      .filter((f) => f.endsWith('.html'))
      .sort()
      .map((f) => path.join(RAIZ_SITIO, d, f)),
  )
}

export type Reglamento = { titulo: string; wpMediaId: string | null; url: string | null }

/** Reglamentos tal como figuran en Institucional (título visible + ID de WordPress). */
export function extraerReglamentos(): Reglamento[] {
  const $ = load(fs.readFileSync(path.join(RAIZ_SITIO, 'pages/institucional.html'), 'utf8'))
  return $('.regulation-item')
    .map((_, el) => {
      const a = $(el).find('a').first()
      const href = a.attr('href')
      return {
        titulo: limpio($(el).find('strong').first().text()),
        wpMediaId: a.attr('data-brochure-id') ?? null,
        url: href && href !== '#' ? href : null,
      }
    })
    .get()
    .filter((r) => r.titulo)
}

export type DatosDelSitio = {
  telefono: string | null
  whatsapp: string | null
  email: string | null
  direccion: string | null
  redes: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string }
  campusVirtualUrl: string | null
  leyendaInstitucional: string | null
  bitrixFormulario: string | null
  bitrixLoaderUrl: string | null
}

/** Datos de contacto, redes y formulario tal como aparecen en el pie y el header de las páginas. */
export function extraerDatosDelSitio(): DatosDelSitio {
  const html = fs.readFileSync(path.join(RAIZ_SITIO, 'pages/carreras/derecho.html'), 'utf8')
  const $ = load(html)
  const footer = $('footer').first()
  const textos = footer
    .find('span, p')
    .map((_, el) => limpio($(el).text()))
    .get()
  const sinIcono = (s: string | undefined) => (s ? s.replace(/^[^\p{L}\p{N}+]+/u, '').trim() : null)
  const red = (dominio: string) => footer.find(`a[href*="${dominio}"]`).first().attr('href')
  const whatsapp = /wa\.me\/(\d+)/.exec(html)?.[1] ?? /api\.whatsapp\.com\/send\?phone=(\d+)/.exec(html)?.[1] ?? null
  const bitrix = $('[data-b24-form]').first().attr('data-b24-form') ?? null
  const loader = /(https:\/\/cdn\.bitrix24\.[a-z]+\/[^'"]+loader_\d+[^'"]*\.js)/.exec(html)?.[1] ?? null
  return {
    telefono: sinIcono(textos.find((t) => /\+595/.test(t))),
    whatsapp,
    email: sinIcono(textos.find((t) => /@uap\.edu\.py/.test(t))),
    direccion: sinIcono(textos.find((t) => /Asunci[oó]n/.test(t) && /\d/.test(t))),
    redes: {
      facebook: red('facebook.com'),
      instagram: red('instagram.com'),
      youtube: red('youtube.com'),
      linkedin: red('linkedin.com'),
    },
    campusVirtualUrl: $('header a[href*="canvas"], header a:contains("Campus Virtual")').first().attr('href') ?? null,
    leyendaInstitucional: textos.find((t) => /MEC/.test(t) && t.length > 40) ?? null,
    bitrixFormulario: bitrix,
    bitrixLoaderUrl: loader,
  }
}

/** Alias de .htaccess: slug viejo → archivo nuevo (para redirecciones 301). */
export function extraerAliasesHtaccess(): { desde: string; archivo: string }[] {
  const texto = fs.readFileSync(path.join(RAIZ_SITIO, '.htaccess'), 'utf8')
  return [...texto.matchAll(/^\s*RewriteRule \^([a-z0-9-]+)\/\?\$ (pages\/(?:carreras|posgrados)\/[a-z0-9-]+\.html) \[L\]/gm)].map((m) => ({
    desde: `/${m[1]}/`,
    archivo: m[2],
  }))
}
