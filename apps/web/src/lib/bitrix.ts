// Código de inserción de formularios de Bitrix24. Bitrix entrega algo como:
//   <script data-b24-form="inline/1537/vgks4c" data-skip-moving="true">(function(w,d,u){…})
//   (window,document,'https://cdn.bitrix24.es/b23715511/crm/form/loader_1537.js');</script>
// El sitio solo necesita el código del formulario y la URL del loader.

export type FormularioBitrixDatos = { formulario: string; loaderUrl: string }

/** Solo el CDN de Bitrix24 que permite la CSP del sitio (next.config.ts). */
const LOADER = /https:\/\/cdn\.bitrix24\.es\/b\d+\/crm\/form\/loader_(\d+)\.js/i
const FORMULARIO = /\b(inline\/(\d+)\/[a-z0-9]+)\b/i

const FORMULARIO_EXACTO = /^inline\/(\d+)\/[a-z0-9]+$/i
const LOADER_EXACTO = /^https:\/\/cdn\.bitrix24\.es\/b\d+\/crm\/form\/loader_(\d+)\.js$/i

/**
 * Problema de un formulario y su loader cargados a mano (global Configuración, formulario
 * propio de un programa), o null si están bien. Vacíos se aceptan: el sitio muestra el aviso
 * con los datos de contacto.
 */
export function problemaFormularioBitrix(formulario?: string | null, loaderUrl?: string | null): string | null {
  const f = formulario ? FORMULARIO_EXACTO.exec(formulario.trim()) : null
  if (formulario && !f) return 'El código del formulario tiene la forma inline/61/hi7fex.'
  const l = loaderUrl ? LOADER_EXACTO.exec(loaderUrl.trim()) : null
  if (loaderUrl && !l) return 'El script tiene la forma https://cdn.bitrix24.es/b…/crm/form/loader_61.js'
  if (f && l && f[1] !== l[1]) return `El código es del formulario ${f[1]} y el script del ${l[1]}: tienen que ser del mismo.`
  return null
}

/**
 * Loader de un formulario a partir del de otro del mismo portal: cada loader trae un solo
 * formulario y todos comparten la carpeta del CDN. Sin esto, el formulario propio de un
 * programa se pedía con el loader del general y no se dibujaba.
 */
export function loaderDelFormulario(formulario: string, loaderBase: string): string {
  const id = FORMULARIO_EXACTO.exec(formulario.trim())?.[1]
  return id ? loaderBase.replace(/loader_\d+\.js$/i, `loader_${id}.js`) : loaderBase
}

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
