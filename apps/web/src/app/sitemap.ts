// /sitemap.xml generado desde el CMS: solo contenido publicado, con su fecha real de modificación.
import type { MetadataRoute } from 'next'

import { listarParaSitemap } from '@/lib/datos'
import { SITIO, urlAbsoluta, urlNoticia, urlPrograma } from '@/lib/urls'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { carreras, posgrados, noticias } = await listarParaSitemap()
  const fijas = Object.values(SITIO).map((ruta) => ({ url: urlAbsoluta(ruta), changeFrequency: 'weekly' as const, priority: ruta === '/' ? 1 : 0.7 }))
  const programas = [...carreras, ...posgrados].map((p) => ({
    url: urlAbsoluta(urlPrograma(p.slug)),
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
  const notas = noticias.map((n) => ({ url: urlAbsoluta(urlNoticia(n.slug)), lastModified: n.updatedAt, changeFrequency: 'yearly' as const, priority: 0.5 }))
  return [...fijas, ...programas, ...notas]
}
