import { GRUPOS_AUTORIDADES } from '@/collections/Autoridades'
import type { Autoridad } from '@/payload-types'

import { Imagen, esMedio } from './Imagen'

type Props = {
  autoridades: Autoridad[]
  /** Nivel del título de cada grupo (h2 en /autoridades/, h3 dentro de Institucional). */
  nivel?: 'h2' | 'h3'
}

/** Autoridades agrupadas en el orden institucional; los grupos sin personas no se muestran. */
export function ListaAutoridades({ autoridades, nivel = 'h2' }: Props) {
  const Titulo = nivel
  const Nombre = nivel === 'h2' ? 'h3' : 'h4'
  return (
    <>
      {GRUPOS_AUTORIDADES.map(({ value, label }) => {
        const personas = autoridades.filter((a) => a.grupo === value)
        if (!personas.length) return null
        return (
          <section key={value} className="autoridades-grupo" aria-label={label}>
            <Titulo className="institucional-subtitulo">{label}</Titulo>
            <div className="authorities-grid">
              {personas.map((p) => (
                <div key={p.id} className="authority-card">
                  {esMedio(p.foto) && (
                    <Imagen medio={p.foto} tamano="tarjeta" sizes="(max-width: 768px) 50vw, 240px" className="authority-card__foto" />
                  )}
                  <p className="authority-card__cargo">{p.cargo}</p>
                  <Nombre className="authority-card__nombre">{p.nombre}</Nombre>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}
