import type { MetadataRoute } from 'next'

import { urlAbsoluta } from '@/lib/urls'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: urlAbsoluta('/sitemap.xml'),
  }
}
