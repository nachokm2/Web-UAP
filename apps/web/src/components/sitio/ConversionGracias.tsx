'use client'

// Avisa a Google Tag Manager que se completó el formulario (Meta lo usa como conversión). No
// dibuja nada. Cuenta cuando el formulario del Summit acaba de guardar una inscripción nueva, o
// una sola vez por sesión si el visitante viene de una página del sitio. No envía datos personales.

import { useEffect } from 'react'

import { CLAVE_PENDIENTE, CLAVE_SESION, EVENTO_LEAD, EVENTO_VISITA_DIRECTA, decidirGracias } from '@/lib/gracias'

export function ConversionGracias() {
  useEffect(() => {
    let yaContada = false
    let pendiente = false
    try {
      yaContada = window.sessionStorage.getItem(CLAVE_SESION) === '1'
      pendiente = window.sessionStorage.getItem(CLAVE_PENDIENTE) === '1'
      if (pendiente) window.sessionStorage.removeItem(CLAVE_PENDIENTE) // la marca vale una sola vez
    } catch {
      // Sin almacenamiento (navegación privada, bloqueado): se decide solo por la procedencia.
    }

    const decision = decidirGracias({ referrer: document.referrer, origen: window.location.origin, yaContada, pendiente })
    if (decision === 'repetida') return

    const w = window as Window & { dataLayer?: Record<string, unknown>[] }
    w.dataLayer = w.dataLayer ?? []
    w.dataLayer.push({
      event: decision === 'conversion' ? EVENTO_LEAD : EVENTO_VISITA_DIRECTA,
      pagina: 'gracias_evento_presencial',
    })

    if (decision === 'conversion') {
      try {
        window.sessionStorage.setItem(CLAVE_SESION, '1')
      } catch {
        // Ver arriba.
      }
    }
  }, [])

  return null
}
