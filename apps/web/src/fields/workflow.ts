import type { Field } from 'payload'

import type { Seccion } from '../access/roles'
import { ESTADOS } from '../workflow/estados'

/**
 * Estado editorial (sidebar) + panel con los botones de transición.
 * El valor lo calcula el servidor (workflow/hooks.ts); el formulario no lo puede cambiar.
 */
export const camposWorkflow = (seccion: Seccion): Field[] => [
  {
    name: 'estado',
    label: 'Estado',
    type: 'select',
    defaultValue: 'borrador',
    index: true,
    options: Object.entries(ESTADOS).map(([value, label]) => ({ value, label })),
    admin: {
      position: 'sidebar',
      readOnly: true,
      description: 'Se cambia con los botones del panel "Flujo editorial".',
    },
  },
  {
    name: 'flujoEditorial',
    type: 'ui',
    admin: {
      position: 'sidebar',
      components: {
        Field: {
          path: '@/components/admin/FlujoEditorial#FlujoEditorial',
          clientProps: { seccion },
        },
      },
    },
  },
]
