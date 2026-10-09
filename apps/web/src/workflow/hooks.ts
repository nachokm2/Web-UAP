// Integración del workflow editorial con Payload.
//
// Payload maneja dos niveles: el documento publicado (lo que ve el público) y la
// última versión (borrador de trabajo). El campo `estado` describe la última
// versión; `_status` de Payload decide qué es público. Este módulo los mantiene
// coherentes y garantiza que solo los aprobadores publiquen o despubliquen.

import {
  addDataAndFileToRequest,
  APIError,
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeOperationHook,
  type CollectionSlug,
  type Endpoint,
  type PayloadRequest,
} from 'payload'

import { esAprobador, type Seccion, type UsuarioConRoles } from '../access/roles'
import { registrarAuditoria } from '../audit/hooks'
import { ESTADOS, validarTransicion, type Estado } from './estados'

/** Clave de `req.context` con la que el endpoint indica el estado destino ya validado. */
export const CONTEXTO_TRANSICION = 'transicionEditorial'

const prohibido = (mensaje: string) => new APIError(mensaje, 403, null, true)

/**
 * Los editores solo guardan borradores. Publicar, despublicar, restaurar versiones
 * y modificar directamente la versión publicada queda para aprobadores. Se evalúa
 * en cada operación real (no en las consultas de permisos del panel).
 */
export const reglasDeEdicion: CollectionBeforeOperationHook = ({ args, operation, overrideAccess, req }) => {
  if (overrideAccess) return args
  const usuario = req.user as UsuarioConRoles
  if (esAprobador(usuario)) return args

  const a = args as { draft?: boolean; data?: { _status?: string } }
  if (operation === 'restoreVersion') {
    throw prohibido('Solo un Administrador puede restaurar versiones anteriores.')
  }
  if ((operation === 'create' || operation === 'update') && a.data?._status === 'published') {
    throw prohibido('No tiene permiso para publicar. Use "Enviar a revisión" para que un Administrador lo apruebe.')
  }
  if (operation === 'update' && !a.draft) {
    throw prohibido('Los editores solo pueden guardar borradores. Un Administrador publica los cambios.')
  }
  return args
}

/** Mantiene `estado` coherente con lo que hizo la operación. Ignora lo que envíe el formulario. */
export const sincronizarEstado: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req, context }) => {
  const destino = context?.[CONTEXTO_TRANSICION] as Estado | undefined
  if (destino) {
    data.estado = destino
    return data
  }
  if (operation === 'create') {
    data.estado = data._status === 'published' ? 'publicado' : 'borrador'
    return data
  }

  const previo = ((originalDoc as { estado?: Estado } | undefined)?.estado ?? 'borrador') as Estado
  if (previo === 'archivado') {
    if (!esAprobador(req.user as UsuarioConRoles)) {
      throw prohibido('Este contenido está archivado. Un Administrador debe restaurarlo antes de editarlo.')
    }
    if (data._status === 'published') {
      throw prohibido('Restaure el contenido como borrador antes de volver a publicarlo.')
    }
  }

  if (data._status === 'published') data.estado = 'publicado'
  else data.estado = previo === 'publicado' ? 'borrador' : previo
  return data
}

type DocConEstado = { id: string | number; estado?: Estado; _status?: string } & Record<string, unknown>

function mensajeDeValidacion(error: unknown): string {
  if (error instanceof ValidationError) {
    const campos = (error.data?.errors ?? [])
      .map((e) => (typeof e.label === 'string' ? e.label : e.path))
      .filter(Boolean)
    return campos.length
      ? `Para publicar falta completar: ${campos.join(', ')}.`
      : 'Hay campos obligatorios sin completar.'
  }
  return error instanceof Error ? error.message : 'No se pudo cambiar el estado.'
}

export type ResultadoTransicion =
  | { status: 200; body: { ok: true; estado: Estado; mensaje: string } }
  | { status: 400 | 401 | 403 | 404; body: { error: string } }

/**
 * Cambia el estado editorial de un documento si el usuario de `req` puede hacerlo.
 * Lo usa el endpoint REST y los tests; los rechazos quedan en la auditoría.
 */
export async function ejecutarTransicion(
  req: PayloadRequest,
  coleccion: CollectionSlug,
  seccion: Seccion,
  id: string,
  hacia: Estado,
): Promise<ResultadoTransicion> {
  if (!req.user) return { status: 401, body: { error: 'Debe iniciar sesión.' } }

  let actual: DocConEstado
  try {
    actual = (await req.payload.findByID({
      collection: coleccion,
      id,
      draft: true,
      depth: 0,
      overrideAccess: false,
      req,
    })) as unknown as DocConEstado
  } catch {
    return { status: 404, body: { error: 'El contenido no existe o no tiene acceso.' } }
  }

  const desde = actual.estado ?? 'borrador'
  const validacion = validarTransicion(req.user as UsuarioConRoles, seccion, desde, hacia)
  if (!validacion.ok) {
    await registrarAuditoria(req, [
      {
        accion: 'transicion_rechazada',
        coleccion,
        documentoId: id,
        documentoTitulo: tituloDe(actual),
        campo: 'estado',
        valorAnterior: ESTADOS[desde] ?? desde,
        valorNuevo: hacia in ESTADOS ? ESTADOS[hacia] : String(hacia),
      },
    ])
    return { status: 403, body: { error: validacion.motivo } }
  }

  const publicar = hacia === 'publicado'
  const retirarDelSitio = hacia === 'no_publicado' || hacia === 'archivado'
  try {
    const doc = (await req.payload.update({
      collection: coleccion,
      id,
      // Publicar o retirar del sitio escribe la versión principal; el resto son borradores.
      draft: !(publicar || retirarDelSitio),
      data: { _status: publicar ? 'published' : 'draft' } as never,
      depth: 0,
      overrideAccess: true,
      req,
      context: { [CONTEXTO_TRANSICION]: hacia },
    })) as unknown as DocConEstado
    return { status: 200, body: { ok: true, estado: doc.estado as Estado, mensaje: `Estado actualizado: ${ESTADOS[hacia]}.` } }
  } catch (error) {
    return { status: 400, body: { error: mensajeDeValidacion(error) } }
  }
}

/** POST /api/{coleccion}/:id/transicion  { "estado": "en_revision" } */
export const endpointTransicion = (coleccion: CollectionSlug, seccion: Seccion): Endpoint => ({
  path: '/:id/transicion',
  method: 'post',
  handler: async (req) => {
    await addDataAndFileToRequest(req)
    const id = String(req.routeParams?.id ?? '')
    const hacia = (req.data as { estado?: string } | undefined)?.estado as Estado
    const { status, body } = await ejecutarTransicion(req, coleccion, seccion, id, hacia)
    return Response.json(body, { status })
  },
})

function tituloDe(doc: Record<string, unknown>): string {
  return String(doc.nombre ?? doc.titulo ?? doc.id ?? '')
}
