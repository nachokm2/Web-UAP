'use client'

// Panel "Flujo editorial" en la barra lateral. Muestra el estado y solo los botones
// que el rol del usuario puede usar. La validación real ocurre en el servidor
// (workflow/hooks.ts); esto es la interfaz.

import { Button, toast, useAuth, useDocumentInfo, useField, useFormFields, useFormModified } from '@payloadcms/ui'
import React, { useState } from 'react'

import type { Seccion, UsuarioConRoles } from '@/access/roles'
import { ESTADOS, transicionesDisponibles, type Estado } from '@/workflow/estados'

const formatoFecha = new Intl.DateTimeFormat('es-PY', { dateStyle: 'long', timeStyle: 'short' })

export function FlujoEditorial({ seccion }: { seccion: Seccion }) {
  const { id, collectionSlug, hasPublishedDoc } = useDocumentInfo()
  const { user } = useAuth()
  const { value } = useField<Estado>({ path: 'estado' })
  const fechaPublicacion = useFormFields(([campos]) => campos.fechaPublicacion?.value as string | undefined)
  const modificado = useFormModified()
  const [enviando, setEnviando] = useState(false)

  const estado: Estado = value && value in ESTADOS ? value : 'borrador'
  const acciones = transicionesDisponibles(user as UsuarioConRoles, seccion, estado)
  const programada = estado === 'publicado' && fechaPublicacion && new Date(fechaPublicacion) > new Date()

  async function ejecutar(destino: Estado) {
    setEnviando(true)
    try {
      const res = await fetch(`/api/${collectionSlug}/${id}/transicion`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: destino }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string; mensaje?: string }
      if (!res.ok) throw new Error(json.error || 'No se pudo cambiar el estado.')
      toast.success(json.mensaje || 'Estado actualizado.')
      // Recarga para que el formulario muestre la versión y el estado nuevos.
      window.location.reload()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cambiar el estado.')
      setEnviando(false)
    }
  }

  return (
    <div className="flujo-editorial">
      <span className="flujo-editorial__titulo">Flujo editorial</span>
      <p className="flujo-editorial__estado">
        <span className={`flujo-editorial__pill flujo-editorial__pill--${estado}`}>{ESTADOS[estado]}</span>
        {programada && <span> · aparecerá el {formatoFecha.format(new Date(fechaPublicacion))}</span>}
      </p>
      {hasPublishedDoc && estado !== 'publicado' && estado !== 'no_publicado' && estado !== 'archivado' && (
        <p className="flujo-editorial__nota">El sitio sigue mostrando la última versión publicada hasta que se apruebe este cambio.</p>
      )}
      {!id ? (
        <p className="flujo-editorial__nota">Guarde un borrador para habilitar el flujo.</p>
      ) : modificado ? (
        <p className="flujo-editorial__nota">Guarde los cambios antes de cambiar el estado.</p>
      ) : acciones.length === 0 ? (
        <p className="flujo-editorial__nota">Su rol no tiene acciones disponibles en este estado.</p>
      ) : (
        <div className="flujo-editorial__acciones">
          {acciones.map((t) => (
            <Button
              key={t.a}
              buttonStyle={t.a === 'publicado' ? 'primary' : 'secondary'}
              size="small"
              disabled={enviando}
              onClick={() => ejecutar(t.a)}
            >
              {t.accion}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
