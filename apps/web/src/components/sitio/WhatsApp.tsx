import { obtenerConfiguracion } from '@/lib/datos'

import { IconoWhatsapp } from './Iconos'

const MENSAJE = 'Hola, quisiera obtener más información sobre la UAP.'

export async function WhatsApp() {
  const { whatsapp } = await obtenerConfiguracion()
  if (!whatsapp) return null
  return (
    <a
      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(MENSAJE)}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp a Recepción"
    >
      <IconoWhatsapp />
    </a>
  )
}
