import type { CollectionConfig } from 'payload'

import { campoSlug, ESPACIO_URL_PROGRAMAS } from '../fields/slug'
import {
  campoOrden,
  pestanaArchivos,
  pestanaContacto,
  pestanaContenido,
  pestanaGeneral,
  pestanaPlanDeEstudios,
} from '../fields/programa'
import { camposWorkflow } from '../fields/workflow'
import { opcionesEditoriales } from './editorial'

const editorial = opcionesEditoriales({
  slug: 'carreras',
  seccion: 'carreras',
  rutaPublica: (slug) => `/${slug}/`,
})

export const Carreras: CollectionConfig = {
  slug: 'carreras',
  labels: { singular: 'Carrera', plural: 'Carreras' },
  admin: {
    group: 'Contenido académico',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'facultad', 'estado', 'updatedAt'],
    listSearchableFields: ['nombre', 'slug'],
    description: 'Carreras de grado. Cada una se publica en uap.edu.py/{dirección-web}/.',
    components: editorial.adminComponents,
  },
  defaultSort: 'orden',
  access: editorial.access,
  versions: editorial.versions,
  endpoints: editorial.endpoints,
  hooks: editorial.hooks,
  fields: [
    {
      type: 'tabs',
      tabs: [
        pestanaGeneral([
          {
            type: 'row',
            fields: [
              { name: 'facultad', label: 'Facultad', type: 'relationship', relationTo: 'facultades' },
              { name: 'gradoAcademico', label: 'Grado académico', type: 'text', admin: { description: 'Ej.: "Licenciatura".' } },
            ],
          },
          { name: 'tituloOtorgado', label: 'Título profesional', type: 'text' },
        ]),
        pestanaContenido(),
        pestanaPlanDeEstudios('Semestre'),
        pestanaArchivos,
        pestanaContacto,
      ],
    },
    campoSlug({ desde: 'nombre', espacioCompartido: ESPACIO_URL_PROGRAMAS }),
    ...camposWorkflow('carreras'),
    campoOrden,
  ],
}
