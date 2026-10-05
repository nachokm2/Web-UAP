// Base exclusiva para E2E, creada desde cero con las migraciones versionadas
// (el mismo camino que en producción, sin "push" del esquema).
import { execSync } from 'child_process'

import pg from 'pg'

import { URL_SERVIDOR_PG } from '../entorno'

export default async function prepararBaseE2E() {
  const cliente = new pg.Client({ connectionString: URL_SERVIDOR_PG })
  await cliente.connect()
  await cliente.query('DROP DATABASE IF EXISTS uap_web_e2e WITH (FORCE)')
  await cliente.query('CREATE DATABASE uap_web_e2e')
  await cliente.end()
  execSync('npx payload migrate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: URL_SERVIDOR_PG.replace(/\/[^/]*$/, '/uap_web_e2e'),
      PAYLOAD_SECRET: 'secreto-solo-para-e2e',
      NODE_OPTIONS: '--no-deprecation',
    },
  })
}
