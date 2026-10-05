// Adaptadores de la matriz de roles (roles.ts) a las funciones de acceso de Payload.

import type { Access, FieldAccess } from 'payload'

import {
  esAprobador,
  esSuperAdmin,
  puedeEditarSeccion,
  puedeEliminar,
  puedeGestionarIntegraciones,
  puedeGestionarSitio,
  puedeSubirArchivos,
  puedeVerAuditoria,
  tieneAcceso,
  type Seccion,
  type UsuarioConRoles,
} from './roles'

const usuario = (u: unknown) => u as UsuarioConRoles

export const nadie: Access = () => false

export const conAcceso: Access = ({ req }) => tieneAcceso(usuario(req.user))

export const soloAprobadores: Access = ({ req }) => esAprobador(usuario(req.user))

export const soloSuperAdmin: Access = ({ req }) => esSuperAdmin(usuario(req.user))

export const gestionDelSitio: Access = ({ req }) => puedeGestionarSitio(usuario(req.user))

export const subidaDeArchivos: Access = ({ req }) => puedeSubirArchivos(usuario(req.user))

export const eliminacionDefinitiva: Access = ({ req }) => puedeEliminar(usuario(req.user))

export const lecturaAuditoria: Access = ({ req }) => puedeVerAuditoria(usuario(req.user))

/**
 * Lectura de contenido editorial: el equipo ve todo (incluye borradores);
 * el público solo lo publicado. Las noticias programadas se ocultan hasta su fecha.
 */
export const lecturaEditorial =
  (opciones: { conFechaDePublicacion?: boolean } = {}): Access =>
  ({ req }) => {
    if (tieneAcceso(usuario(req.user))) return true
    const publicado = { _status: { equals: 'published' } }
    if (!opciones.conFechaDePublicacion) return publicado
    return { and: [publicado, { fechaPublicacion: { less_than_equal: new Date().toISOString() } }] }
  }

/**
 * Crear o editar en una sección. Publicar (enviar _status "published") queda
 * reservado a aprobadores: un editor que lo intente por la API recibe 403.
 */
export const edicionDeSeccion =
  (seccion: Seccion): Access =>
  ({ req, data }) => {
    const u = usuario(req.user)
    if (!puedeEditarSeccion(u, seccion)) return false
    if ((data as { _status?: string } | undefined)?._status === 'published' && !esAprobador(u)) return false
    return true
  }

export const campoSoloAprobadores: FieldAccess = ({ req }) => esAprobador(usuario(req.user))

export const campoSoloSuperAdmin: FieldAccess = ({ req }) => esSuperAdmin(usuario(req.user))

export const campoIntegraciones: FieldAccess = ({ req }) => puedeGestionarIntegraciones(usuario(req.user))
