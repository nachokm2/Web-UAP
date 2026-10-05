'use client'

// Carrusel del encabezado de la portada (antes un <script> en index.html): pasa a la
// diapositiva siguiente cada 5 segundos y los indicadores llevan a cada una.
// No avanza solo si el usuario pidió reducir el movimiento, ni mientras el puntero o el
// foco del teclado están dentro (así no cambia lo que se está por leer o activar).

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

export type Diapositiva = {
  href: string
  insignia: string
  /** Clase extra para el color de la insignia. */
  claseInsignia?: string
  titulo: string
  texto: string
  accion: string
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
  const total = diapositivas.length

  useEffect(() => {
    if (pausado || total < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const temporizador = setInterval(() => setActual((a) => (a + 1) % total), INTERVALO_MS)
    return () => clearInterval(temporizador)
  }, [pausado, total])

  return (
    <section
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
            <Link href={d.href}>
              <div className="hero-slide-content">
                <span className={d.claseInsignia ? `hero-slide-badge ${d.claseInsignia}` : 'hero-slide-badge'}>{d.insignia}</span>
                <Titulo>{d.titulo}</Titulo>
                <p>{d.texto}</p>
                <span className="hero-slide-cta">{d.accion}</span>
              </div>
            </Link>
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
        </div>
      )}
    </section>
  )
}
