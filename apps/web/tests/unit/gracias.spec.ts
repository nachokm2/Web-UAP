// Página de agradecimiento de las campañas presenciales: cuándo cuenta una conversión y que la
// dirección no esté en el registro de rutas del sitio (de ahí salen el sitemap y los enlaces).

import { describe, expect, it } from 'vitest'

import { RUTA_GRACIAS, decidirGracias, vieneDelSitio } from '@/lib/gracias'
import { SITIO } from '@/lib/urls'

const ORIGEN = 'https://uap.edu.py'

describe('vieneDelSitio', () => {
  it('acepta una página del mismo sitio (el formulario)', () => {
    expect(vieneDelSitio(`${ORIGEN}/ingenieria-civil/`, ORIGEN)).toBe(true)
    expect(vieneDelSitio(`${ORIGEN}/ingenieria-civil/?utm_source=meta`, ORIGEN)).toBe(true)
  })

  it('rechaza una visita directa, otro sitio, un valor inválido y la propia página', () => {
    expect(vieneDelSitio('', ORIGEN)).toBe(false)
    expect(vieneDelSitio('https://www.facebook.com/', ORIGEN)).toBe(false)
    expect(vieneDelSitio('https://uap.edu.py.otro-sitio.com/x/', ORIGEN)).toBe(false)
    expect(vieneDelSitio('no es una url', ORIGEN)).toBe(false)
    expect(vieneDelSitio(`${ORIGEN}${RUTA_GRACIAS}`, ORIGEN)).toBe(false)
  })
})

describe('decidirGracias', () => {
  const desdeElFormulario = `${ORIGEN}/ingenieria-civil/`

  it('cuenta la conversión una vez: viene del sitio y no estaba contada', () => {
    expect(decidirGracias({ referrer: desdeElFormulario, origen: ORIGEN, yaContada: false })).toBe('conversion')
  })

  it('no la cuenta de nuevo al recargar', () => {
    expect(decidirGracias({ referrer: desdeElFormulario, origen: ORIGEN, yaContada: true })).toBe('repetida')
  })

  it('con la marca del formulario es una conversión nueva, aunque la sesión ya tuviera otra', () => {
    const pendiente = true
    expect(decidirGracias({ referrer: '', origen: ORIGEN, yaContada: false, pendiente })).toBe('conversion')
    expect(decidirGracias({ referrer: desdeElFormulario, origen: ORIGEN, yaContada: true, pendiente })).toBe('conversion')
    // Funciona aunque el navegador no informe la procedencia (navegación sin recargar, extensiones).
    expect(decidirGracias({ referrer: 'https://l.facebook.com/', origen: ORIGEN, yaContada: false, pendiente })).toBe('conversion')
  })

  it('una visita directa o desde otro sitio nunca es una conversión', () => {
    expect(decidirGracias({ referrer: '', origen: ORIGEN, yaContada: false })).toBe('visita_directa')
    expect(decidirGracias({ referrer: 'https://l.facebook.com/', origen: ORIGEN, yaContada: false })).toBe('visita_directa')
  })
})

describe('dirección de la página', () => {
  it('lleva barra final y un sufijo difícil de adivinar', () => {
    expect(RUTA_GRACIAS).toMatch(/^\/gracias-evento-presencial-[a-z0-9]{6}\/$/)
  })

  it('no está en el registro de rutas del sitio, así que no entra al sitemap ni a los enlaces', () => {
    expect(Object.values(SITIO)).not.toContain(RUTA_GRACIAS)
  })
})
