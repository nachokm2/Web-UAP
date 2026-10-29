// Correo saliente del CMS por SMTP (Brevo, Microsoft 365 u otro proveedor). Queda apagado hasta
// que existan SMTP_HOST y CORREO_REMITENTE: sin ellos Payload no tiene adaptador y el sitio no
// intenta enviar nada (Payload escribiría el correo en los logs, con datos personales).

import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

export const correoConfigurado = (): boolean =>
  Boolean(process.env.SMTP_HOST && process.env.CORREO_REMITENTE)

export function adaptadorDeCorreo() {
  const host = process.env.SMTP_HOST
  const remitente = process.env.CORREO_REMITENTE
  if (!host || !remitente) return undefined
  const puerto = Number(process.env.SMTP_PORT) || 587
  return nodemailerAdapter({
    defaultFromAddress: remitente,
    defaultFromName: process.env.CORREO_REMITENTE_NOMBRE || 'Universidad Autónoma del Paraguay',
    // Sin verificar la conexión al arrancar: el build no depende de la red. Un error se ve al enviar.
    skipVerify: true,
    transportOptions: {
      host,
      port: puerto,
      secure: puerto === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    },
  })
}

/** Lista de correos de una variable de entorno separada por comas. */
export const listaDeCorreos = (valor: string | undefined): string[] =>
  (valor ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
