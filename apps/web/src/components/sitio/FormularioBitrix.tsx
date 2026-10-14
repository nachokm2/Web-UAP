'use client'

// Formulario de leads de Bitrix24. El loader de Bitrix busca un
// <script data-b24-form> y dibuja el formulario en su lugar; se crea al montar
// para que funcione también al navegar entre páginas sin recargar.
//
// Atribución: Bitrix guarda solo la página donde se envió el formulario ("descripción del
// origen" de la negociación, p. ej. https://uap.edu.py/nutricion/) y los utm reales de la
// visita (anuncios). Antes este componente agregaba ?utm_source=web-uap a la dirección; se
// quitó porque Analytics lo tomaba como una campaña y se quedaba con el origen real.

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Código del formulario, ej. "inline/61/hi7fex". */
  formulario: string
  /** Script loader de Bitrix24 (https://cdn.bitrix24.es/.../loader_61.js). */
  loaderUrl: string
  /**
   * Carga el formulario recién cuando el visitante se acerca (al final de las páginas de
   * programa). El script de Bitrix pesa ~100 KB y bloqueaba la página ~0,6 s en celulares.
   * Donde el formulario es lo principal (inscripción, formularios por asesor) va sin diferir.
   */
  diferido?: boolean
}

export function FormularioBitrix({ formulario, loaderUrl, diferido = false }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!diferido)

  useEffect(() => {
    if (visible) return
    const destino = contenedor.current
    if (!destino) return
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { rootMargin: '800px 0px' },
    )
    observador.observe(destino)
    return () => observador.disconnect()
  }, [visible])

  useEffect(() => {
    const destino = contenedor.current
    if (!destino || !visible) return

    const marcador = document.createElement('script')
    marcador.setAttribute('data-b24-form', formulario)
    marcador.setAttribute('data-skip-moving', 'true')
    destino.appendChild(marcador)

    const loader = document.createElement('script')
    loader.async = true
    loader.src = `${loaderUrl}?${(Date.now() / 180000) | 0}`
    document.head.appendChild(loader)

    return () => {
      destino.innerHTML = ''
      loader.remove()
    }
  }, [formulario, loaderUrl, visible])

  return <div ref={contenedor} className="formulario-bitrix" />
}
