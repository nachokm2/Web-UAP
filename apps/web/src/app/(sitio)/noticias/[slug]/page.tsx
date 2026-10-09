import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { Imagen, esMedio, urlDeImagen } from '@/components/sitio/Imagen'
import { TextoCms } from '@/components/sitio/TextoCms'
import { formatoFecha } from '@/components/sitio/TarjetaNoticia'
import type { Categoria, Medio } from '@/payload-types'
import { obtenerNoticia } from '@/lib/datos'
import { SITIO, urlAbsoluta, urlNoticia } from '@/lib/urls'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = await obtenerNoticia((await params).slug)
  if (!n) return {}
  const imagen = (esMedio(n.meta?.image) && n.meta.image) || (esMedio(n.imagenDestacada) && n.imagenDestacada) || null
  const og = urlDeImagen(imagen as Medio | null, 'og')
  const descripcion = n.meta?.description || n.bajada || undefined
  return {
    title: n.meta?.title ? { absolute: n.meta.title } : n.titulo,
    description: descripcion,
    alternates: { canonical: urlAbsoluta(urlNoticia(n.slug)) },
    openGraph: {
      type: 'article',
      title: n.meta?.title || n.titulo,
      description: descripcion,
      url: urlAbsoluta(urlNoticia(n.slug)),
      publishedTime: n.fechaPublicacion,
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
  }
}

export default async function PaginaNoticia({ params }: Params) {
  const n = await obtenerNoticia((await params).slug)
  if (!n) notFound()
  const categoria = typeof n.categoria === 'object' && n.categoria ? (n.categoria as Categoria).nombre : null
  // Como en WordPress: dentro de la nota se ven las fotos de la nota (galería); la imagen
  // destacada es la de listados y redes, y solo se muestra aquí si la nota no tiene fotos.
  const fotos = (n.galeria ?? []).filter(esMedio)
  const principal = fotos[0] ?? (esMedio(n.imagenDestacada) ? n.imagenDestacada : null)
  const galeria = fotos.slice(1)
  const imagenOg = urlDeImagen(esMedio(n.imagenDestacada) ? n.imagenDestacada : null, 'og')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.titulo,
    datePublished: n.fechaPublicacion,
    dateModified: n.updatedAt,
    image: imagenOg ? urlAbsoluta(imagenOg) : undefined,
    author: { '@type': 'Organization', name: n.autor || 'Comunicación UAP' },
    publisher: { '@type': 'CollegeOrUniversity', name: 'Universidad Autónoma del Paraguay' },
    mainEntityOfPage: urlAbsoluta(urlNoticia(n.slug)),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Noticias', href: SITIO.noticias }, { nombre: n.titulo }]} />
      <main id="main-content">
        <article className="section">
          <div className="container noticia">
            <header className="noticia__encabezado">
              <div className="news-meta">
                {categoria && <span className="news-tag">{categoria}</span>}
                <time className="news-date" dateTime={n.fechaPublicacion}>
                  {formatoFecha.format(new Date(n.fechaPublicacion))}
                </time>
              </div>
              <h1>{n.titulo}</h1>
              {n.bajada && <p className="lead">{n.bajada}</p>}
              <p className="noticia__autor">{n.autor || 'Comunicación UAP'}</p>
            </header>
            {principal && <Imagen medio={principal} tamano="hero" sizes="(max-width: 900px) 100vw, 860px" className="noticia__imagen" prioridad />}
            <TextoCms data={n.contenido} />
            {galeria.length > 0 && (
              <section aria-label="Galería de fotos" className="galeria-cms noticia__galeria">
                {galeria.map((m) => (
                  <Imagen key={m.id} medio={m} tamano="tarjeta" sizes="(max-width: 768px) 50vw, 280px" />
                ))}
              </section>
            )}
          </div>
        </article>
      </main>
    </>
  )
}
