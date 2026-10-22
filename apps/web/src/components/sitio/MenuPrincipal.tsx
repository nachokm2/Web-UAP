'use client'

// Menú principal: mismo marcado y clases que el sitio estático (uap-nav.js),
// con el comportamiento en React para que funcione al navegar sin recargar.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { SITIO, urlPrograma } from '@/lib/urls'

export type GrupoDeCarreras = { facultad: string; carreras: { nombre: string; slug: string }[] }
/** Un tipo de posgrado: sus primeros programas y el total (para "Ver los N …"). */
export type GrupoDePosgrados = { titulo: string; href: string; total: number; programas: { nombre: string; slug: string }[] }

type Props = {
  carrerasPorFacultad: GrupoDeCarreras[]
  posgradosPorTipo: GrupoDePosgrados[]
  campusVirtualUrl?: string | null
}

/** Grupo del submenú: título (facultad o tipo), sus enlaces y, si hay más, "ver todos". */
type GrupoDelSubmenu = { titulo: string; enlaces: { nombre: string; href: string }[]; verTodos?: { texto: string; href: string } }

/**
 * Desplegable en dos niveles (Carreras y Posgrados). PC: los grupos y, al costado, los
 * enlaces del elegido en 2 columnas (sin elección, el primero). Celular: acordeón.
 */
function Submenu({
  id,
  grupos,
  abierto,
  alElegir,
  verTodas,
}: {
  id: string
  grupos: GrupoDelSubmenu[]
  abierto: string | null
  alElegir: (titulo: string, conMouse: boolean) => void
  verTodas: { texto: string; href: string }
}) {
  const conMouse = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
  return (
    <div className={`dropdown-content dropdown-facultades dropdown-facultades--${id}`}>
      {grupos.map((g, i) => {
        const esAbierto = abierto === g.titulo
        const idPanel = `submenu-${id}-${i}`
        return (
          <div
            key={g.titulo}
            className={esAbierto ? 'submenu-facultad abierta' : 'submenu-facultad'}
            onMouseEnter={() => conMouse() && alElegir(g.titulo, true)}
          >
            <button
              type="button"
              className="submenu-facultad__titulo"
              aria-expanded={esAbierto}
              aria-controls={idPanel}
              onClick={() => !conMouse() && alElegir(g.titulo, false)}
              onFocus={() => conMouse() && alElegir(g.titulo, true)}
            >
              {g.titulo}
            </button>
            <div id={idPanel} className="submenu-facultad__carreras" role="group" aria-label={g.titulo}>
              {g.enlaces.map((e) => (
                <Link key={e.href} href={e.href}>
                  {e.nombre}
                </Link>
              ))}
              {g.verTodos && (
                <Link href={g.verTodos.href} className="submenu-facultad__ver-todos">
                  {g.verTodos.texto}
                </Link>
              )}
            </div>
          </div>
        )
      })}
      <Link href={verTodas.href} className="dropdown-ver-todas">
        {verTodas.texto}
      </Link>
    </div>
  )
}

const ANCHO_MOVIL = 1200

function seccionActual(ruta: string): string {
  if (ruta === '/') return 'inicio'
  const primera = ruta.split('/').filter(Boolean)[0] ?? ''
  return primera
}

export function MenuPrincipal({ carrerasPorFacultad, posgradosPorTipo, campusVirtualUrl }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [desplegado, setDesplegado] = useState<string | null>(null)
  // Grupo abierto en cada submenú (Carreras: facultad; Posgrados: tipo). null = el primero, en PC.
  const [submenuAbierto, setSubmenuAbierto] = useState<{ carreras: string | null; posgrados: string | null }>({ carreras: null, posgrados: null })
  // En PC el desplegable se abre con :hover/:focus-within (CSS), que no se entera de que
  // la ruta cambió: sin esto, tras hacer clic en un enlace el mouse sigue "encima" (no se
  // movió) y el panel queda tapando la página nueva, pareciendo que no pasó nada.
  // Se fuerza a cerrado hasta que el mouse realmente sale del ítem.
  const [cerradoForzado, setCerradoForzado] = useState<Record<string, boolean>>({})
  const ruta = usePathname()
  const [rutaAnterior, setRutaAnterior] = useState(ruta)
  const boton = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLUListElement>(null)

  // Al navegar se cierra todo (se ajusta durante el render, sin un efecto extra).
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta)
    setAbierto(false)
    setDesplegado(null)
    setSubmenuAbierto({ carreras: null, posgrados: null })
    setCerradoForzado({ carreras: true, posgrados: true, institucional: true })
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
  const claseDesplegable = (id: string) =>
    ['dropdown', desplegado === id ? 'active' : '', cerradoForzado[id] ? 'dropdown--cerrado-forzado' : '']
      .filter(Boolean)
      .join(' ')

  // Submenús: en PC el grupo se abre al pasar el mouse; tocando se abre y se cierra.
  const elegirGrupo = (menu: 'carreras' | 'posgrados') => (titulo: string, conMouse: boolean) =>
    setSubmenuAbierto((s) => ({ ...s, [menu]: conMouse ? titulo : s[menu] === titulo ? null : titulo }))

  // Al entrar a un desplegable: ya pasó el "cierre forzado" tras navegar, y si el foco
  // había quedado en otro desplegable (p. ej. se tocó un botón de facultad), se libera para
  // que ese otro no siga abierto por :focus-within mientras se abre este (se superponían).
  const alEntrarAlDesplegable = (id: string) => (e: React.MouseEvent<HTMLLIElement>) => {
    setCerradoForzado((f) => (f[id] ? { ...f, [id]: false } : f))
    const activo = document.activeElement
    if (activo instanceof HTMLElement && !e.currentTarget.contains(activo)) activo.blur()
  }

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
          <li className={claseDesplegable('carreras')} onMouseEnter={alEntrarAlDesplegable('carreras')}>
            <Link href={SITIO.carreras} className={clase('carreras')} onClick={alternar('carreras')}>
              Carreras
            </Link>
            {/* Antes las 23 carreras en una columna (más alta que la pantalla): ahora las
                facultades y, al lado, las carreras de la elegida. */}
            <Submenu
              id="carreras"
              grupos={carrerasPorFacultad.map((g) => ({
                titulo: g.facultad,
                enlaces: g.carreras.map((c) => ({ nombre: c.nombre, href: urlPrograma(c.slug) })),
              }))}
              abierto={submenuAbierto.carreras}
              alElegir={elegirGrupo('carreras')}
              verTodas={{ texto: 'Ver todas las carreras →', href: SITIO.carreras }}
            />
          </li>
          <li className={claseDesplegable('posgrados')} onMouseEnter={alEntrarAlDesplegable('posgrados')}>
            <Link href={SITIO.posgrados} className={clase('postgrados')} onClick={alternar('posgrados')}>
              Posgrados
            </Link>
            {/* Igual que Carreras: los tipos y, al lado, sus primeros programas + "Ver los N …". */}
            <Submenu
              id="posgrados"
              grupos={posgradosPorTipo.map((g) => ({
                titulo: g.titulo,
                enlaces: g.programas.map((p) => ({ nombre: p.nombre, href: urlPrograma(p.slug) })),
                verTodos: g.total > g.programas.length ? { texto: `Ver los ${g.total} ${g.titulo.toLowerCase()} →`, href: g.href } : { texto: `Ver ${g.titulo.toLowerCase()} →`, href: g.href },
              }))}
              abierto={submenuAbierto.posgrados}
              alElegir={elegirGrupo('posgrados')}
              verTodas={{ texto: 'Ver todos los posgrados →', href: SITIO.posgrados }}
            />
          </li>
          <li>
            <Link href={SITIO.noticias} className={clase('noticias')} aria-current={actual('noticias')}>
              Noticias
            </Link>
          </li>
          <li className={claseDesplegable('institucional')} onMouseEnter={alEntrarAlDesplegable('institucional')}>
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
