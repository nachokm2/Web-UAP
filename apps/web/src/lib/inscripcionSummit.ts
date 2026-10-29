// Reglas de la inscripción al V Summit Internacional UAP 2026: lista de países, validación de los
// datos del formulario, límite de envíos, correo de aviso al equipo y planilla para Excel. Sin
// dependencias del servidor, para poder probarlo solo.

/** Códigos ISO 3166-1 de los países; el nombre en español sale de Intl.DisplayNames. */
const CODIGOS_PAIS = (
  'AF AL DE AD AO AG SA DZ AR AM AU AT AZ BS BD BB BH BE BZ BJ BY MM BO BA BW BR BN BG BF BI BT CV KH CM CA QA TD CL CN ' +
  'CY VA CO KM CG KP KR CI CR HR CU DK DJ DM EC EG SV AE ER SK SI ES US EE SZ ET RU FJ PH FI FR GA GM GE GH GD GR GT GN ' +
  'GQ GW GY HT HN HU IN ID IQ IR IE IS MH SB IL IT JM JP JO KZ KE KG KI KW LA LS LV LB LR LY LI LT LU MK MG MY MW MV ML ' +
  'MT MA MU MR MX FM MD MC MN ME MZ NA NR NP NI NE NG NO NZ OM NL PK PW PA PG PY PE PL PT GB CF CZ CD DO RW RO WS SM KN ' +
  'VC LC ST SN RS SC SL SG SY SO LK ZA SD SS SE CH SR TH TZ TJ TL TG TO TT TN TR TM TV UA UG UY UZ VU VE VN YE ZM ZW PR'
).split(' ')

export const PAIS_PREDETERMINADO = 'Paraguay'

let paises: string[] | null = null

/** Nombres de países en español, ordenados; se calcula una sola vez. */
export function listaDePaises(): string[] {
  if (!paises) {
    const nombres = new Intl.DisplayNames(['es'], { type: 'region' })
    paises = [...new Set(CODIGOS_PAIS.map((c) => nombres.of(c) ?? c))].sort((a, b) =>
      a.localeCompare(b, 'es'),
    )
  }
  return paises
}

export type DatosInscripcion = {
  nombre: string
  apellido: string
  empresa: string
  email: string
  telefono: string
  pais: string
}

export type CampoInscripcion = keyof DatosInscripcion

export type ErroresInscripcion = Partial<Record<CampoInscripcion, string>>

/** Resultado del envío que usa el formulario (lo devuelve la acción del servidor). */
export type EstadoInscripcion =
  | { estado: 'inicial' }
  | { estado: 'ok'; nombre: string }
  | {
      estado: 'error'
      mensaje?: string
      errores?: ErroresInscripcion
      valores?: Partial<Record<CampoInscripcion, string>>
    }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TELEFONO = /^\+?[0-9 ()\-.]{6,25}$/

const MAXIMO: Record<CampoInscripcion, number> = {
  nombre: 80,
  apellido: 80,
  empresa: 150,
  email: 160,
  telefono: 25,
  pais: 80,
}

/** Texto de un campo del formulario: sin espacios sobrantes ni caracteres de control. */
const limpiar = (v: FormDataEntryValue | null): string =>
  typeof v === 'string'
    ? v
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''

/** Valida y normaliza lo que llega del formulario. El correo se guarda en minúsculas. */
export function validarInscripcion(
  formData: FormData,
): { ok: true; datos: DatosInscripcion } | { ok: false; errores: ErroresInscripcion } {
  const datos: DatosInscripcion = {
    nombre: limpiar(formData.get('nombre')),
    apellido: limpiar(formData.get('apellido')),
    empresa: limpiar(formData.get('empresa')),
    email: limpiar(formData.get('email')).toLowerCase(),
    telefono: limpiar(formData.get('telefono')),
    pais: limpiar(formData.get('pais')),
  }
  const errores: ErroresInscripcion = {}
  if (!datos.nombre) errores.nombre = 'Ingresá tu nombre.'
  if (!datos.apellido) errores.apellido = 'Ingresá tu apellido.'
  if (!datos.email) errores.email = 'Ingresá tu correo electrónico.'
  else if (!EMAIL.test(datos.email)) errores.email = 'Revisá el correo: parece incompleto.'
  if (datos.telefono && !TELEFONO.test(datos.telefono))
    errores.telefono = 'Revisá el teléfono: usá solo números, espacios y +.'
  if (!datos.pais) errores.pais = 'Elegí tu país.'
  else if (!listaDePaises().includes(datos.pais)) errores.pais = 'Elegí un país de la lista.'
  for (const campo of Object.keys(MAXIMO) as CampoInscripcion[]) {
    if (!errores[campo] && datos[campo].length > MAXIMO[campo])
      errores[campo] = 'El texto es demasiado largo.'
  }
  return Object.keys(errores).length ? { ok: false, errores } : { ok: true, datos }
}

/**
 * Límite de envíos por visitante (en memoria: alcanza para frenar el spam básico con una sola
 * instancia). Devuelve true si todavía puede enviar.
 */
export function crearLimitador(maximo: number, ventanaMs: number) {
  const registro = new Map<string, number[]>()
  return (clave: string, ahora = Date.now()): boolean => {
    const recientes = (registro.get(clave) ?? []).filter((t) => ahora - t < ventanaMs)
    if (recientes.length >= maximo) {
      registro.set(clave, recientes)
      return false
    }
    recientes.push(ahora)
    registro.set(clave, recientes)
    // Limpieza ocasional para que el mapa no crezca sin límite.
    if (registro.size > 5000)
      for (const [k, v] of registro) if (v.every((t) => ahora - t >= ventanaMs)) registro.delete(k)
    return true
  }
}

/** Una inscripción guardada: lo que hace falta para avisar y para exportar. */
export type FilaInscripcion = {
  nombre: string
  apellido: string
  empresa?: string | null
  email: string
  telefono?: string | null
  pais: string
  createdAt: string
}

/** Fecha y hora de Asunción, como "29/10/2026 10:15". */
export function fechaHoraAsuncion(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ''
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('es-PY', {
      timeZone: 'America/Asuncion',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(fecha)
      .map((x) => [x.type, x.value]),
  )
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

/** Correo de aviso al equipo por una inscripción nueva (texto plano). */
export function avisoDeInscripcion(
  f: FilaInscripcion,
  total: number,
  evento: string,
  urlPanel: string,
): { subject: string; text: string } {
  const nombre = `${f.nombre} ${f.apellido}`
  return {
    subject: `Nueva inscripción al ${evento}: ${nombre}`,
    text: [
      `Se inscribió una persona al ${evento}.`,
      '',
      `Nombre: ${nombre}`,
      `Empresa / Institución: ${f.empresa || '—'}`,
      `Correo: ${f.email}`,
      `Teléfono: ${f.telefono || '—'}`,
      `País: ${f.pais}`,
      `Fecha: ${fechaHoraAsuncion(f.createdAt)} (hora de Asunción)`,
      '',
      `Inscripciones hasta ahora: ${total}`,
      `Verlas todas o descargarlas en Excel: ${urlPanel}`,
      '',
      'Si respondés este correo, la respuesta le llega a la persona inscripta.',
    ].join('\n'),
  }
}

const COLUMNAS_CSV: [string, (f: FilaInscripcion) => string][] = [
  ['Nombre', (f) => f.nombre],
  ['Apellido', (f) => f.apellido],
  ['Empresa / Institución', (f) => f.empresa ?? ''],
  ['Correo electrónico', (f) => f.email],
  ['Teléfono', (f) => f.telefono ?? ''],
  ['País', (f) => f.pais],
  ['Fecha de inscripción', (f) => fechaHoraAsuncion(f.createdAt)],
]

/**
 * Celda de CSV. Un texto que empieza con =, +, - o @ Excel lo toma como fórmula: se le antepone un
 * apóstrofo (por eso un teléfono "+595…" sale "'+595…"). Comillas, ";" y saltos van entre comillas.
 */
function celdaCsv(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor
  return /[";\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro
}

/** Planilla de inscripciones para Excel en español: separador ";" y BOM para que respete los acentos. */
export function inscripcionesACsv(filas: FilaInscripcion[]): string {
  const lineas = [
    COLUMNAS_CSV.map(([titulo]) => titulo),
    ...filas.map((f) => COLUMNAS_CSV.map(([, valor]) => valor(f))),
  ]
  return `﻿${lineas.map((l) => l.map(celdaCsv).join(';')).join('\r\n')}\r\n`
}
