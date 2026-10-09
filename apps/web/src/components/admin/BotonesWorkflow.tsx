'use client'

// Los botones nativos de Payload para publicar y despublicar solo se muestran a
// Administradores y Super Admin. Los editores usan "Enviar a revisión".
// El servidor rechaza igual el intento (workflow/hooks.ts: reglasDeEdicion).

import { PublishButton, UnpublishButton, useAuth } from '@payloadcms/ui'
import React from 'react'

import { esAprobador, type UsuarioConRoles } from '@/access/roles'

type Props = React.ComponentProps<typeof PublishButton>

export function BotonPublicar(props: Props) {
  const { user } = useAuth()
  return esAprobador(user as UsuarioConRoles) ? <PublishButton {...props} /> : null
}

export function BotonDespublicar(props: React.ComponentProps<typeof UnpublishButton>) {
  const { user } = useAuth()
  return esAprobador(user as UsuarioConRoles) ? <UnpublishButton {...props} /> : null
}
