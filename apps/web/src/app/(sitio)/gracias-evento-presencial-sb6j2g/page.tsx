// Página de agradecimiento de las inscripciones a eventos presenciales (ver lib/gracias.ts).
// Sin enlaces desde el sitio, fuera del sitemap y con noindex: solo se llega desde el formulario.
// El mensaje es general para que sirva en cualquier evento presencial; el contacto sale de
// Configuración del sitio en el CMS.

import type { Metadata } from 'next'
import Link from 'next/link'

import { ConversionGracias } from '@/components/sitio/ConversionGracias'
import { obtenerConfiguracion } from '@/lib/datos'
import { SITIO } from '@/lib/urls'
import '@/styles/gracias.css'

export const metadata: Metadata = {
  title: 'Gracias por inscribirte | Universidad Autónoma del Paraguay',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
}

export default async function PaginaGracias() {
  const config = await obtenerConfiguracion()

  return (
    <>
      <ConversionGracias />
      <main id="main-content">
        <section className="page-hero gracias-hero">
          <div className="container">
            <span className="gracias-icono" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            <h1>¡Gracias por inscribirte!</h1>
            <p className="lead">Tu inscripción al evento quedó registrada.</p>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="gracias-tarjeta">
              <p className="gracias-texto">
                Recibimos tus datos correctamente. Gracias por tu interés en participar en los eventos de la Universidad Autónoma del Paraguay.
              </p>

              {config.email && (
                <div className="gracias-contacto">
                  <h2>¿Tienes alguna consulta?</h2>
                  <p>
                    Escríbenos a <a href={`mailto:${config.email}`}>{config.email}</a>
                  </p>
                </div>
              )}

              <div className="gracias-acciones">
                <Link href={SITIO.inicio} className="btn btn-primary">
                  Volver al inicio
                </Link>
                <Link href={SITIO.carreras} className="gracias-enlace">
                  Conocer nuestras carreras
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
