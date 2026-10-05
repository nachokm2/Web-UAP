// HTML del sitio anterior → estado del editor (Lexical), conservando texto,
// títulos, listas, citas y enlaces. Las imágenes se devuelven aparte.

import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { load } from 'cheerio'
import { JSDOM } from 'jsdom'
import type { SanitizedConfig } from 'payload'

type Editor = Awaited<ReturnType<typeof editorConfigFactory.default>>

let editor: Editor | null = null

async function configuracionDelEditor(config: SanitizedConfig): Promise<Editor> {
  editor ??= await editorConfigFactory.default({ config })
  return editor
}

const BLOQUES = 'h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote'

/**
 * Deja solo bloques de texto en orden de lectura (quita contenedores de Elementor,
 * estilos, scripts y botones vacíos). Devuelve el HTML limpio y las imágenes encontradas.
 */
export function limpiarHtml(html: string): { html: string; imagenes: string[] } {
  const $ = load(html)
  $('script, style, noscript, form, iframe, svg').remove()

  const imagenes: string[] = []
  $('img').each((_, el) => {
    const img = $(el)
    const srcset = img.attr('srcset')
    const mayor = srcset
      ?.split(',')
      .map((s) => s.trim().split(/\s+/))
      .sort((a, b) => parseInt(b[1] ?? '0') - parseInt(a[1] ?? '0'))[0]?.[0]
    const src = mayor || img.attr('data-src') || img.attr('src')
    if (src && /^https?:\/\//.test(src) && !imagenes.includes(src)) imagenes.push(src)
  })

  const partes: string[] = []
  $(BLOQUES).each((_, el) => {
    const nodo = $(el)
    // Solo bloques de primer nivel: un <p> dentro de un <li> ya va con su lista.
    if (nodo.parents(BLOQUES).length) return
    if (!nodo.text().replace(/\s+/g, ' ').trim()) return
    nodo.find('img').remove()
    nodo.find('*').each((__, hijo) => {
      const h = $(hijo)
      const href = h.is('a') ? h.attr('href') : undefined
      for (const atributo of Object.keys(hijo.attribs ?? {})) h.removeAttr(atributo)
      if (href && /^(https?:|mailto:|tel:|\/)/.test(href)) h.attr('href', href)
    })
    const etiqueta = el.tagName.toLowerCase() === 'h1' ? 'h2' : el.tagName.toLowerCase()
    partes.push(`<${etiqueta}>${nodo.html()?.trim() ?? ''}</${etiqueta}>`)
  })
  return { html: partes.join('\n'), imagenes }
}

/** Convierte HTML a estado de Lexical. Devuelve null si no queda texto. */
export async function htmlALexical(html: string | null | undefined, config: SanitizedConfig) {
  if (!html || !html.trim()) return null
  const { html: limpio } = limpiarHtml(html)
  const fuente = limpio || html
  if (!load(fuente).text().trim()) return null
  return convertHTMLToLexical({ editorConfig: await configuracionDelEditor(config), html: fuente, JSDOM })
}

/** Texto plano (para bajadas y descripciones cortas). */
export function textoPlano(html: string | null | undefined, max?: number): string | null {
  if (!html) return null
  const texto = load(html).text().replace(/\s+/g, ' ').trim()
  if (!texto) return null
  if (!max || texto.length <= max) return texto
  const corte = texto.slice(0, max - 1)
  return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:.]$/, '') + '…'
}
