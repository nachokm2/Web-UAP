'use client'

// Video de fondo del encabezado de la portada: silenciado, en bucle y en línea, como en
// el sitio estático. Va encima de la imagen fija de la portada (un <img> optimizado, que es
// lo que pinta la página) y, sin poster, es transparente hasta que tiene su primer cuadro.
// Se carga sólo si vale la pena: pantalla ancha, sin "reducir movimiento" y sin ahorro de
// datos. En celulares queda la imagen (el video pesaba 13 MB).

import { useEffect, useRef } from 'react'

type Fuente = { src: string; type: string }

type Props = {
  fuentes: Fuente[]
  className?: string
}

const ANCHO_MINIMO = '(min-width: 768px)'

export function VideoFondo({ fuentes, className }: Props) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current
    if (!v) return
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)')
    const ahorroDeDatos = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    if (!window.matchMedia(ANCHO_MINIMO).matches || ahorroDeDatos) return

    let cargado = false
    const aplicar = () => {
      if (reducir.matches) {
        v.pause()
        return
      }
      if (!cargado) {
        for (const f of fuentes) {
          const s = document.createElement('source')
          s.src = f.src
          s.type = f.type
          v.appendChild(s)
        }
        v.load()
        cargado = true
      }
      // Los navegadores sólo permiten reproducir sin interacción un video silenciado.
      v.muted = true
      v.play().catch(() => {
        /* reproducción bloqueada por el navegador: queda la imagen fija */
      })
    }
    aplicar()
    reducir.addEventListener('change', aplicar)
    return () => reducir.removeEventListener('change', aplicar)
  }, [fuentes])

  return <video ref={video} className={className} muted loop playsInline preload="none" aria-hidden="true" />
}
