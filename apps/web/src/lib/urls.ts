// Rutas públicas del sitio. Se conservan las del WordPress anterior (con barra final)
// para no perder posicionamiento: los programas viven en /{slug}/.

export const SITIO = {
  inicio: '/',
  carreras: '/carreras/',
  posgrados: '/postgrados/',
  noticias: '/noticias/',
  institucional: '/institucional/',
  investigacion: '/investigacion/',
  estudiantes: '/estudiantes/',
  contacto: '/contacto/',
  inscripcion: '/inscripcion/',
  privacidad: '/privacidad/',
} as const

export const urlPrograma = (slug: string) => `/${slug}/`
export const urlNoticia = (slug: string) => `/noticias/${slug}/`

export function urlDeDocumento(coleccion: string, slug: string): string {
  return coleccion === 'noticias' ? urlNoticia(slug) : urlPrograma(slug)
}

/** URL absoluta canónica (siempre el dominio oficial, nunca el de pruebas). */
export function urlAbsoluta(ruta: string): string {
  const base = (process.env.SITE_URL || 'https://uap.edu.py').replace(/\/$/, '')
  return `${base}${ruta.startsWith('/') ? ruta : `/${ruta}`}`
}
