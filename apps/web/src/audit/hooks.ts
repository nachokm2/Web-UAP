// Registro de auditoría: una fila por campo modificado, escrita en la misma
// transacción que el cambio (si el guardado falla, no queda registro huérfano).

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterLoginHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { ESTADOS, type Estado } from '../workflow/estados'
import { diffDocumentos } from './diff'

export const ACCIONES = {
  creacion: 'Creación',
  actualizacion: 'Actualización',
  cambio_estado: 'Cambio de estado',
  eliminacion: 'Eliminación',
  inicio_sesion: 'Inicio de sesión',
  transicion_rechazada: 'Cambio de estado rechazado',
} as const

export type Accion = keyof typeof ACCIONES

export type EntradaAuditoria = {
  accion: Accion
  coleccion: string
  documentoId: string
  documentoTitulo?: string
  campo?: string | null
  valorAnterior?: string | null
  valorNuevo?: string | null
}

/** Clave de `req.context` para que scripts (migración, seed) se identifiquen en el registro. */
export const CONTEXTO_ACTOR = 'actorAuditoria'

type UsuarioAuditable = { id?: string | number; nombre?: string; email?: string } | null

export async function registrarAuditoria(
  req: PayloadRequest,
  entradas: EntradaAuditoria[],
  usuarioExplicito?: UsuarioAuditable,
): Promise<void> {
  if (!entradas.length) return
  const usuario = usuarioExplicito ?? (req.user as UsuarioAuditable)
  const actor = (req.context?.[CONTEXTO_ACTOR] as string | undefined) ?? 'Sistema'
  for (const e of entradas) {
    await req.payload.create({
      collection: 'auditoria',
      data: {
        ...e,
        usuario: usuario?.id ?? null,
        usuarioNombre: usuario ? usuario.nombre || usuario.email || String(usuario.id) : actor,
        usuarioEmail: usuario?.email ?? null,
      } as never,
      overrideAccess: true,
      depth: 0,
      req,
    })
  }
}

function tituloDe(doc: Record<string, unknown> | null | undefined): string {
  if (!doc) return ''
  return String(doc.nombre ?? doc.titulo ?? doc.from ?? doc.email ?? doc.filename ?? doc.id ?? '')
}

const etiquetaEstado = (v: string | null) => (v && v in ESTADOS ? ESTADOS[v as Estado] : v)

export const auditarCambios: CollectionAfterChangeHook = async ({ collection, doc, previousDoc, operation, req }) => {
  const base = {
    coleccion: collection.slug,
    documentoId: String(doc.id),
    documentoTitulo: tituloDe(doc),
  }
  if (operation === 'create') {
    await registrarAuditoria(req, [{ ...base, accion: 'creacion' }])
    return doc
  }
  const cambios = diffDocumentos(previousDoc, doc)
  await registrarAuditoria(
    req,
    cambios.map((c) =>
      c.campo === 'estado'
        ? { ...base, accion: 'cambio_estado', campo: 'estado', valorAnterior: etiquetaEstado(c.anterior), valorNuevo: etiquetaEstado(c.nuevo) }
        : { ...base, accion: 'actualizacion', campo: c.campo, valorAnterior: c.anterior, valorNuevo: c.nuevo },
    ),
  )
  return doc
}

export const auditarEliminacion: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  await registrarAuditoria(req, [
    { accion: 'eliminacion', coleccion: collection.slug, documentoId: String(doc.id), documentoTitulo: tituloDe(doc) },
  ])
  return doc
}

export const auditarGlobal: GlobalAfterChangeHook = async ({ global, doc, previousDoc, req }) => {
  const cambios = diffDocumentos(previousDoc, doc)
  await registrarAuditoria(
    req,
    cambios.map((c) => ({
      accion: 'actualizacion' as const,
      coleccion: global.slug,
      documentoId: global.slug,
      documentoTitulo: typeof global.label === 'string' ? global.label : global.slug,
      campo: c.campo,
      valorAnterior: c.anterior,
      valorNuevo: c.nuevo,
    })),
  )
  return doc
}

export const auditarInicioSesion: CollectionAfterLoginHook = async ({ collection, req, user }) => {
  const u = user as UsuarioAuditable
  await registrarAuditoria(
    req,
    [{ accion: 'inicio_sesion', coleccion: collection.slug, documentoId: String(u?.id ?? ''), documentoTitulo: u?.email ?? '' }],
    u,
  )
  return user
}
