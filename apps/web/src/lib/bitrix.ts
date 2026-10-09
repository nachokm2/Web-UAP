// Código de inserción de formularios de Bitrix24. Bitrix entrega algo como:
//   <script data-b24-form="inline/1537/vgks4c" data-skip-moving="true">(function(w,d,u){…})
//   (window,document,'https://cdn.bitrix24.es/b23715511/crm/form/loader_1537.js');</script>
// El sitio solo necesita el código del formulario y la URL del loader.

export type FormularioBitrixDatos = { formulario: string; loaderUrl: string }

/** Solo el CDN de Bitrix24 que permite la CSP del sitio (next.config.ts). */
const LOADER = /https:\/\/cdn\.bitrix24\.es\/b\d+\/crm\/form\/loader_(\d+)\.js/i
const FORMULARIO = /\b(inline\/(\d+)\/[a-z0-9]+)\b/i

/** Devuelve el formulario y su loader, o null si el texto no es un código de Bitrix24 válido. */
export function leerCodigoBitrix(codigo: string | null | undefined): FormularioBitrixDatos | null {
  if (!codigo) return null
  const formulario = FORMULARIO.exec(codigo)
  const loader = LOADER.exec(codigo)
  if (!formulario || !loader) return null
  // El número del formulario y el del loader tienen que ser el mismo.
  if (formulario[2] !== loader[1]) return null
  return { formulario: formulario[1], loaderUrl: loader[0] }
}
