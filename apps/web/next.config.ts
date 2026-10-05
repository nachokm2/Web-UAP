import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const esProduccion = process.env.NODE_ENV === 'production'

// Cabeceras de seguridad para todo el sitio. La CSP del sitio público (con los
// orígenes de Bitrix24) se define junto con las páginas públicas (roadmap P0-09).
const cabecerasDeSeguridad = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(esProduccion ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
]

const nextConfig: NextConfig = {
  // Imagen de producción mínima (node server.js) para Railway.
  output: 'standalone',
  poweredByHeader: false,
  images: {
    localPatterns: [{ pathname: '/api/medios/file/**' }],
  },
  async headers() {
    return [{ source: '/:path*', headers: cabecerasDeSeguridad }]
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
