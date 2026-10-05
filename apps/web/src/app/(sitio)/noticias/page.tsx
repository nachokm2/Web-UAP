import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { TarjetaNoticia } from '@/components/sitio/TarjetaNoticia'
import type { Noticia } from '@/payload-types'
import { listarNoticias } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

type Props = { searchParams: Promise<{ pagina?: string }> }

const paginaPedida = (v?: string) => Math.max(1, Number.parseInt(v ?? '1', 10) || 1)

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const pagina = paginaPedida((await searchParams).pagina)
  return {
    title: pagina > 1 ? `Noticias (página ${pagina})` : 'Noticias',
    description: 'Novedades y actividades de la Universidad Autónoma del Paraguay.',
    alternates: { canonical: urlAbsoluta(pagina > 1 ? `${SITIO.noticias}?pagina=${pagina}` : SITIO.noticias) },
  }
}

export default async function PaginaNoticias({ searchParams }: Props) {
  const pagina = paginaPedida((await searchParams).pagina)
  const resultado = await listarNoticias(pagina)
  const enlace = (n: number) => (n === 1 ? SITIO.noticias : `${SITIO.noticias}?pagina=${n}`)

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Noticias' }]} />
      <main id="main-content">
        <section className="page-hero">
          <div className="container">
            <h1>Noticias</h1>
            <p className="lead">Entérate de las últimas novedades y actividades de la universidad.</p>
          </div>
        </section>
        <section className="section section-alt">
          <div className="container">
            {resultado.docs.length ? (
              <div className="news-grid">
                {(resultado.docs as Noticia[]).map((n) => (
                  <TarjetaNoticia key={n.id} noticia={n} nivelTitulo="h2" />
                ))}
              </div>
            ) : (
              <p>Todavía no hay noticias publicadas.</p>
            )}
            {resultado.totalPages > 1 && (
              <nav className="paginacion" aria-label="Páginas de noticias">
                {pagina > 1 && <Link href={enlace(pagina - 1)}>← Anteriores</Link>}
                {Array.from({ length: resultado.totalPages }, (_, i) => i + 1).map((n) =>
                  n === pagina ? (
                    <span key={n} aria-current="page">
                      {n}
                    </span>
                  ) : (
                    <Link key={n} href={enlace(n)}>
                      {n}
                    </Link>
                  ),
                )}
                {resultado.hasNextPage && <Link href={enlace(pagina + 1)}>Siguientes →</Link>}
              </nav>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
