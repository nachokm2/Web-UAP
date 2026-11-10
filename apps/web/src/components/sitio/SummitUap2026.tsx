// Landing de un evento (hoy, el V Summit Internacional UAP 2026; antes una landing de
// WordPress/Elementor en /summit-internacional-uap2026/). Solo presentación: el contenido
// viene del CMS (Eventos) a través de `evento`, y la estructura de la página queda acá. El
// formulario de inscripción (propio) se pasa desde la página como `formulario`.

import { Fragment, type ReactNode } from 'react'

import { IconoInstagram, IconoLinkedin } from '@/components/sitio/Iconos'
import { ANCLA_INSCRIPCION, type RedEvento } from '@/lib/eventos/contenidoSummit'
import type { EventoVista, ImagenVista, PersonaVista } from '@/lib/eventos/vista'

const ICONOS_RED: Record<RedEvento, { nombre: string; icono: ReactNode }> = {
  instagram: { nombre: 'Instagram', icono: <IconoInstagram /> },
  linkedin: { nombre: 'LinkedIn', icono: <IconoLinkedin /> },
  x: {
    nombre: 'X',
    icono: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
}

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

function BotonInscripcion({ texto, grande = false }: { texto: string; grande?: boolean }) {
  return (
    <a href={`#${ANCLA_INSCRIPCION}`} className={`btn btn-accent${grande ? ' btn-lg' : ''}`}>
      {texto}
    </a>
  )
}

type PropsImagen = {
  imagen: ImagenVista | null | undefined
  alt: string
  ancho: number
  alto: number
  clase?: string
}

/** Imagen con su propio tamaño (las del CMS vienen del bucket; las de respaldo, de /public). */
function Img({ imagen, alt, ancho, alto, clase }: PropsImagen) {
  if (!imagen) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagen del CMS o de /public, con tamaño propio
    <img src={imagen.src} alt={alt} width={ancho} height={alto} loading="lazy" className={clase} />
  )
}

const Foto = ({ p, clase }: { p: PersonaVista; clase: string }) => (
  <Img imagen={p.foto} alt={p.nombre} ancho={200} alto={200} clase={clase} />
)

export function SummitUap2026({ evento, formulario }: { evento: EventoVista; formulario: ReactNode }) {
  return (
    <div className="summit">
      {/* 1. Banner de portada: imagen con fecha, lugar y botón encima (el título viene en la imagen) */}
      <section className="summit-banner" aria-label={evento.nombre}>
        <h1 className="sr-only">
          {evento.nombre}: {evento.titulo}
        </h1>
        {evento.banner && (
          // eslint-disable-next-line @next/next/no-img-element -- imagen del CMS o de /public
          <img
            src={evento.banner.src}
            alt=""
            width={1920}
            height={600}
            fetchPriority="high"
            className="summit-banner__img"
          />
        )}
        <div className="summit-banner__info">
          <p className="summit-banner__fecha">{evento.fecha}</p>
          <p className="summit-banner__lugar">
            {evento.lugar}, {evento.ciudad}
          </p>
          <BotonInscripcion texto={evento.textoBoton} grande />
        </div>
      </section>

      {/* 2. Presentación */}
      <section className="section section-alt">
        <div className="container summit-intro">
          <h2>{evento.tituloIntro}</h2>
          <div className="summit-intro__texto">
            {evento.parrafos.map((texto, i) => (
              <p key={i}>{texto}</p>
            ))}
            <BotonInscripcion texto={evento.textoBoton} />
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
                <p>{evento.fecha}</p>
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
                  <strong>{evento.lugar}</strong>
                  <br />
                  {evento.direccion}
                </p>
              </div>
            </div>
            {evento.certificacion.length > 0 && (
              <div className="summit-dato">
                <Icono>
                  <circle cx="12" cy="9" r="6" />
                  <path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5" />
                </Icono>
                <div>
                  <h3>Certificación</h3>
                  <p>
                    {evento.certificacion.map((nombre, i) => (
                      <Fragment key={i}>
                        {i > 0 && <br />}
                        {nombre}
                      </Fragment>
                    ))}
                  </p>
                </div>
              </div>
            )}
            {(evento.hashtag || evento.redes.length > 0) && (
              <div className="summit-redes">
                {evento.hashtag && (
                  <p>
                    Compartí en tus redes sociales usando <strong>{evento.hashtag}</strong>
                  </p>
                )}
                {evento.redes.length > 0 && (
                  <ul>
                    {evento.redes.map((r, i) => {
                      const red = ICONOS_RED[r.red]
                      return (
                        <li key={i}>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`summit-redes__${r.red}`}
                            aria-label={red.nombre}
                          >
                            {red.icono}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          {evento.imagenEvento && (
            <div className="summit-info__foto">
              <Img imagen={evento.imagenEvento} alt="Summit Internacional UAP" ancho={800} alto={600} />
            </div>
          )}
        </div>
      </section>

      {/* 4. Organiza y colaboran */}
      <section className="section section-alt summit-alianzas">
        <div className="container">
          <div className="summit-alianzas__fila">
            <h2>Organiza</h2>
            <Img imagen={evento.organizador.logo} alt={evento.organizador.nombre} ancho={220} alto={80} />
          </div>
          {evento.colaboran.length > 0 && (
            <div className="summit-alianzas__fila">
              <h2>Colaboran</h2>
              <ul className="summit-logos">
                {evento.colaboran.map((c, i) => (
                  <li key={i}>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        <Img imagen={c.logo} alt={c.nombre} ancho={220} alto={110} />
                      </a>
                    ) : (
                      <Img imagen={c.logo} alt={c.nombre} ancho={220} alto={110} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 5. Expositores */}
      {evento.expositores.length > 0 && (
        <section className="section" id="expositores">
          <div className="container">
            <div className="section-header">
              <h2>Expositores</h2>
            </div>
            <ul className="summit-expositores">
              {evento.expositores.map((e) => (
                <li key={e.id} className="authority-card summit-expositor">
                  <Foto p={e} clase="authority-card__foto" />
                  <p className="authority-card__cargo">{e.cargo}</p>
                  <h3 className="authority-card__nombre">{e.nombre}</h3>
                  <p className="summit-expositor__institucion">
                    {e.institucion}
                    {e.pais ? ` · ${e.pais}` : ''}
                  </p>
                  <Img imagen={e.logo} alt="" ancho={120} alto={60} clase="summit-expositor__logo" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 6. Programa */}
      {evento.programa.length > 0 && (
        <section className="section section-alt" id="programa">
          <div className="container">
            <div className="section-header">
              <h2>Programa</h2>
              <p>
                {evento.fecha} · {evento.lugar}
              </p>
            </div>
            <ol className="summit-programa">
              {evento.programa.map((s, i) => (
                <li key={`${s.hora}-${i}`} className="summit-sesion">
                  <time className="summit-sesion__hora" dateTime={s.hora}>
                    {s.hora} hrs.
                  </time>
                  <div className="summit-sesion__cuerpo">
                    <h3>{s.titulo}</h3>
                    {s.nota && <p className="summit-sesion__nota">{s.nota}</p>}
                    {s.personas.length > 0 && (
                      <>
                        {s.rol && <p className="summit-sesion__rol">{s.rol}</p>}
                        <ul className="summit-sesion__personas">
                          {s.personas.map((e) => (
                            <li key={e.id}>
                              <Foto p={e} clase="summit-sesion__foto" />
                              <span>
                                <strong>{e.nombre}</strong>
                                <span>
                                  {e.cargo} · {e.institucion}
                                  {e.pais ? ` · ${e.pais}` : ''}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 7. Formulario de inscripción */}
      <section className="section" id={ANCLA_INSCRIPCION}>
        <div className="container summit-formulario">
          <div className="section-header">
            <h2>Formulario de inscripción</h2>
            <p>Completá tus datos para asistir al {evento.nombre}.</p>
          </div>
          <div className="summit-formulario__caja">{formulario}</div>
        </div>
      </section>

      {/* 8. Lugar del evento */}
      <section className="section section-alt" id="lugar">
        <div className="container summit-lugar">
          <div className="summit-lugar__texto">
            <h2>{evento.lugar}</h2>
            <p>{evento.direccion}</p>
            <a href={evento.mapa} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* 9. Comités */}
      {evento.comites.length > 0 && (
        <section className="section" id="comites">
          <div className="container summit-comites">
            <div className="section-header">
              <h2>Comités</h2>
            </div>
            {evento.comites.map((c, i) => (
              <details key={i} className="desplegable faculty-section">
                <summary className="desplegable__titulo">
                  <h3 className="faculty-title">{c.titulo}</h3>
                </summary>
                <div className="desplegable__contenido">
                  <Img
                    imagen={c.imagen}
                    alt={`Logos del ${c.titulo.toLowerCase()}`}
                    ancho={c.imagen?.ancho ?? 1000}
                    alto={c.imagen?.alto ?? 500}
                    clase="summit-comite__imagen"
                  />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
