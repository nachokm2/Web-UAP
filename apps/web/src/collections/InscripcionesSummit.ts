// Inscripciones de asistentes al V Summit Internacional UAP 2026 (formulario de la landing
// /summit-internacional-uap2026/). Tabla simple: una fila por persona inscripta.
//
// Son datos personales: solo los ven los administradores y nadie puede crear filas por la API
// pública (POST /api/inscripciones-summit queda cerrado). Las inscripciones entran únicamente
// por la acción del servidor de la landing, que valida y guarda con la API local.

import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { eliminacionDefinitiva, nadie, soloAprobadores } from '../access'

const normalizarCorreo: CollectionBeforeValidateHook = ({ data }) => {
  if (data && typeof data.email === 'string') data.email = data.email.trim().toLowerCase()
  return data
}

export const InscripcionesSummit: CollectionConfig = {
  slug: 'inscripciones-summit',
  typescript: { interface: 'InscripcionSummit' },
  labels: { singular: 'Inscripción al Summit', plural: 'Inscripciones al Summit' },
  admin: {
    group: 'Eventos',
    useAsTitle: 'email',
    defaultColumns: ['nombre', 'apellido', 'empresa', 'email', 'telefono', 'pais', 'createdAt'],
    listSearchableFields: ['nombre', 'apellido', 'empresa', 'email', 'pais'],
    description:
      'Personas que se inscribieron para asistir al V Summit Internacional UAP 2026 desde el formulario de la landing. Solo lectura: las inscripciones llegan desde el sitio.',
  },
  defaultSort: '-createdAt',
  access: { read: soloAprobadores, create: nadie, update: nadie, delete: eliminacionDefinitiva },
  hooks: { beforeValidate: [normalizarCorreo] },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 80 },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true, maxLength: 80 },
    { name: 'empresa', label: 'Empresa / Institución', type: 'text', maxLength: 150 },
    {
      name: 'email',
      label: 'Correo electrónico',
      type: 'email',
      required: true,
      unique: true,
      admin: { description: 'Único: una misma persona no se inscribe dos veces.' },
    },
    { name: 'telefono', label: 'Teléfono', type: 'text', maxLength: 25 },
    { name: 'pais', label: 'País', type: 'text', required: true, maxLength: 80 },
  ],
}
