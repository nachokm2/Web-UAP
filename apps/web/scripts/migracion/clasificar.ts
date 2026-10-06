// Clasifica las entradas ("posts") de WordPress. En el sitio anterior no todo post es una
// noticia: las páginas de carreras y posgrados son posts de las categorías Carreras y
// Postgrados, y los formularios de postulación por asesor son posts sin categoría.
// Solo las noticias se publican como noticias; el resto se conserva archivado.

export type CategoriaWp = { id: number; slug: string; parent: number }
export type TipoPostWp = 'noticia' | 'programa' | 'formulario' | 'otro'

const RAICES_NOTICIA = new Set(['noticias', 'noticias-postgrado', 'cursos-y-seminarios'])
const RAICES_PROGRAMA = new Set(['carreras', 'postgrados'])

function raiz(id: number, porId: Map<number, CategoriaWp>): string | undefined {
  let c = porId.get(id)
  const vistos = new Set<number>()
  while (c && c.parent && porId.has(c.parent) && !vistos.has(c.id)) {
    vistos.add(c.id)
    c = porId.get(c.parent)
  }
  return c?.slug
}

export function clasificarPostWp(
  post: { slug: string; categories?: number[] },
  categorias: CategoriaWp[],
): { tipo: TipoPostWp; motivo: string } {
  const porId = new Map(categorias.map((c) => [c.id, c]))
  const raices = new Set((post.categories ?? []).map((id) => raiz(id, porId)).filter(Boolean))
  if ([...raices].some((r) => RAICES_PROGRAMA.has(r!))) {
    return { tipo: 'programa', motivo: 'página de programa (categoría Carreras o Postgrados en WordPress)' }
  }
  if ([...raices].some((r) => RAICES_NOTICIA.has(r!))) return { tipo: 'noticia', motivo: '' }
  if (post.slug.startsWith('formulario')) {
    return { tipo: 'formulario', motivo: 'formulario de postulación (sin categoría en WordPress)' }
  }
  return { tipo: 'otro', motivo: 'sin categoría de noticias en WordPress' }
}
