// Carga inicial del V Summit en el CMS: sube las imágenes de /public/images/summit-2026,
// crea los expositores y el evento con el contenido de contenidoSummit.ts. Es idempotente:
// si el evento ya existe no toca nada, y las imágenes y expositores que ya estén cargados
// se reutilizan en vez de duplicarse. Se ejecuta al iniciar el servidor (instrumentation.ts)
// y también a mano con `npm run sembrar:summit`.

import path from 'node:path'

import type { Payload } from 'payload'

import { CONTEXTO_ACTOR } from '@/audit/hooks'

import { CARPETA_IMAGENES_SUMMIT, CONTENIDO_SUMMIT, type ContenidoEvento } from './contenidoSummit'

const ACTOR = 'Carga inicial del Summit'
// Un objeto NUEVO por cada operación: Payload usa req.context para pasar datos entre sus hooks de
// subida, y compartirlo entre varias subidas hacía que el almacenamiento S3 guardara el contenido de
// la primera imagen para todas las demás (probado con un S3 falso local).
const contexto = () => ({ [CONTEXTO_ACTOR]: ACTOR })
const PREFIJO_ORIGEN = 'semilla:summit-2026/'
/** Marca en `origen` de las imágenes subidas con el contexto corregido (las anteriores quedaron mal en S3). */
const MARCA_OK = '#v2'

export type ResultadoCarga = 'creado' | 'ya_existia'

/** Texto alternativo de cada imagen que se sube (el CMS lo exige). */
function textoAlternativo(c: ContenidoEvento): Map<string, string> {
  const alts = new Map<string, string>()
  alts.set(c.banner, `${c.nombre}: ${c.titulo}. ${formatoCorto(c)}.`)
  alts.set(c.imagenEvento, `${c.nombre}`)
  alts.set(c.organizador.logo, `Logo de ${c.organizador.nombre}`)
  c.colaboran.forEach((x) => alts.set(x.logo, `Logo de ${x.nombre}`))
  c.expositores.forEach((e) => {
    alts.set(e.foto, `Foto de ${e.nombre}`)
    if (!alts.has(e.logo)) alts.set(e.logo, `Logo de ${e.institucion}`)
  })
  c.comites.forEach((x) => alts.set(x.imagen, `Logos del ${x.titulo.toLowerCase()}`))
  return alts
}

const formatoCorto = (c: ContenidoEvento) => `${c.fechaIso.split('-').reverse().join('/')}, ${c.lugar}`

const rutaDelArchivo = (raiz: string, archivo: string) =>
  path.join(raiz, 'public', ...CARPETA_IMAGENES_SUMMIT.split('/').filter(Boolean), archivo)

/**
 * Repara las imágenes del Summit subidas con el defecto anterior (un único objeto de contexto
 * compartido): en S3 quedaron todas con el contenido de la primera. Vuelve a subir el original desde
 * /public y deja la marca para no repetirlo. Devuelve cuántas reparó; si no hay ninguna, no hace nada.
 */
export async function repararImagenesSummit(payload: Payload, raiz: string = process.cwd()): Promise<number> {
  const { docs } = await payload.find({
    collection: 'medios',
    where: { origen: { like: PREFIJO_ORIGEN } },
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })
  let reparadas = 0
  // El filtro se hace acá: `not_like` de Payload no excluye las ya marcadas.
  for (const m of docs.filter((d) => !String(d.origen).endsWith(MARCA_OK))) {
    const archivo = String(m.origen).slice(PREFIJO_ORIGEN.length)
    try {
      await payload.update({
        collection: 'medios',
        id: m.id,
        data: { origen: `${m.origen}${MARCA_OK}` },
        filePath: rutaDelArchivo(raiz, archivo),
        overrideAccess: true,
        context: contexto(),
      })
      reparadas += 1
    } catch (error) {
      console.error(`[eventos] No se pudo reparar la imagen ${archivo}:`, error instanceof Error ? error.message : error)
    }
  }
  return reparadas
}

export async function sembrarSummit(payload: Payload, raiz: string = process.cwd()): Promise<ResultadoCarga> {
  const c = CONTENIDO_SUMMIT
  const existente = await payload.count({
    collection: 'eventos',
    where: { slug: { equals: c.slug } },
    overrideAccess: true,
  })
  if (existente.totalDocs > 0) return 'ya_existia'

  const alts = textoAlternativo(c)
  const medios = new Map<string, number>()
  const subir = async (archivo: string): Promise<number> => {
    const ya = medios.get(archivo)
    if (ya) return ya
    const origen = `${PREFIJO_ORIGEN}${archivo}${MARCA_OK}`
    const previo = await payload.find({
      collection: 'medios',
      where: { origen: { equals: origen } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const id =
      previo.docs[0]?.id ??
      (
        await payload.create({
          collection: 'medios',
          data: { alt: alts.get(archivo) ?? archivo, origen },
          filePath: rutaDelArchivo(raiz, archivo),
          overrideAccess: true,
          context: contexto(),
        })
      ).id
    medios.set(archivo, id)
    return id
  }

  const expositores = new Map<string, number>()
  for (const e of c.expositores) {
    const previo = await payload.find({
      collection: 'expositores',
      where: { nombre: { equals: e.nombre } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const id =
      previo.docs[0]?.id ??
      (
        await payload.create({
          collection: 'expositores',
          data: {
            nombre: e.nombre,
            cargo: e.cargo,
            institucion: e.institucion,
            pais: e.pais,
            foto: await subir(e.foto),
            logo: await subir(e.logo),
          },
          overrideAccess: true,
          context: contexto(),
        })
      ).id
    expositores.set(e.id, id)
  }
  const ids = (lista: string[] = []) => lista.map((x) => expositores.get(x)).filter((x): x is number => x !== undefined)

  await payload.create({
    collection: 'eventos',
    data: {
      nombre: c.nombre,
      titulo: c.titulo,
      slug: c.slug,
      // Mediodía UTC: el selector de "solo fecha" guarda así y no se corre de día.
      fecha: `${c.fechaIso}T12:00:00.000Z`,
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      lugar: c.lugar,
      ciudad: c.ciudad,
      direccion: c.direccion,
      mapa: c.mapa,
      hashtag: c.hashtag,
      correo: c.correo,
      textoBoton: c.textoBoton,
      banner: await subir(c.banner),
      tituloIntro: c.tituloIntro,
      parrafos: c.parrafos.map((texto) => ({ texto })),
      certificacion: c.certificacion.map((nombre) => ({ nombre })),
      imagenEvento: await subir(c.imagenEvento),
      redes: c.redes,
      organizador: { nombre: c.organizador.nombre, logo: await subir(c.organizador.logo) },
      colaboran: await Promise.all(
        c.colaboran.map(async (x) => ({ nombre: x.nombre, url: x.url, logo: await subir(x.logo) })),
      ),
      expositores: ids(c.expositores.map((e) => e.id)),
      programa: c.programa.map((s) => ({
        hora: s.hora,
        titulo: s.titulo,
        rol: s.rol,
        nota: s.nota,
        personas: ids(s.personas),
      })),
      comites: await Promise.all(c.comites.map(async (x) => ({ titulo: x.titulo, imagen: await subir(x.imagen) }))),
      _status: 'published',
    },
    overrideAccess: true,
    context: contexto(),
  })
  return 'creado'
}
