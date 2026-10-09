'use client'

// Cifra de la portada con conteo animado (antes animateCounters() en index.html): cuenta
// de 0 al valor en 2 segundos cuando la cifra aparece en pantalla (antes contaba al cargar,
// aunque estuviera más abajo, y competía con el resto de la carga). El HTML del servidor ya
// trae el valor final, y se queda así si el usuario pidió reducir el movimiento.

import { useEffect, useRef, useState } from 'react'

const DURACION_MS = 2000

export function ContadorEstadistica({ valor }: { valor: number }) {
  const cifra = useRef<HTMLDivElement>(null)
  const [actual, setActual] = useState(valor)

  useEffect(() => {
    const el = cifra.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cuadro = 0
    const contar = () => {
      const inicio = performance.now()
      const paso = (ahora: number) => {
        const avance = Math.min((ahora - inicio) / DURACION_MS, 1)
        // Sólo cambia el estado cuando cambia el número entero (React ignora valores iguales).
        setActual(Math.floor(valor * avance))
        if (avance < 1) cuadro = requestAnimationFrame(paso)
      }
      cuadro = requestAnimationFrame(paso)
    }
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((e) => e.isIntersecting)) {
        observador.disconnect()
        contar()
      }
    })
    observador.observe(el)
    return () => {
      observador.disconnect()
      cancelAnimationFrame(cuadro)
    }
  }, [valor])

  return (
    <div ref={cifra} className="stat-number">
      +{actual}
    </div>
  )
}
