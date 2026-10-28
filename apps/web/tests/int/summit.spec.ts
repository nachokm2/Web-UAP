// Inscripciones al Summit contra PostgreSQL real: permisos de la tabla y acción del servidor.

import type { Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { Usuario } from '@/payload-types'

import { asegurarSuperAdminInicial, crearUsuario, esperarRechazo, payloadDeTest } from '../helpers'

// La acción lee el encabezado x-forwarded-for; en el test cada caso elige su "visitante".
let visitante = '10.0.0.1'
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': visitante }),
}))

let payload: Payload
let admin: Usuario
let editor: Usuario

const como = (usuario: Usuario | null) => ({
  user: usuario ? { ...usuario, collection: 'usuarios' as const } : undefined,
  overrideAccess: false,
})

const formulario = (extra: Record<string, string> = {}) => {
  const fd = new FormData()
  const base = {
    nombre: 'Ana',
    apellido: 'Gómez',
    empresa: 'UAP',
    email: `ana-${Date.now()}-${Math.random().toString(36).slice(2)}@ejemplo.com`,
    telefono: '+595 981 123456',
    pais: 'Paraguay',
    sitio_web: '',
    dibujado_en: String(Date.now() - 60_000),
    ...extra,
  }
  for (const [k, v] of Object.entries(base)) fd.set(k, v)
  return fd
}

const cantidad = async (email: string) =>
  (await payload.count({ collection: 'inscripciones-summit', where: { email: { equals: email } } }))
    .totalDocs

beforeAll(async () => {
  payload = await payloadDeTest()
  await asegurarSuperAdminInicial(payload)
  admin = await crearUsuario(payload, ['admin'])
  editor = await crearUsuario(payload, ['editor_noticias'])
})

describe('Tabla inscripciones-summit: permisos', () => {
  it('el público no puede crear ni leer inscripciones', async () => {
    await esperarRechazo(
      payload.create({
        collection: 'inscripciones-summit',
        data: { nombre: 'X', apellido: 'Y', email: 'x@y.com', pais: 'Paraguay' },
        ...como(null),
      }),
      /permiso|forbidden|not allowed/i,
    )
    await esperarRechazo(
      payload.find({ collection: 'inscripciones-summit', ...como(null) }),
      /permiso|forbidden|not allowed/i,
    )
  })

  it('un editor no ve los datos personales; un administrador sí', async () => {
    await esperarRechazo(
      payload.find({ collection: 'inscripciones-summit', ...como(editor) }),
      /permiso|forbidden|not allowed/i,
    )
    await expect(
      payload.find({ collection: 'inscripciones-summit', ...como(admin) }),
    ).resolves.toBeDefined()
  })

  it('ni siquiera un administrador crea filas a mano: solo entran por el formulario', async () => {
    await esperarRechazo(
      payload.create({
        collection: 'inscripciones-summit',
        data: { nombre: 'X', apellido: 'Y', email: 'x2@y.com', pais: 'Paraguay' },
        ...como(admin),
      }),
      /permiso|forbidden|not allowed/i,
    )
  })
})

describe('Acción inscribirse', () => {
  it('guarda la inscripción con todas las columnas', async () => {
    const { inscribirse } = await import('@/app/(sitio)/summit-internacional-uap2026/acciones')
    visitante = '10.0.1.1'
    const fd = formulario({ email: 'Completa@Ejemplo.com' })
    const r = await inscribirse({ estado: 'inicial' }, fd)
    expect(r).toEqual({ estado: 'ok', nombre: 'Ana' })
    const { docs } = await payload.find({
      collection: 'inscripciones-summit',
      where: { email: { equals: 'completa@ejemplo.com' } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({
      nombre: 'Ana',
      apellido: 'Gómez',
      empresa: 'UAP',
      telefono: '+595 981 123456',
      pais: 'Paraguay',
    })
    expect(docs[0].createdAt).toBeTruthy()
  })

  it('no duplica el mismo correo y responde igual', async () => {
    const { inscribirse } = await import('@/app/(sitio)/summit-internacional-uap2026/acciones')
    visitante = '10.0.2.1'
    const fd = formulario({ email: 'repetida@ejemplo.com' })
    expect((await inscribirse({ estado: 'inicial' }, fd)).estado).toBe('ok')
    expect(
      (await inscribirse({ estado: 'inicial' }, formulario({ email: 'repetida@ejemplo.com' })))
        .estado,
    ).toBe('ok')
    expect(await cantidad('repetida@ejemplo.com')).toBe(1)
  })

  it('devuelve los errores de validación y conserva lo escrito', async () => {
    const { inscribirse } = await import('@/app/(sitio)/summit-internacional-uap2026/acciones')
    visitante = '10.0.3.1'
    const r = await inscribirse({ estado: 'inicial' }, formulario({ email: 'mal', nombre: '' }))
    expect(r.estado).toBe('error')
    if (r.estado === 'error') {
      expect(Object.keys(r.errores ?? {}).sort()).toEqual(['email', 'nombre'])
      expect(r.valores?.apellido).toBe('Gómez')
    }
  })

  it('los robots (campo trampa o envío instantáneo) reciben "ok" pero no se guarda nada', async () => {
    const { inscribirse } = await import('@/app/(sitio)/summit-internacional-uap2026/acciones')
    visitante = '10.0.4.1'
    expect(
      (
        await inscribirse(
          { estado: 'inicial' },
          formulario({ email: 'bot1@ejemplo.com', sitio_web: 'http://spam' }),
        )
      ).estado,
    ).toBe('ok')
    expect(
      (
        await inscribirse(
          { estado: 'inicial' },
          formulario({ email: 'bot2@ejemplo.com', dibujado_en: String(Date.now()) }),
        )
      ).estado,
    ).toBe('ok')
    expect(await cantidad('bot1@ejemplo.com')).toBe(0)
    expect(await cantidad('bot2@ejemplo.com')).toBe(0)
  })

  it('limita los envíos seguidos de un mismo visitante', async () => {
    const { inscribirse } = await import('@/app/(sitio)/summit-internacional-uap2026/acciones')
    visitante = '10.0.5.1'
    const estados: string[] = []
    for (let i = 0; i < 7; i++)
      estados.push((await inscribirse({ estado: 'inicial' }, formulario())).estado)
    expect(estados.slice(0, 5).every((e) => e === 'ok')).toBe(true)
    expect(estados.slice(5)).toEqual(['error', 'error'])
  })
})
