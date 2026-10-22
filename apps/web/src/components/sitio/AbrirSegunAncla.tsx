'use client'

// Los listados de /carreras/ y /postgrados/ son desplegables (<details>) cerrados. Si se llega
// con un ancla (el menú enlaza /postgrados/#diplomados), se abre ese desplegable y los que lo
// contienen. Escucha también los cambios de ancla sin recargar: los enlaces de Next usan
// pushState, que no dispara "hashchange", por eso además la Navigation API si está disponible
// ("currententrychange" sí se entera del pushState).

import { useEffect } from 'react'

function abrir() {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id) return
  const destino = document.getElementById(id)
  if (!destino) return
  for (let d = destino.closest('details'); d; d = d.parentElement?.closest('details') ?? null) d.open = true
  destino.scrollIntoView({ block: 'start' })
}

export function AbrirSegunAncla() {
  useEffect(() => {
    abrir()
    const nav = (window as Window & { navigation?: EventTarget }).navigation
    window.addEventListener('hashchange', abrir)
    nav?.addEventListener('currententrychange', abrir)
    return () => {
      window.removeEventListener('hashchange', abrir)
      nav?.removeEventListener('currententrychange', abrir)
    }
  }, [])

  return null
}
