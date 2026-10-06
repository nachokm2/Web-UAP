// Extracción del sitio estático (contra los HTML reales del repositorio) y utilidades del sitio.

import path from 'path'

import { describe, expect, it } from 'vitest'

import { urlDeInsercion } from '@/components/sitio/TextoCms'

import {
  RAIZ_SITIO,
  extraerAgrupaciones,
  extraerPrograma,
  extraerReglamentos,
  listarPaginasDePrograma,
  mapearModalidad,
  mapearSecciones,
  similitud,
} from '../../scripts/migracion/extraer'
import { clasificarPostWp, type CategoriaWp } from '../../scripts/migracion/clasificar'
import { limpiarHtml, textoPlano } from '../../scripts/migracion/html'

const pagina = (rel: string) => path.join(RAIZ_SITIO, rel)

describe('Extracción de programas del sitio estático', () => {
  const programas = listarPaginasDePrograma().map(extraerPrograma)

  it('encuentra las 93 páginas con su tipo', () => {
    expect(programas).toHaveLength(93)
    const tipos = programas.reduce<Record<string, number>>((acc, p) => ((acc[p.tipo] = (acc[p.tipo] ?? 0) + 1), acc), {})
    expect(tipos).toEqual({ carrera: 23, diplomado: 48, especializacion: 12, maestria: 4, doctorado: 5, maestria_doctorado: 1 })
    expect(programas.every((p) => p.nombre && p.malla.length > 0)).toBe(true)
  })

  it('extrae datos, malla y brochure de una carrera sin inventar modalidad', () => {
    const derecho = extraerPrograma(pagina('pages/carreras/derecho.html'))
    expect(derecho).toMatchObject({ nombre: 'Derecho', tipo: 'carrera', duracion: '8 Semestres', sede: 'Central', modalidad: null, brochure: { wpMediaId: '26890' } })
    expect(derecho.malla).toHaveLength(8)
    expect(derecho.malla[0]).toMatchObject({ nombre: '1° Semestre', asignaturas: expect.arrayContaining(['Guaraní']) })
    const c = mapearSecciones(derecho.secciones)
    expect(c.objetivo).toMatch(/Formar profesionales en Derecho/)
    expect(c.campoLaboral).toBeTruthy()
    expect(c.perfilEgreso).toBeTruthy()
  })

  it('mapea las secciones de un posgrado y descarta la descripción duplicada', () => {
    const p = extraerPrograma(pagina('pages/posgrados/diplomado-en-mindfulness.html'))
    expect(p).toMatchObject({ tipo: 'diplomado', duracion: '4 Meses', modalidad: 'virtual', brochure: { wpMediaId: '30802' } })
    const c = mapearSecciones(p.secciones)
    expect(c.descripcion).toBeTruthy()
    expect(c.dirigidoA).toBeTruthy()
    expect(c.requisitos).toMatch(/Fotocopia/)
    expect(c.certificacion).toBeTruthy()
    expect(c.omitidas).toContainEqual({ titulo: 'Descripción del Diplomado', motivo: 'repite "Sobre el Programa"' })
  })

  it('agrupa carreras por facultad y posgrados por área según los listados', () => {
    const grupos = extraerAgrupaciones()
    expect(grupos.get('pages/carreras/podologia.html')).toBe('Facultad de Ciencias Médicas y de la Salud')
    expect(grupos.get('pages/posgrados/diplomado-en-psicoterapia-breve.html')).toBe('Ciencias Sociales y Humanidades')
  })

  it('lee los 47 reglamentos con su ID de WordPress', () => {
    const r = extraerReglamentos()
    expect(r).toHaveLength(47)
    expect(r.every((x) => x.titulo && (x.wpMediaId || x.url))).toBe(true)
  })
})

describe('Reglas de mapeo', () => {
  it('modalidad: solo valores claros; lo ambiguo queda vacío', () => {
    expect(mapearModalidad('Online · Campus Virtual')).toBe('virtual')
    expect(mapearModalidad('Presencial · Sede Central')).toBe('presencial')
    expect(mapearModalidad('Presencial y a distancia')).toBe('presencial_y_distancia')
    expect(mapearModalidad('Híbrida')).toBe('hibrida')
    expect(mapearModalidad('CAMPUS')).toBeNull()
    expect(mapearModalidad(null)).toBeNull()
  })

  it('similitud detecta textos casi iguales', () => {
    expect(similitud('El diplomado forma profesionales en salud mental', 'El diplomado forma profesionales en salud mental.')).toBe(1)
    expect(similitud('Odontología pediátrica', 'Derecho penal')).toBe(0)
  })
})

describe('Limpieza del HTML de WordPress (Elementor)', () => {
  const html = `<div class="elementor"><section><div class="elementor-widget"><h1>Título</h1>
    <p style="color:red" class="x">Texto con <a href="https://uap.edu.py/" onclick="x()">enlace</a> y <strong>negrita</strong>.</p>
    <img src="https://uap.edu.py/a.jpg" srcset="https://uap.edu.py/a-300.jpg 300w, https://uap.edu.py/a-1024.jpg 1024w">
    <ul><li><p>Ítem</p></li></ul><p>   </p><script>alert(1)</script></div></section></div>`

  it('deja solo bloques de texto, sin atributos peligrosos ni scripts', () => {
    const { html: limpio, imagenes } = limpiarHtml(html)
    expect(limpio).toBe('<h2>Título</h2>\n<p>Texto con <a href="https://uap.edu.py/">enlace</a> y <strong>negrita</strong>.</p>\n<ul><li><p>Ítem</p></li></ul>')
    expect(imagenes).toEqual(['https://uap.edu.py/a-1024.jpg'])
  })

  it('recorta textos largos en una palabra completa', () => {
    expect(textoPlano('<p>Uno dos tres cuatro cinco</p>', 15)).toBe('Uno dos tres…')
    expect(textoPlano('<p>  </p>')).toBeNull()
  })
})

describe('Clasificación de posts de WordPress', () => {
  // Misma jerarquía que tiene uap.edu.py (ids reales).
  const categorias: CategoriaWp[] = [
    { id: 40, slug: 'carreras', parent: 0 },
    { id: 70, slug: 'facultad-de-ciencias-sociales-y-humanas', parent: 40 },
    { id: 6, slug: 'postgrados', parent: 0 },
    { id: 42, slug: 'diplomado', parent: 6 },
    { id: 75, slug: 'ciencias-de-la-salud', parent: 6 },
    { id: 2, slug: 'noticias', parent: 0 },
    { id: 41, slug: 'noticias-postgrado', parent: 0 },
    { id: 3, slug: 'cursos-y-seminarios', parent: 0 },
    { id: 1, slug: 'uncategorized', parent: 0 },
  ]

  it('las páginas de carreras y posgrados (también por subcategoría) son programas, no noticias', () => {
    expect(clasificarPostWp({ slug: 'derecho', categories: [40] }, categorias).tipo).toBe('programa')
    expect(clasificarPostWp({ slug: 'trabajo-social', categories: [70] }, categorias).tipo).toBe('programa')
    expect(clasificarPostWp({ slug: 'diplomado-en-mindfulness', categories: [42, 75] }, categorias).tipo).toBe('programa')
  })

  it('noticias, noticias de postgrado y cursos son noticias aunque además estén sin categoría', () => {
    expect(clasificarPostWp({ slug: 'semana-cero', categories: [2, 41, 1] }, categorias).tipo).toBe('noticia')
    expect(clasificarPostWp({ slug: 'jornada-de-endodoncia', categories: [3] }, categorias).tipo).toBe('noticia')
  })

  it('formularios por asesor y posts sin categoría no se publican como noticias', () => {
    expect(clasificarPostWp({ slug: 'formulario-de-postulacion-uap-tamara', categories: [1] }, categorias).tipo).toBe('formulario')
    expect(clasificarPostWp({ slug: 'derecho-2', categories: [1] }, categorias).tipo).toBe('otro')
    expect(clasificarPostWp({ slug: 'sin-datos' }, categorias).tipo).toBe('otro')
  })
})

describe('Videos insertados', () => {
  it('solo YouTube y Vimeo, sin cookies de seguimiento', () => {
    expect(urlDeInsercion('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube-nocookie.com/embed/abc123')
    expect(urlDeInsercion('https://youtu.be/abc123')).toBe('https://www.youtube-nocookie.com/embed/abc123')
    expect(urlDeInsercion('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871?dnt=1')
    expect(urlDeInsercion('https://evil.example/video')).toBeNull()
    expect(urlDeInsercion('javascript:alert(1)')).toBeNull()
  })
})
