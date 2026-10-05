'use client'

// Plan de estudios en pestañas (patrón WAI-ARIA de tabs, igual que el sitio estático):
// flechas, Inicio y Fin mueven el foco entre pestañas.

import { useRef, useState } from 'react'

type Periodo = { nombre: string; asignaturas?: { nombre: string }[] | null }

export function Malla({ titulo, periodos }: { titulo: string; periodos: Periodo[] }) {
  const [activa, setActiva] = useState(0)
  const pestanas = useRef<(HTMLButtonElement | null)[]>([])

  if (!periodos.length) return null

  const activar = (i: number, foco = false) => {
    setActiva(i)
    if (foco) pestanas.current[i]?.focus()
  }
  const alTeclear = (e: React.KeyboardEvent, i: number) => {
    const ultimo = periodos.length - 1
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
    <div className="malla-section">
      <h2 className="malla-titulo">{titulo}</h2>
      <div className="malla-tabs" role="tablist" aria-label={titulo}>
        {periodos.map((p, i) => (
          <button
            key={`${p.nombre}-${i}`}
            ref={(el) => {
              pestanas.current[i] = el
            }}
            type="button"
            role="tab"
            id={`malla-tab-${i}`}
            aria-controls={`malla-panel-${i}`}
            aria-selected={activa === i}
            tabIndex={activa === i ? 0 : -1}
            className={activa === i ? 'malla-tab active' : 'malla-tab'}
            onClick={() => activar(i)}
            onKeyDown={(e) => alTeclear(e, i)}
          >
            {p.nombre}
          </button>
        ))}
      </div>
      {periodos.map((p, i) => (
        <div
          key={`${p.nombre}-panel-${i}`}
          className="malla-panel"
          role="tabpanel"
          id={`malla-panel-${i}`}
          aria-labelledby={`malla-tab-${i}`}
          tabIndex={0}
          hidden={activa !== i}
        >
          <ul>
            {(p.asignaturas ?? []).map((a, j) => (
              <li key={j}>{a.nombre}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
