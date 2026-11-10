// Personas que participan en los eventos (V Summit Internacional UAP, etc.). Se cargan una
// vez acá y se eligen en cada evento, tanto en la lista de expositores como en el programa.

import type { CollectionConfig } from 'payload'

import { eliminacionDefinitiva, gestionDelSitio } from '../access'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'

export const Expositores: CollectionConfig = {
  slug: 'expositores',
  typescript: { interface: 'Expositor' },
  labels: { singular: 'Expositor', plural: 'Expositores' },
  admin: {
    group: 'Eventos',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'cargo', 'institucion', 'pais'],
    listSearchableFields: ['nombre', 'cargo', 'institucion'],
    description:
      'Personas que participan en los eventos. Se cargan una sola vez y se eligen en cada evento (lista de expositores y programa).',
  },
  defaultSort: 'nombre',
  access: { read: () => true, create: gestionDelSitio, update: gestionDelSitio, delete: eliminacionDefinitiva },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      maxLength: 120,
      admin: { description: 'Con el título, como se publica (p. ej. "Dr. Teodoro Ribera").' },
    },
    { name: 'cargo', label: 'Cargo', type: 'text', required: true, maxLength: 160 },
    { name: 'institucion', label: 'Institución', type: 'text', required: true, maxLength: 160 },
    {
      name: 'pais',
      label: 'País',
      type: 'text',
      maxLength: 80,
      admin: { description: 'Opcional. Si se deja vacío no se muestra.' },
    },
    {
      name: 'foto',
      label: 'Foto',
      type: 'upload',
      relationTo: 'medios',
      admin: { description: 'Foto cuadrada o casi cuadrada, de frente. Se muestra en círculo.' },
    },
    {
      name: 'logo',
      label: 'Logo de la institución',
      type: 'upload',
      relationTo: 'medios',
      admin: { description: 'Se muestra debajo de la tarjeta del expositor. Si se deja vacío no se muestra.' },
    },
  ],
}
