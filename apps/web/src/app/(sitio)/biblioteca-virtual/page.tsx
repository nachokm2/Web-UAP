// Biblioteca Virtual (misma URL que en WordPress, /biblioteca-virtual/). Texto y enlaces de la
// página de WordPress (actualizada en julio 2026); allí los recursos eran logos sin texto.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Biblioteca Virtual',
  description: 'Biblioteca UAP “Pierre Fauchard”: servicios, repositorio digital, convenio con la Biblioteca de la Universidad Autónoma de Chile y bases de datos académicas.',
  alternates: { canonical: urlAbsoluta(SITIO.biblioteca) },
}

const CONVENIO_UACHILE = 'https://uautonoma.primo.exlibrisgroup.com/discovery/search?vid=56UADC_INST:UAP'

const SERVICIOS = [
  'Consultas de Tesis/Tesinas, exclusivamente en la sala de lectura.',
  'Educación de Usuarios',
  'Consultas a distancia',
  'Orientación para trabajos de Investigación.',
  'Buzón de sugerencias.',
  'Préstamo en sala',
  'Préstamo a domicilio',
  'Búsquedas Automatizadas',
  'Internet / Zona Wifi',
  'Acceso a Bases de Datos',
]

/** "Links de interés" de WordPress, en el mismo orden. */
const RECURSOS = [
  { nombre: 'SciELO Paraguay', url: 'http://scielo.iics.una.py/scielo.php/script_sci_home/lng_es/nrm_iso' },
  { nombre: 'Biblioteca Virtual en Salud (BVS)', url: 'http://regional.bvsalud.org/php/index.php' },
  { nombre: 'ERIC', url: 'https://eric.ed.gov' },
  { nombre: 'Paraguay Oral', url: 'https://paraguayoral.com.py' },
  { nombre: 'BASE', url: 'https://www.base-search.net' },
  { nombre: 'Google Libros', url: 'https://books.google.es/?hl=es' },
  { nombre: 'CICCO (CONACYT)', url: 'https://cicco.conacyt.gov.py' },
  { nombre: 'Dialnet', url: 'https://dialnet.unirioja.es' },
  { nombre: 'RefSeek', url: 'https://www.refseek.com' },
  { nombre: 'Redalyc', url: 'https://www.redalyc.org' },
  { nombre: 'WorldWideScience', url: 'https://worldwidescience.org' },
]

const dominio = (url: string) => new URL(url).hostname.replace(/^www\./, '')

export default function PaginaBiblioteca() {
  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Estudiantes', href: SITIO.estudiantes }, { nombre: 'Biblioteca Virtual' }]} />
      <main id="main-content" className="page">
        <div className="page-hero">
          <div className="container">
            <h1>Biblioteca Virtual</h1>
            <p>Biblioteca UAP “Pierre Fauchard”</p>
          </div>
        </div>

        <div className="container content institucional-contenido biblioteca">
          <p>
            La Biblioteca UAP “Pierre Fauchard” pertenece al Departamento Académico de la Universidad Autónoma de Paraguay. Está constituida por todos
            los fondos bibliográficos y documentales adquiridos por la Universidad. La comunidad en general puede acceder a casi 4.200 libros con que
            cuentan la biblioteca para su lectura en dicho local, y los miembros de la comunidad universitaria de la UAP pueden retirar los libros a
            modo de préstamo por una cierta cantidad de días. La Biblioteca, se encuentra en las instalaciones de la institución, ubicada en Colón Nº
            658, de la ciudad de Asunción. Actualmente se cuenta con un total de 2.546 Trabajos de investigación de conclusión de carreras de grado y
            programas de postgrados.
          </p>

          <p className="biblioteca__convenio">
            <a href={CONVENIO_UACHILE} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              Servicios Convenio UAChile Biblioteca
            </a>
          </p>

          <h2>Servicios</h2>
          <ul>
            {SERVICIOS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h2>Repositorio Digital</h2>
          <p>
            El Repositorio Digital <strong>UAP</strong> es un depósito de documentos digitales en modo de acceso abierto de la producción intelectual
            resultante de la actividad académica e investigación de la comunidad universitaria con los objetivos de:
          </p>
          <ul>
            <li>
              Integrar, conservar y preservar la producción intelectual de la <strong>UAP</strong>
            </li>
            <li>Aumentar la visibilidad de la obra, del autor y de la universidad</li>
            <li>Aumentar el impacto de la producción científica disponible en red</li>
            <li>Proporcionar acceso a la información institucional de forma gratuita</li>
          </ul>

          <h2>Links de interés</h2>
          <ul className="biblioteca__recursos">
            {RECURSOS.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <span className="biblioteca__recurso-nombre">{r.nombre}</span>
                  <span className="biblioteca__recurso-dominio">{dominio(r.url)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
