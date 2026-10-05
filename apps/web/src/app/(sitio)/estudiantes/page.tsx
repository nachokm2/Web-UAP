// Estudiantes (antes pages/estudiantes.html). Los datos de contacto salen de la global
// Configuración.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Estudiantes',
  description: 'Portal del estudiante UAP. Accedé a recursos, servicios y herramientas para tu vida universitaria.',
  alternates: { canonical: urlAbsoluta(SITIO.estudiantes) },
}

/** "595981222785" → "+595 981 222 785", como se mostraba en el sitio estático. */
function formatoWhatsapp(numero: string): string {
  const digitos = numero.replace(/\D/g, '')
  const partes = /^(595)(\d{3})(\d{3})(\d{3})$/.exec(digitos)
  return partes ? `+${partes[1]} ${partes[2]} ${partes[3]} ${partes[4]}` : `+${digitos}`
}

const propsIcono = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 48 48', width: 32, height: 32, 'aria-hidden': true } as const
const trazo = { fill: 'none', stroke: 'white', strokeWidth: 2 } as const

export default async function PaginaEstudiantes() {
  const config = await obtenerConfiguracion()

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Estudiantes' }]} />
      <main id="main-content" className="page">
        <div className="page-hero">
          <div className="container">
            <h1>Estudiantes</h1>
            <p>Todo lo que necesitás para tu vida académica</p>
          </div>
        </div>

        <div className="container">
          <div className="student-grid">
            <a href="https://uap.edu.py/biblioteca-virtual/" className="student-card" target="_blank" rel="noopener noreferrer">
              <div className="student-icon">
                <svg {...propsIcono}>
                  <path d="M8 12 C8 8, 14 8, 18 12 L18 38 C14 34, 8 34, 8 38 Z" {...trazo} strokeLinejoin="round" />
                  <path d="M18 12 C18 8, 24 8, 28 12 L28 38 C24 34, 18 34, 18 38 Z" {...trazo} strokeLinejoin="round" />
                  <path d="M28 12 C28 8, 34 8, 38 12 L38 38 C34 34, 28 34, 28 38 Z" {...trazo} strokeLinejoin="round" />
                  <line x1="8" y1="38" x2="40" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Biblioteca Virtual</h3>
              <p>Accedé a recursos bibliográficos, libros electrónicos, revistas académicas y bases de datos científicas para tu formación.</p>
            </a>

            <div className="student-card">
              <div className="student-icon">
                <svg {...propsIcono}>
                  <rect x="4" y="8" width="40" height="36" rx="4" {...trazo} />
                  <line x1="4" y1="18" x2="44" y2="18" stroke="white" strokeWidth="2" />
                  <line x1="14" y1="4" x2="14" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="34" y1="4" x2="34" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="14" y1="26" x2="34" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="14" y1="34" x2="26" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Calendario Académico</h3>
              <p>Consultá las fechas importantes del período lectivo, exámenes, inscripciones y eventos institucionales.</p>
            </div>

            <div className="student-card">
              <div className="student-icon">
                <svg {...propsIcono}>
                  <rect x="8" y="4" width="32" height="40" rx="4" {...trazo} />
                  <line x1="8" y1="14" x2="40" y2="14" stroke="white" strokeWidth="2" />
                  <line x1="16" y1="24" x2="32" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="32" x2="28" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="40" x2="32" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Reglamentos</h3>
              <p>Conocé el reglamento de la universidad, normativas de evaluación, derechos y deberes del estudiante.</p>
            </div>

            <div className="student-card">
              <div className="student-icon">
                <svg {...propsIcono}>
                  <rect x="8" y="6" width="32" height="36" rx="4" {...trazo} />
                  <line x1="16" y1="4" x2="16" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="32" y1="4" x2="32" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="18" x2="40" y2="18" stroke="white" strokeWidth="2" />
                  <line x1="16" y1="28" x2="20" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="26" y1="28" x2="30" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="36" x2="34" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Trámites</h3>
              <p>Gestioná constancias de estudios, certificados de notas, duplicados de credencial y otros documentos.</p>
            </div>

            <div className="student-card">
              <div className="student-icon">
                <svg {...propsIcono}>
                  <path
                    d="M24 42 C24 42, 4 30, 4 18 C4 12, 8 6, 14 6 C18 6, 22 8, 24 12 C26 8, 30 6, 34 6 C40 6, 44 12, 44 18 C44 30, 24 42, 24 42 Z"
                    {...trazo}
                    strokeLinejoin="round"
                  />
                  <path d="M14 14 C16 12, 20 14, 22 16" {...trazo} strokeLinecap="round" />
                </svg>
              </div>
              <h3>Bienestar Estudiantil</h3>
              <p>Accedé a programas de apoyo psicológico, orientación vocacional, actividades culturales y deportivas.</p>
            </div>

            <div className="student-card">
              <div className="student-icon">
                <svg {...propsIcono}>
                  <rect x="4" y="8" width="40" height="28" rx="4" {...trazo} />
                  <rect x="20" y="36" width="8" height="6" {...trazo} />
                  <line x1="16" y1="44" x2="32" y2="44" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <rect x="10" y="16" width="12" height="12" rx="2" {...trazo} />
                  <line x1="28" y1="16" x2="36" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="28" y1="22" x2="36" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="28" y1="28" x2="36" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>Plataforma Virtual</h3>
              <p>Accedé a tu aula virtual, materiales de clase, tareas y comunicación con docentes.</p>
            </div>
          </div>

          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Información de Contacto</h2>
            </div>
            <div className="estudiantes-contacto">
              {config.direccion && (
                <p>
                  <strong>Dirección:</strong> {config.direccion}
                </p>
              )}
              {config.telefono && (
                <p>
                  <strong>Teléfono:</strong> {config.telefono}
                </p>
              )}
              {config.whatsapp && (
                <p>
                  <strong>WhatsApp:</strong> {formatoWhatsapp(config.whatsapp)}
                </p>
              )}
              {config.email && (
                <p>
                  <strong>Email:</strong> {config.email}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
