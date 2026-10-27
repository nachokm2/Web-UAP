import Link from 'next/link'

import type { Categoria, Noticia } from '@/payload-types'
import { urlNoticia } from '@/lib/urls'

import { Imagen } from './Imagen'

export const formatoFecha = new Intl.DateTimeFormat('es-PY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Asuncion' })

export function TarjetaNoticia({
  noticia: n,
  nivelTitulo = 'h3',
  prioridad,
}: {
  noticia: Noticia
  nivelTitulo?: 'h2' | 'h3'
  /** Primera tarjeta del listado: en celular su imagen es lo más grande de la pantalla (LCP). */
  prioridad?: boolean
}) {
  const categoria = typeof n.categoria === 'object' && n.categoria ? (n.categoria as Categoria).nombre : null
  const Titulo = nivelTitulo
  return (
    <article className="news-card">
      <div className="news-image">
        <Imagen medio={n.imagenDestacada} tamano="tarjeta" sizes="(max-width: 768px) 100vw, 33vw" prioridad={prioridad} />
      </div>
      <div className="news-content">
        <div className="news-meta">
          {categoria && <span className="news-tag">{categoria}</span>}
          <time className="news-date" dateTime={n.fechaPublicacion}>
            {formatoFecha.format(new Date(n.fechaPublicacion))}
          </time>
        </div>
        <Titulo>{n.titulo}</Titulo>
        {n.bajada && <p>{n.bajada}</p>}
        <Link href={urlNoticia(n.slug)} className="news-link" aria-label={`Leer más: ${n.titulo}`}>
          Leer más →
        </Link>
      </div>
    </article>
  )
}
