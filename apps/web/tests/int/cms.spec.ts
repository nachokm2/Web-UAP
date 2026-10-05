// Tests de integración contra PostgreSQL real (base uap_web_test, se recrea en cada corrida).
// Usan la API local de Payload con `overrideAccess: false` para aplicar los permisos
// exactamente como en una petición real de cada rol.

import type { Payload } from 'payload'
import sharp from 'sharp'
import { beforeAll, describe, expect, it } from 'vitest'

import type { Carrera, Usuario } from '@/payload-types'
import { ejecutarTransicion } from '@/workflow/hooks'

import { asegurarSuperAdminInicial, crearUsuario, esperarRechazo, payloadDeTest, reqDe } from '../helpers'

let payload: Payload
let superadmin: Usuario
let admin: Usuario
let edCarreras: Usuario
let edPosgrados: Usuario
let edNoticias: Usuario
let lectura: Usuario

const como = (usuario: Usuario | null) => ({
  user: usuario ? { ...usuario, collection: 'usuarios' as const } : undefined,
  overrideAccess: false,
})

const transicion = async (usuario: Usuario, coleccion: 'carreras' | 'posgrados' | 'noticias', id: number, a: string) =>
  ejecutarTransicion(await reqDe(payload, usuario), coleccion, coleccion, String(id), a as never)

let n = 0
const unico = (base: string) => `${base}-${++n}-${Date.now().toString(36)}`

async function crearCarreraBorrador(nombre = unico('carrera test')) {
  return payload.create({ collection: 'carreras', data: { nombre }, draft: true, ...como(edCarreras) })
}

beforeAll(async () => {
  payload = await payloadDeTest()
  await asegurarSuperAdminInicial(payload)
  superadmin = await crearUsuario(payload, ['superadmin'])
  admin = await crearUsuario(payload, ['admin'])
  edCarreras = await crearUsuario(payload, ['editor_carreras'])
  edPosgrados = await crearUsuario(payload, ['editor_posgrados'])
  edNoticias = await crearUsuario(payload, ['editor_noticias'])
  lectura = await crearUsuario(payload, ['lectura'])
})

describe('Permisos por rol', () => {
  it('el editor de carreras crea un borrador de carrera', async () => {
    const c = await crearCarreraBorrador()
    expect(c.estado).toBe('borrador')
    expect(c._status).toBe('draft')
  })

  it('cada editor queda limitado a su sección', async () => {
    await expect(
      payload.create({ collection: 'posgrados', data: { nombre: unico('pos'), tipo: 'diplomado' }, draft: true, ...como(edCarreras) }),
    ).rejects.toThrow()
    await expect(
      payload.create({ collection: 'noticias', data: { titulo: unico('nota') }, draft: true, ...como(edPosgrados) }),
    ).rejects.toThrow()
  })

  it('solo lectura no puede crear ni subir archivos', async () => {
    await expect(payload.create({ collection: 'carreras', data: { nombre: unico('x') }, draft: true, ...como(lectura) })).rejects.toThrow()
  })

  it('un editor no puede publicar directamente, ni al crear ni al editar', async () => {
    await expect(
      payload.create({ collection: 'carreras', data: { nombre: unico('pub'), _status: 'published' } as never, ...como(edCarreras) }),
    ).rejects.toThrow(/No tiene permiso para publicar/)
    const c = await crearCarreraBorrador()
    await expect(
      payload.update({ collection: 'carreras', id: c.id, data: { _status: 'published' }, ...como(edCarreras) }),
    ).rejects.toThrow(/No tiene permiso para publicar/)
  })

  it('un editor solo guarda borradores: editar sin draft (la versión publicada) es rechazado', async () => {
    const c = await crearCarreraBorrador()
    await expect(
      payload.update({ collection: 'carreras', id: c.id, data: { duracion: '8 semestres' }, draft: true, ...como(edCarreras) }),
    ).resolves.toMatchObject({ duracion: '8 semestres' })
    await expect(
      payload.update({ collection: 'carreras', id: c.id, data: { duracion: '10 semestres' }, ...como(edCarreras) }),
    ).rejects.toThrow(/solo pueden guardar borradores/)
  })

  it('eliminar definitivamente es solo de Super Admin', async () => {
    const c = await crearCarreraBorrador()
    await expect(payload.delete({ collection: 'carreras', id: c.id, ...como(edCarreras) })).rejects.toThrow()
    await expect(payload.delete({ collection: 'carreras', id: c.id, ...como(admin) })).rejects.toThrow()
    await expect(payload.delete({ collection: 'carreras', id: c.id, ...como(superadmin) })).resolves.toBeTruthy()
  })

  it('el público solo ve contenido publicado; el equipo ve también borradores', async () => {
    const borrador = await crearCarreraBorrador()
    const publicada = await crearCarreraBorrador()
    await transicion(admin, 'carreras', publicada.id, 'publicado')

    const publico = await payload.find({ collection: 'carreras', limit: 500, ...como(null) })
    const ids = publico.docs.map((d) => d.id)
    expect(ids).toContain(publicada.id)
    expect(ids).not.toContain(borrador.id)

    const equipo = await payload.find({ collection: 'carreras', limit: 500, draft: true, ...como(lectura) })
    expect(equipo.docs.map((d) => d.id)).toContain(borrador.id)
  })

  it('usuarios: solo Super Admin los gestiona; cada uno ve solo su perfil', async () => {
    await expect(
      payload.create({ collection: 'usuarios', data: { nombre: 'X', email: `x${Date.now()}@uap.test`, password: 'clave-larga-segura', roles: ['admin'] }, ...como(admin) }),
    ).rejects.toThrow()
    const vistos = await payload.find({ collection: 'usuarios', ...como(admin) })
    expect(vistos.docs.map((d) => d.id)).toEqual([admin.id])
    const todos = await payload.find({ collection: 'usuarios', limit: 100, ...como(superadmin) })
    expect(todos.totalDocs).toBeGreaterThanOrEqual(7)
  })

  it('un usuario no puede darse más permisos a sí mismo', async () => {
    const actualizado = await payload.update({ collection: 'usuarios', id: edNoticias.id, data: { roles: ['superadmin'] }, ...como(edNoticias) })
    expect(actualizado.roles).toEqual(['editor_noticias'])
  })
})

describe('Workflow editorial', () => {
  it('ciclo completo: borrador → revisión → (editor no publica) → administrador publica', async () => {
    const c = await crearCarreraBorrador()

    const enviar = await transicion(edCarreras, 'carreras', c.id, 'en_revision')
    expect(enviar.status).toBe(200)

    const intento = await transicion(edCarreras, 'carreras', c.id, 'publicado')
    expect(intento.status).toBe(403)

    const rechazo = await payload.find({
      collection: 'auditoria',
      where: { and: [{ documentoId: { equals: String(c.id) } }, { accion: { equals: 'transicion_rechazada' } }] },
      overrideAccess: true,
    })
    expect(rechazo.totalDocs).toBe(1)
    expect(rechazo.docs[0].usuarioNombre).toBe(edCarreras.nombre)

    const aprobar = await transicion(admin, 'carreras', c.id, 'publicado')
    expect(aprobar).toMatchObject({ status: 200, body: { estado: 'publicado' } })
    const publica = await payload.findByID({ collection: 'carreras', id: c.id, ...como(null) })
    expect(publica._status).toBe('published')
  })

  it('editar algo publicado no cambia el sitio hasta que se aprueba', async () => {
    const c = await crearCarreraBorrador('Nombre original')
    await transicion(admin, 'carreras', c.id, 'publicado')

    const borrador = await payload.update({ collection: 'carreras', id: c.id, data: { nombre: 'Nombre corregido' }, draft: true, ...como(edCarreras) })
    expect(borrador.estado).toBe('borrador')
    expect((await payload.findByID({ collection: 'carreras', id: c.id, ...como(null) })).nombre).toBe('Nombre original')

    await transicion(edCarreras, 'carreras', c.id, 'en_revision')
    await transicion(admin, 'carreras', c.id, 'publicado')
    expect((await payload.findByID({ collection: 'carreras', id: c.id, ...como(null) })).nombre).toBe('Nombre corregido')
  })

  it('despublicar y archivar retiran el contenido del sitio; lo archivado no se edita', async () => {
    const c = await crearCarreraBorrador()
    await transicion(admin, 'carreras', c.id, 'publicado')
    expect((await transicion(admin, 'carreras', c.id, 'no_publicado')).status).toBe(200)
    await expect(payload.findByID({ collection: 'carreras', id: c.id, ...como(null) })).rejects.toThrow()

    expect((await transicion(admin, 'carreras', c.id, 'archivado')).status).toBe(200)
    await expect(
      payload.update({ collection: 'carreras', id: c.id, data: { jornada: 'Noche' }, draft: true, ...como(edCarreras) }),
    ).rejects.toThrow(/archivado/)

    expect((await transicion(admin, 'carreras', c.id, 'borrador')).status).toBe(200)
  })

  it('publicar exige los campos obligatorios y lo explica', async () => {
    const p = await payload.create({ collection: 'posgrados', data: { nombre: unico('sin tipo') } as never, draft: true, ...como(edPosgrados) })
    const r = await transicion(admin, 'posgrados', p.id, 'publicado')
    expect(r.status).toBe(400)
    expect('error' in r.body && r.body.error).toMatch(/Tipo de programa/)
  })
})

describe('Auditoría de cambios', () => {
  it('registra usuario, campo, valor anterior y nuevo (ejemplo del brief: MBA 18 → 20 meses)', async () => {
    const mba = await payload.create({
      collection: 'posgrados',
      data: { nombre: unico('MBA'), tipo: 'maestria', duracion: '18 meses' },
      draft: true,
      ...como(edPosgrados),
    })
    await payload.update({ collection: 'posgrados', id: mba.id, data: { duracion: '20 meses' }, draft: true, ...como(edPosgrados) })

    const { docs } = await payload.find({
      collection: 'auditoria',
      where: { and: [{ documentoId: { equals: String(mba.id) } }, { campo: { equals: 'duracion' } }] },
      ...como(admin),
    })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({
      accion: 'actualizacion',
      coleccion: 'posgrados',
      usuarioNombre: edPosgrados.nombre,
      valorAnterior: '18 meses',
      valorNuevo: '20 meses',
    })

    await transicion(edPosgrados, 'posgrados', mba.id, 'en_revision')
    const estado = await payload.find({
      collection: 'auditoria',
      where: { and: [{ documentoId: { equals: String(mba.id) } }, { accion: { equals: 'cambio_estado' } }] },
      ...como(admin),
    })
    expect(estado.docs[0]).toMatchObject({ valorAnterior: 'Borrador', valorNuevo: 'En revisión' })
  })

  it('es de solo lectura para todos, incluido el Super Admin; los editores no la ven', async () => {
    const { docs } = await payload.find({ collection: 'auditoria', limit: 1, ...como(superadmin) })
    await expect(payload.update({ collection: 'auditoria', id: docs[0].id, data: { valorNuevo: 'x' }, ...como(superadmin) })).rejects.toThrow()
    await expect(payload.delete({ collection: 'auditoria', id: docs[0].id, ...como(superadmin) })).rejects.toThrow()
    await expect(payload.find({ collection: 'auditoria', ...como(edCarreras) })).rejects.toThrow()
  })
})

describe('Publicación programada de noticias', () => {
  it('una noticia aprobada con fecha futura no se ve hasta esa fecha', async () => {
    const futura = await payload.create({
      collection: 'noticias',
      data: { titulo: unico('Futura'), fechaPublicacion: new Date(Date.now() + 86_400_000).toISOString() },
      draft: true,
      ...como(edNoticias),
    })
    const pasada = await payload.create({
      collection: 'noticias',
      data: { titulo: unico('Pasada'), fechaPublicacion: new Date(Date.now() - 60_000).toISOString() },
      draft: true,
      ...como(edNoticias),
    })
    await transicion(admin, 'noticias', futura.id, 'publicado')
    await transicion(admin, 'noticias', pasada.id, 'publicado')

    const publico = await payload.find({ collection: 'noticias', limit: 100, ...como(null) })
    const ids = publico.docs.map((d) => d.id)
    expect(ids).toContain(pasada.id)
    expect(ids).not.toContain(futura.id)
  })
})

describe('Direcciones web y redirecciones', () => {
  it('genera el slug desde el nombre, sin tildes', async () => {
    const c = await payload.create({ collection: 'carreras', data: { nombre: `Óptica y Contactología ${++n}` }, draft: true, ...como(edCarreras) })
    expect(c.slug).toBe(`optica-y-contactologia-${n}`)
  })

  it('no permite la misma dirección en una carrera y un posgrado, ni rutas reservadas', async () => {
    const slug = unico('derecho')
    await payload.create({ collection: 'carreras', data: { nombre: 'Derecho', slug }, draft: true, ...como(edCarreras) })
    await esperarRechazo(
      payload.create({ collection: 'posgrados', data: { nombre: 'Derecho posgrado', slug, tipo: 'diplomado' }, draft: true, ...como(edPosgrados) }),
      /Ya existe un contenido en "carreras"/,
    )
    await esperarRechazo(
      payload.create({ collection: 'carreras', data: { nombre: 'Admin', slug: 'admin' }, draft: true, ...como(edCarreras) }),
      /reservado/,
    )
  })

  it('cambiar la dirección de algo publicado crea una redirección 301', async () => {
    const anterior = unico('contador-publico')
    const c = await payload.create({ collection: 'carreras', data: { nombre: 'Contaduría', slug: anterior }, draft: true, ...como(edCarreras) })
    await transicion(admin, 'carreras', c.id, 'publicado')
    const nuevo = unico('contaduria-publica')
    await payload.update({ collection: 'carreras', id: c.id, data: { slug: nuevo, _status: 'published' }, ...como(admin) })

    const { docs } = await payload.find({ collection: 'redirecciones', where: { desde: { equals: `/${anterior}/` } }, overrideAccess: true })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toMatchObject({ tipo: '301', destinoTipo: 'interno', origen: 'automatica' })
    expect((docs[0].destino as { relationTo: string; value: number | Carrera }).relationTo).toBe('carreras')
  })
})

describe('Seguridad de cuentas', () => {
  it('rechaza contraseñas de menos de 12 caracteres', async () => {
    await expect(crearUsuario(payload, ['lectura'], { password: 'corta' } as never)).rejects.toThrow(/al menos 12/)
  })

  it('una cuenta desactivada no puede iniciar sesión', async () => {
    const email = `inactivo${Date.now()}@uap.test`
    await crearUsuario(payload, ['editor_noticias'], { email, activo: false })
    await expect(payload.login({ collection: 'usuarios', data: { email, password: 'clave-de-prueba-segura' } })).rejects.toThrow(/desactivada/)
  })
})

describe('Archivos', () => {
  const pngReal = () => sharp({ create: { width: 1200, height: 800, channels: 3, background: '#003366' } }).png().toBuffer()
  const PDF_MINIMO = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 10 10]>>endobj\nxref\n0 4\n0000000000 65535 f \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF\n',
  )

  it('acepta una imagen real y genera versiones livianas', async () => {
    const data = await pngReal()
    const img = await payload.create({
      collection: 'medios',
      data: { alt: 'Prueba' },
      file: { data, mimetype: 'image/png', name: 'prueba.png', size: data.length },
      ...como(edCarreras),
    })
    expect(img.mimeType).toBe('image/png')
    expect(img.sizes?.miniatura?.filename).toBeTruthy()
  })

  it('rechaza un archivo que no es imagen aunque diga .jpg', async () => {
    const data = Buffer.from('esto no es una imagen, es texto')
    await expect(
      payload.create({ collection: 'medios', data: { alt: 'x' }, file: { data, mimetype: 'image/jpeg', name: 'falsa.jpg', size: data.length }, ...como(edCarreras) }),
    ).rejects.toThrow()
  })

  it('acepta un PDF válido y rechaza uno falso', async () => {
    const ok = await payload.create({
      collection: 'documentos',
      data: { titulo: 'Brochure prueba', tipo: 'brochure' },
      file: { data: PDF_MINIMO, mimetype: 'application/pdf', name: 'brochure.pdf', size: PDF_MINIMO.length },
      ...como(edPosgrados),
    })
    expect(ok.mimeType).toBe('application/pdf')
    const falso = Buffer.from('<html>no soy un pdf</html>')
    await expect(
      payload.create({
        collection: 'documentos',
        data: { titulo: 'Falso', tipo: 'otro' },
        file: { data: falso, mimetype: 'application/pdf', name: 'falso.pdf', size: falso.length },
        ...como(edPosgrados),
      }),
    ).rejects.toThrow()
  })

  it('rechaza imágenes de más de 10 MB con un mensaje claro', async () => {
    const data = Buffer.alloc(10 * 1024 * 1024 + 1)
    await expect(
      payload.create({ collection: 'medios', data: { alt: 'x' }, file: { data, mimetype: 'image/png', name: 'enorme.png', size: data.length }, ...como(edCarreras) }),
    ).rejects.toThrow(/máximo es 10 MB/)
  })

  it('solo lectura no puede subir archivos', async () => {
    const data = await pngReal()
    await expect(
      payload.create({ collection: 'medios', data: { alt: 'x' }, file: { data, mimetype: 'image/png', name: 'x.png', size: data.length }, ...como(lectura) }),
    ).rejects.toThrow()
  })
})

// Al final: modifica los roles de los Super Admin de prueba.
describe('Protección del último Super Admin', () => {
  it('no se puede dejar el sistema sin un Super Admin activo', async () => {
    const { docs } = await payload.find({
      collection: 'usuarios',
      where: { and: [{ roles: { contains: 'superadmin' } }, { activo: { not_equals: false } }] },
      limit: 100,
      overrideAccess: true,
    })
    const [ultimo, ...resto] = docs
    for (const u of resto) {
      await payload.update({ collection: 'usuarios', id: u.id, data: { roles: ['admin'] }, overrideAccess: true })
    }
    await expect(
      payload.update({ collection: 'usuarios', id: ultimo.id, data: { roles: ['admin'] }, overrideAccess: true }),
    ).rejects.toThrow(/último Super Admin/)
    await expect(
      payload.update({ collection: 'usuarios', id: ultimo.id, data: { activo: false }, overrideAccess: true }),
    ).rejects.toThrow(/último Super Admin/)
  })
})
