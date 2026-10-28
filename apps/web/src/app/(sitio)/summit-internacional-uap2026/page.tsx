// V Summit Internacional UAP 2026 (antes landing de WordPress en /summit-internacional-uap2026/).
// Misma dirección que el sitio anterior para no perder enlaces ni posicionamiento. Esta carpeta
// estática tiene prioridad sobre la ruta dinámica [slug].

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { FormularioSummit } from '@/components/sitio/FormularioSummit'
import { SUMMIT, SummitUap2026, datosEstructurados } from '@/components/sitio/SummitUap2026'
import { listaDePaises } from '@/lib/inscripcionSummit'
import { SITIO, urlAbsoluta } from '@/lib/urls'
import '@/styles/summit-2026.css'

const RUTA = '/summit-internacional-uap2026/'

const DESCRIPCION =
  'V Summit Internacional UAP 2026: “La nueva era del trabajo y el talento”. 19 de noviembre de 2026, Hotel Sheraton Asunción. Conferencias, mesas de conversación y certificación. Inscripción abierta.'

export const metadata: Metadata = {
  title: SUMMIT.nombre,
  description: DESCRIPCION,
  alternates: { canonical: urlAbsoluta(RUTA) },
  openGraph: {
    title: `${SUMMIT.nombre} | Universidad Autónoma del Paraguay`,
    description: DESCRIPCION,
    url: urlAbsoluta(RUTA),
    type: 'website',
  },
}

export default function PaginaSummit() {
  return (
    <>
      <script
        type="application/ld+json"
        // Marcado Event (Google Eventos). JSON generado en el servidor a partir de constantes propias.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datosEstructurados(urlAbsoluta(RUTA))).replace(/</g, '\\u003c'),
        }}
      />
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: SUMMIT.nombre }]} />
      <main id="main-content">
        <SummitUap2026
          formulario={
            <FormularioSummit
              paises={listaDePaises()}
              detalle={`Te esperamos el ${SUMMIT.fecha} en el ${SUMMIT.lugar}.`}
            />
          }
        />
      </main>
    </>
  )
}
