'use client'

// Cifra de la portada con conteo animado (antes animateCounters() en index.html):
// al cargar cuenta de 0 al valor en 2 segundos. El HTML del servidor ya trae el valor
// final, y sin animación se queda así si el usuario pidió reducir el movimiento.

import { useEffect, useState } from 'react'

const DURACION_MS = 2000
const PASO_MS = 16

export function ContadorEstadistica({ valor }: { valor: number }) {
  const [actual, setActual] = useState(valor)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const incremento = valor / (DURACION_MS / PASO_MS)
    let cuenta = 0
    const temporizador = setInterval(() => {
      cuenta += incremento
      if (cuenta >= valor) {
        setActual(valor)
        clearInterval(temporizador)
      } else {
        setActual(Math.floor(cuenta))
      }
    }, PASO_MS)
    return () => clearInterval(temporizador)
  }, [valor])

  return <div className="stat-number">+{actual}</div>
}
