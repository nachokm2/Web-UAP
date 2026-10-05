// Editor visual de noticias: títulos, negritas, listas, enlaces, imágenes de la
// biblioteca y bloques de video y galería.

import type { Block } from 'payload'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

const PROVEEDORES_VIDEO = /^https:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//

export const BloqueVideo: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      label: 'Enlace de YouTube o Vimeo',
      type: 'text',
      required: true,
      validate: (value: string | null | undefined) =>
        value && PROVEEDORES_VIDEO.test(value) ? true : 'Pegue un enlace de YouTube o Vimeo que empiece con https://',
    },
    { name: 'titulo', label: 'Título del video', type: 'text', required: true, admin: { description: 'Lo leen los lectores de pantalla.' } },
  ],
}

export const BloqueGaleria: Block = {
  slug: 'galeria',
  labels: { singular: 'Galería', plural: 'Galerías' },
  fields: [{ name: 'imagenes', label: 'Imágenes', type: 'upload', relationTo: 'medios', hasMany: true, required: true, minRows: 2 }],
}

export const editorNoticias = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !['heading', 'upload', 'link', 'relationship'].includes(f.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    LinkFeature({ enabledCollections: ['carreras', 'posgrados', 'noticias'] }),
    UploadFeature({ enabledCollections: ['medios'] }),
    BlocksFeature({ blocks: [BloqueVideo, BloqueGaleria] }),
    FixedToolbarFeature(),
  ],
})
