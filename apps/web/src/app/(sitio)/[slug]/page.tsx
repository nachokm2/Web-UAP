// Landing de carrera o posgrado en /{slug}/ (misma URL que el sitio anterior). En el mismo
// espacio viven los formularios de postulación por asesor (/formulario-de-postulacion-uap-…/).

import type { Metadata } from 'next'
import NextImage from 'next/image'
import { notFound, redirect } from 'next/navigation'

import { Breadcrumb } from '@/components/sitio/Breadcrumb'
import { FormularioBitrix } from '@/components/sitio/FormularioBitrix'
import { IconoSeccion, type TipoIcono } from '@/components/sitio/IconoSeccion'
import { esMedio, urlDeImagen } from '@/components/sitio/Imagen'
import { Malla } from '@/components/sitio/Malla'
import { TextoCms } from '@/components/sitio/TextoCms'
import { MODALIDADES } from '@/fields/programa'
import { TIPOS_POSGRADO } from '@/collections/Posgrados'
import type { Documento, Medio, Sede } from '@/payload-types'
import { PaginaFormulario } from '@/components/sitio/PaginaFormulario'
import { obtenerConfiguracion, obtenerFormulario, obtenerPrograma, type Programa } from '@/lib/datos'
import { SITIO, urlAbsoluta, urlPrograma } from '@/lib/urls'

type Params = { params: Promise<{ slug: string }> }

const etiqueta = (lista: { value: string; label: string }[], valor?: string | null) => lista.find((o) => o.value === valor)?.label

function tipoLegible(p: Programa): string {
  return p.coleccion === 'carreras' ? 'Carrera' : (etiqueta(TIPOS_POSGRADO, p.tipo) ?? 'Posgrado')
}

function descripcionSeo(p: Programa): string | undefined {
  return p.meta?.description || p.descripcionCorta || undefined
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const p = await obtenerPrograma(slug)
  if (!p) {
    const f = await obtenerFormulario(slug)
    // Páginas por asesor: los asesores comparten el enlace; no compiten en buscadores.
    return f?.activo ? { title: f.titulo, robots: { index: false, follow: true }, alternates: { canonical: urlAbsoluta(urlPrograma(f.slug)) } } : {}
  }
  const imagen = (esMedio(p.meta?.image) && p.meta.image) || (esMedio(p.imagenPrincipal) && p.imagenPrincipal) || null
  const og = urlDeImagen(imagen as Medio | null, 'og')
  return {
    // El título SEO del CMS ya incluye "| UAP"; si no hay, se arma con la plantilla del layout.
    title: p.meta?.title ? { absolute: p.meta.title } : p.nombre,
    description: descripcionSeo(p),
    alternates: { canonical: urlAbsoluta(urlPrograma(p.slug)) },
    openGraph: {
      title: p.meta?.title || p.nombre,
      description: descripcionSeo(p),
      url: urlAbsoluta(urlPrograma(p.slug)),
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
  }
}

type Tarjeta = { titulo: string; icono: TipoIcono; contenido: unknown }

const FONDOS = ['degradado', undefined, 'gris', undefined] as const

/** Secciones en orden de lectura; solo las que tienen contenido. */
function tarjetasDe(p: Programa): Tarjeta[] {
  const comunes = (p.seccionesAdicionales ?? []).map((s) => ({ titulo: s.titulo, icono: 'texto' as const, contenido: s.contenido }))
  const propias: Tarjeta[] =
    p.coleccion === 'carreras'
      ? [
          { titulo: 'Descripción', icono: 'texto', contenido: p.descripcion },
          { titulo: 'Objetivo', icono: 'objetivo', contenido: p.objetivo },
          { titulo: 'Campo Laboral', icono: 'campoLaboral', contenido: p.campoLaboral },
          { titulo: 'Perfil del Graduado', icono: 'perfil', contenido: p.perfilEgreso },
          { titulo: 'Perfil de Ingreso', icono: 'perfil', contenido: p.perfilIngreso },
          { titulo: 'Requisitos de Admisión', icono: 'requisitos', contenido: p.requisitos },
        ]
      : [
          { titulo: 'Sobre el Programa', icono: 'objetivo', contenido: p.descripcion },
          { titulo: 'Objetivos Generales', icono: 'objetivo', contenido: p.objetivo },
          { titulo: 'Dirigido a', icono: 'dirigidoA', contenido: p.dirigidoA },
          { titulo: 'Objetivos Específicos', icono: 'objetivosEspecificos', contenido: p.objetivosEspecificos },
          { titulo: 'Requisitos de Postulación', icono: 'requisitos', contenido: p.requisitos },
          { titulo: 'Perfil de Egreso', icono: 'perfil', contenido: p.perfilEgreso },
          { titulo: 'Campo Laboral', icono: 'campoLaboral', contenido: p.campoLaboral },
          { titulo: 'Perfil de Ingreso', icono: 'perfil', contenido: p.perfilIngreso },
        ]
  return [...propias, ...comunes].filter((t) => t.contenido)
}

/** De a dos por fila, como el sitio estático. */
function filasDeTarjetas(tarjetas: Tarjeta[]): Tarjeta[][] {
  const filas: Tarjeta[][] = []
  for (let i = 0; i < tarjetas.length; i += 2) filas.push(tarjetas.slice(i, i + 2))
  return filas
}

function Tarjetas({ items, fondo }: { items: Tarjeta[]; fondo?: 'degradado' | 'gris' }) {
  const visibles = items.filter((t) => t.contenido)
  if (!visibles.length) return null
  return (
    <section className={`seccion-programa${fondo ? ` seccion-programa--${fondo}` : ''}`}>
      <div className="container">
        <div className={visibles.length > 1 ? 'two-col-grid' : undefined}>
          {visibles.map((t) => (
            <div key={t.titulo} className={visibles.length > 1 ? 'glass-card' : 'glass-card glass-card--angosta'}>
              <h2>
                <IconoSeccion tipo={t.icono} /> {t.titulo}
              </h2>
              <TextoCms data={t.contenido} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function PaginaPrograma({ params }: Params) {
  const { slug } = await params
  const [p, config] = await Promise.all([obtenerPrograma(slug), obtenerConfiguracion()])
  if (!p) {
    const f = await obtenerFormulario(slug)
    if (!f) notFound()
    // Formulario dado de baja (p. ej. el asesor ya no está): nadie queda sin poder postular.
    if (!f.activo) redirect(SITIO.inscripcion)
    return <PaginaFormulario formulario={f} />
  }

  const esCarrera = p.coleccion === 'carreras'
  const hero = urlDeImagen(esMedio(p.imagenPrincipal) ? p.imagenPrincipal : null, 'hero')
  const brochure = typeof p.brochure === 'object' && p.brochure ? (p.brochure as Documento) : null
  const sedes = (p.sedes ?? []).filter((s): s is Sede => typeof s === 'object').map((s) => s.nombre)
  const modalidad = etiqueta(MODALIDADES, p.modalidad)
  const pills = [
    { label: esCarrera ? 'Título' : 'Título otorgado', valor: p.tituloOtorgado },
    { label: 'Duración', valor: p.duracion },
    { label: 'Modalidad', valor: modalidad },
    { label: 'Sede', valor: sedes.join(', ') || null },
  ].filter((x) => x.valor)

  const formulario = p.formularioBitrix || config.bitrixFormulario
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: p.nombre,
    description: descripcionSeo(p),
    url: urlAbsoluta(urlPrograma(p.slug)),
    ...(p.tituloOtorgado ? { educationalCredentialAwarded: p.tituloOtorgado } : {}),
    provider: { '@type': 'CollegeOrUniversity', name: 'Universidad Autónoma del Paraguay', sameAs: urlAbsoluta('/') },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Breadcrumb
        items={[
          { nombre: 'Inicio', href: SITIO.inicio },
          esCarrera ? { nombre: 'Carreras', href: SITIO.carreras } : { nombre: 'Posgrados', href: SITIO.posgrados },
          { nombre: p.nombre },
        ]}
      />
      <main id="main-content">
        {/* Con foto: la foto se ve (degradado solo detrás del texto). Sin foto: fondo institucional. */}
        <section className={hero ? 'career-hero-glass hero-photo' : 'career-hero-glass'}>
          {hero && (
            // Foto como <img> y no como fondo CSS: se pide apenas llega el HTML y cada pantalla
            // baja la versión de su ancho (antes el celular bajaba la de 1200 px o más).
            <NextImage src={hero} alt="" fill sizes="100vw" preload fetchPriority="high" className="career-hero-glass__foto" />
          )}
          <div className="container">
            {!esCarrera && <span className="posgrado-badge">{tipoLegible(p)}</span>}
            <h1>{p.nombre}</h1>
            {brochure?.url && (
              <div className="acciones-hero">
                <a href={brochure.url} className="brochure-btn-glass" target="_blank" rel="noopener">
                  Descargar Brochure
                </a>
              </div>
            )}
            {pills.length > 0 && (
              <div className="info-pills">
                {pills.map((x) => (
                  <div key={x.label} className="info-pill">
                    <div className="pill-label">{x.label}</div>
                    <div className="pill-value">{x.valor}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {filasDeTarjetas(tarjetasDe(p)).map((fila, i) => (
          <Tarjetas key={fila.map((t) => t.titulo).join('|')} items={fila} fondo={FONDOS[i % FONDOS.length]} />
        ))}
        {!esCarrera && p.certificacion && (
          <section className="seccion-programa">
            <div className="container">
              <div className="glass-card glass-card--angosta glass-card--destacada">
                <h2>
                  <IconoSeccion tipo="certificacion" /> Certificación
                </h2>
                <TextoCms data={p.certificacion} />
              </div>
            </div>
          </section>
        )}

        {(p.malla?.length ?? 0) > 0 && (
          <section className="seccion-programa seccion-programa--gris">
            <div className="container">
              <Malla titulo={esCarrera ? 'Plan de Estudios' : 'Malla Curricular'} periodos={p.malla ?? []} />
            </div>
          </section>
        )}

        {formulario && config.bitrixLoaderUrl && (
          <section className="cta-section">
            <div className="container cta-formulario">
              <h2>Solicita información</h2>
              <p>Completa el formulario y un asesor se contactará contigo.</p>
              <div className="cta-formulario__caja">
                <FormularioBitrix formulario={formulario} loaderUrl={config.bitrixLoaderUrl} campana={p.slug} diferido />
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
