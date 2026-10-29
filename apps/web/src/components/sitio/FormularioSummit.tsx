'use client'

// Formulario de inscripción al V Summit Internacional UAP 2026. Los datos se guardan en la tabla
// inscripciones-summit mediante la acción del servidor `inscribirse` (valida otra vez allá).

import { useActionState, useEffect, useRef } from 'react'

import { inscribirse } from '@/app/(sitio)/summit-internacional-uap2026/acciones'
import {
  PAIS_PREDETERMINADO,
  type CampoInscripcion,
  type EstadoInscripcion,
} from '@/lib/inscripcionSummit'

type Props = {
  /** Lista de países (la calcula el servidor una vez). */
  paises: string[]
  /** Fecha y lugar para el mensaje de confirmación. */
  detalle: string
}

const INICIAL: EstadoInscripcion = { estado: 'inicial' }

export function FormularioSummit({ paises, detalle }: Props) {
  const [estado, accion, enviando] = useActionState(inscribirse, INICIAL)
  // Momento en que se dibujó el formulario: un envío instantáneo no es una persona (ver la acción).
  const dibujadoEn = useRef(0)
  useEffect(() => {
    dibujadoEn.current = Date.now()
  }, [])
  const enviar = (datos: FormData) => {
    datos.set('dibujado_en', String(dibujadoEn.current))
    accion(datos)
  }

  if (estado.estado === 'ok') {
    return (
      <div className="summit-confirmacion" role="status">
        <h3>¡Listo, {estado.nombre}!</h3>
        <p>Recibimos tu inscripción al V Summit Internacional UAP 2026.</p>
        <p>{detalle}</p>
      </div>
    )
  }

  const errores = estado.estado === 'error' ? (estado.errores ?? {}) : {}
  const valores = estado.estado === 'error' ? (estado.valores ?? {}) : {}
  const valor = (c: CampoInscripcion) => valores[c] ?? ''

  const campo = (c: CampoInscripcion) => ({
    id: `summit-${c}`,
    name: c,
    'aria-invalid': errores[c] ? true : undefined,
    'aria-describedby': errores[c] ? `summit-${c}-error` : undefined,
  })
  const error = (c: CampoInscripcion) =>
    errores[c] ? (
      <p className="summit-campo__error" id={`summit-${c}-error`}>
        {errores[c]}
      </p>
    ) : null

  return (
    <form action={enviar} className="summit-form" noValidate>
      {estado.estado === 'error' && estado.mensaje && (
        <p className="summit-form__aviso" role="alert">
          {estado.mensaje}
        </p>
      )}

      <div className="summit-form__fila">
        <div className="summit-campo">
          <label htmlFor="summit-nombre">Nombre *</label>
          <input
            {...campo('nombre')}
            type="text"
            autoComplete="given-name"
            maxLength={80}
            required
            defaultValue={valor('nombre')}
          />
          {error('nombre')}
        </div>
        <div className="summit-campo">
          <label htmlFor="summit-apellido">Apellido *</label>
          <input
            {...campo('apellido')}
            type="text"
            autoComplete="family-name"
            maxLength={80}
            required
            defaultValue={valor('apellido')}
          />
          {error('apellido')}
        </div>
      </div>

      <div className="summit-campo">
        <label htmlFor="summit-empresa">Empresa / Institución</label>
        <input
          {...campo('empresa')}
          type="text"
          autoComplete="organization"
          maxLength={150}
          defaultValue={valor('empresa')}
        />
        {error('empresa')}
      </div>

      <div className="summit-campo">
        <label htmlFor="summit-email">Correo electrónico *</label>
        <input
          {...campo('email')}
          type="email"
          autoComplete="email"
          maxLength={160}
          required
          defaultValue={valor('email')}
        />
        {error('email')}
      </div>

      <div className="summit-form__fila">
        <div className="summit-campo">
          <label htmlFor="summit-telefono">Teléfono</label>
          <input
            {...campo('telefono')}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={25}
            placeholder="+595 981 123456"
            defaultValue={valor('telefono')}
          />
          {error('telefono')}
        </div>
        <div className="summit-campo">
          <label htmlFor="summit-pais">País *</label>
          <select
            {...campo('pais')}
            autoComplete="country-name"
            required
            defaultValue={valor('pais') || PAIS_PREDETERMINADO}
          >
            {paises.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {error('pais')}
        </div>
      </div>

      {/* Campo trampa: las personas no lo ven; los robots suelen completarlo. */}
      <div className="summit-form__trampa" aria-hidden="true">
        <label htmlFor="summit-sitio-web">No completar este campo</label>
        <input
          id="summit-sitio-web"
          name="sitio_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <p className="summit-form__nota">
        Usamos tus datos solo para gestionar tu asistencia y comunicarte novedades del evento. Los
        campos con * son obligatorios.
      </p>

      <button type="submit" className="btn btn-accent btn-lg" disabled={enviando}>
        {enviando ? 'Enviando…' : 'Inscribirme'}
      </button>
    </form>
  )
}
