// Medición del sitio: el mismo contenedor de Google Tag Manager que usaba el WordPress.
// Hoy carga Google Analytics 4 (G-WK32BB1JK5) y el píxel de Meta (1153954320108376); qué
// etiquetas corren se administra en tagmanager.google.com, no en este código. Si se agrega
// una etiqueta de otro proveedor, hay que permitir su dominio en la CSP (next.config.ts).
// Solo en el sitio oficial: ver medicionActiva() en lib/urls.ts.

import Script from 'next/script'

import { medicionActiva } from '@/lib/urls'

const CONTENEDOR_GTM = 'GTM-MMNLDBHC'

/** Va al principio de <body>: el script después de hidratar y el iframe para quien navega sin JavaScript. */
export function Medicion() {
  if (!medicionActiva(process.env.SITE_URL, process.env.NOINDEX)) return null
  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${CONTENEDOR_GTM}`}
          title="Google Tag Manager"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${CONTENEDOR_GTM}');`}
      </Script>
    </>
  )
}
