// Página institucional (antes pages/institucional.html). Los reglamentos salen de la
// colección Documentos (tipo "reglamento"); el resto es el texto del sitio estático.

import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { ListaAutoridades } from '@/components/sitio/ListaAutoridades'
import { listarAutoridades, listarReglamentos } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Sobre la UAP | Misión, Visión y Autoridades',
  description: 'Conocé la Universidad Autónoma del Paraguay. Misión, visión, valores y autoridades de la institución.',
  alternates: { canonical: urlAbsoluta(SITIO.institucional) },
}

const VALORES = ['Excelencia académica', 'Integridad', 'Compromiso social', 'Innovación', 'Solidaridad', 'Responsabilidad']

export default async function PaginaInstitucional() {
  const [reglamentos, autoridades] = await Promise.all([listarReglamentos(), listarAutoridades()])

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Institucional' }]} />
      <main id="main-content" className="page">
        <div className="page-hero">
          <div className="container">
            <h1>Institucional</h1>
            <p>Conocé nuestra historia, valores y estructura organizativa</p>
          </div>
        </div>

        <div className="container content institucional-contenido">
          {/* Misión, Visión, Valores */}
          <section id="mision">
            <h2>Misión</h2>
            <p>
              Formar profesionales íntegros, competentes y socialmente responsables, capaces de contribuir al desarrollo sostenible del Paraguay y la
              región, mediante una educación de excelencia basada en valores éticos y principios cristianos.
            </p>

            <h2>Visión</h2>
            <p>
              Ser la universidad líder en Paraguay, reconocida por su excelencia académica, innovación e investigación, con proyección internacional y
              compromiso social.
            </p>

            <h2>Valores</h2>
            <div className="values-grid">
              {VALORES.map((v) => (
                <div key={v} className="value-card">
                  {v}
                </div>
              ))}
            </div>
          </section>

          {/* Historia */}
          <section>
            <h2>Nuestra Historia</h2>
            <p>
              La Universidad Autónoma del Paraguay (UAP) nace como una institución de educación superior comprometida con la formación de profesionales
              de excelencia. A lo largo de los años, hemos consolidado un modelo educativo que integra la teoría y la práctica, formando egresados
              altamente capacitados para responder a los desafíos del mercado laboral.
            </p>
            <p>
              Contamos con modernas instalaciones, laboratorios equipados con tecnología de punta y un cuerpo docente conformado por profesionales de
              destacada trayectoria académica y profesional.
            </p>
          </section>

          {/* Autoridades */}
          <section id="autoridades">
            <h2>Autoridades</h2>
            <ListaAutoridades autoridades={autoridades} nivel="h3" />
            <p>
              <Link href={SITIO.autoridades}>Ver la página de Autoridades →</Link>
            </p>
          </section>

          {/* Convenios */}
          <section id="convenios">
            <h2>Convenios Internacionales</h2>
            <p>
              La UAP mantiene convenios de cooperación académica con prestigiosas instituciones de educación superior de América Latina, Europa y
              Estados Unidos. Estos acuerdos permiten:
            </p>
            <ul>
              <li>Movilidad estudiantil y docente</li>
              <li>Investigación conjunta</li>
              <li>Intercambio de recursos bibliográficos</li>
              <li>Validación de estudios</li>
              <li>Conferencias y seminarios internacionales</li>
            </ul>
            <p>Algunas de nuestras instituciones aliadas incluyen universidades de Chile, Argentina, España, México y Estados Unidos.</p>
          </section>

          {/* Reglamentos */}
          <section id="reglamentos">
            <h2>Reglamentos y Normativas</h2>
            <p>La UAP se rige por un marco normativo que asegura la calidad académica y el buen funcionamiento institucional:</p>
            {reglamentos.length > 0 && (
              <div className="regulations-list">
                {reglamentos.map((r) => (
                  <div key={r.id} className="regulation-item">
                    <strong>{r.titulo}</strong>
                    <br />
                    {r.url && (
                      <a href={r.url} target="_blank" rel="noopener">
                        Descargar PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reconocimientos */}
          <section>
            <h2>Reconocimientos y Acreditaciones</h2>
            <p>
              La UAP cuenta con reconocimiento oficial de la Secretaría Nacional de Educación Superior (SNES) y mantiene un compromiso continuo con la
              calidad académica a través de procesos de autoevaluación y mejora continua.
            </p>
            <ul>
              <li>Reconocimiento oficial por la SNES</li>
              {/* Texto tal cual el sitio estático ("Membro"): lo valida el equipo de contenido. */}
              <li>Membro de la Unión de Universidades de América Latina (UDUAL)</li>
              <li>Alianzas con universidades de Chile, Argentina, España y México</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}
