// Contacto (antes pages/contacto.html). Los datos y el formulario de Bitrix24 salen de
// la global Configuración.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { FormularioBitrix } from '@/components/sitio/FormularioBitrix'
import { obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Contacto e Información de Admisión',
  description: 'Contactate con la Universidad Autónoma del Paraguay. Información de carreras, posgrados, admisión e inscripciones.',
  alternates: { canonical: urlAbsoluta(SITIO.contacto) },
}

const propsIcono = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'var(--color-primary)',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export default async function PaginaContacto() {
  const config = await obtenerConfiguracion()
  // P1: mover a Configuración (cargar "Enlace al mapa"); mientras esté vacío se usa el enlace del sitio estático.
  const mapa = config.mapaUrl || 'https://maps.google.com/?q=Colón+658+Haedo+Asunción+Paraguay'
  // P1: mover a Configuración (cargar "Horario de atención"); mientras esté vacío se usa el texto del sitio estático.
  const horario = config.horario || 'Lunes a Viernes: 08:00 - 18:00'

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Contacto' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Contacto</h1>
            <p className="lead">Estamos aquí para ayudarte. Contáctanos para más información.</p>
          </div>
        </section>
        <section className="section section-alt">
          <div className="container">
            <div className="news-grid">
              <div>
                <h2>Información de contacto</h2>
                <div className="contacto-datos">
                  {config.direccion && (
                    <div className="contacto-dato">
                      <h3 className="contact-row">
                        <svg {...propsIcono}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Dirección
                      </h3>
                      <p className="contacto-valor">
                        <a href={mapa} target="_blank" rel="noopener noreferrer">
                          {config.direccion}
                        </a>
                      </p>
                    </div>
                  )}
                  {config.telefono && (
                    <div className="contacto-dato">
                      <h3 className="contact-row">
                        <svg {...propsIcono}>
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.69a16 16 0 006.29 6.29l1.17-1.17a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        Teléfono
                      </h3>
                      <p className="contacto-valor">
                        <a href={`tel:${config.telefono.replace(/\s/g, '')}`}>{config.telefono}</a>
                      </p>
                    </div>
                  )}
                  {config.email && (
                    <div className="contacto-dato">
                      <h3 className="contact-row">
                        <svg {...propsIcono}>
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        Email
                      </h3>
                      <p className="contacto-valor">
                        <a href={`mailto:${config.email}`}>{config.email}</a>
                      </p>
                    </div>
                  )}
                  <div className="contacto-dato">
                    <h3 className="contact-row">
                      <svg {...propsIcono}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Horario de atención
                    </h3>
                    <p className="contacto-valor contacto-horario">{horario}</p>
                  </div>
                </div>
              </div>
              {config.bitrixFormulario && config.bitrixLoaderUrl && (
                <div className="contacto-formulario">
                  <FormularioBitrix formulario={config.bitrixFormulario} loaderUrl={config.bitrixLoaderUrl} campana="contacto-general" />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
