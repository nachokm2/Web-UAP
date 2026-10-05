import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { TarjetaPrograma } from '@/components/sitio/TarjetaPrograma'
import type { Facultad, Posgrado } from '@/payload-types'
import { listarPosgrados } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Posgrados',
  description: 'Diplomados, especializaciones, maestrías y doctorados de la Universidad Autónoma del Paraguay.',
  alternates: { canonical: urlAbsoluta(SITIO.posgrados) },
}

// Secciones del listado (los anclas son los que usa el menú: /postgrados/#diplomados).
const SECCIONES: { id: string; titulo: string; tipos: Posgrado['tipo'][] }[] = [
  { id: 'diplomados', titulo: 'Diplomados', tipos: ['diplomado'] },
  { id: 'especializaciones', titulo: 'Especializaciones', tipos: ['especializacion'] },
  { id: 'maestrias', titulo: 'Maestrías', tipos: ['maestria', 'maestria_doctorado'] },
  { id: 'doctorados', titulo: 'Doctorados', tipos: ['doctorado'] },
  { id: 'otros', titulo: 'Otros programas', tipos: ['otro'] },
]

function porArea(programas: Posgrado[]) {
  const areas = new Map<string, { area: Facultad | null; programas: Posgrado[] }>()
  for (const p of programas) {
    const a = typeof p.area === 'object' ? p.area : null
    const clave = a?.nombre ?? ''
    if (!areas.has(clave)) areas.set(clave, { area: a, programas: [] })
    areas.get(clave)!.programas.push(p)
  }
  return [...areas.entries()].sort((x, y) => (x[1].area?.orden ?? 999) - (y[1].area?.orden ?? 999))
}

export default async function PaginaPosgrados() {
  const posgrados = (await listarPosgrados()) as Posgrado[]

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Posgrados' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Posgrados</h1>
            <p className="lead">Continuá tu formación académica con nuestras maestrías, especializaciones y doctorados con excelencia internacional.</p>
          </div>
        </section>
        <section className="section section-alt">
          <div className="container">
            {SECCIONES.map((s) => {
              const programas = posgrados.filter((p) => s.tipos.includes(p.tipo))
              if (!programas.length) return null
              return (
                <div key={s.id} className="faculty-section" id={s.id}>
                  <h2 className="faculty-title">{s.titulo}</h2>
                  {porArea(programas).map(([area, g]) => (
                    <div key={area || 'sin-area'}>
                      {area && <h3 className="posgrado-subtitle">{area}</h3>}
                      <div className="careers-grid">
                        {g.programas.map((p) => (
                          <TarjetaPrograma key={p.id} programa={p} tipo="posgrado" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </>
  )
}
