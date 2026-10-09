// Lee la página "Autoridades" de WordPress (/autoridades-del-c-s-u/, armada con Elementor).
// Estructura, widget por widget: título de grupo → título con el cargo → imagen con la foto
// y el nombre como leyenda (Consejo y Directivos), o un segundo título con el nombre
// (Dirección de Carrera, sin fotos).

import { load } from 'cheerio'

import type { GrupoAutoridad } from '../../src/collections/Autoridades'

export type AutoridadExtraida = { grupo: GrupoAutoridad; cargo: string; nombre: string; foto?: string }

const GRUPOS: Record<string, GrupoAutoridad> = {
  'consejo superior universitario': 'consejo',
  'directivos uap': 'directivos',
  'direccion de carrera': 'carreras',
  'coordinacion de programas de postgrado': 'posgrado',
}

/** Sin espacios de ancho cero (WordPress deja uno tras "Director Académico") ni dobles. */
const limpio = (s: string) => s.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim()
const clave = (s: string) => limpio(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function extraerAutoridades(html: string): AutoridadExtraida[] {
  const $ = load(html)
  const out: AutoridadExtraida[] = []
  let grupo: GrupoAutoridad | null = null
  let cargo: string | null = null

  $('[data-widget_type]').each((_, el) => {
    const w = $(el)
    const tipo = (w.attr('data-widget_type') ?? '').split('.')[0]
    if (tipo === 'heading') {
      const texto = limpio(w.text())
      if (!texto) return
      if (GRUPOS[clave(texto)]) {
        grupo = GRUPOS[clave(texto)]
        cargo = null
        return
      }
      if (!grupo) return
      // En Dirección de Carrera el nombre es el título siguiente al de la carrera.
      if (grupo === 'carreras' || grupo === 'posgrado') {
        if (cargo) {
          out.push({ grupo, cargo, nombre: texto })
          cargo = null
        } else cargo = texto
        return
      }
      cargo = texto
      return
    }
    if (tipo === 'image' && grupo && cargo) {
      const nombre = limpio(w.find('figcaption').text() || w.text())
      if (!nombre) return
      const img = w.find('img')
      const foto = img.attr('data-src') || img.attr('src')
      out.push({ grupo, cargo, nombre, ...(foto && /^https?:\/\//.test(foto) ? { foto } : {}) })
      cargo = null
    }
  })
  return out
}
