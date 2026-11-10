// Eventos con página propia (hoy, la landing del V Summit Internacional UAP 2026 en
// /summit-internacional-uap2026/). Se edita el contenido: textos, fecha, lugar, imágenes,
// expositores y programa. La estructura de la página (orden de las secciones, diseño) y el
// formulario de inscripción quedan en el código.

import type { CollectionConfig, Field, TextFieldSingleValidation } from 'payload'

import { campoSoloSuperAdmin, eliminacionDefinitiva, gestionDelSitio, lecturaEditorial } from '../access'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'
import { normalizarSlug } from '../fields/slug'

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/

const validarHora: TextFieldSingleValidation = (valor) =>
  !valor || HORA.test(valor) ? true : 'Use el formato de 24 horas, por ejemplo 08:00 o 13:30.'

/** Solo http(s): el enlace se escribe tal cual en la página. */
const validarEnlace: TextFieldSingleValidation = (valor) =>
  !valor || /^https?:\/\/\S+$/i.test(valor) ? true : 'Escriba la dirección completa, que empiece con https://'

const validarSlug: TextFieldSingleValidation = (valor) =>
  !valor || valor === normalizarSlug(valor) ? true : 'Use solo minúsculas, números y guiones.'

const REDES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X (Twitter)' },
]

const logoColaborador: Field[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 160 },
  { name: 'url', label: 'Enlace', type: 'text', validate: validarEnlace, admin: { description: 'Opcional. A dónde lleva el logo.' } },
  { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'medios', required: true },
]

export const Eventos: CollectionConfig = {
  slug: 'eventos',
  typescript: { interface: 'Evento' },
  labels: { singular: 'Evento', plural: 'Eventos' },
  admin: {
    group: 'Eventos',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'fecha', '_status', 'updatedAt'],
    listSearchableFields: ['nombre', 'slug'],
    description:
      'Contenido de la página de cada evento (textos, fecha, lugar, imágenes, expositores y programa). El diseño de la página y el formulario de inscripción no se editan acá.',
  },
  defaultSort: '-fecha',
  access: {
    read: lecturaEditorial(),
    create: gestionDelSitio,
    update: gestionDelSitio,
    delete: eliminacionDefinitiva,
    readVersions: gestionDelSitio,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Evento',
          fields: [
            { name: 'nombre', label: 'Nombre del evento', type: 'text', required: true, maxLength: 160 },
            {
              name: 'titulo',
              label: 'Lema o título',
              type: 'text',
              required: true,
              maxLength: 200,
              admin: { description: 'Ej.: "La nueva era del trabajo y el talento".' },
            },
            {
              name: 'slug',
              label: 'Dirección de la página',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              validate: validarSlug,
              access: { update: campoSoloSuperAdmin },
              admin: {
                description:
                  'Solo un Super Admin puede cambiarla: la landing del Summit vive en /summit-internacional-uap2026/ y cambiarla la dejaría sin página.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'fecha',
                  label: 'Fecha',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
                },
                {
                  name: 'horaInicio',
                  label: 'Hora de inicio',
                  type: 'text',
                  required: true,
                  defaultValue: '08:00',
                  validate: validarHora,
                  admin: { description: '24 horas, p. ej. 08:00. Solo para los buscadores (Google Eventos).' },
                },
                {
                  name: 'horaFin',
                  label: 'Hora de cierre',
                  type: 'text',
                  required: true,
                  defaultValue: '13:30',
                  validate: validarHora,
                  admin: { description: '24 horas, p. ej. 13:30.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'lugar', label: 'Lugar', type: 'text', required: true, maxLength: 160, admin: { description: 'Ej.: "Hotel Sheraton Asunción".' } },
                { name: 'ciudad', label: 'Ciudad', type: 'text', required: true, maxLength: 80, defaultValue: 'Asunción' },
              ],
            },
            { name: 'direccion', label: 'Dirección', type: 'text', required: true, maxLength: 200 },
            {
              name: 'mapa',
              label: 'Enlace al mapa',
              type: 'text',
              required: true,
              validate: validarEnlace,
              admin: { description: 'Enlace de Google Maps para el botón "Cómo llegar".' },
            },
            { name: 'hashtag', label: 'Hashtag', type: 'text', maxLength: 60, admin: { description: 'Con el #. Ej.: #SummitParaguay2026.' } },
            { name: 'correo', label: 'Correo del evento', type: 'email', required: true, admin: { description: 'Correo de contacto y destino por defecto de los avisos de inscripción.' } },
            {
              name: 'textoBoton',
              label: 'Texto del botón de inscripción',
              type: 'text',
              required: true,
              defaultValue: 'Inscríbete para asistir al evento',
              maxLength: 80,
            },
          ],
        },
        {
          label: 'Portada y presentación',
          fields: [
            {
              name: 'banner',
              label: 'Banner de portada',
              type: 'upload',
              relationTo: 'medios',
              required: true,
              admin: {
                description:
                  'Imagen de 1920 × 600 px con el título dibujado. La fecha, el lugar y el botón se escriben encima automáticamente: dejar libre el lado izquierdo.',
              },
            },
            {
              name: 'tituloIntro',
              label: 'Título de la presentación',
              type: 'text',
              required: true,
              maxLength: 240,
            },
            {
              name: 'parrafos',
              label: 'Párrafos de la presentación',
              type: 'array',
              labels: { singular: 'Párrafo', plural: 'Párrafos' },
              minRows: 1,
              admin: { initCollapsed: true },
              fields: [{ name: 'texto', label: 'Texto', type: 'textarea', required: true }],
            },
          ],
        },
        {
          label: 'Datos y redes',
          fields: [
            {
              name: 'certificacion',
              label: 'Certificación',
              type: 'array',
              labels: { singular: 'Institución', plural: 'Instituciones que certifican' },
              fields: [{ name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 160 }],
            },
            {
              name: 'imagenEvento',
              label: 'Imagen del lugar o del evento',
              type: 'upload',
              relationTo: 'medios',
              admin: { description: 'Se muestra al lado de la fecha y el lugar. Proporción de 4:3 (por ejemplo, 800 × 600 px).' },
            },
            {
              name: 'redes',
              label: 'Redes sociales',
              type: 'array',
              labels: { singular: 'Red', plural: 'Redes' },
              maxRows: 6,
              fields: [
                { name: 'red', label: 'Red', type: 'select', required: true, options: REDES },
                { name: 'url', label: 'Enlace', type: 'text', required: true, validate: validarEnlace },
              ],
            },
          ],
        },
        {
          label: 'Organizan y colaboran',
          fields: [
            {
              name: 'organizador',
              label: 'Organiza',
              type: 'group',
              fields: [
                { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 160 },
                { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'medios' },
              ],
            },
            {
              name: 'colaboran',
              label: 'Colaboran',
              type: 'array',
              labels: { singular: 'Colaborador', plural: 'Colaboradores' },
              fields: logoColaborador,
            },
          ],
        },
        {
          label: 'Expositores',
          fields: [
            {
              name: 'expositores',
              label: 'Expositores',
              type: 'relationship',
              relationTo: 'expositores',
              hasMany: true,
              admin: {
                description:
                  'Se muestran en este orden. Para agregar a alguien nuevo, cárguelo primero en Eventos → Expositores y elíjalo acá.',
              },
            },
          ],
        },
        {
          label: 'Programa',
          fields: [
            {
              name: 'programa',
              label: 'Programa',
              type: 'array',
              labels: { singular: 'Sesión', plural: 'Sesiones' },
              admin: { description: 'En el orden en que se muestran. Se pueden arrastrar para reordenar.' },
              fields: [
                { name: 'hora', label: 'Hora', type: 'text', required: true, validate: validarHora, admin: { description: '24 horas, p. ej. 09:15.' } },
                { name: 'titulo', label: 'Título de la sesión', type: 'text', required: true, maxLength: 300 },
                { name: 'rol', label: 'Rótulo de los participantes', type: 'text', maxLength: 60, admin: { description: 'Opcional. Ej.: "Modera" o "Panelistas".' } },
                { name: 'nota', label: 'Nota', type: 'text', maxLength: 200, admin: { description: 'Opcional. Ej.: "Modera: Fundación Internacional ORP".' } },
                { name: 'personas', label: 'Participantes', type: 'relationship', relationTo: 'expositores', hasMany: true },
              ],
            },
          ],
        },
        {
          label: 'Comités',
          fields: [
            {
              name: 'comites',
              label: 'Comités',
              type: 'array',
              labels: { singular: 'Comité', plural: 'Comités' },
              fields: [
                { name: 'titulo', label: 'Nombre del comité', type: 'text', required: true, maxLength: 160 },
                { name: 'imagen', label: 'Imagen con los logos', type: 'upload', relationTo: 'medios', required: true },
              ],
            },
          ],
        },
        {
          label: 'Buscadores',
          fields: [
            {
              name: 'descripcionSeo',
              label: 'Descripción para buscadores',
              type: 'textarea',
              maxLength: 200,
              admin: {
                description:
                  'Opcional. Es el texto que aparece bajo el título en Google. Si se deja vacío, se arma sola con el nombre, el lema, la fecha y el lugar.',
              },
            },
          ],
        },
      ],
    },
  ],
}
