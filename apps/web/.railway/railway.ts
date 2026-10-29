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
// Despliegue: cada push a main despliega, pero solo si pasa la verificación de GitHub
// Actions (.github/workflows/cms.yml) gracias a checkSuites. Sin watchPatterns: Railway
// salteaba ("no changes detected in watch paths") commits que sí cambiaban apps/web. No se
// declaran acá: Railway guarda la lista vacía como null y el plan mostraba siempre un cambio.

import { bucket, defineRailway, github, postgres, preserve, project, ref, service } from 'railway/iac'

export const partial = 'cms'

export default defineRailway(() => {
  // Bucket S3 existente (privado). La región no se puede cambiar.
  const archivos = bucket('collected-carrier', { region: 'sjc' })

  const db = postgres('Postgres')

  const cms = service('web-cms', {
    // Despliega desde main (el CMS se unió en el PR #2). Los cambios llegan a main por PR.
    source: github('nachokm2/Web-UAP', { branch: 'main', rootDirectory: 'apps/web', checkSuites: true }),
    build: { buildCommand: 'npm run build', builder: 'RAILPACK' },
    preDeploy: 'npm run migrate',
    start: 'npm start',
    healthcheck: '/api/health',
    healthcheckTimeout: 120,
    // Una réplica: el sitio guarda contenido en memoria (lib/cache.ts) y con dos una de ellas
    // podría mostrar ediciones del panel con minutos de retraso.
    replicas: { sfo: 1 },
    deploy: {
      // Topes, no reservas: Railway cobra lo usado. Medido con ~50 páginas/s: 0,5 vCPU y
      // 0,6 GB. Los valores son los que se fijaron en el panel (4 vCPU, 4 GB): margen de sobra
      // para procesar imágenes subidas sin reinicios por memoria. No bajar de 2 GB.
      limitOverride: { containers: { cpu: 4, memoryBytes: 4_000_000_000 } },
    },
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: db.env.DATABASE_URL,
      PAYLOAD_SECRET: preserve(),
      // Sitio oficial (lanzamiento, docs/cambio-de-dominio.md). Con este valor: canonical,
      // sitemap y robots apuntan a uap.edu.py, el panel solo acepta sesiones desde
      // https://uap.edu.py/admin (CSRF) y se activa la medición (Tag Manager). Sin NOINDEX:
      // el sitio se indexa. El dominio de Railway sigue respondiendo, pero con noindex.
      // Vuelta atrás: SITE_URL 'https://web-cms-production-fd17.up.railway.app' y NOINDEX: 'true'.
      SITE_URL: 'https://uap.edu.py',
      S3_BUCKET: ref(archivos, 'BUCKET'),
      S3_ENDPOINT: ref(archivos, 'ENDPOINT'),
      S3_REGION: ref(archivos, 'REGION'),
      S3_ACCESS_KEY_ID: ref(archivos, 'ACCESS_KEY_ID'),
      S3_SECRET_ACCESS_KEY: ref(archivos, 'SECRET_ACCESS_KEY'),
      // Correo saliente (lib/correo.ts y .env.example). Se cargan en el panel o con la CLI; acá
      // quedan como preserve() para que el apply no los borre.
      SMTP_HOST: preserve(),
      SMTP_PORT: preserve(),
      SMTP_USER: preserve(),
      SMTP_PASS: preserve(),
      CORREO_REMITENTE: preserve(),
      CORREO_REMITENTE_NOMBRE: preserve(),
      SUMMIT_AVISO_PARA: preserve(),
    },
  })

  return project('Web UAP', {
    resources: [cms, db, archivos],
  })
})
