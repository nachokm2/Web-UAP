import type { GlobalConfig } from 'payload'

import { campoIntegraciones, gestionDelSitio } from '../access'
import { auditarGlobal } from '../audit/hooks'

/** Datos que hoy están copiados en las 103 páginas del sitio estático. */
export const Configuracion: GlobalConfig = {
  slug: 'configuracion',
  label: 'Configuración del sitio',
  admin: {
    group: 'Configuración',
    description: 'Datos que aparecen en todo el sitio: contacto, redes, pie de página y SEO por defecto.',
  },
  access: { read: () => true, update: gestionDelSitio },
  hooks: { afterChange: [auditarGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacto',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'telefono', label: 'Teléfono', type: 'text' },
                { name: 'whatsapp', label: 'WhatsApp', type: 'text', admin: { description: 'Solo números con código de país. Ej.: 595981222785' } },
                { name: 'email', label: 'Email', type: 'email' },
              ],
            },
            { name: 'direccion', label: 'Dirección', type: 'text' },
            { name: 'mapaUrl', label: 'Enlace al mapa', type: 'text' },
            { name: 'horario', label: 'Horario de atención', type: 'textarea' },
          ],
        },
        {
          label: 'Redes y enlaces',
          fields: [
            {
              name: 'redes',
              label: 'Redes sociales',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'facebook', label: 'Facebook', type: 'text' },
                    { name: 'instagram', label: 'Instagram', type: 'text' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'youtube', label: 'YouTube', type: 'text' },
                    { name: 'linkedin', label: 'LinkedIn', type: 'text' },
                  ],
                },
              ],
            },
            { name: 'campusVirtualUrl', label: 'Campus Virtual', type: 'text' },
          ],
        },
        {
          label: 'Pie de página',
          fields: [
            {
              name: 'leyendaInstitucional',
              label: 'Leyenda institucional',
              type: 'textarea',
              admin: { description: 'Ej.: habilitación y acreditación. Confirme el texto con Secretaría General antes de publicarlo.' },
            },
          ],
        },
        {
          label: 'SEO por defecto',
          fields: [
            { name: 'seoTitulo', label: 'Título del sitio', type: 'text', defaultValue: 'Universidad Autónoma del Paraguay' },
            { name: 'seoDescripcion', label: 'Descripción por defecto', type: 'textarea', maxLength: 160 },
            { name: 'seoImagen', label: 'Imagen para compartir', type: 'upload', relationTo: 'medios', admin: { description: '1200 × 630 px.' } },
          ],
        },
        {
          label: 'Integraciones',
          description: 'Solo Super Admin puede modificar esta sección.',
          fields: [
            {
              name: 'bitrixFormulario',
              label: 'Formulario Bitrix24 (código)',
              type: 'text',
              access: { update: campoIntegraciones },
              admin: { description: 'Ej.: inline/61/hi7fex' },
            },
            {
              name: 'bitrixLoaderUrl',
              label: 'Script del formulario Bitrix24',
              type: 'text',
              access: { update: campoIntegraciones },
            },
          ],
        },
      ],
    },
  ],
}
