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

/** Si a los 15 s no hay ningún campo, el formulario no va a aparecer (o Bitrix lo tiene deshabilitado). */
const ESPERA_MS = 15000

type Contacto = { telefono?: string | null; whatsapp?: string | null; email?: string | null }

/** Sin formulario no hay leads y nadie se entera: queda un evento en el dataLayer para medirlo en Analytics. */
function avisarFalla(formulario: string) {
  const w = window as Window & { dataLayer?: Record<string, unknown>[] }
  w.dataLayer?.push({ event: 'formulario_no_disponible', formulario })
}

type Props = {
  /** Código del formulario, ej. "inline/61/hi7fex". Vacío: se muestra solo el aviso. */
  formulario?: string | null
  /** Script loader de Bitrix24 (https://cdn.bitrix24.es/.../loader_61.js). */
  loaderUrl?: string | null
  /** Datos de la global Configuración para el aviso si el formulario no carga. */
  contacto: Contacto
  /**
   * Carga el formulario recién cuando el visitante se acerca (al final de las páginas de
   * programa). El script de Bitrix pesa ~100 KB y bloqueaba la página ~0,6 s en celulares.
   * Donde el formulario es lo principal (inscripción, formularios por asesor) va sin diferir.
   */
  diferido?: boolean
}

export function FormularioBitrix({ formulario, loaderUrl, contacto, diferido = false }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(!diferido)
  const [fallo, setFallo] = useState(false)
  const sinConfiguracion = !formulario || !loaderUrl

  useEffect(() => {
    if (sinConfiguracion) avisarFalla(formulario || '(sin configurar)')
  }, [sinConfiguracion, formulario])

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
    if (!destino || !visible || !formulario || !loaderUrl) return

    const marcador = document.createElement('script')
    marcador.setAttribute('data-b24-form', formulario)
    marcador.setAttribute('data-skip-moving', 'true')
    destino.appendChild(marcador)

    const loader = document.createElement('script')
    loader.async = true
    loader.src = `${loaderUrl}?${(Date.now() / 180000) | 0}`

    // El visitante ve otras formas de contactarnos (AvisoSinFormulario).
    let avisado = false
    const fallar = () => {
      setFallo(true)
      if (avisado) return
      avisado = true
      avisarFalla(formulario)
    }
    const tieneCampos = () => destino.querySelector('input:not([type="hidden"]), textarea, select') !== null
    loader.onerror = fallar
    const espera = setTimeout(() => {
      if (!tieneCampos()) fallar()
    }, ESPERA_MS)
    // Con conexión lenta puede llegar después de la espera: entonces el aviso se va.
    const observador = new MutationObserver(() => {
      if (tieneCampos()) setFallo(false)
    })
    observador.observe(destino, { childList: true, subtree: true })
    document.head.appendChild(loader)

    return () => {
      clearTimeout(espera)
      observador.disconnect()
      destino.innerHTML = ''
      loader.remove()
    }
  }, [formulario, loaderUrl, visible])

  return (
    <>
      <div ref={contenedor} className="formulario-bitrix" />
      {(sinConfiguracion || fallo) && <AvisoSinFormulario contacto={contacto} />}
    </>
  )
}

function AvisoSinFormulario({ contacto: { telefono, whatsapp, email } }: { contacto: Contacto }) {
  return (
    <div className="formulario-respaldo" role="status">
      <p>
        <strong>No pudimos cargar el formulario.</strong> Escribinos o llamanos y te ayudamos con tu inscripción:
      </p>
      <ul>
        {whatsapp && (
          <li>
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </li>
        )}
        {email && (
          <li>
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        )}
        {telefono && (
          <li>
            <a href={`tel:${telefono.replace(/[^\d+]/g, '')}`}>{telefono}</a>
          </li>
        )}
      </ul>
    </div>
  )
}
