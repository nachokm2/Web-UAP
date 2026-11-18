// Resumen de inscripciones al Summit sin datos personales: cálculo por día y por país, zonas
// horarias y comprobación del token. Puro (sin base de datos).

import { describe, expect, it } from 'vitest'

import {
  MAX_PAISES,
  TOKEN_MINIMO,
  diaEnZona,
  diasEntre,
  esFechaISO,
  resumenDeInscripciones,
  sumarDias,
  tokenDeEncabezado,
  tokenValido,
  zonaValida,
} from '@/lib/resumenSummit'

const fila = (createdAt: string, pais = 'Paraguay') => ({ createdAt, pais })

describe('fechas y zonas', () => {
  it('esFechaISO solo acepta días reales', () => {
    for (const ok of ['2026-11-18', '2024-02-29']) expect(esFechaISO(ok)).toBe(true)
    for (const mal of ['2026-02-30', '2026-13-01', '18/11/2026', '2026-11-18T10:00', '', 20261118, null])
      expect(esFechaISO(mal)).toBe(false)
  })

  it('el día depende de la zona, no del servidor (UTC)', () => {
    const instante = '2026-11-18T01:30:00.000Z'
    expect(diaEnZona(instante, 'UTC')).toBe('2026-11-18')
    expect(diaEnZona(instante, 'America/Santiago')).toBe('2026-11-17')
    expect(diaEnZona(instante, 'America/Asuncion')).toBe('2026-11-17')
    expect(diaEnZona('no es fecha', 'UTC')).toBeNull()
  })

  it('el corte de medianoche cae en el día correcto en cada zona', () => {
    // Santiago es UTC-3 en noviembre: la medianoche local es a las 03:00 UTC.
    expect(diaEnZona('2026-11-18T02:59:59.000Z', 'America/Santiago')).toBe('2026-11-17')
    expect(diaEnZona('2026-11-18T03:00:00.000Z', 'America/Santiago')).toBe('2026-11-18')
  })

  it('zonaValida, sumarDias y diasEntre', () => {
    expect(zonaValida('America/Santiago')).toBe(true)
    expect(zonaValida('Marte/Olympus')).toBe(false)
    expect(sumarDias('2026-02-28', 1)).toBe('2026-03-01')
    expect(sumarDias('2026-01-01', -1)).toBe('2025-12-31')
    expect(diasEntre('2026-11-16', '2026-11-18')).toEqual(['2026-11-16', '2026-11-17', '2026-11-18'])
    expect(diasEntre('2026-11-18', '2026-11-18')).toEqual(['2026-11-18'])
  })
})

describe('resumenDeInscripciones', () => {
  const filas = [
    fila('2026-11-16T15:00:00.000Z'),
    fila('2026-11-17T12:00:00.000Z'),
    fila('2026-11-17T13:00:00.000Z', 'Argentina'),
    fila('2026-11-17T20:00:00.000Z', 'Paraguay'),
    fila('2026-11-18T02:59:00.000Z', 'Chile'), // 17 en Santiago, 18 en UTC
    fila('2026-11-10T12:00:00.000Z', 'Brasil'), // fuera del rango
  ]

  it('cuenta por día y por país, con todos los días del rango (con ceros)', () => {
    const r = resumenDeInscripciones(filas, { desde: '2026-11-15', hasta: '2026-11-18', zona: 'America/Santiago' })
    expect(r.total).toBe(5)
    expect(r.por_dia).toEqual([
      { fecha: '2026-11-15', inscripciones: 0 },
      { fecha: '2026-11-16', inscripciones: 1 },
      { fecha: '2026-11-17', inscripciones: 4 },
      { fecha: '2026-11-18', inscripciones: 0 },
    ])
    expect(r.por_pais).toEqual([
      { pais: 'Paraguay', inscripciones: 3 },
      { pais: 'Argentina', inscripciones: 1 },
      { pais: 'Chile', inscripciones: 1 },
    ])
    expect(r.por_dia.reduce((s, d) => s + d.inscripciones, 0)).toBe(r.total)
    expect(r.por_pais.reduce((s, p) => s + p.inscripciones, 0)).toBe(r.total)
    expect(r.primera_inscripcion).toBe('2026-11-16T15:00:00.000Z')
    expect(r.ultima_inscripcion).toBe('2026-11-18T02:59:00.000Z')
    expect([r.desde, r.hasta, r.zona]).toEqual(['2026-11-15', '2026-11-18', 'America/Santiago'])
  })

  it('la zona cambia el día de la inscripción de las 02:59 UTC', () => {
    const utc = resumenDeInscripciones(filas, { desde: '2026-11-15', hasta: '2026-11-18', zona: 'UTC' })
    expect(utc.por_dia.find((d) => d.fecha === '2026-11-18')?.inscripciones).toBe(1)
    expect(utc.por_dia.find((d) => d.fecha === '2026-11-17')?.inscripciones).toBe(3)
  })

  it('sin rango cuenta todo y lista solo los días con inscripciones, en orden', () => {
    const r = resumenDeInscripciones(filas, { zona: 'America/Santiago' })
    expect(r.total).toBe(6)
    expect(r.por_dia.map((d) => d.fecha)).toEqual(['2026-11-10', '2026-11-16', '2026-11-17'])
    expect(r.desde).toBeNull()
  })

  it('sin inscripciones da ceros y listas vacías, no errores', () => {
    const r = resumenDeInscripciones([], { desde: '2026-11-01', hasta: '2026-11-03', zona: 'UTC' })
    expect(r.total).toBe(0)
    expect(r.por_dia).toHaveLength(3)
    expect(r.por_pais).toEqual([])
    expect(r.primera_inscripcion).toBeNull()
  })

  it('agrupa los países sobrantes en "Otros países" sin perder inscripciones', () => {
    const muchos = Array.from({ length: MAX_PAISES + 5 }, (_, i) => fila('2026-11-17T12:00:00.000Z', `País ${String(i).padStart(2, '0')}`))
    const r = resumenDeInscripciones(muchos, { zona: 'UTC' })
    expect(r.por_pais).toHaveLength(MAX_PAISES + 1)
    expect(r.por_pais.at(-1)).toEqual({ pais: 'Otros países', inscripciones: 5 })
    expect(r.por_pais.reduce((s, p) => s + p.inscripciones, 0)).toBe(muchos.length)
  })

  it('un país vacío se llama "Sin país" y se ignoran fechas inválidas', () => {
    const r = resumenDeInscripciones([fila('2026-11-17T12:00:00.000Z', '  '), fila('basura')], { zona: 'UTC' })
    expect(r.total).toBe(1)
    expect(r.por_pais).toEqual([{ pais: 'Sin país', inscripciones: 1 }])
  })

  it('NUNCA devuelve datos personales, aunque la fila traiga más campos', () => {
    const conDatos = [{ ...fila('2026-11-17T12:00:00.000Z'), nombre: 'Ana', apellido: 'Gómez', email: 'ana@ejemplo.com', telefono: '+595981123456' }]
    const texto = JSON.stringify(resumenDeInscripciones(conDatos, { zona: 'UTC' }))
    for (const dato of ['Ana', 'Gómez', 'ana@ejemplo.com', '+595981123456', '@']) expect(texto).not.toContain(dato)
  })
})

describe('token del resumen', () => {
  const bueno = 'a'.repeat(TOKEN_MINIMO)

  it('lee el token del encabezado Bearer', () => {
    expect(tokenDeEncabezado('Bearer abc123')).toBe('abc123')
    expect(tokenDeEncabezado('bearer   abc123 ')).toBe('abc123')
    for (const mal of ['abc123', 'Basic abc', 'Bearer', '', null, undefined]) expect(tokenDeEncabezado(mal)).toBeNull()
  })

  it('acepta solo el token exacto', () => {
    expect(tokenValido(bueno, bueno)).toBe(true)
    expect(tokenValido(bueno + 'x', bueno)).toBe(false)
    expect(tokenValido('b'.repeat(TOKEN_MINIMO), bueno)).toBe(false)
    expect(tokenValido(null, bueno)).toBe(false)
  })

  it('si el token configurado falta o es corto, el resumen queda cerrado: nada lo abre', () => {
    expect(tokenValido('cualquiera', undefined)).toBe(false)
    expect(tokenValido('', '')).toBe(false)
    expect(tokenValido('corto', 'corto')).toBe(false)
    expect(tokenValido('a'.repeat(TOKEN_MINIMO - 1), 'a'.repeat(TOKEN_MINIMO - 1))).toBe(false)
  })
})
