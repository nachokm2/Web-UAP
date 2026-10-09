import { URL_BASE_DE_TEST } from './entorno'

// Se fija antes de que cualquier test importe la configuración de Payload.
process.env.DATABASE_URL = URL_BASE_DE_TEST
process.env.PAYLOAD_SECRET = 'secreto-solo-para-tests'
process.env.SITE_URL = 'http://localhost:3000'
delete process.env.S3_BUCKET
