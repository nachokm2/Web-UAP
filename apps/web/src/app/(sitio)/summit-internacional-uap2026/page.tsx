// V Summit Internacional UAP 2026 (antes landing de WordPress en /summit-internacional-uap2026/).
// Misma dirección que el sitio anterior para no perder enlaces ni posicionamiento. Esta carpeta
// estática tiene prioridad sobre la ruta dinámica [slug].
//
// El contenido sale del CMS (Eventos). Mientras el evento no esté cargado (recién desplegado)
// o si la consulta falla, se muestra el contenido de respaldo; si el equipo lo despublica,
// la página deja de mostrarse (404), igual que una carrera.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { FormularioSummit } from '@/components/sitio/FormularioSummit'
import { SummitUap2026 } from '@/components/sitio/SummitUap2026'
import { CONTENIDO_SUMMIT, SLUG_SUMMIT } from '@/lib/eventos/contenidoSummit'
import { datosEstructurados, descripcionDelEvento, vistaDesdeCms, vistaDesdeContenido, type EventoVista } from '@/lib/eventos/vista'
import { obtenerEvento } from '@/lib/datos'
import { listaDePaises } from '@/lib/inscripcionSummit'
import { SITIO, urlAbsoluta } from '@/lib/urls'
import '@/styles/summit-2026.css'

const RUTA = '/summit-internacional-uap2026/'

async function cargarEvento(): Promise<EventoVista | null> {
  try {
    const { estado, evento } = await obtenerEvento(SLUG_SUMMIT)
    if (estado === 'publicado') return vistaDesdeCms(evento)
    if (estado === 'oculto') return null
  } catch (error) {
    console.error('[summit] no se pudo leer el evento del CMS; se usa el contenido de respaldo:', error instanceof Error ? error.message : error)
  }
  return vistaDesdeContenido(CONTENIDO_SUMMIT)
}

export async function generateMetadata(): Promise<Metadata> {
  const evento = await cargarEvento()
  if (!evento) return {}
  const descripcion = descripcionDelEvento(evento)
  return {
    title: evento.nombre,
    description: descripcion,
    alternates: { canonical: urlAbsoluta(RUTA) },
    openGraph: {
      title: `${evento.nombre} | Universidad Autónoma del Paraguay`,
      description: descripcion,
      url: urlAbsoluta(RUTA),
      type: 'website',
    },
  }
}

export default async function PaginaSummit() {
  const evento = await cargarEvento()
  if (!evento) notFound()
  return (
    <>
      <script
        type="application/ld+json"
        // Marcado Event (Google Eventos). JSON generado en el servidor a partir de los datos del evento.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datosEstructurados(evento, urlAbsoluta(RUTA))).replace(/</g, '\\u003c'),
        }}
      />
      <Breadcrumb items={[{ nombre: 'Inicio', href: SITIO.inicio }, { nombre: evento.nombre }]} />
      <main id="main-content">
        <SummitUap2026
          evento={evento}
          formulario={
            <FormularioSummit
              paises={listaDePaises()}
              detalle={`Te esperamos el ${evento.fecha} en el ${evento.lugar}.`}
            />
          }
        />
      </main>
    </>
  )
}
