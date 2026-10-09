// Investigación (antes pages/investigacion.html).

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Investigación',
  description: 'Investigación y extensión universitaria en UAP. Proyectos, publicaciones y convenios internacionales.',
  alternates: { canonical: urlAbsoluta(SITIO.investigacion) },
}

const LINEAS = [
  {
    titulo: 'Ciencias de la Salud',
    icono: '/images/icon-odontologia.png',
    texto: 'Investigación en salud pública, epidemiología y ciencias médicas aplicadas.',
  },
  {
    titulo: 'Gestión e Innovación',
    icono: '/images/icon-admin.png',
    texto: 'Estudios en administración, emprendimiento e innovación tecnológica.',
  },
  {
    titulo: 'Ciencias Sociales y Humanas',
    icono: '/images/icon-psicologia.png',
    texto: 'Investigación en psicología, educación y desarrollo social.',
  },
]

export default function PaginaInvestigacion() {
  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Investigación' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Investigación</h1>
            <p className="lead">Descubrí nuestros proyectos de investigación y trabajos científicos.</p>
          </div>
        </section>
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2>Líneas de investigación</h2>
            </div>
            <div className="careers-grid investigacion-lineas">
              {LINEAS.map((l) => (
                <div key={l.titulo} className="career-card">
                  <div className="career-icon">
                    {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático */}
                    <img src={l.icono} alt="" width={28} height={28} loading="lazy" />
                  </div>
                  <h3>{l.titulo}</h3>
                  <p>{l.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
