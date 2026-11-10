// Lógica pura de la página de un evento: fecha en español, descripción para buscadores,
// marcado Event y armado de la vista desde el contenido de respaldo y desde el CMS.

import { describe, expect, it } from 'vitest'

import { CONTENIDO_SUMMIT } from '@/lib/eventos/contenidoSummit'
import {
  datosEstructurados,
  descripcionDelEvento,
  formatoFechaLarga,
  vistaDesdeCms,
  vistaDesdeContenido,
} from '@/lib/eventos/vista'
import type { Evento, Expositor, Medio } from '@/payload-types'

describe('formatoFechaLarga', () => {
  it('escribe la fecha en español', () => {
    expect(formatoFechaLarga('2026-11-19')).toBe('19 de noviembre de 2026')
    expect(formatoFechaLarga('2027-03-01')).toBe('1 de marzo de 2027')
  })

  it('no se corre de día con la hora que guarda el CMS (mediodía UTC)', () => {
    expect(formatoFechaLarga('2026-11-19T12:00:00.000Z')).toBe('19 de noviembre de 2026')
    expect(formatoFechaLarga('2026-12-31T12:00:00.000Z')).toBe('31 de diciembre de 2026')
  })
})

describe('vistaDesdeContenido (respaldo del Summit)', () => {
  const v = vistaDesdeContenido(CONTENIDO_SUMMIT)

  it('arma los datos del evento', () => {
    expect(v.fecha).toBe('19 de noviembre de 2026')
    expect(v.lugar).toBe('Hotel Sheraton Asunción')
    expect(v.ciudad).toBe('Asunción')
    expect(v.parrafos).toHaveLength(3)
    expect(v.certificacion).toHaveLength(3)
    expect(v.redes.map((r) => r.red)).toEqual(['instagram', 'linkedin', 'x'])
  })

  it('mantiene el orden de los expositores', () => {
    expect(v.expositores.map((e) => e.nombre)).toEqual([
      'Carlos Ruffinelli',
      'Dr. Teodoro Ribera',
      'Dr. Pedro R. Mondelo',
      'Eva Villalba',
      'Mariano Battistotti',
      'Esteban Barahona',
      'Daniel Schmidt Mclachlan',
    ])
  })

  it('resuelve los participantes de cada sesión del programa', () => {
    const inauguracion = v.programa.find((s) => s.hora === '09:00')
    expect(inauguracion?.personas.map((p) => p.nombre)).toEqual([
      'Carlos Ruffinelli',
      'Dr. Teodoro Ribera',
      'Dr. Pedro R. Mondelo',
    ])
    expect(v.programa.find((s) => s.hora === '10:30')?.personas).toEqual([])
    expect(v.programa).toHaveLength(10)
  })

  it('no inventa país donde no hay', () => {
    expect(v.expositores.find((e) => e.nombre === 'Eva Villalba')?.pais).toBeUndefined()
  })

  it('conserva las medidas de las imágenes de los comités', () => {
    expect(v.comites.map((c) => [c.imagen?.ancho, c.imagen?.alto])).toEqual([
      [1000, 400],
      [1000, 700],
      [1000, 500],
    ])
  })
})

describe('textos para buscadores', () => {
  const v = vistaDesdeContenido(CONTENIDO_SUMMIT)

  it('la descripción por defecto es la que ya tenía la página', () => {
    expect(descripcionDelEvento(v)).toBe(
      'V Summit Internacional UAP 2026: “La nueva era del trabajo y el talento”. 19 de noviembre de 2026, Hotel Sheraton Asunción. Conferencias, mesas de conversación y certificación. Inscripción abierta.',
    )
  })

  it('una descripción escrita a mano tiene prioridad', () => {
    expect(descripcionDelEvento({ ...v, descripcionSeo: 'Texto propio.' })).toBe('Texto propio.')
  })

  it('el marcado Event conserva fechas, lugar y organizador', () => {
    const d = datosEstructurados(v, 'https://uap.edu.py/summit-internacional-uap2026/')
    expect(d.startDate).toBe('2026-11-19T08:00:00-03:00')
    expect(d.endDate).toBe('2026-11-19T13:30:00-03:00')
    expect(d.name).toBe('V Summit Internacional UAP 2026')
    expect(d.description.startsWith('La nueva era del trabajo y el talento. Un espacio de análisis')).toBe(true)
    expect(d.location.address.streetAddress).toBe('Aviadores Del Chaco 2066')
    expect(d.location.address.addressLocality).toBe('Asunción')
    expect(d.organizer.name).toBe('Universidad Autónoma del Paraguay')
  })
})

describe('vistaDesdeCms', () => {
  const medio = (nombre: string): Medio =>
    ({ id: 1, alt: nombre, url: `http://localhost:3000/api/medios/file/${nombre}.jpg`, width: 800, height: 600 }) as Medio
  const persona = (id: number, nombre: string): Expositor =>
    ({ id, nombre, cargo: 'Cargo', institucion: 'Institución', pais: null, foto: medio('foto'), logo: null }) as Expositor

  const doc = {
    id: 1,
    nombre: 'Evento de prueba',
    titulo: 'Lema',
    slug: 'evento-de-prueba',
    fecha: '2026-11-19T12:00:00.000Z',
    horaInicio: '09:00',
    horaFin: '12:00',
    lugar: 'Lugar',
    ciudad: 'Asunción',
    direccion: 'Calle 1, Asunción',
    mapa: 'https://maps.example/x',
    hashtag: null,
    correo: 'evento@uap.edu.py',
    textoBoton: 'Inscribirme',
    banner: medio('banner'),
    tituloIntro: 'Intro',
    parrafos: [{ texto: 'Uno' }, { texto: 'Dos' }],
    certificacion: null,
    organizador: { nombre: 'UAP', logo: null },
    expositores: [persona(1, 'Ana'), 99, persona(2, 'Beto')],
    programa: [{ hora: '09:00', titulo: 'Apertura', rol: null, nota: null, personas: [persona(2, 'Beto'), 77] }],
    colaboran: [{ nombre: 'Aliado', url: null, logo: medio('aliado') }],
    comites: null,
    updatedAt: '2026-11-01T00:00:00.000Z',
    createdAt: '2026-11-01T00:00:00.000Z',
  } as unknown as Evento

  const v = vistaDesdeCms(doc)

  it('toma la fecha del CMS sin correrla de día', () => {
    expect(v.fecha).toBe('19 de noviembre de 2026')
    expect(v.fechaIso).toBe('2026-11-19')
  })

  it('ignora las relaciones sin poblar (id suelto)', () => {
    expect(v.expositores.map((e) => e.nombre)).toEqual(['Ana', 'Beto'])
    expect(v.programa[0].personas.map((e) => e.nombre)).toEqual(['Beto'])
  })

  it('usa valores vacíos seguros para lo opcional', () => {
    expect(v.hashtag).toBe('')
    expect(v.certificacion).toEqual([])
    expect(v.comites).toEqual([])
    expect(v.programa[0].rol).toBeUndefined()
    expect(v.colaboran[0].url).toBeUndefined()
    expect(v.expositores[0].pais).toBeUndefined()
  })

  it('las imágenes son rutas relativas al sitio, no direcciones absolutas', () => {
    expect(v.expositores[0].foto?.src).toBe('/api/medios/file/foto.jpg')
    expect(v.banner?.src).toBe('/api/medios/file/banner.jpg')
  })
})
