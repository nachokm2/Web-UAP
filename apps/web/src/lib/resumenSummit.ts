// Resumen de las inscripciones al Summit SIN DATOS PERSONALES: solo cuántas hay, por día y por país.
// Lo lee el dashboard "Analytics UAP" (GET /api/inscripciones-summit/resumen) para mostrar las
// inscripciones reales junto a las visitas de Google Analytics.
//
// Este archivo es solo del servidor (usa node:crypto): no importarlo desde componentes del navegador.
// La entrada de resumenDeInscripciones() ni siquiera admite nombre ni correo: solo país y fecha.

import { createHash, timingSafeEqual } from 'node:crypto'

/** Un token más corto que esto no se acepta: el resumen queda desactivado. */
export const TOKEN_MINIMO = 32
/** Rango máximo que se puede pedir (días). */
export const MAX_DIAS_RESUMEN = 400
/** Países que se listan; el resto se junta en "Otros países". */
export const MAX_PAISES = 15

/** Fecha 'AAAA-MM-DD' que existe en el calendario. */
export function esFechaISO(valor: unknown): valor is string {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false
  const fecha = new Date(`${valor}T00:00:00Z`)
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
}

export function zonaValida(zona: string): boolean {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: zona })
    return true
  } catch {
    return false
  }
}

const formateadores = new Map<string, Intl.DateTimeFormat>()

/** Día 'AAAA-MM-DD' de un instante en una zona horaria (nunca la hora del servidor, que está en UTC). */
export function diaEnZona(iso: string, zona: string): string | null {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return null
  let formato = formateadores.get(zona)
  if (!formato) {
    formato = new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    formateadores.set(zona, formato)
  }
  return formato.format(fecha)
}

export const sumarDias = (dia: string, n: number): string =>
  new Date(Date.parse(`${dia}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)

/** Todos los días entre dos fechas, ambas incluidas. */
export function diasEntre(desde: string, hasta: string): string[] {
  const dias: string[] = []
  for (let d = desde; d <= hasta; d = sumarDias(d, 1)) dias.push(d)
  return dias
}

/** Lo único que se lee de cada inscripción: nada que identifique a la persona. */
export type FilaParaResumen = { pais?: string | null; createdAt: string }

export type ResumenInscripciones = {
  total: number
  desde: string | null
  hasta: string | null
  zona: string
  por_dia: { fecha: string; inscripciones: number }[]
  por_pais: { pais: string; inscripciones: number }[]
  primera_inscripcion: string | null
  ultima_inscripcion: string | null
}

/**
 * Cuenta las inscripciones por día (en `zona`) y por país. Con `desde` y `hasta` solo entran las de
 * esos días y por_dia trae TODOS los días del rango (con ceros); sin ellos, solo los días con inscripciones.
 */
export function resumenDeInscripciones(
  filas: FilaParaResumen[],
  { desde, hasta, zona }: { desde?: string | null; hasta?: string | null; zona: string },
): ResumenInscripciones {
  const porDia = new Map<string, number>()
  const porPais = new Map<string, number>()
  let total = 0
  let primera: string | null = null
  let ultima: string | null = null
  for (const fila of filas) {
    const dia = diaEnZona(fila.createdAt, zona)
    if (!dia || (desde && dia < desde) || (hasta && dia > hasta)) continue
    total += 1
    porDia.set(dia, (porDia.get(dia) ?? 0) + 1)
    const pais = (fila.pais ?? '').trim() || 'Sin país'
    porPais.set(pais, (porPais.get(pais) ?? 0) + 1)
    if (primera === null || fila.createdAt < primera) primera = fila.createdAt
    if (ultima === null || fila.createdAt > ultima) ultima = fila.createdAt
  }
  const dias = desde && hasta ? diasEntre(desde, hasta) : [...porDia.keys()].sort()
  const paises = [...porPais.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'))
  const visibles = paises.slice(0, MAX_PAISES)
  const resto = paises.slice(MAX_PAISES).reduce((suma, [, n]) => suma + n, 0)
  return {
    total,
    desde: desde ?? null,
    hasta: hasta ?? null,
    zona,
    por_dia: dias.map((fecha) => ({ fecha, inscripciones: porDia.get(fecha) ?? 0 })),
    por_pais: [
      ...visibles.map(([pais, inscripciones]) => ({ pais, inscripciones })),
      ...(resto > 0 ? [{ pais: 'Otros países', inscripciones: resto }] : []),
    ],
    primera_inscripcion: primera,
    ultima_inscripcion: ultima,
  }
}

/** Token del encabezado "Authorization: Bearer …" (o null). */
export function tokenDeEncabezado(encabezado: string | null | undefined): string | null {
  const m = /^Bearer\s+(\S+)$/i.exec((encabezado ?? '').trim())
  return m ? m[1] : null
}

/**
 * Compara el token recibido con el configurado en tiempo constante. Si el configurado falta o es
 * demasiado corto, SIEMPRE da false (el resumen queda desactivado en vez de abierto).
 */
export function tokenValido(recibido: string | null, esperado: string | undefined): boolean {
  if (!esperado || esperado.length < TOKEN_MINIMO || !recibido) return false
  const a = createHash('sha256').update(recibido).digest()
  const b = createHash('sha256').update(esperado).digest()
  return timingSafeEqual(a, b)
}
