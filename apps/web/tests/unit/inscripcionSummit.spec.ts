import { describe, expect, it } from 'vitest'

import { listaDeCorreos } from '@/lib/correo'
import {
  avisoDeInscripcion,
  crearLimitador,
  fechaHoraAsuncion,
  inscripcionesACsv,
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

// 13:15 UTC = 10:15 en Asunción (UTC-3 todo el año).
const fila = { ...valido, createdAt: '2026-10-29T13:15:00.000Z' }

describe('Fecha de Asunción', () => {
  it('muestra día, mes, año y hora local de 24 h', () => {
    expect(fechaHoraAsuncion(fila.createdAt)).toBe('29/10/2026 10:15')
    expect(fechaHoraAsuncion('2026-11-19T23:30:00.000Z')).toBe('19/11/2026 20:30')
    expect(fechaHoraAsuncion('no es fecha')).toBe('')
  })
})

describe('Aviso de inscripción', () => {
  it('lleva el nombre en el asunto y todos los datos, el total y el enlace en el texto', () => {
    const { subject, text } = avisoDeInscripcion(fila, 12, 'V Summit', 'https://uap.edu.py/admin/x')
    expect(subject).toBe('Nueva inscripción al V Summit: Ana Gómez')
    for (const parte of ['Ana Gómez', 'UAP', 'ana@ejemplo.com', '+595 981 123456', 'Paraguay'])
      expect(text).toContain(parte)
    expect(text).toContain('29/10/2026 10:15')
    expect(text).toContain('Inscripciones hasta ahora: 12')
    expect(text).toContain('https://uap.edu.py/admin/x')
  })

  it('marca con un guion lo opcional que falta', () => {
    const { text } = avisoDeInscripcion({ ...fila, empresa: null, telefono: '' }, 1, 'V', 'u')
    expect(text).toContain('Empresa / Institución: —')
    expect(text).toContain('Teléfono: —')
  })
})

describe('Planilla CSV', () => {
  it('empieza con BOM, usa ";" y una fila por inscripción con la fecha local', () => {
    const csv = inscripcionesACsv([fila])
    expect(csv.startsWith('﻿')).toBe(true)
    const [titulos, primera, resto] = csv.slice(1).split('\r\n')
    expect(titulos).toBe(
      'Nombre;Apellido;Empresa / Institución;Correo electrónico;Teléfono;País;Fecha de inscripción',
    )
    expect(primera).toBe("Ana;Gómez;UAP;ana@ejemplo.com;'+595 981 123456;Paraguay;29/10/2026 10:15")
    expect(resto).toBe('')
  })

  it('neutraliza fórmulas y entrecomilla separadores, comillas y saltos', () => {
    const csv = inscripcionesACsv([
      { ...fila, nombre: '=HYPERLINK("http://x")', apellido: 'Pérez; Ruiz', empresa: '@SUM(A1)' },
    ])
    const datos = csv.slice(1).split('\r\n')[1]
    expect(datos.startsWith(`"'=HYPERLINK(""http://x"")";"Pérez; Ruiz";'@SUM(A1);`)).toBe(true)
  })

  it('sin inscripciones queda solo la fila de títulos', () => {
    expect(inscripcionesACsv([]).slice(1).split('\r\n')).toHaveLength(2)
  })
})

describe('Lista de correos', () => {
  it('separa por comas y descarta vacíos', () => {
    expect(listaDeCorreos(' a@uap.edu.py, b@uap.edu.py ,,')).toEqual(['a@uap.edu.py', 'b@uap.edu.py'])
    expect(listaDeCorreos(undefined)).toEqual([])
  })
})
