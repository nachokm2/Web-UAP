import NextImage from 'next/image'

import type { Medio } from '@/payload-types'

type Tamano = 'miniatura' | 'tarjeta' | 'hero' | 'og'

export function esMedio(v: unknown): v is Medio {
  return typeof v === 'object' && v !== null && 'url' in v
}

/**
 * Payload arma URLs absolutas con serverURL (http://dominio/api/medios/file/x.webp). El
 * optimizador de Next y el propio sitio usan la ruta relativa; las absolutas se piden con
 * urlAbsoluta() donde hacen falta (Open Graph).
 */
export function rutaRelativa(url: string): string {
  try {
    const u = new URL(url)
    return u.pathname.startsWith('/api/') ? `${u.pathname}${u.search}` : url
  } catch {
    return url
  }
}

/** Ruta de una versión de la imagen (WebP liviana) con respaldo al original. */
export function urlDeImagen(medio: Medio | null | undefined, tamano?: Tamano): string | null {
  if (!medio) return null
  const url = (tamano && medio.sizes?.[tamano]?.url) || medio.url
  return url ? rutaRelativa(url) : null
}

type Props = {
  medio: Medio | number | null | undefined
  tamano?: Tamano
  sizes?: string
  className?: string
  prioridad?: boolean
}

/** Imagen del CMS con dimensiones (evita saltos de diseño) y carga diferida. */
export function Imagen({ medio, tamano = 'tarjeta', sizes = '(max-width: 768px) 100vw, 50vw', className, prioridad }: Props) {
  if (!esMedio(medio)) return null
  const version = medio.sizes?.[tamano]
  const original = version?.url || medio.url
  const src = original ? rutaRelativa(original) : null
  const width = version?.width || medio.width
  const height = version?.height || medio.height
  if (!src || !width || !height) return null
  return (
    <NextImage
      src={src}
      alt={medio.alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={prioridad}
      loading={prioridad ? undefined : 'lazy'}
    />
  )
}
