// Máquina de estados del workflow editorial. Pura y sin dependencias de Payload,
// para poder probarla aislada; el endpoint de transición la usa para validar.

import { esAprobador, puedeEditarSeccion, type Seccion, type UsuarioConRoles } from '../access/roles'

export const ESTADOS = {
  borrador: 'Borrador',
  en_revision: 'En revisión',
  publicado: 'Publicado',
  no_publicado: 'No publicado',
  archivado: 'Archivado',
} as const

export type Estado = keyof typeof ESTADOS

export const LISTA_ESTADOS = Object.keys(ESTADOS) as Estado[]

type Quien = 'editor' | 'aprobador'

export type Transicion = {
  de: Estado
  a: Estado
  quien: Quien
  /** Texto del botón en el panel. */
  accion: string
}

export const TRANSICIONES: readonly Transicion[] = [
  { de: 'borrador', a: 'en_revision', quien: 'editor', accion: 'Enviar a revisión' },
  { de: 'en_revision', a: 'borrador', quien: 'editor', accion: 'Volver a borrador' },
  { de: 'en_revision', a: 'publicado', quien: 'aprobador', accion: 'Aprobar y publicar' },
  { de: 'borrador', a: 'publicado', quien: 'aprobador', accion: 'Publicar' },
  { de: 'publicado', a: 'no_publicado', quien: 'aprobador', accion: 'Despublicar' },
  { de: 'publicado', a: 'archivado', quien: 'aprobador', accion: 'Archivar' },
  { de: 'no_publicado', a: 'publicado', quien: 'aprobador', accion: 'Volver a publicar' },
  { de: 'no_publicado', a: 'archivado', quien: 'aprobador', accion: 'Archivar' },
  { de: 'no_publicado', a: 'borrador', quien: 'editor', accion: 'Volver a borrador' },
  { de: 'archivado', a: 'borrador', quien: 'aprobador', accion: 'Restaurar como borrador' },
]

/** Estados que hacen visible el contenido en el sitio público. */
export const ESTADOS_PUBLICOS: readonly Estado[] = ['publicado']

function puedeComo(usuario: UsuarioConRoles, seccion: Seccion, quien: Quien): boolean {
  return quien === 'aprobador' ? esAprobador(usuario) : puedeEditarSeccion(usuario, seccion)
}

/** Transiciones que este usuario puede ejecutar desde el estado actual. */
export function transicionesDisponibles(
  usuario: UsuarioConRoles,
  seccion: Seccion,
  desde: Estado,
): Transicion[] {
  return TRANSICIONES.filter((t) => t.de === desde && puedeComo(usuario, seccion, t.quien))
}

export type ResultadoValidacion = { ok: true; transicion: Transicion } | { ok: false; motivo: string }

export function validarTransicion(
  usuario: UsuarioConRoles,
  seccion: Seccion,
  desde: Estado,
  hacia: Estado,
): ResultadoValidacion {
  if (!(hacia in ESTADOS)) return { ok: false, motivo: `El estado "${hacia}" no existe.` }
  if (desde === hacia) return { ok: false, motivo: `El contenido ya está en "${ESTADOS[hacia]}".` }
  const transicion = TRANSICIONES.find((t) => t.de === desde && t.a === hacia)
  if (!transicion) {
    return { ok: false, motivo: `No se puede pasar de "${ESTADOS[desde]}" a "${ESTADOS[hacia]}".` }
  }
  if (!puedeComo(usuario, seccion, transicion.quien)) {
    return {
      ok: false,
      motivo:
        transicion.quien === 'aprobador'
          ? 'Solo un Administrador o Super Admin puede hacer este cambio.'
          : 'No tiene permiso para editar esta sección.',
    }
  }
  return { ok: true, transicion }
}
