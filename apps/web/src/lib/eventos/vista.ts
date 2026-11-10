// Datos de la página de un evento, ya listos para dibujar. Se arman desde el CMS (lo normal)
// o desde el contenido inicial en código (respaldo). Así el componente visual es uno solo y
// no sabe de dónde vienen los datos. Funciones puras: se prueban sin base de datos.

import { esMedio, rutaRelativa, urlDeImagen } from '@/components/sitio/Imagen'
import type { Evento, Expositor } from '@/payload-types'

import { CARPETA_IMAGENES_SUMMIT, type ContenidoEvento, type RedEvento } from './contenidoSummit'

export type ImagenVista = { src: string; ancho?: number; alto?: number }

export type PersonaVista = {
  id: string
  nombre: string
  cargo: string
  institucion: string
  pais?: string
  foto: ImagenVista | null
  logo: ImagenVista | null
}

export type EventoVista = {
  slug: string
  nombre: string
  titulo: string
  /** Texto largo en español: "19 de noviembre de 2026". */
  fecha: string
  /** AAAA-MM-DD */
  fechaIso: string
  horaInicio: string
  horaFin: string
  lugar: string
  ciudad: string
  direccion: string
  mapa: string
  hashtag: string
  correo: string
  textoBoton: string
  descripcionSeo?: string
  banner: ImagenVista | null
  imagenEvento: ImagenVista | null
  tituloIntro: string
  parrafos: string[]
  certificacion: string[]
  redes: { red: RedEvento; url: string }[]
  organizador: { nombre: string; logo: ImagenVista | null }
  colaboran: { nombre: string; url?: string; logo: ImagenVista | null }[]
  expositores: PersonaVista[]
  programa: { hora: string; titulo: string; rol?: string; nota?: string; personas: PersonaVista[] }[]
  comites: { titulo: string; imagen: ImagenVista | null }[]
}

/** "2026-11-19" → "19 de noviembre de 2026" (en UTC: la fecha del CMS no lleva hora local). */
export function formatoFechaLarga(fechaIso: string): string {
  const [a, m, d] = fechaIso.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat('es-PY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(a, m - 1, d)),
  )
}

// ---------------------------------------------------------------------------------------
// Desde el contenido inicial en código

const estatica = (archivo: string, ancho?: number, alto?: number): ImagenVista => ({
  src: `${CARPETA_IMAGENES_SUMMIT}/${archivo}`,
  ancho,
  alto,
})

export function vistaDesdeContenido(c: ContenidoEvento): EventoVista {
  const personas = new Map<string, PersonaVista>(
    c.expositores.map((e) => [
      e.id,
      {
        id: e.id,
        nombre: e.nombre,
        cargo: e.cargo,
        institucion: e.institucion,
        pais: e.pais,
        foto: estatica(e.foto),
        logo: estatica(e.logo),
      },
    ]),
  )
  const porIds = (ids: string[] = []) => ids.map((id) => personas.get(id)).filter((p): p is PersonaVista => Boolean(p))
  return {
    slug: c.slug,
    nombre: c.nombre,
    titulo: c.titulo,
    fecha: formatoFechaLarga(c.fechaIso),
    fechaIso: c.fechaIso,
    horaInicio: c.horaInicio,
    horaFin: c.horaFin,
    lugar: c.lugar,
    ciudad: c.ciudad,
    direccion: c.direccion,
    mapa: c.mapa,
    hashtag: c.hashtag,
    correo: c.correo,
    textoBoton: c.textoBoton,
    banner: estatica(c.banner),
    imagenEvento: estatica(c.imagenEvento),
    tituloIntro: c.tituloIntro,
    parrafos: c.parrafos,
    certificacion: c.certificacion,
    redes: c.redes,
    organizador: { nombre: c.organizador.nombre, logo: estatica(c.organizador.logo) },
    colaboran: c.colaboran.map((x) => ({ nombre: x.nombre, url: x.url, logo: estatica(x.logo) })),
    expositores: porIds(c.expositores.map((e) => e.id)),
    programa: c.programa.map((s) => ({
      hora: s.hora,
      titulo: s.titulo,
      rol: s.rol,
      nota: s.nota,
      personas: porIds(s.personas),
    })),
    comites: c.comites.map((x) => ({ titulo: x.titulo, imagen: estatica(x.imagen, x.ancho, x.alto) })),
  }
}

// ---------------------------------------------------------------------------------------
// Desde el CMS

function imagenDe(medio: unknown, tamano?: 'hero'): ImagenVista | null {
  if (!esMedio(medio)) return null
  const src = urlDeImagen(medio, tamano) ?? (medio.url ? rutaRelativa(medio.url) : null)
  if (!src) return null
  return { src, ancho: medio.width ?? undefined, alto: medio.height ?? undefined }
}

const esExpositor = (v: unknown): v is Expositor => typeof v === 'object' && v !== null && 'nombre' in v

function personaDe(e: Expositor): PersonaVista {
  return {
    id: String(e.id),
    nombre: e.nombre,
    cargo: e.cargo,
    institucion: e.institucion,
    pais: e.pais || undefined,
    foto: imagenDe(e.foto),
    logo: imagenDe(e.logo),
  }
}

const personasDe = (lista: (number | Expositor)[] | null | undefined): PersonaVista[] =>
  (lista ?? []).filter(esExpositor).map(personaDe)

/** El documento debe venir con las relaciones pobladas (depth 2). */
export function vistaDesdeCms(e: Evento): EventoVista {
  const fechaIso = e.fecha.slice(0, 10)
  return {
    slug: e.slug,
    nombre: e.nombre,
    titulo: e.titulo,
    fecha: formatoFechaLarga(fechaIso),
    fechaIso,
    horaInicio: e.horaInicio,
    horaFin: e.horaFin,
    lugar: e.lugar,
    ciudad: e.ciudad,
    direccion: e.direccion,
    mapa: e.mapa,
    hashtag: e.hashtag ?? '',
    correo: e.correo,
    textoBoton: e.textoBoton,
    descripcionSeo: e.descripcionSeo || undefined,
    banner: imagenDe(e.banner, 'hero'),
    imagenEvento: imagenDe(e.imagenEvento),
    tituloIntro: e.tituloIntro,
    parrafos: (e.parrafos ?? []).map((p) => p.texto),
    certificacion: (e.certificacion ?? []).map((c) => c.nombre),
    redes: (e.redes ?? []).map((r) => ({ red: r.red, url: r.url })),
    organizador: { nombre: e.organizador.nombre, logo: imagenDe(e.organizador.logo) },
    colaboran: (e.colaboran ?? []).map((c) => ({ nombre: c.nombre, url: c.url || undefined, logo: imagenDe(c.logo) })),
    expositores: personasDe(e.expositores),
    programa: (e.programa ?? []).map((s) => ({
      hora: s.hora,
      titulo: s.titulo,
      rol: s.rol || undefined,
      nota: s.nota || undefined,
      personas: personasDe(s.personas),
    })),
    comites: (e.comites ?? []).map((c) => ({ titulo: c.titulo, imagen: imagenDe(c.imagen) })),
  }
}

// ---------------------------------------------------------------------------------------
// Textos derivados (buscadores)

export function descripcionDelEvento(v: EventoVista): string {
  return (
    v.descripcionSeo ||
    `${v.nombre}: “${v.titulo}”. ${v.fecha}, ${v.lugar}. Conferencias, mesas de conversación y certificación. Inscripción abierta.`
  )
}

/** Marcado Event de buscadores (Google "Eventos"). */
export function datosEstructurados(v: EventoVista, urlPagina: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: v.nombre,
    description: `${v.titulo}. ${v.tituloIntro}`,
    startDate: `${v.fechaIso}T${v.horaInicio}:00-03:00`,
    endDate: `${v.fechaIso}T${v.horaFin}:00-03:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: urlPagina,
    location: {
      '@type': 'Place',
      name: v.lugar,
      address: {
        '@type': 'PostalAddress',
        streetAddress: v.direccion.split(',')[0].trim(),
        addressLocality: v.ciudad,
        addressCountry: 'PY',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: v.organizador.nombre,
      url: 'https://uap.edu.py/',
    },
  }
}
