import type { Metadata } from 'next'
import React from 'react'

import { Footer } from '@/components/sitio/Footer'
import { Header } from '@/components/sitio/Header'
import { WhatsApp } from '@/components/sitio/WhatsApp'
import { obtenerConfiguracion } from '@/lib/datos'
import { urlAbsoluta } from '@/lib/urls'

import '@/styles/uap-refined.css'
import '@/styles/sitio.css'
import '@/styles/paginas.css'

// El contenido sale de la base y se cachea en memoria (lib/cache.ts): las páginas
// se arman en cada pedido y no consultan la base durante el build.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const config = await obtenerConfiguracion()
  const titulo = config.seoTitulo || 'Universidad Autónoma del Paraguay'
  return {
    metadataBase: new URL(urlAbsoluta('/')),
    title: { default: titulo, template: `%s | UAP` },
    description: config.seoDescripcion || undefined,
    icons: { icon: '/images/favicon.svg' },
    openGraph: { siteName: titulo, locale: 'es_PY', type: 'website' },
  }
}

export default function LayoutSitio({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <Header />
        {children}
        <Footer />
        <WhatsApp />
      </body>
    </html>
  )
}
