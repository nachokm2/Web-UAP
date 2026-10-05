// Inscripción (antes pages/inscripcion.html): formulario de Bitrix24 configurado en la
// global Configuración.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { FormularioBitrix } from '@/components/sitio/FormularioBitrix'
import { obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Inscripción',
  description: 'Inscribite en la Universidad Autónoma del Paraguay. Matrículas abiertas 2026. Primera cuota exonerada.',
  alternates: { canonical: urlAbsoluta(SITIO.inscripcion) },
}

export default async function PaginaInscripcion() {
  const config = await obtenerConfiguracion()

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Inscripción' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Inscripción</h1>
            <p className="lead">Completá el formulario para iniciar tu proceso de admisión.</p>
          </div>
        </section>
        <section className="section section-alt">
          <div className="container">
            <div className="content inscripcion-contenido">
              {config.bitrixFormulario && config.bitrixLoaderUrl && (
                <FormularioBitrix formulario={config.bitrixFormulario} loaderUrl={config.bitrixLoaderUrl} campana="inscripcion-general" />
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
