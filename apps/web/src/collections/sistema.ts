// Colecciones de sistema: Redirecciones y Auditoría.

import type { CollectionConfig, TextFieldSingleValidation } from 'payload'

import { gestionDelSitio, lecturaAuditoria, nadie } from '../access'
import { ACCIONES, auditarCambios, auditarEliminacion } from '../audit/hooks'

/** "/Psicologia" → "/psicologia/". Las URLs del sitio llevan barra final, como el WordPress anterior. */
export function normalizarRuta(ruta: string): string {
  let r = ruta.trim()
  try {
    if (/^https?:\/\//i.test(r)) r = new URL(r).pathname
  } catch {
    /* se valida abajo */
  }
  r = r.split(/[?#]/)[0].toLowerCase()
  if (!r.startsWith('/')) r = '/' + r
  if (!/\.[a-z0-9]{2,5}$/.test(r) && !r.endsWith('/')) r += '/'
  return r.replace(/\/{2,}/g, '/')
}

const validarDesde: TextFieldSingleValidation = (value) => {
  if (!value) return 'Indique la dirección de origen.'
  if (!value.startsWith('/')) return 'Debe empezar con "/". Ej.: /contador-publico/'
  if (value.startsWith('/admin') || value.startsWith('/api/')) return 'No se pueden redirigir rutas del sistema.'
  return true
}

export const Redirecciones: CollectionConfig = {
  slug: 'redirecciones',
  typescript: { interface: 'Redireccion' },
  labels: { singular: 'Redirección', plural: 'Redirecciones' },
  admin: {
    group: 'Configuración',
    useAsTitle: 'desde',
    defaultColumns: ['desde', 'tipo', 'destinoTipo', 'origen', 'updatedAt'],
    description:
      'Envía a los visitantes de una URL antigua a la nueva. Se crean solas al cambiar la dirección web de un contenido publicado.',
  },
  access: { read: () => true, create: gestionDelSitio, update: gestionDelSitio, delete: gestionDelSitio },
  hooks: {
    afterChange: [auditarCambios],
    afterDelete: [auditarEliminacion],
  },
  fields: [
    {
      name: 'desde',
      label: 'URL de origen',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      validate: validarDesde,
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' && value ? normalizarRuta(value) : value)] },
      admin: { description: 'Solo la ruta, por ejemplo /contador-publico/' },
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      defaultValue: '301',
      options: [
        { value: '301', label: '301 · Movida definitivamente' },
        { value: '302', label: '302 · Temporal' },
        { value: '410', label: '410 · Eliminada (sin destino)' },
      ],
    },
    {
      name: 'destinoTipo',
      label: 'Destino',
      type: 'radio',
      defaultValue: 'interno',
      options: [
        { value: 'interno', label: 'Contenido del sitio' },
        { value: 'url', label: 'Otra URL' },
      ],
      admin: { layout: 'horizontal', condition: (_, s) => s?.tipo !== '410' },
    },
    {
      name: 'destino',
      label: 'Contenido de destino',
      type: 'relationship',
      relationTo: ['carreras', 'posgrados', 'noticias'],
      admin: { condition: (_, s) => s?.tipo !== '410' && s?.destinoTipo !== 'url' },
      validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.tipo === '410' || siblingData?.destinoTipo === 'url' || value ? true : 'Elija el contenido de destino.',
    },
    {
      name: 'url',
      label: 'URL de destino',
      type: 'text',
      admin: { condition: (_, s) => s?.tipo !== '410' && s?.destinoTipo === 'url', description: 'Ruta interna (/postgrados/) o URL completa (https://…).' },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: Record<string, unknown> }) => {
        if (siblingData?.tipo === '410' || siblingData?.destinoTipo !== 'url') return true
        if (!value) return 'Indique la URL de destino.'
        return value.startsWith('/') || /^https:\/\//.test(value) ? true : 'Use una ruta que empiece con "/" o una URL https://'
      },
    },
    {
      name: 'origen',
      label: 'Origen',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { value: 'manual', label: 'Manual' },
        { value: 'automatica', label: 'Automática (cambio de dirección)' },
        { value: 'migracion', label: 'Migración del sitio anterior' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
}

export const Auditoria: CollectionConfig = {
  slug: 'auditoria',
  labels: { singular: 'Registro de auditoría', plural: 'Auditoría' },
  admin: {
    group: 'Sistema',
    useAsTitle: 'documentoTitulo',
    defaultColumns: ['createdAt', 'usuarioNombre', 'accion', 'coleccion', 'documentoTitulo', 'campo', 'valorAnterior', 'valorNuevo'],
    listSearchableFields: ['documentoTitulo', 'usuarioNombre', 'campo'],
    description: 'Historial de cambios. Es de solo lectura: nadie puede editarlo ni borrarlo.',
    pagination: { defaultLimit: 50 },
  },
  defaultSort: '-createdAt',
  // Solo se escribe desde hooks del servidor (overrideAccess). Ningún usuario lo modifica.
  access: { read: lecturaAuditoria, create: nadie, update: nadie, delete: nadie },
  fields: [
    { name: 'usuario', label: 'Usuario', type: 'relationship', relationTo: 'usuarios', index: true },
    { name: 'usuarioNombre', label: 'Usuario', type: 'text' },
    { name: 'usuarioEmail', label: 'Email', type: 'text' },
    {
      name: 'accion',
      label: 'Acción',
      type: 'select',
      required: true,
      index: true,
      options: Object.entries(ACCIONES).map(([value, label]) => ({ value, label })),
    },
    { name: 'coleccion', label: 'Tipo de contenido', type: 'text', required: true, index: true },
    { name: 'documentoId', label: 'ID del contenido', type: 'text', required: true, index: true },
    { name: 'documentoTitulo', label: 'Contenido', type: 'text' },
    { name: 'campo', label: 'Campo', type: 'text' },
    { name: 'valorAnterior', label: 'Valor anterior', type: 'textarea' },
    { name: 'valorNuevo', label: 'Valor nuevo', type: 'textarea' },
  ],
}
