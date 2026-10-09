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
// En Windows el SDK busca la CLI en la variable "_": correr desde PowerShell con
//   $env:_ = "$env:APPDATA\npm\node_modules\@railway\cli\bin\railway.exe"
//
// Secretos: PAYLOAD_SECRET se carga una vez con la CLI (sellado) y acá queda como
// preserve() para que el apply no lo borre. Nunca escribir secretos en este archivo.
//
// Despliegue: cada push a la rama despliega, pero solo si pasa la verificación de GitHub
// Actions (.github/workflows/cms.yml) gracias a checkSuites. Sin watchPatterns: Railway
// salteaba ("no changes detected in watch paths") commits que sí cambiaban apps/web.

import { bucket, defineRailway, github, postgres, preserve, project, ref, service } from 'railway/iac'

export const partial = 'cms'

export default defineRailway(() => {
  // Bucket S3 existente (privado). La región no se puede cambiar.
  const archivos = bucket('collected-carrier', { region: 'sjc' })

  const db = postgres('Postgres')

  const cms = service('web-cms', {
    // Mientras el CMS no esté en main, despliega desde su rama.
    source: github('nachokm2/Web-UAP', { branch: 'feat/cms-payload', rootDirectory: 'apps/web', checkSuites: true }),
    build: { buildCommand: 'npm run build', builder: 'RAILPACK', watchPatterns: [] },
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
      SITE_URL: 'https://web-cms-production-fd17.up.railway.app',
      // Entorno de pruebas: no indexar. Quitar al apuntar uap.edu.py a este servicio.
      NOINDEX: 'true',
      S3_BUCKET: ref(archivos, 'BUCKET'),
      S3_ENDPOINT: ref(archivos, 'ENDPOINT'),
      S3_REGION: ref(archivos, 'REGION'),
      S3_ACCESS_KEY_ID: ref(archivos, 'ACCESS_KEY_ID'),
      S3_SECRET_ACCESS_KEY: ref(archivos, 'SECRET_ACCESS_KEY'),
    },
  })

  return project('Web UAP', {
    resources: [cms, db, archivos],
  })
})
