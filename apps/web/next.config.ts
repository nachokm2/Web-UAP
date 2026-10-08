import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const esProduccion = process.env.NODE_ENV === 'production'

// Cabeceras de seguridad para todo el sitio.
const cabecerasDeSeguridad = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(esProduccion ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
]

// CSP del sitio público. Bitrix24 (formulario de leads) carga desde uachile.bitrix24.es y
// necesita 'unsafe-eval'; YouTube/Vimeo solo para videos insertados en noticias.
// El panel (/admin) usa la CSP por defecto de Payload (sin esta cabecera).
const cspSitio = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.bitrix24.es https://uachile.bitrix24.es",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.bitrix24.es https://uachile.bitrix24.es",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "connect-src 'self' https://*.bitrix24.es",
  "frame-src 'self' https://*.bitrix24.es https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://*.bitrix24.es",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  // Las URLs del sitio llevan barra final (/periodismo/); la agrega proxy.ts para las
  // páginas sin tocar /admin ni /api.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // Probado y descartado (8-oct): experimental.inlineCss. Con una hoja de estilos de ~97 KB el
  // HTML se duplicaba y el trabajo de estilos en celulares subía ~0,7–0,9 s (Lighthouse).
  images: {
    localPatterns: [{ pathname: '/api/medios/file/**' }],
    // Las imágenes del CMS no cambian de nombre al reemplazarse (Payload crea un archivo nuevo).
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  async headers() {
    return [
      { source: '/:path*', headers: cabecerasDeSeguridad },
      // Todo menos el panel y la API lleva la CSP del sitio.
      { source: '/((?!admin(?:/|$)|api/).*)', headers: [{ key: 'Content-Security-Policy', value: cspSitio }] },
      // Imágenes, íconos y videos fijos del sitio: una semana en caché del navegador.
      ...['/images/:path*', '/icons/:path*', '/videos/:path*'].map((source) => ({
        source,
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      })),
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
