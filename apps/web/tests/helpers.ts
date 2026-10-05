import config from '@payload-config'
import { createLocalReq, getPayload, type Payload, type PayloadRequest } from 'payload'

import type { Rol } from '@/access/roles'
import type { Usuario } from '@/payload-types'

let instancia: Payload | null = null

export async function payloadDeTest(): Promise<Payload> {
  instancia ??= await getPayload({ config })
  return instancia
}

let contador = 0

/** Crea un usuario con los roles indicados (como lo haría un Super Admin). */
export async function crearUsuario(payload: Payload, roles: Rol[], extra: Partial<Usuario> = {}): Promise<Usuario> {
  contador += 1
  return payload.create({
    collection: 'usuarios',
    data: {
      nombre: `Usuario ${roles.join('+')} ${contador}`,
      email: `test${contador}-${Date.now()}@uap.test`,
      password: 'clave-de-prueba-segura',
      roles,
      activo: true,
      ...extra,
    },
    overrideAccess: true,
  })
}

/** Petición local autenticada como `usuario` (para probar permisos sin HTTP). */
export function reqDe(payload: Payload, usuario: Usuario | null): Promise<PayloadRequest> {
  return createLocalReq({ user: usuario ? { ...usuario, collection: 'usuarios' } : undefined }, payload)
}

/**
 * Con la base vacía, el primer usuario creado pasa a ser Super Admin (regla de
 * "Crear primer usuario"). Se crea antes que los demás para que los roles de
 * prueba sean los pedidos.
 */
export async function asegurarSuperAdminInicial(payload: Payload): Promise<void> {
  const { totalDocs } = await payload.count({ collection: 'usuarios', overrideAccess: true })
  if (totalDocs === 0) await crearUsuario(payload, ['superadmin'], { nombre: 'Super Admin inicial' })
}

/** Espera que la promesa falle con un mensaje que coincida (incluye los errores de validación por campo). */
export async function esperarRechazo(promesa: Promise<unknown>, patron: RegExp): Promise<void> {
  try {
    await promesa
  } catch (e) {
    const err = e as { message?: string; data?: { errors?: { message?: string }[] } }
    const texto = [err.message, ...(err.data?.errors ?? []).map((x) => x.message)].join(' | ')
    if (!patron.test(texto)) throw new Error(`Falló con otro motivo: ${texto}`)
    return
  }
  throw new Error(`Se esperaba un rechazo que coincida con ${patron}, pero la operación se completó.`)
}
