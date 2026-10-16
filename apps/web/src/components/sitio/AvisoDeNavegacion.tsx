'use client'

// Avisa a Google Tag Manager cada vez que el visitante pasa a otra página sin recargar
// (los enlaces internos de Next). En el WordPress cada página era una carga completa y las
// etiquetas "de página cargada" (como el píxel de Meta) se disparaban solas; acá hace falta
// este evento. Solo cambia de página la ruta: no cuentan los # ni los parámetros (?utm=…).
// En Tag Manager: activador de evento personalizado "cambio_de_pagina".

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const EVENTO_CAMBIO_DE_PAGINA = 'cambio_de_pagina'

export function AvisoDeNavegacion() {
  const ruta = usePathname()
  const primeraCarga = useRef(true)

  useEffect(() => {
    // La primera página ya la cuenta Tag Manager al cargar.
    if (primeraCarga.current) {
      primeraCarga.current = false
      return
    }
    const w = window as Window & { dataLayer?: Record<string, unknown>[] }
    w.dataLayer = w.dataLayer ?? []
    w.dataLayer.push({ event: EVENTO_CAMBIO_DE_PAGINA, page_path: ruta, page_location: window.location.href, page_title: document.title })
  }, [ruta])

  return null
}
