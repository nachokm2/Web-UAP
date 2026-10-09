import pg from 'pg'

import { BASE_DE_TEST, URL_SERVIDOR_PG } from './entorno'

export default async function crearBaseDeTest() {
  const cliente = new pg.Client({ connectionString: URL_SERVIDOR_PG })
  try {
    await cliente.connect()
  } catch (e) {
    throw new Error(`No se pudo conectar a PostgreSQL (${URL_SERVIDOR_PG}). ¿Está levantado? Ejecute: npm run db:up\n${e}`)
  }
  await cliente.query(`DROP DATABASE IF EXISTS ${BASE_DE_TEST} WITH (FORCE)`)
  await cliente.query(`CREATE DATABASE ${BASE_DE_TEST}`)
  await cliente.end()
}
