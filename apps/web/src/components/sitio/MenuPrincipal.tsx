'use client'

// Menú principal: mismo marcado y clases que el sitio estático (uap-nav.js),
// con el comportamiento en React para que funcione al navegar sin recargar.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { SITIO, urlPrograma } from '@/lib/urls'

export type GrupoDeCarreras = { facultad: string; carreras: { nombre: string; slug: string }[] }

type Props = {
  carrerasPorFacultad: GrupoDeCarreras[]
  campusVirtualUrl?: string | null
}

const ANCHO_MOVIL = 1200

function seccionActual(ruta: string): string {
  if (ruta === '/') return 'inicio'
  const primera = ruta.split('/').filter(Boolean)[0] ?? ''
  return primera
}

export function MenuPrincipal({ carrerasPorFacultad, campusVirtualUrl }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [desplegado, setDesplegado] = useState<string | null>(null)
  // Facultad cuyas carreras se muestran en el submenú de Carreras (null = la primera, en PC).
  const [facultadAbierta, setFacultadAbierta] = useState<string | null>(null)
  const ruta = usePathname()
  const [rutaAnterior, setRutaAnterior] = useState(ruta)
  const boton = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLUListElement>(null)

  // Al navegar se cierra todo (se ajusta durante el render, sin un efecto extra).
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta)
    setAbierto(false)
    setDesplegado(null)
    setFacultadAbierta(null)
  }

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        setAbierto(false)
        boton.current?.focus()
      }
    }
    const alHacerClic = (e: MouseEvent) => {
      const t = e.target as Node
      if (!nav.current?.contains(t) && !boton.current?.contains(t)) {
        setAbierto(false)
        setDesplegado(null)
      }
    }
    document.addEventListener('keydown', alTeclear)
    document.addEventListener('click', alHacerClic)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('click', alHacerClic)
    }
  }, [abierto])

  const seccion = seccionActual(ruta)
  const clase = (s: string) => (seccion === s ? 'nav-active' : undefined)
  const actual = (s: string) => (seccion === s ? ('page' as const) : undefined)

  // En pantallas chicas el título de un desplegable lo abre en lugar de navegar.
  const alternar = (id: string) => (e: React.MouseEvent) => {
    if (window.innerWidth <= ANCHO_MOVIL) {
      e.preventDefault()
      setDesplegado((d) => (d === id ? null : id))
    }
  }
  const claseDesplegable = (id: string) => ['dropdown', desplegado === id ? 'active' : ''].filter(Boolean).join(' ')

  // Submenú de facultades: en PC se abre al pasar el mouse; tocando (o con teclado) se alterna.
  const conMouse = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const alternarFacultad = (f: string) => setFacultadAbierta((a) => (a === f ? null : f))

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="mobile-menu-btn"
        aria-expanded={abierto}
        aria-controls="menu-principal"
        aria-label={abierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
        onClick={() => setAbierto((a) => !a)}
      >
        ☰
      </button>
      <nav aria-label="Principal">
        <ul id="menu-principal" ref={nav} className={abierto ? 'nav active' : 'nav'}>
          <li>
            <Link href={SITIO.inicio} className={clase('inicio')} aria-current={actual('inicio')}>
              Inicio
            </Link>
          </li>
          <li className={claseDesplegable('carreras')}>
            <Link href={SITIO.carreras} className={clase('carreras')} onClick={alternar('carreras')}>
              Carreras
            </Link>
            {/* Antes las 23 carreras en una columna (más alta que la pantalla): ahora las
                facultades y, al lado, las carreras de la elegida. */}
            <div className="dropdown-content dropdown-facultades">
              {carrerasPorFacultad.map((g, i) => {
                const abierta = facultadAbierta === g.facultad
                const idPanel = `submenu-facultad-${i}`
                return (
                  <div
                    key={g.facultad}
                    className={abierta ? 'submenu-facultad abierta' : 'submenu-facultad'}
                    onMouseEnter={() => conMouse() && setFacultadAbierta(g.facultad)}
                  >
                    <button
                      type="button"
                      className="submenu-facultad__titulo"
                      aria-expanded={abierta}
                      aria-controls={idPanel}
                      onClick={() => !conMouse() && alternarFacultad(g.facultad)}
                      onFocus={() => conMouse() && setFacultadAbierta(g.facultad)}
                    >
                      {g.facultad}
                    </button>
                    <div id={idPanel} className="submenu-facultad__carreras" role="group" aria-label={g.facultad}>
                      {g.carreras.map((c) => (
                        <Link key={c.slug} href={urlPrograma(c.slug)}>
                          {c.nombre}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
              <Link href={SITIO.carreras} className="dropdown-ver-todas">
                Ver todas las carreras →
              </Link>
            </div>
          </li>
          <li className={claseDesplegable('posgrados')}>
            <Link href={SITIO.posgrados} className={clase('postgrados')} onClick={alternar('posgrados')}>
              Posgrados
            </Link>
            <div className="dropdown-content">
              <Link href={`${SITIO.posgrados}#diplomados`}>Diplomados</Link>
              <Link href={`${SITIO.posgrados}#especializaciones`}>Especializaciones</Link>
              <Link href={`${SITIO.posgrados}#maestrias`}>Maestrías</Link>
              <Link href={`${SITIO.posgrados}#doctorados`}>Doctorados</Link>
            </div>
          </li>
          <li>
            <Link href={SITIO.noticias} className={clase('noticias')} aria-current={actual('noticias')}>
              Noticias
            </Link>
          </li>
          <li className={claseDesplegable('institucional')}>
            <Link href={SITIO.institucional} className={clase('institucional')} onClick={alternar('institucional')}>
              Institucional
            </Link>
            <div className="dropdown-content">
              <Link href={`${SITIO.institucional}#mision`}>Misión, Visión y Valores</Link>
              <Link href={SITIO.autoridades}>Autoridades</Link>
              <Link href={`${SITIO.institucional}#convenios`}>Convenios</Link>
              <Link href={`${SITIO.institucional}#reglamentos`}>Reglamentos</Link>
            </div>
          </li>
          <li>
            <Link href={SITIO.investigacion} className={clase('investigacion')} aria-current={actual('investigacion')}>
              Investigación
            </Link>
          </li>
          <li>
            <Link href={SITIO.estudiantes} className={clase('estudiantes')} aria-current={actual('estudiantes')}>
              Estudiantes
            </Link>
          </li>
          <li>
            <Link href={SITIO.contacto} className={clase('contacto')} aria-current={actual('contacto')}>
              Contacto
            </Link>
          </li>
          {campusVirtualUrl && (
            <li>
              <a href={campusVirtualUrl}>Campus Virtual</a>
            </li>
          )}
        </ul>
      </nav>
    </>
  )
}
