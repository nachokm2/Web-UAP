// Evento del Summit listo para dibujar, para las páginas que lo muestran (la landing y la página de
// gracias). Mientras el evento no esté cargado en el CMS, o si la consulta falla, usa el contenido de
// respaldo; si el equipo lo despublicó, devuelve null (la landing responde 404).

import { obtenerEvento } from '@/lib/datos'

import { CONTENIDO_SUMMIT, SLUG_SUMMIT } from './contenidoSummit'
import { vistaDesdeCms, vistaDesdeContenido, type EventoVista } from './vista'

export async function cargarEventoSummit(): Promise<EventoVista | null> {
  try {
    const { estado, evento } = await obtenerEvento(SLUG_SUMMIT)
    if (estado === 'publicado') return vistaDesdeCms(evento)
    if (estado === 'oculto') return null
  } catch (error) {
    console.error('[summit] no se pudo leer el evento del CMS; se usa el contenido de respaldo:', error instanceof Error ? error.message : error)
  }
  return vistaDesdeContenido(CONTENIDO_SUMMIT)
}
