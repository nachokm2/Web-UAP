// Página de agradecimiento de la inscripción al Summit (campañas de eventos presenciales; ver
// lib/gracias.ts). Sin enlaces desde el sitio, fuera del sitemap y con noindex: solo se llega
// desde el formulario. Nombre, fecha y lugar salen del evento en el CMS.

import type { Metadata } from 'next'
import Link from 'next/link'

import { ConversionGracias } from '@/components/sitio/ConversionGracias'
import { obtenerConfiguracion } from '@/lib/datos'
import { cargarEventoSummit } from '@/lib/eventos/cargar'
import { SITIO } from '@/lib/urls'
import '@/styles/gracias.css'

export const metadata: Metadata = {
  title: 'Gracias por inscribirte | Universidad Autónoma del Paraguay',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
}

export default async function PaginaGracias() {
  const [evento, config] = await Promise.all([cargarEventoSummit(), obtenerConfiguracion()])
  // Si el evento está despublicado se muestra un agradecimiento general, sin fecha ni lugar.
  const correo = evento?.correo ?? config.email

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
            <p className="lead">{evento ? `Tu inscripción al ${evento.nombre} quedó registrada.` : 'Recibimos tus datos correctamente.'}</p>
          </div>
        </section>

        <section className="section section-alt">
          <div className="container">
            <div className="gracias-tarjeta">
              <p className="gracias-texto">
                {evento
                  ? `Te esperamos el ${evento.fecha} en el ${evento.lugar}.`
                  : 'Un asesor de la Universidad Autónoma del Paraguay se pondrá en contacto contigo para confirmar tu participación.'}
              </p>

              {correo && (
                <div className="gracias-contacto">
                  <h2>¿Tienes alguna consulta?</h2>
                  <p>
                    Escríbenos a <a href={`mailto:${correo}`}>{correo}</a>
                  </p>
                </div>
              )}

              <div className="gracias-acciones">
                {evento && (
                  <a href={evento.mapa} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    Cómo llegar
                  </a>
                )}
                <Link href={SITIO.inicio} className="gracias-enlace">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
