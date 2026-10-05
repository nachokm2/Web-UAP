// Crea el primer Super Admin sin dejar abierta la pantalla "Crear primer usuario"
// en un entorno recién desplegado. Solo actúa si la base no tiene usuarios.
// La contraseña es aleatoria y se escribe en un archivo local (no se imprime).
//
//   npx tsx scripts/crear-superadmin.ts --email persona@uautonoma.cl --nombre "Nombre Apellido" --archivo C:\ruta\credenciales.txt

import 'dotenv/config'

import crypto from 'crypto'
import fs from 'fs'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const args = process.argv.slice(2)
const valor = (nombre: string) => {
  const i = args.indexOf(`--${nombre}`)
  return i >= 0 ? args[i + 1] : undefined
}

async function main() {
  const email = valor('email')
  const nombre = valor('nombre')
  const archivo = valor('archivo')
  if (!email || !nombre || !archivo) throw new Error('Uso: --email <email> --nombre "<nombre>" --archivo <ruta>')

  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({ collection: 'usuarios', overrideAccess: true })
  if (totalDocs > 0) {
    console.log(`La base ya tiene ${totalDocs} usuario(s): no se crea nada.`)
    process.exit(0)
  }

  const password = crypto.randomBytes(18).toString('base64url')
  await payload.create({
    collection: 'usuarios',
    data: { email, nombre, password, roles: ['superadmin'], activo: true },
    overrideAccess: true,
    context: { actorAuditoria: 'Alta inicial del Super Admin' },
  })
  fs.writeFileSync(
    archivo,
    [
      `Panel: ${(process.env.SITE_URL ?? '').replace(/\/$/, '')}/admin`,
      `Usuario: ${email}`,
      `Contraseña inicial: ${password}`,
      '',
      'Cámbiela al primer ingreso (menú Cuenta) y borre este archivo.',
      '',
    ].join('\n'),
    { mode: 0o600 },
  )
  console.log(`Super Admin creado (${email}). Credenciales en: ${archivo}`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
