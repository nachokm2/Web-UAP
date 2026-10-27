'use client'

// Carrusel del encabezado de la portada (antes un <script> en index.html): pasa a la
// diapositiva siguiente cada 5 segundos y los indicadores llevan a cada una.
// No avanza solo si el usuario pidió reducir el movimiento, ni mientras el puntero o el
// foco del teclado están dentro (así no cambia lo que se está por leer o activar).
// El botón de pausa detiene el avance y el video de fondo (WCAG 2.2.2).

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type Diapositiva = {
  href: string
  insignia: string
  /** Clase extra para el color de la insignia. */
  claseInsignia?: string
  titulo: string
  texto: string
  accion: string
  /** Banner propio: la diapositiva muestra solo esta imagen (con su texto incluido) y tapa el video.
   *  `movil` es la versión vertical para pantallas angostas (hasta 640 px). */
  imagen?: { src: string; alt: string; movil?: string }
}

const INTERVALO_MS = 5000

type Props = {
  diapositivas: Diapositiva[]
  /** Fondo del encabezado (el video). */
  children?: ReactNode
}

export function CarruselPortada({ diapositivas, children }: Props) {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  // Pausa pedida con el botón: dura hasta que la persona la quite (el puntero y el foco no la cambian).
  const [detenido, setDetenido] = useState(false)
  const seccion = useRef<HTMLElement>(null)
  const total = diapositivas.length

  useEffect(() => {
    if (pausado || detenido || total < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const temporizador = setInterval(() => setActual((a) => (a + 1) % total), INTERVALO_MS)
    return () => clearInterval(temporizador)
  }, [pausado, detenido, total])

  // El video de fondo (VideoFondo) se pausa y se reanuda con el mismo botón.
  useEffect(() => {
    const video = seccion.current?.querySelector('video')
    if (!video) return
    if (detenido) video.pause()
    // Solo si ya se cargó (en celulares, con ahorro de datos o reducir movimiento no se carga).
    else if (video.currentSrc && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.play().catch(() => {})
  }, [detenido])

  return (
    <section
      ref={seccion}
      className="hero-clean"
      id="hero-carousel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPausado(false)
      }}
    >
      {children}

      {diapositivas.map((d, i) => {
        // La primera diapositiva lleva el título principal de la página.
        const Titulo = i === 0 ? 'h1' : 'h2'
        return (
          <div
            key={d.href}
            className={i === actual ? 'carousel-slide carousel-active' : 'carousel-slide'}
            // Con teclado, la diapositiva que recibe el foco pasa a ser la visible.
            onFocus={() => setActual(i)}
          >
            {d.imagen ? (
              <Link href={d.href} className={d.imagen.movil ? 'hero-slide-banner hero-slide-banner--con-movil' : 'hero-slide-banner'}>
                <Image src={d.imagen.src} alt={d.imagen.alt} fill sizes="(max-width: 1920px) 100vw, 1920px" className="hero-slide-banner__foto hero-slide-banner__foto--escritorio" />
                {d.imagen.movil && (
                  <Image src={d.imagen.movil} alt={d.imagen.alt} fill sizes="640px" className="hero-slide-banner__foto hero-slide-banner__foto--movil" />
                )}
              </Link>
            ) : (
              <Link href={d.href}>
                <div className="hero-slide-content">
                  <span className={d.claseInsignia ? `hero-slide-badge ${d.claseInsignia}` : 'hero-slide-badge'}>{d.insignia}</span>
                  <Titulo>{d.titulo}</Titulo>
                  <p>{d.texto}</p>
                  <span className="hero-slide-cta">{d.accion}</span>
                </div>
              </Link>
            )}
          </div>
        )
      })}

      {total > 1 && (
        <div className="carousel-indicators">
          {diapositivas.map((d, i) => (
            <button
              key={d.href}
              type="button"
              className={i === actual ? 'indicator active' : 'indicator'}
              aria-label={`Mostrar diapositiva ${i + 1}: ${d.titulo}`}
              aria-current={i === actual ? 'true' : undefined}
              onClick={() => setActual(i)}
            />
          ))}
          <button
            type="button"
            className="carousel-pausa"
            aria-label={detenido ? 'Reanudar la presentación' : 'Pausar la presentación'}
            onClick={() => setDetenido((d) => !d)}
          >
            {detenido ? (
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path d="M2 1l9 5-9 5z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      )}
    </section>
  )
}
