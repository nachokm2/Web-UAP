// Autoridades de la UAP (antes /autoridades-del-c-s-u/ en WordPress). Se editan en el CMS,
// colección Autoridades.

import type { Metadata } from 'next'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { ListaAutoridades } from '@/components/sitio/ListaAutoridades'
import { listarAutoridades } from '@/lib/datos'
import { SITIO, urlAbsoluta } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Autoridades',
  description: 'Consejo Superior Universitario, directivos y directores de carrera de la Universidad Autónoma del Paraguay.',
  alternates: { canonical: urlAbsoluta(SITIO.autoridades) },
}

export default async function PaginaAutoridades() {
  const autoridades = await listarAutoridades()

  return (
    <>
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: 'Institucional', href: SITIO.institucional }, { nombre: 'Autoridades' }]} />
      <main id="main-content" className="page">
        <div className="page-hero">
          <div className="container">
            <h1>Autoridades</h1>
            <p>Consejo Superior Universitario, directivos y directores de carrera</p>
          </div>
        </div>

        <div className="container content autoridades-contenido">
          {autoridades.length ? (
            <ListaAutoridades autoridades={autoridades} />
          ) : (
            <p className="lead">Pronto publicaremos la nómina de autoridades.</p>
          )}
        </div>
      </main>
    </>
  )
}
