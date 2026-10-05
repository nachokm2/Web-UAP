import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { TarjetaPrograma } from '@/components/sitio/TarjetaPrograma'
import type { Carrera, Facultad } from '@/payload-types'
import { listarCarreras } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Carreras de grado',
  description: 'Carreras de grado de la Universidad Autónoma del Paraguay, organizadas por facultad.',
  alternates: { canonical: urlAbsoluta(SITIO.carreras) },
}

export default async function PaginaCarreras() {
  const carreras = (await listarCarreras()) as Carrera[]
  const grupos = new Map<string, { facultad: Facultad | null; carreras: Carrera[] }>()
  for (const c of carreras) {
    const f = typeof c.facultad === 'object' ? c.facultad : null
    const clave = f?.nombre ?? 'Otras carreras'
    if (!grupos.has(clave)) grupos.set(clave, { facultad: f, carreras: [] })
    grupos.get(clave)!.carreras.push(c)
  }
  const ordenados = [...grupos.entries()].sort((a, b) => (a[1].facultad?.orden ?? 999) - (b[1].facultad?.orden ?? 999))

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Carreras' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Carreras Profesionales</h1>
            <p className="lead">
              Descubrí la carrera perfecta para tu futuro profesional. Ofrecemos programas académicos de excelencia en {grupos.size} facultades.
            </p>
          </div>
        </section>
        <section className="section section-alt">
          <div className="container">
            {ordenados.map(([nombre, g]) => (
              <div key={nombre} className="faculty-section" id={g.facultad?.slug ?? undefined}>
                <h2 className="faculty-title">{nombre}</h2>
                <div className="careers-grid">
                  {g.carreras.map((c) => (
                    <TarjetaPrograma key={c.id} programa={c} tipo="carrera" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
