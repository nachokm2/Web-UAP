// Texto enriquecido del CMS (Lexical) → HTML, con bloques de video y galería,
// imágenes de la biblioteca y enlaces internos a carreras, posgrados y noticias.

import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { LinkJSXConverter, RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

import type { Medio } from '@/payload-types'
import { urlDeDocumento } from '@/lib/urls'

import { Imagen, esMedio } from './Imagen'

type Bloque<T> = { node: { fields: T } }

/** youtube.com/watch?v=ID, youtu.be/ID o vimeo.com/ID → URL de inserción sin cookies de seguimiento. */
export function urlDeInsercion(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.endsWith('youtu.be')) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`
    if (u.hostname.endsWith('youtube.com')) {
      const id = u.searchParams.get('v') ?? u.pathname.split('/').pop()
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (u.hostname.endsWith('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?dnt=1` : null
    }
  } catch {
    /* URL inválida: no se inserta */
  }
  return null
}

const convertidores: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc
      const valor = doc?.value as { slug?: string } | undefined
      return doc && valor?.slug ? urlDeDocumento(doc.relationTo, valor.slug) : '#'
    },
  }),
  upload: ({ node }) => {
    const medio = node.value as Medio
    return esMedio(medio) ? <Imagen medio={medio} tamano="hero" sizes="(max-width: 900px) 100vw, 800px" /> : null
  },
  blocks: {
    video: ({ node }: Bloque<{ url: string; titulo: string }>) => {
      const src = urlDeInsercion(node.fields.url)
      return src ? (
        <div className="video-cms">
          <iframe src={src} title={node.fields.titulo} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      ) : null
    },
    galeria: ({ node }: Bloque<{ imagenes: (Medio | number)[] }>) => (
      <div className="galeria-cms">
        {node.fields.imagenes?.filter(esMedio).map((m) => <Imagen key={m.id} medio={m} tamano="tarjeta" sizes="(max-width: 768px) 50vw, 300px" />)}
      </div>
    ),
  },
})

type Props = { data: unknown; className?: string }

export function TextoCms({ data, className = 'contenido-cms' }: Props) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return <RichText data={data as SerializedEditorState} converters={convertidores} className={className} disableContainer={false} />
}
