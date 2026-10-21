'use client'

// Carreras de la portada en pestañas por facultad (antes un <script> en index.html que
// mostraba y ocultaba cada panel). Mismo marcado y clases; se agrega el patrón WAI-ARIA
// de pestañas, como en el plan de estudios (Malla): flechas, Inicio y Fin mueven el foco.
// Para pasar de facultad sin volver a las pestañas: flechas ‹ › a los costados, deslizar
// el dedo sobre las tarjetas y anterior / siguiente al pie de la lista.

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { urlPrograma } from '@/lib/urls'

export type CarreraDePortada = {
  slug: string
  nombre: string
  /** Ruta del ícono en public/images, si hay uno para la carrera. */
  icono: string | null
  /** Duración y título, ej. "5 años • Licenciatura". */
  meta: string
  descripcion: string | null
}

export type FacultadDePortada = { id: string; etiqueta: string; carreras: CarreraDePortada[] }

export function PestanasCarreras({ facultades }: { facultades: FacultadDePortada[] }) {
  const [activa, setActiva] = useState(0)
  const pestanas = useRef<(HTMLButtonElement | null)[]>([])
  const lista = useRef<HTMLDivElement>(null)
  const [pista, setPista] = useState(false)
  // Lado desde el que entran las tarjetas al cambiar de facultad.
  const [entrada, setEntrada] = useState<'derecha' | 'izquierda' | null>(null)
  const toque = useRef<{ x: number; y: number } | null>(null)

  // En celular las pestañas no entran a lo ancho: la primera vez que la fila se ve, hace
  // un vaivén corto para mostrar que se puede deslizar (no con movimiento reducido).
  useEffect(() => {
    const el = lista.current
    if (!el || el.scrollWidth <= el.clientWidth || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        setPista(true)
        observador.disconnect()
      },
      { threshold: 0.6 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  if (!facultades.length) return null

  const ultimo = facultades.length - 1
  const anterior = activa === 0 ? ultimo : activa - 1
  const siguiente = activa === ultimo ? 0 : activa + 1
  const suave = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const activar = (i: number, foco = false, desde?: 'derecha' | 'izquierda') => {
    if (i === activa) return
    setEntrada(desde ?? (i > activa ? 'derecha' : 'izquierda'))
    setActiva(i)
    if (foco) pestanas.current[i]?.focus()
    // La pestaña elegida queda centrada en la fila (solo se nota cuando la fila se desliza).
    pestanas.current[i]?.scrollIntoView({ behavior: suave() ? 'smooth' : 'auto', block: 'nearest', inline: 'center' })
  }
  const irAnterior = () => activar(anterior, false, 'izquierda')
  const irSiguiente = () => activar(siguiente, false, 'derecha')

  // Desde el pie de la lista: cambia de facultad y sube hasta las pestañas (debajo del encabezado fijo).
  const irDesdeElPie = (i: number, desde: 'derecha' | 'izquierda') => {
    activar(i, false, desde)
    const el = lista.current
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: suave() ? 'smooth' : 'auto' })
  }

  // Deslizar el dedo sobre las tarjetas: solo gestos claramente horizontales (no el desplazamiento vertical).
  const alTocar = (e: React.TouchEvent) => {
    toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const alSoltar = (e: React.TouchEvent) => {
    const inicio = toque.current
    toque.current = null
    if (!inicio) return
    const dx = e.changedTouches[0].clientX - inicio.x
    const dy = e.changedTouches[0].clientY - inicio.y
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    if (dx < 0) irSiguiente()
    else irAnterior()
  }
  const alTeclear = (e: React.KeyboardEvent, i: number) => {
    const destino =
      e.key === 'ArrowRight' ? (i === ultimo ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i === 0 ? ultimo : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? ultimo
      : null
    if (destino !== null) {
      e.preventDefault()
      activar(destino, true)
    }
  }

  const hayVarias = facultades.length > 1

  return (
    <>
      <div className="pestanas-nav">
        {hayVarias && (
          <button type="button" className="pestanas-flecha" onClick={irAnterior} aria-label={`Facultad anterior: ${facultades[anterior].etiqueta}`}>
            <span aria-hidden="true">‹</span>
          </button>
        )}
        <div
          ref={lista}
          className={pista ? 'tab-buttons tab-buttons--pista' : 'tab-buttons'}
          role="tablist"
          aria-label="Carreras por facultad"
          onAnimationEnd={() => setPista(false)}
        >
          {facultades.map((f, i) => (
            <button
              key={f.id}
              ref={(el) => {
                pestanas.current[i] = el
              }}
              type="button"
              role="tab"
              id={`pestana-${f.id}`}
              aria-controls={`tab-${f.id}`}
              aria-selected={activa === i}
              tabIndex={activa === i ? 0 : -1}
              className={activa === i ? 'tab-btn active' : 'tab-btn'}
              onClick={() => activar(i)}
              onKeyDown={(e) => alTeclear(e, i)}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
        {hayVarias && (
          <button type="button" className="pestanas-flecha" onClick={irSiguiente} aria-label={`Facultad siguiente: ${facultades[siguiente].etiqueta}`}>
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      {facultades.map((f, i) => (
        <div
          key={f.id}
          className={[
            'tab-content inicio-pestana',
            activa === i && 'active',
            activa === i && entrada && `inicio-pestana--desde-${entrada}`,
          ]
            .filter(Boolean)
            .join(' ')}
          id={`tab-${f.id}`}
          role="tabpanel"
          aria-labelledby={`pestana-${f.id}`}
          hidden={activa !== i}
          onTouchStart={hayVarias ? alTocar : undefined}
          onTouchEnd={hayVarias ? alSoltar : undefined}
        >
          <div className="careers-grid-20">
            {f.carreras.map((c) => (
              <Link key={c.slug} href={urlPrograma(c.slug)} className="career-card">
                {c.icono && (
                  <div className="career-icon">
                    {/* Decorativo: el nombre ya está en el título de la tarjeta. */}
                    {/* eslint-disable-next-line @next/next/no-img-element -- recurso estático */}
                    <img src={c.icono} alt="" width={28} height={28} loading="lazy" />
                  </div>
                )}
                <h3>{c.nombre}</h3>
                {c.meta && <p className="inicio-carrera-meta">{c.meta}</p>}
                {c.descripcion && <p className="career-card-desc">{c.descripcion}</p>}
                <span className="career-card-cta">Ver carrera →</span>
              </Link>
            ))}
          </div>
          {hayVarias && (
            <nav className="pestanas-pie" aria-label="Otras facultades">
              <button type="button" className="pestanas-pie__boton" onClick={() => irDesdeElPie(anterior, 'izquierda')}>
                <span aria-hidden="true">←</span> {facultades[anterior].etiqueta}
              </button>
              <button type="button" className="pestanas-pie__boton pestanas-pie__boton--siguiente" onClick={() => irDesdeElPie(siguiente, 'derecha')}>
                {facultades[siguiente].etiqueta} <span aria-hidden="true">→</span>
              </button>
            </nav>
          )}
        </div>
      ))}
    </>
  )
}
