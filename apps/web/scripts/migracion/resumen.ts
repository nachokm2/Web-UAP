// Resumen de lo que se extraería (sin tocar la base): npx tsx scripts/migracion/resumen.ts
import { extraerAgrupaciones, extraerAliasesHtaccess, extraerDatosDelSitio, extraerPrograma, extraerReglamentos, listarPaginasDePrograma, mapearSecciones } from './extraer'

const grupos = extraerAgrupaciones()
const programas = listarPaginasDePrograma().map(extraerPrograma)
const conteo: Record<string, number> = {}
const sinMapear: Record<string, number> = {}
const omitidas: Record<string, number> = {}
for (const p of programas) {
  const c = mapearSecciones(p.secciones)
  for (const [k, v] of Object.entries(c)) if (typeof v === 'string' && v) conteo[k] = (conteo[k] ?? 0) + 1
  c.adicionales.forEach((a) => (sinMapear[a.titulo] = (sinMapear[a.titulo] ?? 0) + 1))
  c.omitidas.forEach((o) => (omitidas[`${o.titulo} (${o.motivo})`] = (omitidas[`${o.titulo} (${o.motivo})`] ?? 0) + 1))
}
const tipos: Record<string, number> = {}
programas.forEach((p) => (tipos[p.tipo] = (tipos[p.tipo] ?? 0) + 1))
console.log('Programas:', programas.length, tipos)
console.log('Sin nombre:', programas.filter((p) => !p.nombre).map((p) => p.archivo))
console.log('Con grupo (facultad/área):', programas.filter((p) => grupos.has(p.archivo)).length, '| sin grupo:', programas.filter((p) => !grupos.has(p.archivo)).map((p) => p.slug))
console.log('Campos llenos:', conteo)
console.log('Secciones como "adicionales":', sinMapear)
console.log('Secciones omitidas:', omitidas)
console.log('Modalidad sin mapear:', programas.filter((p) => p.modalidadTexto && !p.modalidad).map((p) => `${p.slug}: "${p.modalidadTexto}"`))
console.log('Sin malla:', programas.filter((p) => !p.malla.length).length, '| periodos vacíos:', programas.flatMap((p) => p.malla.filter((m) => !m.asignaturas.length).map((m) => `${p.slug}/${m.nombre}`)).length)
console.log('Brochure:', { wp: programas.filter((p) => p.brochure && 'wpMediaId' in p.brochure).length, url: programas.filter((p) => p.brochure && 'url' in p.brochure).length, ninguno: programas.filter((p) => !p.brochure).length })
console.log('Hero:', programas.filter((p) => p.imagenHero).length, 'ejemplo:', programas[0].imagenHero)
console.log('Reglamentos:', extraerReglamentos().length, extraerReglamentos()[46])
console.log('Sitio:', extraerDatosDelSitio())
console.log('Alias .htaccess:', extraerAliasesHtaccess())
