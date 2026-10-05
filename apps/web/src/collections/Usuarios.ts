import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook, type CollectionConfig } from 'payload'

import { campoSoloSuperAdmin, soloSuperAdmin } from '../access'
import { esSuperAdmin, puedeGestionarUsuarios, ROLES, tieneAcceso, type UsuarioConRoles } from '../access/roles'
import { auditarCambios, auditarEliminacion, auditarInicioSesion } from '../audit/hooks'

const LARGO_MINIMO_CLAVE = 12

const error = (mensaje: string, status = 400) => new APIError(mensaje, status, null, true)

async function contarSuperAdminsActivos(req: Parameters<CollectionBeforeChangeHook>[0]['req'], excluirId?: string | number) {
  const { totalDocs } = await req.payload.count({
    collection: 'usuarios',
    where: {
      and: [
        { roles: { contains: 'superadmin' } },
        { activo: { not_equals: false } },
        ...(excluirId !== undefined ? [{ id: { not_equals: excluirId } }] : []),
      ],
    },
    overrideAccess: true,
    req,
  })
  return totalDocs
}

const validarUsuario: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
  if (typeof data.password === 'string' && data.password.length < LARGO_MINIMO_CLAVE) {
    throw error(`La contraseña debe tener al menos ${LARGO_MINIMO_CLAVE} caracteres.`)
  }

  if (operation === 'create') {
    // El primer usuario del sistema (pantalla "Crear primer usuario") es Super Admin.
    const { totalDocs } = await req.payload.count({ collection: 'usuarios', overrideAccess: true, req })
    if (totalDocs === 0) {
      data.roles = ['superadmin']
      data.activo = true
    }
    return data
  }

  // Nunca dejar el sistema sin un Super Admin activo.
  const eraSuperAdminActivo = esSuperAdmin(originalDoc as UsuarioConRoles)
  const seguiraSiendolo = esSuperAdmin({ roles: data.roles ?? originalDoc?.roles, activo: data.activo ?? originalDoc?.activo })
  if (eraSuperAdminActivo && !seguiraSiendolo && (await contarSuperAdminsActivos(req, originalDoc?.id)) === 0) {
    throw error('No se puede quitar el rol ni desactivar al último Super Admin activo.')
  }
  return data
}

const protegerEliminacion: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (String((req.user as { id?: string | number } | null)?.id) === String(id)) {
    throw error('No puede eliminar su propia cuenta.')
  }
  const usuario = await req.payload.findByID({ collection: 'usuarios', id, overrideAccess: true, depth: 0, req })
  if (esSuperAdmin(usuario as UsuarioConRoles) && (await contarSuperAdminsActivos(req, id)) === 0) {
    throw error('No se puede eliminar al último Super Admin activo.')
  }
}

export const Usuarios: CollectionConfig = {
  slug: 'usuarios',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    group: 'Sistema',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'email', 'roles', 'activo'],
    // Solo Super Admin ve la gestión de usuarios en el menú; cada uno puede editar su perfil.
    hidden: ({ user }) => !puedeGestionarUsuarios(user as UsuarioConRoles),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    // El panel solo admite usuarios activos con algún rol.
    admin: ({ req }) => tieneAcceso(req.user as UsuarioConRoles),
    read: ({ req }) => {
      if (esSuperAdmin(req.user as UsuarioConRoles)) return true
      return req.user ? { id: { equals: req.user.id } } : false
    },
    create: soloSuperAdmin,
    update: ({ req, id }) =>
      esSuperAdmin(req.user as UsuarioConRoles) || (!!req.user && String(req.user.id) === String(id)),
    delete: soloSuperAdmin,
    unlock: soloSuperAdmin,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (!tieneAcceso(user as UsuarioConRoles)) {
          throw error('Su cuenta está desactivada o no tiene un rol asignado. Contacte a un Super Admin.', 403)
        }
        return user
      },
    ],
    afterLogin: [auditarInicioSesion],
    beforeChange: [validarUsuario],
    beforeDelete: [protegerEliminacion],
    afterChange: [auditarCambios],
    afterDelete: [auditarEliminacion],
  },
  fields: [
    { name: 'nombre', label: 'Nombre completo', type: 'text', required: true },
    {
      name: 'roles',
      label: 'Roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['lectura'],
      saveToJWT: true,
      options: Object.entries(ROLES).map(([value, label]) => ({ value, label })),
      access: { update: campoSoloSuperAdmin, create: campoSoloSuperAdmin },
      admin: { description: 'Los editores solo guardan borradores; Administrador y Super Admin publican.' },
    },
    {
      name: 'activo',
      label: 'Cuenta activa',
      type: 'checkbox',
      defaultValue: true,
      access: { update: campoSoloSuperAdmin, create: campoSoloSuperAdmin },
      admin: { description: 'Desactivar en lugar de eliminar: conserva el historial y bloquea el acceso de inmediato.' },
    },
  ],
}
