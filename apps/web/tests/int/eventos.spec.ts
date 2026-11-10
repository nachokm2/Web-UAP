// Eventos contra PostgreSQL real: carga inicial del Summit, permisos por rol, borradores
// ocultos al público y que el contenido cargado en el CMS equivale al de respaldo en código.

import type { Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import { limpiarCacheCompleta } from '@/lib/cache'
import { obtenerEvento } from '@/lib/datos'
import { CONTENIDO_SUMMIT, SLUG_SUMMIT } from '@/lib/eventos/contenidoSummit'
import { sembrarSummit } from '@/lib/eventos/sembrar'
import { vistaDesdeCms, vistaDesdeContenido, type EventoVista } from '@/lib/eventos/vista'
import type { Evento, Usuario } from '@/payload-types'

import { asegurarSuperAdminInicial, crearUsuario, esperarRechazo, payloadDeTest } from '../helpers'

let payload: Payload
let admin: Usuario
let superadmin: Usuario
let edNoticias: Usuario
let lectura: Usuario

const como = (usuario: Usuario | null) => ({
  user: usuario ? { ...usuario, collection: 'usuarios' as const } : undefined,
  overrideAccess: false,
})

/** La vista sin las direcciones de las imágenes (cambian: estáticas vs. del CMS). */
const sinRutas = (v: EventoVista) =>
  JSON.parse(
    JSON.stringify(v, (clave, valor) =>
      valor && typeof valor === 'object' && 'src' in valor ? { ancho: valor.ancho, alto: valor.alto, hay: Boolean(valor.src) } : valor,
    ),
  )

beforeAll(async () => {
  payload = await payloadDeTest()
  await asegurarSuperAdminInicial(payload)
  superadmin = await crearUsuario(payload, ['superadmin'])
  admin = await crearUsuario(payload, ['admin'])
  edNoticias = await crearUsuario(payload, ['editor_noticias'])
  lectura = await crearUsuario(payload, ['lectura'])
})

describe('Carga inicial del Summit', () => {
  it('crea el evento, los expositores y las imágenes', async () => {
    expect(await sembrarSummit(payload)).toBe('creado')
    const eventos = await payload.count({ collection: 'eventos', where: { slug: { equals: SLUG_SUMMIT } }, overrideAccess: true })
    expect(eventos.totalDocs).toBe(1)
    const expositores = await payload.count({ collection: 'expositores', overrideAccess: true })
    expect(expositores.totalDocs).toBe(CONTENIDO_SUMMIT.expositores.length)
  })

  it('sube cada imagen una sola vez, aunque varios expositores compartan el logo', async () => {
    const c = CONTENIDO_SUMMIT
    const archivos = new Set([
      c.banner,
      c.imagenEvento,
      c.organizador.logo,
      ...c.colaboran.map((x) => x.logo),
      ...c.expositores.flatMap((e) => [e.foto, e.logo]),
      ...c.comites.map((x) => x.imagen),
    ])
    const medios = await payload.find({
      collection: 'medios',
      where: { origen: { like: 'semilla:summit-2026/' } },
      limit: 100,
      depth: 0,
      overrideAccess: true,
    })
    expect(medios.totalDocs).toBe(archivos.size)
  })

  it('es idempotente: una segunda carga no duplica nada', async () => {
    expect(await sembrarSummit(payload)).toBe('ya_existia')
    const eventos = await payload.count({ collection: 'eventos', overrideAccess: true })
    expect(eventos.totalDocs).toBe(1)
    const expositores = await payload.count({ collection: 'expositores', overrideAccess: true })
    expect(expositores.totalDocs).toBe(CONTENIDO_SUMMIT.expositores.length)
  })

  it('lo cargado en el CMS equivale al contenido de respaldo (la página no cambia)', async () => {
    limpiarCacheCompleta()
    const { estado, evento } = await obtenerEvento(SLUG_SUMMIT)
    expect(estado).toBe('publicado')
    const delCms = vistaDesdeCms(evento as Evento)
    const delCodigo = vistaDesdeContenido(CONTENIDO_SUMMIT)
    // Las imágenes del CMS traen su tamaño real; en el respaldo solo los comités traen medidas.
    const normal = (v: EventoVista) => {
      const s = sinRutas(v)
      s.comites = s.comites.map((c: { titulo: string }) => ({ titulo: c.titulo }))
      for (const campo of ['banner', 'imagenEvento']) s[campo] = { hay: Boolean(s[campo]?.hay) }
      s.organizador.logo = { hay: Boolean(s.organizador.logo?.hay) }
      s.colaboran = s.colaboran.map((x: { nombre: string; url?: string; logo: unknown }) => ({ nombre: x.nombre, url: x.url, logo: Boolean(x.logo) }))
      const persona = (p: { foto: unknown; logo: unknown; id: string }) => ({ ...p, id: '', foto: Boolean(p.foto), logo: Boolean(p.logo) })
      s.expositores = s.expositores.map(persona)
      s.programa = s.programa.map((x: { personas: never[] }) => ({ ...x, personas: x.personas.map(persona) }))
      return s
    }
    expect(normal(delCms)).toEqual(normal(delCodigo))
  })

  it('la fecha guardada no se corre de día', async () => {
    const { docs } = await payload.find({ collection: 'eventos', where: { slug: { equals: SLUG_SUMMIT } }, overrideAccess: true, depth: 0 })
    expect(docs[0].fecha.slice(0, 10)).toBe('2026-11-19')
  })
})

describe('Permisos', () => {
  let eventoId: number
  beforeAll(async () => {
    const { docs } = await payload.find({ collection: 'eventos', where: { slug: { equals: SLUG_SUMMIT } }, overrideAccess: true, depth: 0 })
    eventoId = docs[0].id
  })

  it('el Administrador edita el contenido y publica', async () => {
    const editado = await payload.update({ collection: 'eventos', id: eventoId, data: { lugar: 'Otro salón' }, ...como(admin) })
    expect(editado.lugar).toBe('Otro salón')
    expect(editado._status).toBe('published')
    await payload.update({ collection: 'eventos', id: eventoId, data: { lugar: CONTENIDO_SUMMIT.lugar }, ...como(admin) })
  })

  it('un Administrador no puede cambiar la dirección de la página', async () => {
    await payload.update({ collection: 'eventos', id: eventoId, data: { slug: 'otra-direccion' }, ...como(admin) })
    const { docs } = await payload.find({ collection: 'eventos', where: { id: { equals: eventoId } }, overrideAccess: true, depth: 0 })
    expect(docs[0].slug).toBe(SLUG_SUMMIT)
  })

  it('un Super Admin sí puede cambiarla', async () => {
    await payload.update({ collection: 'eventos', id: eventoId, data: { slug: 'temporal-summit' }, ...como(superadmin) })
    await payload.update({ collection: 'eventos', id: eventoId, data: { slug: SLUG_SUMMIT }, ...como(superadmin) })
    const { docs } = await payload.find({ collection: 'eventos', where: { id: { equals: eventoId } }, overrideAccess: true, depth: 0 })
    expect(docs[0].slug).toBe(SLUG_SUMMIT)
  })

  it('un editor de otra sección y el rol de solo lectura no pueden editar', async () => {
    for (const usuario of [edNoticias, lectura]) {
      await expect(
        payload.update({ collection: 'eventos', id: eventoId, data: { lugar: 'No debería' }, ...como(usuario) }),
      ).rejects.toThrow()
    }
  })

  it('solo un Super Admin elimina de forma definitiva', async () => {
    await expect(payload.delete({ collection: 'eventos', id: eventoId, ...como(admin) })).rejects.toThrow()
  })

  it('rechaza enlaces que no empiecen con https:// y horas mal escritas', async () => {
    await esperarRechazo(
      payload.update({ collection: 'eventos', id: eventoId, data: { mapa: 'javascript:alert(1)' }, ...como(admin) }),
      /https:\/\//,
    )
    await esperarRechazo(
      payload.update({ collection: 'eventos', id: eventoId, data: { horaInicio: '25:99' }, ...como(admin) }),
      /24 horas/,
    )
  })
})

describe('Visibilidad para el público', () => {
  it('un evento en borrador no se ve sin sesión y la página lo trata como oculto', async () => {
    const base = (await payload.find({ collection: 'eventos', where: { slug: { equals: SLUG_SUMMIT } }, overrideAccess: true, depth: 0 })).docs[0]
    const borrador = await payload.create({
      collection: 'eventos',
      data: {
        nombre: 'Evento en borrador',
        titulo: 'Lema',
        slug: 'evento-en-borrador',
        fecha: '2027-05-10T12:00:00.000Z',
        horaInicio: '09:00',
        horaFin: '12:00',
        lugar: 'Lugar',
        ciudad: 'Asunción',
        direccion: 'Calle 1',
        mapa: 'https://maps.google.com/?q=x',
        correo: 'evento@uap.edu.py',
        textoBoton: 'Inscribirme',
        banner: typeof base.banner === 'number' ? base.banner : base.banner.id,
        tituloIntro: 'Intro',
        organizador: { nombre: 'UAP' },
        _status: 'draft',
      },
      draft: true,
      ...como(admin),
    })
    expect(borrador._status).toBe('draft')

    const publico = await payload.find({ collection: 'eventos', where: { slug: { equals: 'evento-en-borrador' } }, overrideAccess: false })
    expect(publico.totalDocs).toBe(0)

    limpiarCacheCompleta()
    expect((await obtenerEvento('evento-en-borrador')).estado).toBe('oculto')
    expect((await obtenerEvento('no-existe-este-evento')).estado).toBe('sin_cargar')
    expect((await obtenerEvento(SLUG_SUMMIT)).estado).toBe('publicado')
  })
})
