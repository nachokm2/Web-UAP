import Link from 'next/link'

import { listarCarreras, obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlPrograma } from '@/lib/urls'

import { IconoFacebook, IconoInstagram, IconoLinkedin, IconoYoutube } from './Iconos'

const REDES = [
  { clave: 'facebook', nombre: 'Facebook', Icono: IconoFacebook },
  { clave: 'instagram', nombre: 'Instagram', Icono: IconoInstagram },
  { clave: 'youtube', nombre: 'YouTube', Icono: IconoYoutube },
  { clave: 'linkedin', nombre: 'LinkedIn', Icono: IconoLinkedin },
] as const

export async function Footer() {
  const [config, carreras] = await Promise.all([obtenerConfiguracion(), listarCarreras()])
  const destacadas = carreras.slice(0, 5)
  const redes = (config.redes ?? {}) as Record<string, string | null | undefined>

  return (
    <footer className="pie">
      <div className="container">
        <div className="pie__grilla">
          <div>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo liviano */}
              <img src="/images/logo-white.png" alt="UAP – Universidad Autónoma del Paraguay" className="pie__logo" width={738} height={150} loading="lazy" />
            </Link>
            {config.leyendaInstitucional && <p className="pie__leyenda">{config.leyendaInstitucional}</p>}
            <div className="pie__contacto">
              {config.direccion && <span>📍 {config.direccion}</span>}
              {config.telefono && <span>📞 {config.telefono}</span>}
              {config.email && <span>✉️ {config.email}</span>}
            </div>
            <div className="pie__sellos">
              <span>MEC Habilitada</span>
              <span>ANEAES</span>
            </div>
            <div className="pie__redes">
              {REDES.filter((r) => redes[r.clave]).map(({ clave, nombre, Icono }) => (
                <a key={clave} href={redes[clave]!} target="_blank" rel="noopener noreferrer" aria-label={`${nombre} UAP`}>
                  <Icono />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="pie__titulo">Carreras</h2>
            <ul className="pie__lista">
              {destacadas.map((c) => (
                <li key={c.id}>
                  <Link href={urlPrograma(c.slug)}>{c.nombre}</Link>
                </li>
              ))}
              <li>
                <Link href={SITIO.carreras} className="pie__mas">
                  Ver todas →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="pie__titulo">Posgrados</h2>
            <ul className="pie__lista">
              <li><Link href={`${SITIO.posgrados}#maestrias`}>Maestrías</Link></li>
              <li><Link href={`${SITIO.posgrados}#especializaciones`}>Especializaciones</Link></li>
              <li><Link href={`${SITIO.posgrados}#doctorados`}>Doctorados</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="pie__titulo">Institucional</h2>
            <ul className="pie__lista">
              <li><Link href={SITIO.institucional}>Sobre la UAP</Link></li>
              <li><Link href={`${SITIO.institucional}#autoridades`}>Autoridades</Link></li>
              <li><Link href={SITIO.investigacion}>Investigación</Link></li>
              <li><Link href={SITIO.estudiantes}>Estudiantes</Link></li>
              <li><Link href={SITIO.contacto}>Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="pie__titulo">Legal</h2>
            <ul className="pie__lista">
              <li><Link href={SITIO.privacidad}>Política de privacidad</Link></li>
              <li><Link href={SITIO.inscripcion}>Inscripción</Link></li>
            </ul>
          </div>
        </div>
        <div className="pie__base">
          <span>© {new Date().getFullYear()} Universidad Autónoma del Paraguay. Todos los derechos reservados.</span>
          <div>
            <Link href={SITIO.privacidad}>Privacidad</Link>
            <Link href={SITIO.contacto}>Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
