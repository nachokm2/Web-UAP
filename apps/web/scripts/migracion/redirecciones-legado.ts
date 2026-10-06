// Redirecciones para las URL del WordPress actual (sitemap de uap.edu.py), para que no
// den 404 cuando el dominio apunte al sitio nuevo. Correr DESPUÉS de importar.ts.
//
//   npx tsx scripts/migracion/redirecciones-legado.ts             → simulación + CSV
//   npx tsx scripts/migracion/redirecciones-legado.ts --aplicar   → crea las redirecciones seguras
//
// Solo crea lo que tiene una respuesta clara. Lo demás (páginas institucionales, formularios
// de postulación por asesor, etc.) va a un CSV para que lo decida una persona en el CMS.

import 'dotenv/config'

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config'
import { CONTEXTO_ACTOR } from '../../src/audit/hooks'
import { normalizarRuta } from '../../src/collections/sistema'
import { SITIO } from '../../src/lib/urls'
import { similitud } from './extraer'

const APLICAR = process.argv.includes('--aplicar')
const DIR = path.dirname(fileURLToPath(import.meta.url))
const SITEMAP = 'https://uap.edu.py/sitemap_index.xml'

/** Subsecciones que el .htaccess del sitio estático ya redirigía (decisión del equipo). */
const DECISIONES_HTACCESS: Record<string, string> = {
  doctorado: `${SITIO.posgrados}#doctorados`,
  maestrias: `${SITIO.posgrados}#maestrias`,
  'todas-las-especializaciones': `${SITIO.posgrados}#especializaciones`,
}

type Regla = { tipo: '301' | '410'; destino?: { relationTo: 'carreras' | 'posgrados' | 'noticias'; value: number } | string; motivo: string }

async function texto(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.text()
}

/** Todas las URL de los sitemaps de WordPress (Yoast), con el sitemap de origen. */
async function urlsDelSitioAnterior(): Promise<{ ruta: string; sitemap: string }[]> {
  const indice = await texto(SITEMAP)
  const sitemaps = [...indice.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const out: { ruta: string; sitemap: string }[] = []
  for (const s of sitemaps) {
    const xml = await texto(s)
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (/\.(jpe?g|png|webp|pdf)$/i.test(m[1])) continue
      out.push({ ruta: normalizarRuta(new URL(m[1]).pathname), sitemap: path.basename(s, '.xml') })
    }
  }
  return out
}

async function indicePorSlug(payload: Payload, coleccion: 'carreras' | 'posgrados') {
  const { docs } = await payload.find({ collection: coleccion, draft: true, depth: 0, limit: 1000, overrideAccess: true, select: { slug: true, nombre: true } })
  return docs as { id: number; slug: string; nombre: string }[]
}

async function main() {
  const payload = await getPayload({ config })
  const [carreras, posgrados] = await Promise.all([indicePorSlug(payload, 'carreras'), indicePorSlug(payload, 'posgrados')])
  const programas = [
    ...carreras.map((c) => ({ ...c, coleccion: 'carreras' as const })),
    ...posgrados.map((p) => ({ ...p, coleccion: 'posgrados' as const })),
  ]
  const porSlug = new Map(programas.map((p) => [p.slug, p]))
  const { docs: redirs } = await payload.find({ collection: 'redirecciones', depth: 0, limit: 10_000, overrideAccess: true, select: { desde: true } })
  const yaRedirigidas = new Set(redirs.map((r) => (r as { desde: string }).desde))
  const rutasPropias = new Set<string>(Object.values(SITIO))

  const resultado = { yaResuelve: 0, creadas: 0, pendientes: [] as { ruta: string; sitemap: string; sugerencia: string }[] }

  for (const { ruta, sitemap } of await urlsDelSitioAnterior()) {
    const slug = ruta.split('/').filter(Boolean).join('/')
    if (rutasPropias.has(ruta) || porSlug.has(slug) || yaRedirigidas.has(ruta)) {
      resultado.yaResuelve++
      continue
    }

    let regla: Regla | null = null
    if (DECISIONES_HTACCESS[slug]) regla = { tipo: '301', destino: DECISIONES_HTACCESS[slug], motivo: 'misma decisión que .htaccess' }
    else if (/^(home|inicio|home-copy)$/.test(slug)) regla = { tipo: '301', destino: SITIO.inicio, motivo: 'portada' }
    else if (/^(members(-\d+)?|courses|portfolio-grid|auth-forgot-password|forgot-password|pagina-ejemplo|become-a-teacher(-\d+)?|prueba)$/.test(slug)) {
      regla = { tipo: '410', motivo: 'página de demostración del tema de WordPress' }
    } else if (/^(cart|checkout(-\d+)?|my-account|sample-page|hello-world)$/.test(slug)) regla = { tipo: '410', motivo: 'página técnica de WordPress' }
    else if (/^(author|tag|elementskit-content)\//.test(slug)) regla = { tipo: '410', motivo: 'archivo interno de WordPress' }
    else if (/^category\/carreras/.test(slug)) regla = { tipo: '301', destino: SITIO.carreras, motivo: 'categoría → listado' }
    else if (/^category\/(postgrados|posgrados)/.test(slug)) regla = { tipo: '301', destino: SITIO.posgrados, motivo: 'categoría → listado' }
    else if (/^category\//.test(slug)) regla = { tipo: '301', destino: SITIO.noticias, motivo: 'categoría → noticias' }
    else {
      // Landings de campaña /sNN-diplomado-x/ → el programa x, si existe con ese slug exacto.
      const sinPrefijo = slug.replace(/^s\d+-/, '')
      const programa = sinPrefijo !== slug ? porSlug.get(sinPrefijo) : undefined
      if (programa) regla = { tipo: '301', destino: { relationTo: programa.coleccion, value: programa.id }, motivo: 'landing de campaña → programa' }
    }

    if (!regla) {
      const candidato = programas
        .map((p) => ({ p, s: similitud(slug.replace(/-/g, ' '), p.slug.replace(/-/g, ' ')) }))
        .sort((a, b) => b.s - a.s)[0]
      resultado.pendientes.push({
        ruta,
        sitemap,
        sugerencia: candidato && candidato.s >= 0.6 ? `¿/${candidato.p.slug}/? (similitud ${candidato.s.toFixed(2)})` : '',
      })
      continue
    }

    resultado.creadas++
    if (!APLICAR) continue
    const destino = regla.destino
    await payload.create({
      collection: 'redirecciones',
      data: {
        desde: ruta,
        tipo: regla.tipo,
        ...(regla.tipo === '410'
          ? {}
          : typeof destino === 'string'
            ? { destinoTipo: 'url', url: destino }
            : { destinoTipo: 'interno', destino }),
        origen: 'migracion',
      } as never,
      overrideAccess: true,
      context: { [CONTEXTO_ACTOR]: 'Migración del sitio anterior' },
    })
  }

  fs.mkdirSync(path.join(DIR, 'lotes'), { recursive: true })
  const csv = path.join(DIR, 'lotes', `redirecciones-pendientes-${new Date().toISOString().slice(0, 10)}.csv`)
  const filas = [['ruta', 'sitemap', 'sugerencia'], ...resultado.pendientes.map((p) => [p.ruta, p.sitemap, p.sugerencia])]
  fs.writeFileSync(csv, filas.map((f) => f.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n') + '\n')

  console.log(APLICAR ? 'APLICADO' : 'SIMULACIÓN (use --aplicar)')
  console.log(`  Ya resueltas (programa, sección o redirección existente): ${resultado.yaResuelve}`)
  console.log(`  ${APLICAR ? 'Creadas' : 'Se crearían'}: ${resultado.creadas}`)
  console.log(`  Pendientes de decisión: ${resultado.pendientes.length} → ${path.relative(process.cwd(), csv)}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
