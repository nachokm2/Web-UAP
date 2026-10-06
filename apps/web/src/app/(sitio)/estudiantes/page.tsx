// Estudiantes: los mismos accesos y en el mismo orden que https://uap.edu.py/estudiantes/
// (Campus Virtual, Biblioteca Virtual, Consultas académicas, Revista Científica, Servicios de
// atención). Los datos de contacto salen de la global Configuración.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Estudiantes',
  description: 'Portal del estudiante UAP: Campus Virtual, Biblioteca Virtual, consultas académicas, revista científica y servicios de atención.',
  alternates: { canonical: urlAbsoluta(SITIO.estudiantes) },
}

/** "595981222785" → "+595 981 222 785", como se mostraba en el sitio estático. */
function formatoWhatsapp(numero: string): string {
  const digitos = numero.replace(/\D/g, '')
  const partes = /^(595)(\d{3})(\d{3})(\d{3})$/.exec(digitos)
  return partes ? `+${partes[1]} ${partes[2]} ${partes[3]} ${partes[4]}` : `+${digitos}`
}

/** Revista científica enlazada desde la página Estudiantes de WordPress. */
const REVISTA_CIENTIFICA = 'https://paraguayoral.com.py/'

const propsIcono = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 48 48', width: 32, height: 32, 'aria-hidden': true } as const
const trazo = { fill: 'none', stroke: 'white', strokeWidth: 2 } as const
const linea = { stroke: 'white', strokeWidth: 2, strokeLinecap: 'round' } as const

const ICONOS = {
  campus: (
    <svg {...propsIcono}>
      <rect x="4" y="8" width="40" height="28" rx="4" {...trazo} />
      <rect x="20" y="36" width="8" height="6" {...trazo} />
      <line x1="16" y1="44" x2="32" y2="44" {...linea} />
      <rect x="10" y="16" width="12" height="12" rx="2" {...trazo} />
      <line x1="28" y1="16" x2="36" y2="16" {...linea} />
      <line x1="28" y1="22" x2="36" y2="22" {...linea} />
      <line x1="28" y1="28" x2="36" y2="28" {...linea} />
    </svg>
  ),
  biblioteca: (
    <svg {...propsIcono}>
      <path d="M8 12 C8 8, 14 8, 18 12 L18 38 C14 34, 8 34, 8 38 Z" {...trazo} strokeLinejoin="round" />
      <path d="M18 12 C18 8, 24 8, 28 12 L28 38 C24 34, 18 34, 18 38 Z" {...trazo} strokeLinejoin="round" />
      <path d="M28 12 C28 8, 34 8, 38 12 L38 38 C34 34, 28 34, 28 38 Z" {...trazo} strokeLinejoin="round" />
      <line x1="8" y1="38" x2="40" y2="38" {...linea} />
    </svg>
  ),
  consultas: (
    <svg {...propsIcono}>
      <circle cx="24" cy="24" r="18" {...trazo} />
      <path d="M18 19 C18 15, 21 13, 24 13 C27 13, 30 15, 30 19 C30 23, 24 23, 24 28" {...trazo} strokeLinecap="round" />
      <circle cx="24" cy="34" r="1.5" fill="white" />
    </svg>
  ),
  revista: (
    <svg {...propsIcono}>
      <path d="M10 6 H32 L38 12 V42 H10 Z" {...trazo} strokeLinejoin="round" />
      <path d="M32 6 V12 H38" {...trazo} strokeLinejoin="round" />
      <line x1="16" y1="20" x2="32" y2="20" {...linea} />
      <line x1="16" y1="27" x2="32" y2="27" {...linea} />
      <line x1="16" y1="34" x2="26" y2="34" {...linea} />
    </svg>
  ),
  atencion: (
    <svg {...propsIcono}>
      <path d="M8 10 H40 V32 H22 L14 40 V32 H8 Z" {...trazo} strokeLinejoin="round" />
      <line x1="15" y1="18" x2="33" y2="18" {...linea} />
      <line x1="15" y1="25" x2="27" y2="25" {...linea} />
    </svg>
  ),
}

/** Tarjeta de servicio: enlace cuando hay destino; los externos abren en otra pestaña. */
function Servicio({ href, icono, titulo, texto }: { href?: string | null; icono: React.ReactNode; titulo: string; texto: string }) {
  const contenido = (
    <>
      <div className="student-icon">{icono}</div>
      <h3>{titulo}</h3>
      <p>{texto}</p>
    </>
  )
  if (!href) return <div className="student-card">{contenido}</div>
  const externo = /^https?:\/\//.test(href)
  return (
    <a href={href} className="student-card" {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {contenido}
    </a>
  )
}

export default async function PaginaEstudiantes() {
  const config = await obtenerConfiguracion()
  const whatsapp = config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, '')}` : null

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
            <Servicio
              href={config.campusVirtualUrl}
              icono={ICONOS.campus}
              titulo="Campus Virtual"
              texto="Accedé a tu aula virtual, materiales de clase, tareas y comunicación con docentes."
            />
            <Servicio
              href={SITIO.biblioteca}
              icono={ICONOS.biblioteca}
              titulo="Biblioteca Virtual"
              texto="Accedé a recursos bibliográficos, libros electrónicos, revistas académicas y bases de datos científicas para tu formación."
            />
            <Servicio
              href={SITIO.contacto}
              icono={ICONOS.consultas}
              titulo="Consultas Académicas"
              texto="Escribinos tu consulta y te respondemos a la brevedad."
            />
            <Servicio href={REVISTA_CIENTIFICA} icono={ICONOS.revista} titulo="Revista Científica" texto="Accedé a la revista científica y a sus publicaciones." />
            <Servicio
              href={whatsapp}
              icono={ICONOS.atencion}
              titulo="Servicios de Atención"
              texto="Escribinos por WhatsApp para trámites y atención al estudiante."
            />
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
