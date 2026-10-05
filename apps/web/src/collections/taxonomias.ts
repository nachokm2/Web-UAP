// Taxonomías simples: Facultades y áreas, Sedes, Categorías de noticias.

import type { CollectionConfig } from 'payload'

import { gestionDelSitio } from '../access'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'
import { campoSlug } from '../fields/slug'

const accesoTaxonomia: CollectionConfig['access'] = {
  read: () => true,
  create: gestionDelSitio,
  update: gestionDelSitio,
  delete: gestionDelSitio,
}

const hooksTaxonomia: CollectionConfig['hooks'] = {
  afterChange: [auditarCambios],
  afterDelete: [auditarEliminacion],
}

export const Facultades: CollectionConfig = {
  slug: 'facultades',
  typescript: { interface: 'Facultad' },
  labels: { singular: 'Facultad o área', plural: 'Facultades y áreas' },
  admin: {
    group: 'Configuración',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'orden'],
    description: 'Agrupan las carreras (facultad) y los posgrados (área) en los listados y menús.',
  },
  defaultSort: 'orden',
  access: accesoTaxonomia,
  hooks: hooksTaxonomia,
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    campoSlug({ desde: 'nombre' }),
    { name: 'orden', label: 'Orden', type: 'number', defaultValue: 100 },
  ],
}

export const Sedes: CollectionConfig = {
  slug: 'sedes',
  labels: { singular: 'Sede', plural: 'Sedes' },
  admin: { group: 'Configuración', useAsTitle: 'nombre' },
  access: accesoTaxonomia,
  hooks: hooksTaxonomia,
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'direccion', label: 'Dirección', type: 'text' },
    { name: 'ciudad', label: 'Ciudad', type: 'text' },
  ],
}

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoría', plural: 'Categorías de noticias' },
  admin: { group: 'Noticias', useAsTitle: 'nombre' },
  access: accesoTaxonomia,
  hooks: hooksTaxonomia,
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    campoSlug({ desde: 'nombre' }),
  ],
}
