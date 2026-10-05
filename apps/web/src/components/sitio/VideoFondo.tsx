'use client'

// Video de fondo del encabezado de la portada: silenciado, en bucle y en línea, como en
// el sitio estático. Se reproduce desde aquí en lugar de con el atributo autoplay para
// que quede quieto si el usuario pidió reducir el movimiento (y se detenga o reanude si
// cambia esa preferencia con la página abierta).

import { useEffect, useRef } from 'react'

type Props = {
  src: string
  className?: string
}

export function VideoFondo({ src, className }: Props) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current
    if (!v) return
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aplicar = () => {
      if (consulta.matches) {
        v.pause()
        return
      }
      // Los navegadores sólo permiten reproducir sin interacción un video silenciado.
      v.muted = true
      v.play().catch(() => {
        /* reproducción bloqueada por el navegador: queda el primer cuadro */
      })
    }
    aplicar()
    consulta.addEventListener('change', aplicar)
    return () => consulta.removeEventListener('change', aplicar)
  }, [])

  return (
    <video ref={video} className={className} muted loop playsInline preload="metadata">
      <source src={src} type="video/mp4" />
    </video>
  )
}
