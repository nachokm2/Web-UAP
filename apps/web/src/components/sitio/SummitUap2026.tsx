// V Summit Internacional UAP 2026 (antes landing de WordPress/Elementor en
// /summit-internacional-uap2026/). Solo presentación: el contenido está en las constantes de
// este archivo para que se pueda editar sin tocar el marcado. El formulario de inscripción
// (Bitrix24) se pasa desde la página como `formulario`.

import type { ReactNode } from 'react'

import { IconoInstagram, IconoLinkedin } from '@/components/sitio/Iconos'

const IMG = '/images/summit-2026'

export const SUMMIT = {
  nombre: 'V Summit Internacional UAP 2026',
  titulo: 'La nueva era del trabajo y el talento',
  fecha: '19 de noviembre de 2026',
  fechaIso: '2026-11-19',
  lugar: 'Hotel Sheraton Asunción',
  direccion: 'Aviadores Del Chaco 2066, Asunción, Paraguay',
  mapa: 'https://maps.google.com/?q=Hotel+Sheraton+Asunción+Aviadores+Del+Chaco+2066+Asunción+Paraguay',
  hashtag: '#SummitParaguay2026',
  correo: 'marketing@uap.edu.py',
  ancla: 'inscripcion',
} as const

type Expositor = {
  id: string
  nombre: string
  cargo: string
  institucion: string
  pais?: string
  foto: string
  logo: string
}

const EXPOSITORES: Record<string, Expositor> = {
  ruffinelli: {
    id: 'ruffinelli',
    nombre: 'Carlos Ruffinelli',
    cargo: 'Rector',
    institucion: 'Universidad Autónoma del Paraguay',
    pais: 'Paraguay',
    foto: 'carlos-ruffinelli.jpg',
    logo: 'logo-uap.jpg',
  },
  ribera: {
    id: 'ribera',
    nombre: 'Dr. Teodoro Ribera',
    cargo: 'Rector',
    institucion: 'Universidad Autónoma de Chile',
    pais: 'Chile',
    foto: 'teodoro-ribera.jpg',
    logo: 'logo-ua.jpg',
  },
  mondelo: {
    id: 'mondelo',
    nombre: 'Dr. Pedro R. Mondelo',
    cargo: 'Director',
    institucion: 'Fundación Internacional ORP',
    pais: 'España',
    foto: 'pedro-mondelo.jpg',
    logo: 'orp.jpg',
  },
  villalba: {
    id: 'villalba',
    nombre: 'Eva Villalba',
    cargo: 'Presidenta Consejo de Administración',
    institucion: 'Cooperativa Universitaria Paraguay',
    foto: 'eva-villalba.jpg',
    logo: 'cooperativa-universitaria-paraguay.jpg',
  },
  battistoni: {
    id: 'battistoni',
    nombre: 'Mariano Battistoni',
    cargo: 'Regional HR Director',
    institucion: 'SkyTel',
    pais: 'Argentina',
    foto: 'mariano-battistoni.jpg',
    logo: 'skytel.jpg',
  },
  barahona: {
    id: 'barahona',
    nombre: 'Esteban Barahona',
    cargo: 'Director Comercial y de Procesos de Postgrado',
    institucion: 'Universidad Autónoma de Chile',
    pais: 'Chile',
    foto: 'esteban-barahona.jpg',
    logo: 'logo-ua.jpg',
  },
  schmidt: {
    id: 'schmidt',
    nombre: 'Daniel Schmidt Mclachlan',
    cargo: 'Decano de la Facultad de Arquitectura, Construcción y Medio Ambiente',
    institucion: 'Universidad Autónoma de Chile',
    pais: 'Chile',
    foto: 'daniel-schmidt-mclachlan.jpg',
    logo: 'logo-ua.jpg',
  },
}

/** Orden en que aparecen en "Expositores". */
const ORDEN_EXPOSITORES = [
  'ruffinelli',
  'ribera',
  'mondelo',
  'villalba',
  'battistoni',
  'barahona',
  'schmidt',
]

type Sesion = {
  hora: string
  titulo: string
  /** Rótulo opcional sobre los participantes: "Modera", "Panelistas". */
  rol?: string
  personas?: string[]
  nota?: string
}

const PROGRAMA: Sesion[] = [
  { hora: '08:00', titulo: 'Café de bienvenida – Acreditación' },
  {
    hora: '09:00',
    titulo: 'Bienvenida – Inauguración',
    personas: ['ruffinelli', 'ribera', 'mondelo'],
  },
  {
    hora: '09:15',
    titulo:
      'Conferencia inaugural: “Cooperativismo, liderazgo y desarrollo del talento en la nueva era del trabajo”',
    personas: ['villalba'],
  },
  {
    hora: '10:00',
    titulo: 'Conferencia inaugural: “El talento del Siglo XXI”',
    personas: ['battistoni'],
  },
  { hora: '10:30', titulo: 'Coffee – Networking' },
  {
    hora: '11:00',
    titulo:
      'Mesa de conversación: “La obsolescencia de las competencias y el nuevo valor del talento”',
    rol: 'Modera',
    personas: ['barahona'],
  },
  {
    hora: '11:30',
    titulo: 'Mesa de conversación: “El nuevo contrato social del Talento”',
    nota: 'Modera: Fundación Internacional ORP',
    rol: 'Panelistas',
    personas: ['schmidt'],
  },
  { hora: '12:00', titulo: 'Conferencia de clausura', personas: ['mondelo'] },
  { hora: '12:30', titulo: 'Ceremonia de clausura' },
  { hora: '12:40', titulo: 'Cóctel' },
]

const COMITES = [
  {
    titulo: 'Comité asesor empresarial ORP',
    imagen: 'logos-comite-empresarial.jpg',
    ancho: 1000,
    alto: 400,
  },
  {
    titulo: 'Comité asesor institucional ORP',
    imagen: 'logos-comite-institucional.jpg',
    ancho: 1000,
    alto: 700,
  },
  { titulo: 'Comité científico', imagen: 'logos-comite-cientifico.jpg', ancho: 1000, alto: 500 },
]

const COLABORAN = [
  {
    nombre: 'Universidad Autónoma de Chile',
    imagen: 'logo-universidad-autonoma-chile.png',
    href: 'https://www.uautonoma.cl/',
  },
  { nombre: 'Fundación Internacional ORP', imagen: 'logo-orp.jpg', href: 'https://gan.education/' },
  { nombre: 'Global Academic Network', imagen: 'logo-gan.jpg', href: 'https://gan.education/' },
]

const REDES = [
  {
    nombre: 'Instagram',
    href: 'https://www.instagram.com/uap_py',
    clase: 'instagram',
    icono: <IconoInstagram />,
  },
  {
    nombre: 'LinkedIn',
    href: 'https://www.linkedin.com/company/universidad-aut%C3%B3noma-del-paraguay/',
    clase: 'linkedin',
    icono: <IconoLinkedin />,
  },
  {
    nombre: 'X',
    href: 'https://twitter.com/uap_py',
    clase: 'x',
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

const porId = (id: string) => EXPOSITORES[id]

function Icono({ children }: { children: ReactNode }) {
  return (
    <span className="summit-dato__icono" aria-hidden="true">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  )
}

function BotonInscripcion({ grande = false }: { grande?: boolean }) {
  return (
    <a href={`#${SUMMIT.ancla}`} className={`btn btn-accent${grande ? ' btn-lg' : ''}`}>
      Inscríbete para asistir al evento
    </a>
  )
}

function Foto({ e, clase }: { e: Expositor; clase: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public
    <img
      src={`${IMG}/${e.foto}`}
      alt={e.nombre}
      width={200}
      height={200}
      loading="lazy"
      className={clase}
    />
  )
}

/** Datos para el marcado Event de buscadores (Google "Eventos"). */
export function datosEstructurados(urlPagina: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: SUMMIT.nombre,
    description: `${SUMMIT.titulo}. Un espacio de análisis, ideas y tendencias globales para quienes lideran hoy las decisiones del mañana.`,
    startDate: `${SUMMIT.fechaIso}T08:00:00-03:00`,
    endDate: `${SUMMIT.fechaIso}T13:30:00-03:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: urlPagina,
    location: {
      '@type': 'Place',
      name: SUMMIT.lugar,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Aviadores Del Chaco 2066',
        addressLocality: 'Asunción',
        addressCountry: 'PY',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Universidad Autónoma del Paraguay',
      url: 'https://uap.edu.py/',
    },
  }
}

export function SummitUap2026({ formulario }: { formulario: ReactNode }) {
  return (
    <div className="summit">
      {/* 1. Banner de portada: imagen con fecha, lugar y botón encima (el título viene en la imagen) */}
      <section className="summit-banner" aria-label={SUMMIT.nombre}>
        <h1 className="sr-only">
          {SUMMIT.nombre}: {SUMMIT.titulo}
        </h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public */}
        <img
          src={`${IMG}/banner-escritorio.jpg`}
          alt=""
          width={1920}
          height={600}
          fetchPriority="high"
          className="summit-banner__img"
        />
        <div className="summit-banner__info">
          <p className="summit-banner__fecha">{SUMMIT.fecha}</p>
          <p className="summit-banner__lugar">{SUMMIT.lugar}, Asunción</p>
          <BotonInscripcion grande />
        </div>
      </section>

      {/* 2. Presentación */}
      <section className="section section-alt">
        <div className="container summit-intro">
          <h2>
            Un espacio de análisis, ideas y tendencias globales para quienes lideran hoy las
            decisiones del mañana.
          </h2>
          <div className="summit-intro__texto">
            <p>
              Hablar de la “La nueva era del trabajo y el talento” es reconocer una transformación
              estructural: las reglas del mercado laboral no están cambiando a futuro, ya han mutado
              radicalmente en el presente. En esta coyuntura, el trabajo y el talento dejan de ser
              variables independientes para convertirse en una ecuación indivisible; no existe nueva
              era del trabajo sin una redefinición profunda del capital humano que la impulsa, ni
              talento sostenible sin entornos laborales que potencien su máximo valor.
            </p>
            <p>
              La irrupción acelerada de la Inteligencia Artificial Generativa, la automatización
              avanzada, los modelos dinámicos de trabajo y la exigencia de upskilling y reskilling
              continuo han dejado obsoletos los esquemas tradicionales. Hoy asistimos al nacimiento
              de un nuevo paradigma: la empleabilidad ya no se mide por la formación de origen o el
              historial del pasado, sino por la agilidad estratégica, la capacidad de desaprender y
              el aprendizaje permanente hacia adelante.
            </p>
            <p>
              El V Summit Internacional UAP se posiciona en la vanguardia de esta discusión global,
              reuniendo los temas clave y las tendencias mundiales que están reconfigurando el
              panorama productivo internacional. Más que un punto de encuentro es una declaración de
              principios: un espacio estratégico de alta dirección para que los líderes y tomadores
              de decisiones dejen de reaccionar ante la coyuntura y comiencen a diseñar, con visión
              de futuro, el ecosistema donde convergerán el trabajo y el talento del mañana.
            </p>
            <BotonInscripcion />
          </div>
        </div>
      </section>

      {/* 3. Fecha, lugar y certificación */}
      <section className="section">
        <div className="container summit-info">
          <div className="summit-info__datos">
            <div className="summit-dato">
              <Icono>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </Icono>
              <div>
                <h3>Fecha</h3>
                <p>{SUMMIT.fecha}</p>
              </div>
            </div>
            <div className="summit-dato">
              <Icono>
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </Icono>
              <div>
                <h3>Lugar</h3>
                <p>
                  <strong>{SUMMIT.lugar}</strong>
                  <br />
                  {SUMMIT.direccion}
                </p>
              </div>
            </div>
            <div className="summit-dato">
              <Icono>
                <circle cx="12" cy="9" r="6" />
                <path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5" />
              </Icono>
              <div>
                <h3>Certificación</h3>
                <p>
                  Universidad Autónoma del Paraguay
                  <br />
                  Universidad Autónoma de Chile
                  <br />
                  Fundación Internacional ORP
                </p>
              </div>
            </div>
            <div className="summit-redes">
              <p>
                Compartí en tus redes sociales usando <strong>{SUMMIT.hashtag}</strong>
              </p>
              <ul>
                {REDES.map((r) => (
                  <li key={r.nombre}>
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`summit-redes__${r.clase}`}
                      aria-label={r.nombre}
                    >
                      {r.icono}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="summit-info__foto">
            {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public */}
            <img
              src={`${IMG}/evento.jpg`}
              alt="Summit Internacional UAP"
              width={800}
              height={600}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* 4. Organiza y colaboran */}
      <section className="section section-alt summit-alianzas">
        <div className="container">
          <div className="summit-alianzas__fila">
            <h2>Organiza</h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public */}
            <img
              src={`${IMG}/logo-uap-color.png`}
              alt="Universidad Autónoma del Paraguay"
              width={220}
              height={80}
              loading="lazy"
            />
          </div>
          <div className="summit-alianzas__fila">
            <h2>Colaboran</h2>
            <ul className="summit-logos">
              {COLABORAN.map((c) => (
                <li key={c.nombre}>
                  <a href={c.href} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public */}
                    <img
                      src={`${IMG}/${c.imagen}`}
                      alt={c.nombre}
                      width={220}
                      height={110}
                      loading="lazy"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Expositores */}
      <section className="section" id="expositores">
        <div className="container">
          <div className="section-header">
            <h2>Expositores</h2>
          </div>
          <ul className="summit-expositores">
            {ORDEN_EXPOSITORES.map((id) => {
              const e = porId(id)
              return (
                <li key={id} className="authority-card summit-expositor">
                  <Foto e={e} clase="authority-card__foto" />
                  <p className="authority-card__cargo">{e.cargo}</p>
                  <h3 className="authority-card__nombre">{e.nombre}</h3>
                  <p className="summit-expositor__institucion">
                    {e.institucion}
                    {e.pais ? ` · ${e.pais}` : ''}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public */}
                  <img
                    src={`${IMG}/${e.logo}`}
                    alt=""
                    width={120}
                    height={60}
                    loading="lazy"
                    className="summit-expositor__logo"
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* 6. Programa */}
      <section className="section section-alt" id="programa">
        <div className="container">
          <div className="section-header">
            <h2>Programa</h2>
            <p>
              {SUMMIT.fecha} · {SUMMIT.lugar}
            </p>
          </div>
          <ol className="summit-programa">
            {PROGRAMA.map((s) => (
              <li key={s.hora} className="summit-sesion">
                <time className="summit-sesion__hora" dateTime={s.hora}>
                  {s.hora} hrs.
                </time>
                <div className="summit-sesion__cuerpo">
                  <h3>{s.titulo}</h3>
                  {s.nota && <p className="summit-sesion__nota">{s.nota}</p>}
                  {s.personas && (
                    <>
                      {s.rol && <p className="summit-sesion__rol">{s.rol}</p>}
                      <ul className="summit-sesion__personas">
                        {s.personas.map((id) => {
                          const e = porId(id)
                          return (
                            <li key={id}>
                              <Foto e={e} clase="summit-sesion__foto" />
                              <span>
                                <strong>{e.nombre}</strong>
                                <span>
                                  {e.cargo} · {e.institucion}
                                  {e.pais ? ` · ${e.pais}` : ''}
                                </span>
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7. Formulario de inscripción */}
      <section className="section" id={SUMMIT.ancla}>
        <div className="container summit-formulario">
          <div className="section-header">
            <h2>Formulario de inscripción</h2>
            <p>Completá tus datos para asistir al {SUMMIT.nombre}.</p>
          </div>
          <div className="summit-formulario__caja">{formulario}</div>
        </div>
      </section>

      {/* 8. Lugar del evento */}
      <section className="section section-alt" id="lugar">
        <div className="container summit-lugar">
          <div className="summit-lugar__texto">
            <h2>{SUMMIT.lugar}</h2>
            <p>{SUMMIT.direccion}</p>
            <a
              href={SUMMIT.mapa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* 9. Comités */}
      <section className="section" id="comites">
        <div className="container summit-comites">
          <div className="section-header">
            <h2>Comités</h2>
          </div>
          {COMITES.map((c) => (
            <details key={c.titulo} className="desplegable faculty-section">
              <summary className="desplegable__titulo">
                <h3 className="faculty-title">{c.titulo}</h3>
              </summary>
              <div className="desplegable__contenido">
                {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático de /public */}
                <img
                  src={`${IMG}/${c.imagen}`}
                  alt={`Logos del ${c.titulo.toLowerCase()}`}
                  width={c.ancho}
                  height={c.alto}
                  loading="lazy"
                  className="summit-comite__imagen"
                />
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
