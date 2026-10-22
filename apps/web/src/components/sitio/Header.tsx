import Link from 'next/link'

import type { Carrera, Facultad, Posgrado } from '@/payload-types'
import { listarCarreras, listarPosgrados, obtenerConfiguracion } from '@/lib/datos'
import { SITIO } from '@/lib/urls'

import { MenuPrincipal, type GrupoDeCarreras, type GrupoDePosgrados } from './MenuPrincipal'

// Mismas secciones (y anclas) que la página /postgrados/.
const TIPOS_DEL_MENU: { id: string; titulo: string; tipos: Posgrado['tipo'][] }[] = [
  { id: 'diplomados', titulo: 'Diplomados', tipos: ['diplomado'] },
  { id: 'especializaciones', titulo: 'Especializaciones', tipos: ['especializacion'] },
  { id: 'maestrias', titulo: 'Maestrías', tipos: ['maestria', 'maestria_doctorado'] },
  { id: 'doctorados', titulo: 'Doctorados', tipos: ['doctorado'] },
  { id: 'otros', titulo: 'Otros programas', tipos: ['otro'] },
]
/** Programas que se muestran por tipo en el menú; el resto, con "Ver los N …". */
const PROGRAMAS_POR_TIPO = 8

/** Posgrados publicados por tipo (con su total) y los primeros de cada uno. */
function agruparPorTipo(posgrados: Posgrado[]): GrupoDePosgrados[] {
  return TIPOS_DEL_MENU.map((t) => {
    const del_tipo = posgrados.filter((p) => t.tipos.includes(p.tipo))
    return {
      titulo: t.titulo,
      href: `${SITIO.posgrados}#${t.id}`,
      total: del_tipo.length,
      programas: del_tipo.slice(0, PROGRAMAS_POR_TIPO).map((p) => ({ nombre: p.nombreCorto || p.nombre, slug: p.slug })),
    }
  }).filter((g) => g.total > 0)
}

/** Carreras publicadas agrupadas por facultad, en el orden de las facultades. */
function agruparPorFacultad(carreras: Carrera[]): GrupoDeCarreras[] {
  const grupos = new Map<string, GrupoDeCarreras & { orden: number }>()
  for (const c of carreras) {
    const f = typeof c.facultad === 'object' && c.facultad ? (c.facultad as Facultad) : null
    const nombre = f?.nombre ?? 'Otras carreras'
    if (!grupos.has(nombre)) grupos.set(nombre, { facultad: nombre, carreras: [], orden: f?.orden ?? 999 })
    grupos.get(nombre)!.carreras.push({ nombre: c.nombreCorto || c.nombre, slug: c.slug })
  }
  return [...grupos.values()].sort((a, b) => a.orden - b.orden).map(({ facultad, carreras }) => ({ facultad, carreras }))
}

export async function Header() {
  const [carreras, posgrados, config] = await Promise.all([listarCarreras(), listarPosgrados(), obtenerConfiguracion()])
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo liviano (8 KB), sin optimización */}
          <img src="/images/logo-uap.png" alt="UAP – Universidad Autónoma del Paraguay" className="logo-img" width={300} height={61} />
        </Link>
        <MenuPrincipal
          carrerasPorFacultad={agruparPorFacultad(carreras as Carrera[])}
          posgradosPorTipo={agruparPorTipo(posgrados as Posgrado[])}
          campusVirtualUrl={config.campusVirtualUrl}
        />
      </div>
    </header>
  )
}
