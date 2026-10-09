import Link from 'next/link'

import type { Carrera, Facultad } from '@/payload-types'
import { listarCarreras, obtenerConfiguracion } from '@/lib/datos'

import { MenuPrincipal, type GrupoDeCarreras } from './MenuPrincipal'

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
  const [carreras, config] = await Promise.all([listarCarreras(), obtenerConfiguracion()])
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo liviano (8 KB), sin optimización */}
          <img src="/images/logo-uap.png" alt="UAP – Universidad Autónoma del Paraguay" className="logo-img" width={300} height={61} />
        </Link>
        <MenuPrincipal carrerasPorFacultad={agruparPorFacultad(carreras as Carrera[])} campusVirtualUrl={config.campusVirtualUrl} />
      </div>
    </header>
  )
}
