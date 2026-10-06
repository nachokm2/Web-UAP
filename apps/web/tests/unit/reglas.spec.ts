import { describe, expect, it } from 'vitest'

import {
  esAprobador,
  puedeEditarSeccion,
  puedeEliminar,
  puedeGestionarUsuarios,
  puedeSubirArchivos,
  puedeVerAuditoria,
  tieneAcceso,
  type Rol,
} from '@/access/roles'
import { diffDocumentos, textoDeRichText } from '@/audit/diff'
import { esRutaDelSistema, normalizarRuta } from '@/collections/sistema'
import { normalizarSlug } from '@/fields/slug'
import { transicionesDisponibles, validarTransicion } from '@/workflow/estados'

const u = (...roles: Rol[]) => ({ roles, activo: true })

describe('Matriz de roles', () => {
  it('cada editor solo edita su sección', () => {
    expect(puedeEditarSeccion(u('editor_carreras'), 'carreras')).toBe(true)
    expect(puedeEditarSeccion(u('editor_carreras'), 'posgrados')).toBe(false)
    expect(puedeEditarSeccion(u('editor_posgrados'), 'posgrados')).toBe(true)
    expect(puedeEditarSeccion(u('editor_noticias'), 'noticias')).toBe(true)
    expect(puedeEditarSeccion(u('editor_noticias'), 'carreras')).toBe(false)
  })

  it('administradores editan todo y publican; editores no publican', () => {
    for (const s of ['carreras', 'posgrados', 'noticias'] as const) {
      expect(puedeEditarSeccion(u('admin'), s)).toBe(true)
      expect(puedeEditarSeccion(u('superadmin'), s)).toBe(true)
    }
    expect(esAprobador(u('admin'))).toBe(true)
    expect(esAprobador(u('editor_carreras', 'editor_noticias'))).toBe(false)
  })

  it('solo lectura entra al panel pero no edita ni sube archivos', () => {
    expect(tieneAcceso(u('lectura'))).toBe(true)
    expect(puedeEditarSeccion(u('lectura'), 'carreras')).toBe(false)
    expect(puedeSubirArchivos(u('lectura'))).toBe(false)
  })

  it('usuarios y eliminación definitiva solo para Super Admin; auditoría para aprobadores', () => {
    expect(puedeGestionarUsuarios(u('admin'))).toBe(false)
    expect(puedeGestionarUsuarios(u('superadmin'))).toBe(true)
    expect(puedeEliminar(u('admin'))).toBe(false)
    expect(puedeVerAuditoria(u('admin'))).toBe(true)
    expect(puedeVerAuditoria(u('editor_posgrados'))).toBe(false)
  })

  it('un usuario desactivado o sin roles no tiene ningún permiso', () => {
    expect(tieneAcceso({ roles: ['superadmin'], activo: false })).toBe(false)
    expect(esAprobador({ roles: ['admin'], activo: false })).toBe(false)
    expect(tieneAcceso({ roles: [] })).toBe(false)
    expect(tieneAcceso(null)).toBe(false)
  })
})

describe('Workflow editorial', () => {
  it('el editor envía a revisión pero no publica', () => {
    expect(validarTransicion(u('editor_carreras'), 'carreras', 'borrador', 'en_revision').ok).toBe(true)
    const publicar = validarTransicion(u('editor_carreras'), 'carreras', 'en_revision', 'publicado')
    expect(publicar.ok).toBe(false)
  })

  it('el editor no puede saltarse la revisión ni actuar fuera de su sección', () => {
    expect(validarTransicion(u('editor_carreras'), 'carreras', 'borrador', 'publicado').ok).toBe(false)
    expect(validarTransicion(u('editor_carreras'), 'posgrados', 'borrador', 'en_revision').ok).toBe(false)
  })

  it('el administrador aprueba, despublica, archiva y restaura', () => {
    const admin = u('admin')
    expect(validarTransicion(admin, 'posgrados', 'en_revision', 'publicado').ok).toBe(true)
    expect(validarTransicion(admin, 'posgrados', 'publicado', 'no_publicado').ok).toBe(true)
    expect(validarTransicion(admin, 'posgrados', 'publicado', 'archivado').ok).toBe(true)
    expect(validarTransicion(admin, 'posgrados', 'archivado', 'borrador').ok).toBe(true)
  })

  it('rechaza transiciones inexistentes y estados desconocidos con un motivo legible', () => {
    const r = validarTransicion(u('superadmin'), 'noticias', 'archivado', 'publicado')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.motivo).toMatch(/No se puede pasar de "Archivado" a "Publicado"/)
    expect(validarTransicion(u('superadmin'), 'noticias', 'borrador', 'inventado' as never).ok).toBe(false)
  })

  it('solo lectura no tiene acciones disponibles', () => {
    expect(transicionesDisponibles(u('lectura'), 'carreras', 'borrador')).toEqual([])
    expect(transicionesDisponibles(u('editor_carreras'), 'carreras', 'borrador').map((t) => t.a)).toEqual(['en_revision'])
  })
})

describe('Diff de auditoría', () => {
  it('registra el valor anterior y el nuevo de cada campo', () => {
    const cambios = diffDocumentos(
      { id: 1, nombre: 'MBA', duracion: '18 meses', updatedAt: 'a' },
      { id: 1, nombre: 'MBA', duracion: '20 meses', updatedAt: 'b' },
    )
    expect(cambios).toEqual([{ campo: 'duracion', anterior: '18 meses', nuevo: '20 meses' }])
  })

  it('compara relaciones por ID aunque una venga poblada', () => {
    expect(diffDocumentos({ facultad: 3 }, { facultad: { id: 3, nombre: 'Salud' } })).toEqual([])
    expect(diffDocumentos({ facultad: 3 }, { facultad: { id: 4, nombre: 'Derecho' } })).toEqual([
      { campo: 'facultad', anterior: '3', nuevo: '4' },
    ])
  })

  it('recorre grupos y nunca registra campos sensibles', () => {
    const cambios = diffDocumentos(
      { meta: { title: 'A' }, password: 'x', hash: 'h1', salt: 's1' },
      { meta: { title: 'B' }, password: 'y', hash: 'h2', salt: 's2' },
    )
    expect(cambios).toEqual([{ campo: 'meta.title', anterior: 'A', nuevo: 'B' }])
  })

  it('resume el texto enriquecido como texto plano', () => {
    const rich = (t: string) => ({ root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text: t }] }] } })
    expect(textoDeRichText(rich('Hola'))).toBe('Hola')
    expect(diffDocumentos({ descripcion: rich('Antes') }, { descripcion: rich('Después') })).toEqual([
      { campo: 'descripcion', anterior: 'Antes', nuevo: 'Después' },
    ])
  })

  it('trata vacío, null e indefinido como iguales', () => {
    expect(diffDocumentos({ jornada: '' }, { jornada: null })).toEqual([])
  })
})

describe('Slugs y rutas', () => {
  it('normaliza tildes, ñ, mayúsculas y espacios', () => {
    expect(normalizarSlug('Óptica y Contactología')).toBe('optica-y-contactologia')
    expect(normalizarSlug('  Diseño   Niño ')).toBe('diseno-nino')
  })

  it('normaliza rutas de redirección con barra final, sin dominio ni query', () => {
    expect(normalizarRuta('Contador-Publico')).toBe('/contador-publico/')
    expect(normalizarRuta('https://uap.edu.py/postgrados?x=1')).toBe('/postgrados/')
    expect(normalizarRuta('/wp-content/uploads/a.pdf')).toBe('/wp-content/uploads/a.pdf')
  })

  it('protege /admin y /api sin bloquear páginas que empiezan igual', () => {
    expect(esRutaDelSistema('/admin')).toBe(true)
    expect(esRutaDelSistema('/admin/collections/carreras')).toBe(true)
    expect(esRutaDelSistema('/api/carreras')).toBe(true)
    expect(esRutaDelSistema('/administracion-de-empresas/')).toBe(false)
    expect(esRutaDelSistema('/administracion-publica/')).toBe(false)
    expect(esRutaDelSistema('/apicultura/')).toBe(false)
  })
})
