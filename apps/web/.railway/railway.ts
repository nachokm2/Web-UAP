// Infraestructura del CMS en Railway (proyecto "Web UAP").
//
// Es un "partial": solo administra lo que declara acá (servicio web-cms, PostgreSQL y
// el bucket). El sitio estático (servicio Web-UAP) se administra aparte y este archivo
// no puede modificarlo ni borrarlo.
//
//   cd apps/web
//   railway config plan     → muestra los cambios (no aplica nada)
//   railway config apply    → aplica tras confirmar
//
// Secretos: PAYLOAD_SECRET se carga una vez con la CLI (sellado) y acá queda como
// preserve() para que el apply no lo borre. Nunca escribir secretos en este archivo.
//
// Límites conocidos de IaC (oct 2026): no maneja watchPatterns ni builder; se fijan con
// la API/panel de Railway y este archivo no los toca.

import { bucket, defineRailway, github, postgres, preserve, project, service } from 'railway/iac'

export const partial = 'cms'

export default defineRailway(() => {
  // Bucket S3 existente (privado). La región no se puede cambiar.
  const archivos = bucket('collected-carrier', { region: 'sjc' })

  const db = postgres('Postgres')

  const cms = service('web-cms', {
    // Mientras el CMS no esté en main, despliega desde su rama.
    source: github('nachokm2/Web-UAP', { branch: 'feat/cms-payload', rootDirectory: 'apps/web', checkSuites: false }),
    build: 'npm run build',
    preDeploy: 'npm run migrate',
    start: 'npm start',
    healthcheck: '/api/health',
    healthcheckTimeout: 120,
    replicas: { sfo: 1 },
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: db.env.DATABASE_URL,
      PAYLOAD_SECRET: preserve(),
      // Dominio de pruebas hasta el cambio de DNS; luego https://uap.edu.py
      SITE_URL: 'https://web-cms-production.up.railway.app',
      S3_BUCKET: archivos.env.BUCKET,
      S3_ENDPOINT: archivos.env.ENDPOINT,
      S3_REGION: archivos.env.REGION,
      S3_ACCESS_KEY_ID: archivos.env.ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: archivos.env.SECRET_ACCESS_KEY,
    },
  })

  return project('Web UAP', {
    resources: [cms, db, archivos],
  })
})
