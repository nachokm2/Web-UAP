// Limpia el contenido importado de un entorno NUEVO para volver a importarlo desde cero
// (por ejemplo, tras una importación interrumpida). Por defecto solo informa.
//
//   npx tsx scripts/migracion/limpiar-importacion.ts             → muestra qué borraría
//   npx tsx scripts/migracion/limpiar-importacion.ts --aplicar   → borra
//
// Conserva usuarios, auditoría y configuración. Se niega a actuar si encuentra contenido
// editado por personas (cualquier registro de auditoría que no sea de un script), para que
// no se pueda usar por error sobre un entorno con trabajo real.

import 'dotenv/config'

import { getPayload, type CollectionSlug } from 'payload'

import config from '../../src/payload.config'
import { CONTEXTO_ACTOR } from '../../src/audit/hooks'

const APLICAR = process.argv.includes('--aplicar')

// Orden: primero lo que referencia a otros documentos.
const COLECCIONES: CollectionSlug[] = ['redirecciones', 'noticias', 'carreras', 'posgrados', 'documentos', 'medios', 'categorias', 'facultades', 'sedes']

async function main() {
  const payload = await getPayload({ config })

  const { totalDocs: cambiosHumanos } = await payload.count({
    collection: 'auditoria',
    where: {
      and: [
        { usuario: { exists: true } },
        { accion: { not_in: ['inicio_sesion'] } },
        { coleccion: { not_equals: 'usuarios' } },
      ],
    },
    overrideAccess: true,
  })
  if (cambiosHumanos > 0) {
    throw new Error(`Hay ${cambiosHumanos} cambios hechos por personas en el CMS: no se limpia este entorno.`)
  }

  for (const coleccion of COLECCIONES) {
    const { totalDocs } = await payload.count({ collection: coleccion, overrideAccess: true })
    console.log(`${coleccion}: ${totalDocs}`)
    if (!APLICAR || !totalDocs) continue
    await payload.delete({
      collection: coleccion,
      where: { id: { exists: true } },
      overrideAccess: true,
      context: { [CONTEXTO_ACTOR]: 'Limpieza de importación interrumpida' },
    })
  }
  console.log(APLICAR ? 'Limpieza aplicada.' : 'Simulación: use --aplicar para borrar.')
  process.exit(0)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
