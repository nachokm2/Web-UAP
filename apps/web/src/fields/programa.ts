// Campos comunes de Carreras y Posgrados ("programas"). Cada colección agrega
// sus campos específicos en la pestaña General.

import type { Field, Tab } from 'payload'

import { campoSoloAprobadores } from '../access'

export const MODALIDADES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'virtual', label: 'Virtual (Campus Virtual)' },
  { value: 'hibrida', label: 'Híbrida' },
  { value: 'presencial_y_distancia', label: 'Presencial y a distancia' },
]

const texto = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'richText',
  admin: description ? { description } : undefined,
})

export const pestanaGeneral = (especificos: Field[]): Tab => ({
  label: 'General',
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    {
      name: 'nombreCorto',
      label: 'Nombre corto',
      type: 'text',
      admin: { description: 'Para menús y tarjetas. Ej.: "Ing. en Informática".' },
    },
    ...especificos,
    {
      type: 'row',
      fields: [
        { name: 'duracion', label: 'Duración', type: 'text', admin: { description: 'Ej.: "8 semestres", "5 meses".' } },
        { name: 'modalidad', label: 'Modalidad', type: 'select', options: MODALIDADES },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'jornada', label: 'Jornada', type: 'text', admin: { description: 'Ej.: "Nocturna", "Sábados".' } },
        { name: 'sedes', label: 'Sedes', type: 'relationship', relationTo: 'sedes', hasMany: true },
      ],
    },
    {
      name: 'descripcionCorta',
      label: 'Descripción corta',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'Texto de 1 o 2 oraciones para las tarjetas del listado (máx. 300 caracteres).' },
    },
  ],
})

export const pestanaContenido = (extra: Field[] = []): Tab => ({
  label: 'Contenido',
  fields: [
    texto('descripcion', 'Descripción'),
    texto('objetivo', 'Objetivo'),
    ...extra,
    texto('perfilIngreso', 'Perfil de ingreso'),
    texto('perfilEgreso', 'Perfil de egreso'),
    texto('campoLaboral', 'Campo laboral'),
    texto('requisitos', 'Requisitos de admisión'),
    {
      name: 'seccionesAdicionales',
      label: 'Secciones adicionales',
      type: 'array',
      labels: { singular: 'Sección', plural: 'Secciones' },
      admin: { description: 'Misión, visión, competencias u otra sección propia del programa.' },
      fields: [
        { name: 'titulo', label: 'Título', type: 'text', required: true },
        { name: 'contenido', label: 'Contenido', type: 'richText', required: true },
      ],
    },
  ],
})

export const pestanaPlanDeEstudios = (unidad: 'Semestre' | 'Módulo'): Tab => ({
  label: 'Plan de estudios',
  fields: [
    {
      name: 'malla',
      label: 'Malla curricular',
      type: 'array',
      labels: { singular: unidad, plural: unidad === 'Semestre' ? 'Semestres' : 'Módulos' },
      admin: { description: `Un elemento por ${unidad.toLowerCase()}, en orden.` },
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, admin: { description: `Ej.: "1° ${unidad}".` } },
        {
          name: 'asignaturas',
          label: 'Asignaturas',
          type: 'array',
          labels: { singular: 'Asignatura', plural: 'Asignaturas' },
          fields: [{ name: 'nombre', label: 'Nombre', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'mallaPdf',
      label: 'Malla en PDF',
      type: 'upload',
      relationTo: 'documentos',
      filterOptions: { tipo: { equals: 'malla' } },
    },
  ],
})

export const pestanaArchivos: Tab = {
  label: 'Imágenes y documentos',
  fields: [
    {
      name: 'imagenPrincipal',
      label: 'Imagen principal',
      type: 'upload',
      relationTo: 'medios',
      admin: { description: 'Foto horizontal de al menos 1600 px de ancho.' },
    },
    { name: 'galeria', label: 'Galería', type: 'upload', relationTo: 'medios', hasMany: true },
    {
      name: 'brochure',
      label: 'Brochure (PDF)',
      type: 'upload',
      relationTo: 'documentos',
      filterOptions: { tipo: { equals: 'brochure' } },
    },
    { name: 'documentos', label: 'Otros documentos', type: 'upload', relationTo: 'documentos', hasMany: true },
  ],
}

export const pestanaContacto: Tab = {
  label: 'Contacto',
  description: 'Solo si este programa tiene datos distintos a los generales del sitio.',
  fields: [
    {
      name: 'contacto',
      label: 'Contacto propio',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'whatsapp', label: 'WhatsApp', type: 'text', admin: { description: 'Solo números, con código de país.' } },
          ],
        },
      ],
    },
    {
      name: 'cta',
      label: 'Botón de llamado a la acción',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'texto', label: 'Texto', type: 'text', admin: { description: 'Ej.: "Solicita información".' } },
            { name: 'url', label: 'Enlace', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'formularioBitrix',
      label: 'Formulario Bitrix propio',
      type: 'text',
      access: { update: campoSoloAprobadores },
      admin: { description: 'Código del formulario (ej.: inline/61/hi7fex). Vacío = el formulario general.' },
    },
  ],
}

export const campoOrden: Field = {
  name: 'orden',
  label: 'Orden en el listado',
  type: 'number',
  defaultValue: 100,
  admin: { position: 'sidebar', description: 'Menor número = aparece antes.' },
}
