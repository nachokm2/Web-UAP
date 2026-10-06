// Autoridades de la universidad (Consejo Superior, directivos, directores de carrera).
// Se muestran en /autoridades/ y en la sección Autoridades de /institucional/.

import type { CollectionConfig } from 'payload'

import { eliminacionDefinitiva, gestionDelSitio } from '../access'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'

/** Grupos en el orden en que se publican (mismos títulos que la página de WordPress). */
export const GRUPOS_AUTORIDADES = [
  { value: 'consejo', label: 'Consejo Superior Universitario' },
  { value: 'directivos', label: 'Directivos UAP' },
  { value: 'carreras', label: 'Dirección de Carrera' },
  { value: 'posgrado', label: 'Coordinación de programas de Postgrado' },
] as const

export type GrupoAutoridad = (typeof GRUPOS_AUTORIDADES)[number]['value']

export const Autoridades: CollectionConfig = {
  slug: 'autoridades',
  typescript: { interface: 'Autoridad' },
  labels: { singular: 'Autoridad', plural: 'Autoridades' },
  admin: {
    group: 'Institucional',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'cargo', 'grupo', 'orden', 'activo'],
    listSearchableFields: ['nombre', 'cargo'],
    description:
      'Personas que se muestran en /autoridades/ y en Institucional. Cuando alguien deja el cargo, desmarque "Se muestra en el sitio" en lugar de borrarlo: queda el historial.',
  },
  defaultSort: 'orden',
  access: { read: () => true, create: gestionDelSitio, update: gestionDelSitio, delete: eliminacionDefinitiva },
  hooks: { afterChange: [auditarCambios], afterDelete: [auditarEliminacion] },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, admin: { description: 'Con el título, como se publica (p. ej. "Abg. Carlos …").' } },
    { name: 'cargo', label: 'Cargo o carrera', type: 'text', required: true },
    { name: 'grupo', label: 'Grupo', type: 'select', required: true, options: [...GRUPOS_AUTORIDADES] },
    { name: 'foto', label: 'Foto', type: 'upload', relationTo: 'medios' },
    { name: 'orden', label: 'Orden', type: 'number', defaultValue: 100, admin: { position: 'sidebar', description: 'Menor primero, dentro de su grupo.' } },
    { name: 'activo', label: 'Se muestra en el sitio', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
