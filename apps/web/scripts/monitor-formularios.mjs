// Revisión diaria de los formularios de Bitrix24 que usa el sitio publicado
// (.github/workflows/formularios.yml). Falla si un formulario en uso no tiene campos
// (deshabilitado en Bitrix) o si su script no corresponde al formulario: en esos casos
// la página muestra "El formulario está deshabilitado" y se pierden los leads sin aviso.
// Solo hace GET a la API pública del sitio y al CDN de Bitrix24. Sin dependencias.
//
// Uso: node scripts/monitor-formularios.mjs [https://uap.edu.py]

const SITIO = (process.argv[2] || process.env.SITIO_URL || 'https://uap.edu.py').replace(/\/$/, '')
const CABECERAS = { 'User-Agent': 'UAP-Monitor-Formularios/1.0' }

async function pedir(url) {
  const res = await fetch(url, { headers: CABECERAS })
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  return res
}
const api = async (ruta) => (await pedir(`${SITIO}${ruta}`)).json()

// Igual que loaderDelFormulario en src/lib/bitrix.ts: cada loader trae un solo formulario.
const idDe = (formulario) => /^inline\/(\d+)\/[a-z0-9]+$/i.exec(formulario?.trim() ?? '')?.[1]
const loaderDelFormulario = (formulario, base) => base.replace(/loader_\d+\.js$/i, `loader_${idDe(formulario)}.js`)

const config = await api('/api/globals/configuracion?depth=0')
const formularios = (await api('/api/formularios?where[activo][equals]=true&limit=500&depth=0')).docs
const programas = []
for (const coleccion of ['carreras', 'posgrados']) {
  const { docs } = await api(`/api/${coleccion}?limit=1000&depth=0&select[slug]=true&select[formularioBitrix]=true`)
  programas.push(...docs.filter((p) => p.formularioBitrix))
}

/** loader → { formulario, paginas } */
const enUso = new Map()
function agregar(formulario, loaderUrl, pagina) {
  const clave = `${formulario} ${loaderUrl}`
  if (!enUso.has(clave)) enUso.set(clave, { formulario, loaderUrl, paginas: [] })
  enUso.get(clave).paginas.push(pagina)
}

agregar(config.bitrixFormulario, config.bitrixLoaderUrl, 'formulario general (inscripción, contacto y programas)')
for (const f of formularios) agregar(f.bitrixFormulario, f.bitrixLoaderUrl, `/${f.slug}/`)
for (const p of programas) agregar(p.formularioBitrix, loaderDelFormulario(p.formularioBitrix, config.bitrixLoaderUrl ?? ''), `/${p.slug}/`)

const problemas = []
for (const { formulario, loaderUrl, paginas } of enUso.values()) {
  const donde = paginas.join(', ')
  if (!idDe(formulario) || !loaderUrl) {
    problemas.push(`Sin formulario o sin script configurado: ${donde}`)
    continue
  }
  try {
    const texto = await (await pedir(loaderUrl)).text()
    const datos = /Loader\.run\((\{.*\})\);\s*\}\)\(\);/s.exec(texto)
    if (!datos) throw new Error('el script no trae la configuración del formulario')
    const { form } = JSON.parse(datos[1])
    if (String(form.id) !== idDe(formulario)) problemas.push(`El script es del formulario ${form.id} y la página usa el ${idDe(formulario)}: ${donde}`)
    else if (!form.data?.fields?.length) problemas.push(`Formulario ${form.id} sin campos (deshabilitado en Bitrix24): ${donde}`)
    else console.log(`OK  formulario ${form.id} (${form.data.fields.length} campos): ${donde}`)
  } catch (e) {
    problemas.push(`No se pudo revisar ${loaderUrl} (${e.message}): ${donde}`)
  }
}

// Dos páginas con el mismo formulario mandan los leads al mismo responsable: se avisa, no falla.
const porId = new Map()
for (const f of formularios) porId.set(idDe(f.bitrixFormulario), [...(porId.get(idDe(f.bitrixFormulario)) ?? []), `/${f.slug}/`])
for (const [id, paginas] of porId) if (paginas.length > 1) console.log(`AVISO  el formulario ${id} se usa en ${paginas.length} páginas: ${paginas.join(', ')}`)

if (problemas.length) {
  console.error(`\n${problemas.length} problema(s):`)
  for (const p of problemas) console.error(`- ${p}`)
  console.error('\nCorregir en Bitrix24, o en el panel (Formularios: desmarcar "activo" redirige a /inscripcion/).')
  process.exit(1)
}
console.log(`\n${enUso.size} formulario(s) revisados, todos con campos.`)
