import type { CollectionConfig } from 'payload'

import { campoSlug } from '../fields/slug'
import { BloqueGaleria, BloqueVideo, editorNoticias } from '../fields/editorNoticias'
import { camposWorkflow } from '../fields/workflow'
import { opcionesEditoriales } from './editorial'

const editorial = opcionesEditoriales({
  slug: 'noticias',
  seccion: 'noticias',
  rutaPublica: (slug) => `/noticias/${slug}/`,
  conFechaDePublicacion: true,
})

export const Noticias: CollectionConfig = {
  slug: 'noticias',
  labels: { singular: 'Noticia', plural: 'Noticias' },
  admin: {
    group: 'Noticias',
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'fechaPublicacion', 'categoria', 'estado'],
    listSearchableFields: ['titulo', 'slug'],
    components: editorial.adminComponents,
  },
  defaultSort: '-fechaPublicacion',
  access: editorial.access,
  versions: editorial.versions,
  endpoints: editorial.endpoints,
  hooks: editorial.hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          fields: [
            { name: 'titulo', label: 'Título', type: 'text', required: true },
            {
              name: 'bajada',
              label: 'Bajada',
              type: 'textarea',
              maxLength: 300,
              admin: { description: 'Resumen de 1 o 2 oraciones que aparece en el listado.' },
            },
            { name: 'imagenDestacada', label: 'Imagen destacada', type: 'upload', relationTo: 'medios' },
            { name: 'contenido', label: 'Contenido', type: 'richText', editor: editorNoticias },
            { name: 'galeria', label: 'Galería al final de la nota', type: 'upload', relationTo: 'medios', hasMany: true },
          ],
        },
        {
          label: 'Clasificación',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'autor', label: 'Autor', type: 'text', admin: { description: 'Nombre que se muestra. Vacío = "Comunicación UAP".' } },
                { name: 'categoria', label: 'Categoría', type: 'relationship', relationTo: 'categorias' },
              ],
            },
            { name: 'tags', label: 'Etiquetas', type: 'text', hasMany: true },
            {
              name: 'urlOriginal',
              label: 'URL en el sitio anterior',
              type: 'text',
              admin: { readOnly: true, description: 'Dirección en el WordPress anterior; se redirige a la nueva.' },
            },
          ],
        },
      ],
    },
    campoSlug({ desde: 'titulo' }),
    {
      name: 'fechaPublicacion',
      label: 'Fecha de publicación',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' },
        description: 'Si es futura, la noticia aprobada aparece sola en el sitio a esa hora.',
      },
    },
    ...camposWorkflow('noticias'),
  ],
}

export { BloqueGaleria, BloqueVideo }
