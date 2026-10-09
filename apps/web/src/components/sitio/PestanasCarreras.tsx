'use client'

// Carreras de la portada en pestañas por facultad (antes un <script> en index.html que
// mostraba y ocultaba cada panel). Mismo marcado y clases; se agrega el patrón WAI-ARIA
// de pestañas, como en el plan de estudios (Malla): flechas, Inicio y Fin mueven el foco.

import Link from 'next/link'
import { useRef, useState } from 'react'

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

  if (!facultades.length) return null

  const activar = (i: number, foco = false) => {
    setActiva(i)
    if (foco) pestanas.current[i]?.focus()
  }
  const alTeclear = (e: React.KeyboardEvent, i: number) => {
    const ultimo = facultades.length - 1
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

  return (
    <>
      <div className="tab-buttons" role="tablist" aria-label="Carreras por facultad">
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

      {facultades.map((f, i) => (
        <div
          key={f.id}
          className={activa === i ? 'tab-content inicio-pestana active' : 'tab-content inicio-pestana'}
          id={`tab-${f.id}`}
          role="tabpanel"
          aria-labelledby={`pestana-${f.id}`}
          hidden={activa !== i}
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
        </div>
      ))}
    </>
  )
}
