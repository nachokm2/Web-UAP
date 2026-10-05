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

export const TIPOS_POSGRADO = [
  { value: 'diplomado', label: 'Diplomado' },
  { value: 'especializacion', label: 'Especialización' },
  { value: 'maestria', label: 'Maestría' },
  { value: 'doctorado', label: 'Doctorado' },
  { value: 'maestria_doctorado', label: 'Maestría y Doctorado' },
  { value: 'otro', label: 'Otro' },
]

const editorial = opcionesEditoriales({
  slug: 'posgrados',
  seccion: 'posgrados',
  rutaPublica: (slug) => `/${slug}/`,
})

export const Posgrados: CollectionConfig = {
  slug: 'posgrados',
  labels: { singular: 'Posgrado', plural: 'Posgrados' },
  admin: {
    group: 'Contenido académico',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'estado', 'updatedAt'],
    listSearchableFields: ['nombre', 'slug'],
    description: 'Diplomados, especializaciones, maestrías y doctorados.',
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
              { name: 'tipo', label: 'Tipo de programa', type: 'select', required: true, index: true, options: TIPOS_POSGRADO },
              { name: 'area', label: 'Área', type: 'relationship', relationTo: 'facultades' },
            ],
          },
          { name: 'tituloOtorgado', label: 'Título otorgado', type: 'text' },
        ]),
        pestanaContenido([
          { name: 'objetivosEspecificos', label: 'Objetivos específicos', type: 'richText' },
          { name: 'dirigidoA', label: 'Dirigido a', type: 'richText' },
          { name: 'certificacion', label: 'Certificación', type: 'richText' },
        ]),
        pestanaPlanDeEstudios('Módulo'),
        pestanaArchivos,
        pestanaContacto,
      ],
    },
    campoSlug({ desde: 'nombre', espacioCompartido: ESPACIO_URL_PROGRAMAS, enRaizDelSitio: true }),
    ...camposWorkflow('posgrados'),
    campoOrden,
  ],
}
