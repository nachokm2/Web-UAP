import type { MetadataRoute } from 'next'

import { urlAbsoluta } from '@/lib/urls'

// Se evalúa en cada pedido para leer NOINDEX en ejecución.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  // Entorno de pruebas: nada indexable.
  if (process.env.NOINDEX === 'true') return { rules: [{ userAgent: '*', disallow: '/' }] }
  // Las reglas son prefijos: "/admin" sin barra bloquearía /administracion-de-empresas/.
  // Las imágenes del CMS (og:image, JSON-LD) se sirven bajo /api/ y deben poder rastrearse.
  return {
    rules: [{ userAgent: '*', allow: ['/', '/api/medios/file/'], disallow: ['/admin$', '/admin/', '/api/'] }],
    sitemap: urlAbsoluta('/sitemap.xml'),
  }
}
