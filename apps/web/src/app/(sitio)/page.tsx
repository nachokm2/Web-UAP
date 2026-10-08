// Portada (antes index.html). Carreras y noticias salen del CMS; el carrusel, las cifras
// y las alianzas siguen escritos acá hasta que exista la global "Portada".

import type { Metadata } from 'next'
import NextImage from 'next/image'
import Link from 'next/link'

import { CarruselPortada, type Diapositiva } from '@/components/sitio/CarruselPortada'
import { ContadorEstadistica } from '@/components/sitio/ContadorEstadistica'
import { PestanasCarreras, type FacultadDePortada } from '@/components/sitio/PestanasCarreras'
import { TarjetaNoticia } from '@/components/sitio/TarjetaNoticia'
import { VideoFondo } from '@/components/sitio/VideoFondo'
import type { Carrera, Facultad, Noticia } from '@/payload-types'
import { listarCarreras, listarNoticias, obtenerConfiguracion } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: { absolute: 'Universidad Autónoma del Paraguay' },
  description:
    'Universidad Autónoma del Paraguay - Carreras de grado, posgrados y convenios internacionales. Excelencia académica en Ciencias de la Salud, Ingenierías y Ciencias Sociales.',
  alternates: { canonical: urlAbsoluta('/') },
}

// P1: mover a la global "Portada" del CMS
const DIAPOSITIVAS: Diapositiva[] = [
  {
    href: SITIO.carreras,
    insignia: 'Carreras de Grado',
    titulo: 'Formá tu futuro profesional',
    texto:
      'Más de 20 carreras habilitadas por el MEC y acreditadas por la ANEAES. Elegí tu camino en Ciencias de la Salud, Ingenierías o Ciencias Sociales.',
    accion: 'Explorar Carreras',
  },
  {
    href: SITIO.inscripcion,
    insignia: 'Matrículas 2026',
    claseInsignia: 'inicio-insignia--matriculas',
    titulo: 'Matrículas Abiertas 2026',
    texto: 'Inscribite ahora y beneficiate con la primera cuota exonerada. Cupos limitados para ingresantes.',
    accion: 'Inscribite Ahora',
  },
  {
    href: SITIO.posgrados,
    insignia: 'Posgrados',
    claseInsignia: 'inicio-insignia--posgrados',
    titulo: 'Especializate con los mejores',
    texto: 'Maestrías, especializaciones y doctorados con respaldo internacional de la Universidad Autónoma de Chile.',
    accion: 'Ver Posgrados',
  },
]

// P1: mover a la global "Portada" del CMS
// Versión web del video (720p, sin audio; antes 4K de 21 MB) y su imagen fija.
const VIDEO_ENCABEZADO = [
  { src: '/videos/portada-720.webm', type: 'video/webm' },
  { src: '/videos/portada-720.mp4', type: 'video/mp4' },
]
const POSTER_ENCABEZADO = '/videos/portada-poster.webp'

// P1: mover a la global "Portada" del CMS
const CIFRAS = [
  { valor: 50, etiqueta: 'Convenios internacionales' },
  { valor: 10, etiqueta: 'Mil egresados' },
  { valor: 5, etiqueta: 'Mil volúmenes biblioteca' },
  { valor: 20, etiqueta: 'Carreras profesionales' },
]

type Alianza = { href: string; nombre: string; logo: { src: string; ancho: number; alto: number } | null }

// P1: mover a la global "Portada" del CMS
const ALIANZAS: Alianza[] = [
  { href: 'https://www.uautonoma.cl', nombre: 'Universidad Autónoma de Chile', logo: { src: '/images/logo-uautonoma-chile.png', ancho: 542, alto: 231 } },
  { href: 'https://carver.university', nombre: 'Carver University', logo: { src: '/images/logo-carver-university.png', ancho: 346, alto: 146 } },
  { href: 'https://iees.pt', nombre: 'IEES Portugal', logo: { src: '/images/logo-iees-portugal.png', ancho: 458, alto: 110 } },
  { href: 'https://ipg.cl', nombre: 'Instituto IPG', logo: { src: '/images/logo-ipg.png', ancho: 600, alto: 265 } },
  { href: 'https://www.coursera.org/campus', nombre: 'Coursera for Campus', logo: { src: '/images/logo-coursera-campus.png', ancho: 500, alto: 200 } },
  { href: 'https://gan.education', nombre: 'Global Academic Network', logo: { src: '/images/logo-global-academic-network.png', ancho: 96, alto: 55 } },
  // Microsoft va con su logo dibujado en SVG, como en el sitio estático.
  { href: 'https://www.microsoft.com', nombre: 'Microsoft', logo: null },
]

/** Íconos de las tarjetas de carrera (public/images). Las carreras sin ícono copiado se muestran sin él. */
const ICONOS: Record<string, string> = {
  odontologia: '/images/icon-odontologia.svg',
  psicologia: '/images/icon-psicologia.svg',
  nutricion: '/images/icon-nutricion.svg',
  fisioterapia: '/images/icon-fisioterapia.svg',
  fonoaudiologia: '/images/icon-fono.svg',
  podologia: '/images/icon-podologia.svg',
  'optica-y-contactologia': '/images/icon-optica.svg',
  'ingenieria-en-informatica': '/images/icon-informatica.svg',
  'ingenieria-en-tecnologia-de-alimentos': '/images/icon-alimentos.svg',
  'administracion-de-empresas': '/images/icon-admin.svg',
  'ingenieria-comercial': '/images/icon-comercial.svg',
  'ingenieria-en-marketing': '/images/icon-marketing.svg',
  'ingenieria-en-comercio-internacional': '/images/icon-comercio.svg',
  'marketing-y-publicidad': '/images/icon-publicidad.svg',
  'ciencias-contables': '/images/icon-contable.svg',
  'contabilidad-y-auditoria': '/images/icon-auditoria.svg',
  'contaduria-publica': '/images/icon-contaduria.svg',
  derecho: '/images/icon-derecho.svg',
  periodismo: '/images/icon-periodismo.svg',
  'trabajo-social': '/images/icon-trabajo-social.svg',
  'administracion-publica': '/images/icon-admin-publica.svg',
  'ciencias-de-la-educacion': '/images/icon-educacion.svg',
  'educacion-parvularia': '/images/icon-parvularia.svg',
}

/** Carreras publicadas agrupadas por facultad (una pestaña por facultad, en su orden). */
function facultadesDePortada(carreras: Carrera[]): FacultadDePortada[] {
  const grupos = new Map<string, FacultadDePortada & { orden: number }>()
  for (const c of carreras) {
    const f = typeof c.facultad === 'object' && c.facultad ? (c.facultad as Facultad) : null
    const id = f?.slug ?? 'otras-carreras'
    if (!grupos.has(id)) {
      // La pestaña muestra el nombre sin "Facultad de", como en el sitio estático.
      const etiqueta = f ? f.nombre.replace(/^Facultad de\s+/i, '') : 'Otras carreras'
      grupos.set(id, { id, etiqueta, carreras: [], orden: f?.orden ?? 999 })
    }
    grupos.get(id)!.carreras.push({
      slug: c.slug,
      nombre: c.nombre,
      icono: ICONOS[c.slug] ?? null,
      meta: [c.duracion, c.gradoAcademico || c.tituloOtorgado].filter(Boolean).join(' • '),
      descripcion: c.descripcionCorta ?? null,
    })
  }
  return [...grupos.values()].sort((a, b) => a.orden - b.orden).map(({ id, etiqueta, carreras }) => ({ id, etiqueta, carreras }))
}

function TarjetaAlianza({ alianza: a, duplicado = false }: { alianza: Alianza; duplicado?: boolean }) {
  return (
    <a
      href={a.href}
      target="_blank"
      rel="noopener noreferrer"
      className={duplicado ? 'partner-slide inicio-socio-duplicado' : 'partner-slide'}
      // La copia sólo sirve para el desplazamiento continuo: no se lee ni recibe foco.
      aria-hidden={duplicado || undefined}
      tabIndex={duplicado ? -1 : undefined}
    >
      {a.logo ? (
        // Se ven a 180 px como máximo (100 px en celulares): el optimizador los achica.
        <NextImage src={a.logo.src} alt="" width={a.logo.ancho} height={a.logo.alto} sizes="(max-width: 480px) 100px, (max-width: 768px) 130px, 180px" />
      ) : (
        <svg width="120" height="26" viewBox="0 0 120 26" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="0" y="0" width="12" height="12" fill="#f25022" />
          <rect x="14" y="0" width="12" height="12" fill="#7fba00" />
          <rect x="0" y="14" width="12" height="12" fill="#00a4ef" />
          <rect x="14" y="14" width="12" height="12" fill="#ffb900" />
          <text x="32" y="18" fontFamily="Segoe UI, sans-serif" fontSize="16" fontWeight="600" fill="#737373">
            Microsoft
          </text>
        </svg>
      )}
      <span>{a.nombre}</span>
    </a>
  )
}

export default async function Inicio() {
  const [config, carreras, noticias] = await Promise.all([obtenerConfiguracion(), listarCarreras(), listarNoticias(1)])
  const ultimasNoticias = (noticias.docs as Noticia[]).slice(0, 3)
  const redes = config.redes ?? {}

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: 'Universidad Autónoma del Paraguay',
    url: urlAbsoluta('/'),
    logo: urlAbsoluta('/images/logo-uap.png'),
    address: config.direccion || undefined,
    telephone: config.telefono || undefined,
    sameAs: [redes.facebook, redes.instagram, redes.youtube, redes.linkedin].filter(Boolean),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <main id="main-content">
        <CarruselPortada diapositivas={DIAPOSITIVAS}>
          <div className="hero-video-container">
            {/* La imagen fija va como <img> optimizado (cada pantalla baja la versión de su ancho);
                el video, cuando se carga, se dibuja encima. */}
            <NextImage src={POSTER_ENCABEZADO} alt="" fill sizes="(max-width: 480px) 500px, (max-width: 768px) 768px, 100vw" preload fetchPriority="high" className="hero-video-bg" />
            <VideoFondo fuentes={VIDEO_ENCABEZADO} className="hero-video-bg" />
            <div className="hero-video-overlay"></div>
          </div>
        </CarruselPortada>

        {/* Cifras */}
        <div className="container">
          <div className="stats">
            {CIFRAS.map((c) => (
              <div key={c.etiqueta} className="stat-card">
                <ContadorEstadistica valor={c.valor} />
                <div className="stat-label">{c.etiqueta}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alianzas Estratégicas */}
        <section className="partners-section inicio-socios">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Alianzas Estratégicas</h2>
              <p className="section-subtitle">Colaboramos con líderes mundiales para brindar la mejor experiencia educativa</p>
            </div>
            <div className="partners-marquee">
              <div className="partners-track">
                {ALIANZAS.map((a) => (
                  <TarjetaAlianza key={a.href} alianza={a} />
                ))}
                {/* Duplicados para loop infinito */}
                {ALIANZAS.map((a) => (
                  <TarjetaAlianza key={`${a.href}-copia`} alianza={a} duplicado />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Carreras con pestañas por facultad */}
        <section id="carreras" className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2>Carreras Profesionales</h2>
              <p>Formación de excelencia organizada por facultades</p>
            </div>

            <PestanasCarreras facultades={facultadesDePortada(carreras as Carrera[])} />

            <div className="section-footer">
              <Link href={SITIO.carreras} className="btn btn-dark">
                Ver todas las carreras
              </Link>
            </div>
          </div>
        </section>

        {/* Noticias */}
        <section id="noticias" className="section inicio-noticias">
          <div className="container">
            <div className="section-header">
              <h2>Noticias</h2>
              <p>Entérate de las últimas novedades y actividades de la universidad.</p>
            </div>
            {ultimasNoticias.length > 0 && (
              <div className="news-grid">
                {ultimasNoticias.map((n) => (
                  <TarjetaNoticia key={n.id} noticia={n} />
                ))}
              </div>
            )}
            <div className="section-footer">
              <Link href={SITIO.noticias} className="btn btn-dark">
                Ver todas las noticias
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <div className="container">
            <div className="cta-content">
              <h2>¿Querés formar parte de la UAP?</h2>
              <p>Descubrí todas las oportunidades que tenemos para tu formación académica y profesional.</p>
              <div className="inicio-cta-acciones">
                <Link href={SITIO.inscripcion} className="btn btn-accent btn-lg">
                  Inscribite ahora
                </Link>
                <Link href={SITIO.contacto} className="btn btn-outline btn-lg">
                  Solicita información
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
