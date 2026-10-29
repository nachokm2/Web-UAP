'use client'

// Botón sobre la lista de inscripciones al Summit: descarga la planilla para Excel desde
// /api/inscripciones-summit/exportar (el servidor revisa otra vez quién la pide).

import { Button, useConfig } from '@payloadcms/ui'
import React from 'react'

export function ExportarInscripciones() {
  const { config } = useConfig()
  return (
    <div style={{ marginBottom: 'var(--base)' }}>
      <Button
        el="anchor"
        url={`${config.routes.api}/inscripciones-summit/exportar`}
        buttonStyle="secondary"
        size="small"
        margin={false}
      >
        Descargar en Excel (CSV)
      </Button>
    </div>
  )
}
