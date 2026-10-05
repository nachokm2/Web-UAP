// Matriz de permisos del CMS. Es la única fuente de verdad de quién puede hacer qué:
// las funciones de acceso de Payload y el workflow editorial se construyen sobre esto.
// Se aplica en el servidor en cada operación (no solo en la interfaz).

export const ROLES = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  editor_carreras: 'Editor de Carreras',
  editor_posgrados: 'Editor de Postgrados',
  editor_noticias: 'Editor de Noticias',
  lectura: 'Solo lectura',
} as const

export type Rol = keyof typeof ROLES

export const TODOS_LOS_ROLES = Object.keys(ROLES) as Rol[]

/** Secciones editoriales; cada una tiene su rol de editor. */
export type Seccion = 'carreras' | 'posgrados' | 'noticias'

const EDITOR_DE: Record<Seccion, Rol> = {
  carreras: 'editor_carreras',
  posgrados: 'editor_posgrados',
  noticias: 'editor_noticias',
}

/** Forma mínima del usuario autenticado que necesitan estas reglas. */
export type UsuarioConRoles = {
  roles?: readonly Rol[] | null
  activo?: boolean | null
} | null | undefined

export function tieneRol(usuario: UsuarioConRoles, ...roles: Rol[]): boolean {
  if (!usuario || usuario.activo === false || !Array.isArray(usuario.roles)) return false
  return usuario.roles.some((rol) => roles.includes(rol))
}

/** Cualquier usuario activo con al menos un rol: puede entrar al panel y ver borradores. */
export const tieneAcceso = (u: UsuarioConRoles) => tieneRol(u, ...TODOS_LOS_ROLES)

export const esSuperAdmin = (u: UsuarioConRoles) => tieneRol(u, 'superadmin')

/** Publicar, despublicar, archivar y aprobar revisiones. */
export const esAprobador = (u: UsuarioConRoles) => tieneRol(u, 'superadmin', 'admin')

export const puedeEditarSeccion = (u: UsuarioConRoles, seccion: Seccion) =>
  esAprobador(u) || tieneRol(u, EDITOR_DE[seccion])

export const puedeSubirArchivos = (u: UsuarioConRoles) =>
  tieneRol(u, 'superadmin', 'admin', 'editor_carreras', 'editor_posgrados', 'editor_noticias')

/** Eliminar contenido de forma definitiva: solo Super Admin. El resto archiva. */
export const puedeEliminar = (u: UsuarioConRoles) => esSuperAdmin(u)

export const puedeGestionarUsuarios = (u: UsuarioConRoles) => esSuperAdmin(u)

export const puedeVerAuditoria = (u: UsuarioConRoles) => esAprobador(u)

/** Facultades, sedes, categorías, redirecciones y configuración general del sitio. */
export const puedeGestionarSitio = (u: UsuarioConRoles) => esAprobador(u)

/** Integraciones (formulario Bitrix, etc.): solo Super Admin. */
export const puedeGestionarIntegraciones = (u: UsuarioConRoles) => esSuperAdmin(u)
