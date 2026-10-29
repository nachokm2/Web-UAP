import { describe, expect, it } from 'vitest'

import {
  crearLimitador,
  listaDePaises,
  PAIS_PREDETERMINADO,
  validarInscripcion,
} from '@/lib/inscripcionSummit'

const formulario = (campos: Record<string, string>) => {
  const fd = new FormData()
  for (const [k, v] of Object.entries(campos)) fd.set(k, v)
  return fd
}

const valido = {
  nombre: 'Ana',
  apellido: 'Gómez',
  empresa: 'UAP',
  email: 'ana@ejemplo.com',
  telefono: '+595 981 123456',
  pais: 'Paraguay',
}

describe('Lista de países', () => {
  it('incluye Paraguay y está en español y ordenada', () => {
    const paises = listaDePaises()
    expect(paises).toContain(PAIS_PREDETERMINADO)
    expect(paises).toContain('Chile')
    expect(paises).toContain('España')
    expect(paises.length).toBeGreaterThan(190)
    expect(paises).toEqual([...paises].sort((a, b) => a.localeCompare(b, 'es')))
    expect(new Set(paises).size).toBe(paises.length)
  })
})

describe('Validación de la inscripción', () => {
  it('acepta datos completos y normaliza el correo', () => {
    const r = validarInscripcion(formulario({ ...valido, email: '  Ana@Ejemplo.COM ' }))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.datos.email).toBe('ana@ejemplo.com')
  })

  it('empresa y teléfono son opcionales', () => {
    expect(validarInscripcion(formulario({ ...valido, empresa: '', telefono: '' })).ok).toBe(true)
  })

  it('exige nombre, apellido, correo y país', () => {
    const r = validarInscripcion(formulario({ nombre: '', apellido: ' ', email: '', pais: '' }))
    expect(r.ok).toBe(false)
    if (!r.ok)
      expect(Object.keys(r.errores).sort()).toEqual(['apellido', 'email', 'nombre', 'pais'])
  })

  it('rechaza correo, teléfono y país inválidos', () => {
    const r = validarInscripcion(
      formulario({ ...valido, email: 'ana@', telefono: 'abc', pais: 'Narnia' }),
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(['email', 'pais', 'telefono'])
  })

  it('rechaza textos demasiado largos y limpia caracteres de control', () => {
    expect(validarInscripcion(formulario({ ...valido, nombre: 'a'.repeat(200) })).ok).toBe(false)
    const r = validarInscripcion(formulario({ ...valido, nombre: 'Ana\u0000\n  María' }))
    expect(r.ok && r.datos.nombre).toBe('Ana María')
  })
})

describe('Límite de envíos', () => {
  it('permite hasta el máximo por visitante dentro de la ventana y luego vuelve a permitir', () => {
    const puede = crearLimitador(2, 1000)
    expect(puede('a', 0)).toBe(true)
    expect(puede('a', 10)).toBe(true)
    expect(puede('a', 20)).toBe(false)
    expect(puede('b', 20)).toBe(true)
    expect(puede('a', 1500)).toBe(true)
  })
})
