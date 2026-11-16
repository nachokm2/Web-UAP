// Página de agradecimiento de las campañas de eventos presenciales.
//
// El formulario de inscripción redirige acá al guardar una inscripción nueva, y la carga de esta
// página es la señal de conversión (Meta, vía Google Tag Manager). Por eso la dirección lleva un
// sufijo difícil de adivinar y la página no se enlaza, no se indexa y no está en el sitemap. Aun
// así la dirección es pública, así que una conversión solo se cuenta si:
//  - el formulario del Summit dejó la marca CLAVE_PENDIENTE al guardar (inscripción nueva), o
//  - el visitante llega desde una página del sitio (por ejemplo, un formulario de Bitrix24 que
//    redirige acá) y no se había contado en la sesión.

/** Dirección de la página (con barra final, como el resto del sitio). */
export const RUTA_GRACIAS = '/gracias-evento-presencial-sb6j2g/'

/** Evento para Tag Manager: lead real (viene del sitio y no se había contado en esta sesión). */
export const EVENTO_LEAD = 'lead_evento_presencial'
/** Evento para Tag Manager: se abrió la página sin venir del sitio. No es una conversión. */
export const EVENTO_VISITA_DIRECTA = 'gracias_visita_directa'

/** Marca en sessionStorage para no contar dos veces al recargar. */
export const CLAVE_SESION = 'uap_gracias_contada'
/** La deja el formulario del Summit justo antes de redirigir, solo al guardar una inscripción nueva. */
export const CLAVE_PENDIENTE = 'uap_gracias_pendiente'

export type DecisionGracias = 'conversion' | 'visita_directa' | 'repetida'

/** ¿El visitante llegó desde una página de este mismo sitio (y no desde esta misma página)? */
export function vieneDelSitio(referrer: string, origen: string): boolean {
  if (!referrer) return false
  try {
    const url = new URL(referrer)
    return url.origin === origen && url.pathname !== RUTA_GRACIAS
  } catch {
    return false
  }
}

/** Qué hacer al cargar la página: contar una conversión, marcar visita directa o no hacer nada. */
export function decidirGracias({
  referrer,
  origen,
  yaContada,
  pendiente = false,
}: {
  referrer: string
  origen: string
  yaContada: boolean
  /** El formulario dejó la marca: es un envío nuevo (aunque la sesión ya tenga otro contado). */
  pendiente?: boolean
}): DecisionGracias {
  if (pendiente) return 'conversion'
  if (!vieneDelSitio(referrer, origen)) return 'visita_directa'
  return yaContada ? 'repetida' : 'conversion'
}
