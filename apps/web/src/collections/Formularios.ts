// Formularios de postulación por asesor o campaña. Cada uno vive en su propia dirección
// (uap.edu.py/formulario-de-postulacion-uap-…/) y usa su formulario de Bitrix24, que es el
// que asigna la negociación directamente a esa persona.

import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { eliminacionDefinitiva, gestionDelSitio } from '../access'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'
import { campoSlug, ESPACIO_URL_PROGRAMAS } from '../fields/slug'
import { leerCodigoBitrix } from '../lib/bitrix'

/** Guarda aparte el formulario y el loader detectados en el código pegado. */
const completarBitrix: CollectionBeforeChangeHook = ({ data }) => {
  const datos = leerCodigoBitrix(data.codigoBitrix as string | undefined)
  if (datos) {
    data.bitrixFormulario = datos.formulario
    data.bitrixLoaderUrl = datos.loaderUrl
  }
  return data
}

export const Formularios: CollectionConfig = {
  slug: 'formularios',
  typescript: { interface: 'FormularioPostulacion' },
  labels: { singular: 'Formulario de postulación', plural: 'Formularios de postulación' },
  admin: {
    group: 'Admisión',
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'asesor', 'slug', 'activo', 'updatedAt'],
    listSearchableFields: ['titulo', 'asesor', 'slug'],
    description:
      'Un formulario de Bitrix24 por asesor o campaña, cada uno en su dirección. La postulación le llega a quien Bitrix24 tenga asignado ese formulario. Para un asesor nuevo: cree el formulario en Bitrix24, cree aquí la ficha y pegue el código de inserción.',
  },
  defaultSort: 'titulo',
  access: { read: () => true, create: gestionDelSitio, update: gestionDelSitio, delete: eliminacionDefinitiva },
  hooks: { beforeChange: [completarBitrix], afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    {
      name: 'titulo',
      label: 'Título',
      type: 'text',
      required: true,
      admin: { description: 'Se muestra en la página, p. ej. "Formulario de Postulación UAP – Tamara".' },
    },
    { name: 'asesor', label: 'Asesor o campaña', type: 'text', admin: { description: 'Para encontrarlo en el panel; no se muestra en el sitio.' } },
    campoSlug({
      desde: 'titulo',
      espacioCompartido: ESPACIO_URL_PROGRAMAS,
      enRaizDelSitio: true,
      descripcion:
        'Final de la URL que comparte el asesor, p. ej. "formulario-de-postulacion-uap-tamara". Si la cambia, el enlace que ya circula deja de funcionar.',
    }),
    {
      name: 'codigoBitrix',
      label: 'Código de inserción de Bitrix24',
      type: 'textarea',
      required: true,
      validate: (value: string | null | undefined) =>
        leerCodigoBitrix(value)
          ? true
          : 'Pegue el código completo que entrega Bitrix24 para insertar el formulario en un sitio (incluye "data-b24-form" y la dirección del loader de cdn.bitrix24.es).',
      admin: { rows: 6 },
    },
    {
      name: 'bitrixFormulario',
      label: 'Formulario detectado',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar', description: 'Se completa solo a partir del código.' },
    },
    { name: 'bitrixLoaderUrl', type: 'text', admin: { hidden: true } },
    {
      name: 'activo',
      label: 'Publicado',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Si se desactiva, su dirección lleva al formulario general de inscripción.' },
    },
  ],
}
