import Link from 'next/link'

import { TIPOS_POSGRADO } from '@/collections/Posgrados'
import { MODALIDADES } from '@/fields/programa'
import type { Carrera, Documento, Posgrado, Sede } from '@/payload-types'
import { urlPrograma } from '@/lib/urls'

import { Imagen, esMedio } from './Imagen'

type Props = { programa: Carrera | Posgrado; tipo: 'carrera' | 'posgrado' }

const etiqueta = (lista: { value: string; label: string }[], v?: string | null) => lista.find((o) => o.value === v)?.label

/** Tarjeta de los listados (mismo formato que el sitio estático). */
export function TarjetaPrograma({ programa: p, tipo }: Props) {
  const tipoPosgrado = tipo === 'posgrado' ? (p as Posgrado).tipo : null
  const badge = tipo === 'carrera' ? 'Carrera' : (etiqueta(TIPOS_POSGRADO, tipoPosgrado) ?? 'Posgrado')
  const sedes = (p.sedes ?? []).filter((s): s is Sede => typeof s === 'object').map((s) => s.nombre)
  const meta = [p.duracion, etiqueta(MODALIDADES, p.modalidad) ?? sedes.join(', ')].filter(Boolean).join(' · ')
  const brochure = typeof p.brochure === 'object' && p.brochure ? (p.brochure as Documento) : null

  return (
    <div className="career-card">
      {esMedio(p.imagenPrincipal) && (
        <Link href={urlPrograma(p.slug)} className="career-card__imagen" tabIndex={-1} aria-hidden="true">
          <Imagen medio={p.imagenPrincipal} tamano="tarjeta" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px" />
        </Link>
      )}
      <div className={`posgrado-badge${tipoPosgrado ? ` badge-${tipoPosgrado}` : ''}`}>{badge}</div>
      <h3>
        <Link href={urlPrograma(p.slug)}>{p.nombre}</Link>
      </h3>
      {meta && <p className="posgrado-meta">{meta}</p>}
      {p.descripcionCorta && <p>{p.descripcionCorta}</p>}
      <div className="career-card__acciones">
        <Link href={urlPrograma(p.slug)} className="posgrado-brochure-link" aria-label={`Ver programa: ${p.nombre}`}>
          Ver programa →
        </Link>
        {brochure?.url && (
          <a href={brochure.url} className="posgrado-brochure-link" target="_blank" rel="noopener" aria-label={`Descargar brochure: ${p.nombre}`}>
            Descargar Brochure
          </a>
        )}
      </div>
    </div>
  )
}
