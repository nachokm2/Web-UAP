import type { MetadataRoute } from 'next'

import { urlAbsoluta } from '@/lib/urls'

// Se evalúa en cada pedido para leer NOINDEX en ejecución.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  // Entorno de pruebas: nada indexable.
  if (process.env.NOINDEX === 'true') return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: urlAbsoluta('/sitemap.xml'),
  }
}
