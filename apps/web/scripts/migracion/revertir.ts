// Revierte un lote de importación: elimina lo que creó, salvo lo que alguien
// editó después (se compara updatedAt). Por defecto simula.
//
//   npx tsx scripts/migracion/revertir.ts scripts/migracion/lotes/lote-XXXX.json
//   npx tsx scripts/migracion/revertir.ts scripts/migracion/lotes/lote-XXXX.json --aplicar

import 'dotenv/config'

import fs from 'fs'

import { getPayload, type CollectionSlug } from 'payload'

import config from '../../src/payload.config'
import { CONTEXTO_ACTOR } from '../../src/audit/hooks'

const [archivo] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const APLICAR = process.argv.includes('--aplicar')

async function main() {
  if (!archivo) throw new Error('Indique el archivo del lote.')
  const { lote, aplicado } = JSON.parse(fs.readFileSync(archivo, 'utf8')) as {
    aplicado: boolean
    lote: { coleccion: CollectionSlug; id: number; updatedAt: string }[]
  }
  if (!aplicado) throw new Error('Ese archivo es de una simulación: no creó nada.')
  const payload = await getPayload({ config })
  const resultado = { eliminados: 0, editadosDespues: 0, yaNoExisten: 0 }

  // Orden inverso: primero lo que depende de otros documentos.
  for (const item of [...lote].reverse()) {
    const doc = await payload
      .findByID({ collection: item.coleccion, id: item.id, draft: true, depth: 0, overrideAccess: true })
      .catch(() => null)
    if (!doc) {
      resultado.yaNoExisten++
      continue
    }
    if ((doc as { updatedAt?: string }).updatedAt !== item.updatedAt) {
      resultado.editadosDespues++
      console.log(`  conservado (editado después de importar): ${item.coleccion} #${item.id}`)
      continue
    }
    if (APLICAR) {
      await payload.delete({
        collection: item.coleccion,
        id: item.id,
        overrideAccess: true,
        context: { [CONTEXTO_ACTOR]: 'Reversión de migración' },
      })
    }
    resultado.eliminados++
  }
  console.log(APLICAR ? 'Revertido:' : 'Simulación (use --aplicar):', resultado)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
