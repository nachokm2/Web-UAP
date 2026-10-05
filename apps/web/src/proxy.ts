// Proxy (antes "middleware"; en Next 16 corre en Node.js):
// 1. Redirecciones del CMS (301/302) y páginas eliminadas (410), incluidas las URL del WordPress anterior.
// 2. Barra final en las páginas, como el sitio anterior (/periodismo/).
// 3. noindex en cualquier dominio que no sea el oficial (por ejemplo, el de pruebas de Railway).

import { NextResponse, type NextRequest } from 'next/server'

import { buscarRedireccion } from '@/lib/redirecciones'

const TIENE_EXTENSION = /\.[a-z0-9]{2,5}$/i

const PAGINA_410 = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Página eliminada | UAP</title></head><body style="font-family:system-ui,sans-serif;max-width:560px;margin:80px auto;padding:0 16px;line-height:1.6"><h1>Esta página ya no existe</h1><p>El contenido fue retirado del sitio de la Universidad Autónoma del Paraguay.</p><p><a href="/">Ir al inicio</a></p></body></html>`

function dominioOficial(): string | null {
  try {
    return new URL(process.env.SITE_URL || '').host
  } catch {
    return null
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  const destino = await buscarRedireccion(pathname).catch(() => null)
  if (destino?.tipo === '410') {
    return new NextResponse(PAGINA_410, { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } })
  }
  if (destino) {
    return NextResponse.redirect(new URL(destino.url, req.url), Number(destino.tipo))
  }

  // El listado de posgrados del sitio anterior está en /postgrados/ (con t).
  if (pathname === '/posgrados' || pathname === '/posgrados/') {
    return NextResponse.redirect(new URL(`/postgrados/${search}`, req.url), 301)
  }

  if (!pathname.endsWith('/') && !TIENE_EXTENSION.test(pathname)) {
    return NextResponse.redirect(new URL(`${pathname}/${search}`, req.url), 301)
  }

  const res = NextResponse.next()
  const oficial = dominioOficial()
  if (oficial && req.headers.get('host') !== oficial) res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return res
}

export const config = {
  // No pasa por el proxy: panel, API, archivos internos de Next y recursos estáticos.
  // "admin" y "api" exactos: /administracion-de-empresas/ sí debe pasar por el proxy.
  matcher: ['/((?!admin(?:/|$)|api(?:/|$)|_next/|images/|videos/|favicon).*)'],
}
