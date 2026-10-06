import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Autoridades } from './collections/Autoridades'
import { Carreras } from './collections/Carreras'
import { Documentos, LIMITE_PDF_MB, Medios } from './collections/archivos'
import { Noticias } from './collections/Noticias'
import { Posgrados } from './collections/Posgrados'
import { Auditoria, Redirecciones } from './collections/sistema'
import { Categorias, Facultades, Sedes } from './collections/taxonomias'
import { Usuarios } from './collections/Usuarios'
import { Configuracion } from './globals/Configuracion'
import { invalidarCacheAlCambiar } from './lib/pluginCache'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
const usarS3 = Boolean(process.env.S3_BUCKET)

if (process.env.NODE_ENV === 'production' && !process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET es obligatorio en producción.')
}

type DocConNombre = { nombre?: string; titulo?: string; descripcionCorta?: string; bajada?: string }

export default buildConfig({
  serverURL: siteUrl,
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · CMS UAP' },
    dateFormat: 'dd/MM/yyyy HH:mm',
  },
  i18n: {
    supportedLanguages: { es },
    fallbackLanguage: 'es',
  },
  collections: [
    Carreras,
    Posgrados,
    Noticias,
    Categorias,
    Medios,
    Documentos,
    Facultades,
    Sedes,
    Autoridades,
    Redirecciones,
    Usuarios,
    Auditoria,
  ],
  globals: [Configuracion],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'solo-desarrollo-no-usar-en-produccion',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
    // En producción el esquema cambia solo con migraciones versionadas (npm run migrate).
    push: process.env.NODE_ENV !== 'production' && process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  sharp,
  graphQL: { disable: true },
  // Las cookies de sesión solo se aceptan desde el propio sitio.
  csrf: [siteUrl],
  cors: [],
  upload: { limits: { fileSize: LIMITE_PDF_MB * 1024 * 1024 } },
  telemetry: false,
  plugins: [
    invalidarCacheAlCambiar,
    seoPlugin({
      collections: ['carreras', 'posgrados', 'noticias'],
      uploadsCollection: 'medios',
      tabbedUI: true,
      generateTitle: ({ doc }) => `${(doc as DocConNombre).nombre || (doc as DocConNombre).titulo || ''} | UAP`,
      generateDescription: ({ doc }) =>
        ((doc as DocConNombre).descripcionCorta || (doc as DocConNombre).bajada || '').slice(0, 155),
    }),
    s3Storage({
      enabled: usarS3,
      // Los campos del plugin (_objectKey, prefix) existen siempre, con o sin S3: así el
      // esquema y las migraciones son iguales en desarrollo, tests y producción.
      alwaysInsertFields: true,
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
      collections: {
        // Imágenes: se sirven a través de la app (el bucket de Railway es privado).
        medios: true,
        // PDF: redirección a una URL prefirmada, sin pasar el archivo por el servidor.
        documentos: { signedDownloads: { expiresIn: 3600 } },
      },
    }),
  ],
})
