// Colecciones de archivos: Medios (imágenes) y Documentos (PDF).
// Payload valida el tipo real del archivo por su contenido (no por la extensión)
// contra `mimeTypes`; acá se agregan límites de tamaño con mensajes claros.

import { APIError, type CollectionBeforeOperationHook, type CollectionConfig } from 'payload'

import { eliminacionDefinitiva, subidaDeArchivos } from '../access'
import { auditarCambios, auditarEliminacion } from '../audit/hooks'

const MB = 1024 * 1024
export const OMITIR_LIMITE_TAMANO = 'omitirLimiteTamano'
export const LIMITE_IMAGEN_MB = 10
export const LIMITE_PDF_MB = 30

const limiteDeTamano =
  (maxMb: number, consejo: string): CollectionBeforeOperationHook =>
  ({ args, operation, req }) => {
    if (operation !== 'create' && operation !== 'update') return args
    // Solo la migración del sitio anterior (script de servidor) importa archivos más grandes;
    // req.context no se puede fijar desde una petición HTTP.
    if (req.context?.[OMITIR_LIMITE_TAMANO] === true) return args
    const tamano = req.file?.size ?? 0
    if (tamano > maxMb * MB) {
      const mb = (tamano / MB).toFixed(1)
      throw new APIError(`El archivo pesa ${mb} MB y el máximo es ${maxMb} MB. ${consejo}`, 400, null, true)
    }
    return args
  }

const accesoArchivos: CollectionConfig['access'] = {
  // Los archivos son públicos (se enlazan desde páginas publicadas).
  read: () => true,
  create: subidaDeArchivos,
  update: subidaDeArchivos,
  delete: eliminacionDefinitiva,
}

export const Medios: CollectionConfig = {
  slug: 'medios',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: {
    group: 'Archivos',
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'width', 'updatedAt'],
    description: `JPG, PNG o WebP de hasta ${LIMITE_IMAGEN_MB} MB. Se generan automáticamente versiones livianas para cada pantalla.`,
  },
  access: accesoArchivos,
  hooks: {
    beforeOperation: [limiteDeTamano(LIMITE_IMAGEN_MB, 'Reduzca la imagen a unos 2000 px de ancho antes de subirla.')],
    afterChange: [auditarCambios],
    afterDelete: [auditarEliminacion],
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    focalPoint: true,
    adminThumbnail: 'miniatura',
    imageSizes: [
      { name: 'miniatura', width: 400, height: 300, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'tarjeta', width: 800, height: 450, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'hero', width: 1920, withoutEnlargement: true, formatOptions: { format: 'webp', options: { quality: 80 } } },
      { name: 'og', width: 1200, height: 630, formatOptions: { format: 'jpeg', options: { quality: 82 } } },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      required: true,
      admin: { description: 'Describa la imagen para personas que no pueden verla. Ej.: "Estudiantes en el laboratorio de odontología".' },
    },
    { name: 'credito', label: 'Crédito o fuente', type: 'text' },
    {
      name: 'origen',
      label: 'Origen',
      type: 'text',
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'URL o ruta de donde se importó el archivo (migración del sitio anterior).' },
    },
  ],
}

export const TIPOS_DOCUMENTO = [
  { value: 'brochure', label: 'Brochure' },
  { value: 'malla', label: 'Malla curricular' },
  { value: 'reglamento', label: 'Reglamento o normativa' },
  { value: 'otro', label: 'Otro' },
]

export const Documentos: CollectionConfig = {
  slug: 'documentos',
  labels: { singular: 'Documento', plural: 'Documentos' },
  admin: {
    group: 'Archivos',
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tipo', 'filesize', 'updatedAt'],
    description: `PDF de hasta ${LIMITE_PDF_MB} MB. Para descargas rápidas en celular, apunte a menos de 10 MB.`,
  },
  access: accesoArchivos,
  hooks: {
    beforeOperation: [limiteDeTamano(LIMITE_PDF_MB, 'Comprima el PDF (por ejemplo, exportándolo con "tamaño mínimo") y vuelva a subirlo.')],
    afterChange: [auditarCambios],
    afterDelete: [auditarEliminacion],
  },
  upload: {
    mimeTypes: ['application/pdf'],
  },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text', required: true },
    { name: 'tipo', label: 'Tipo', type: 'select', required: true, defaultValue: 'otro', index: true, options: TIPOS_DOCUMENTO },
    { name: 'descripcion', label: 'Descripción', type: 'textarea' },
    {
      name: 'origen',
      label: 'Origen',
      type: 'text',
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'URL o ruta de donde se importó el archivo (migración del sitio anterior).' },
    },
  ],
}
