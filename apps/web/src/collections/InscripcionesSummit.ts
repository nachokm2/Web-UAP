// Inscripciones de asistentes al V Summit Internacional UAP 2026 (formulario de la landing
// /summit-internacional-uap2026/). Tabla simple: una fila por persona inscripta.
//
// Son datos personales: solo los ven los administradores y nadie puede crear filas por la API
// pública (POST /api/inscripciones-summit queda cerrado). Las inscripciones entran únicamente
// por la acción del servidor de la landing, que valida y guarda con la API local.

import type { CollectionBeforeValidateHook, CollectionConfig, Endpoint } from 'payload'

import { eliminacionDefinitiva, nadie, soloAprobadores } from '../access'
import { esAprobador, type UsuarioConRoles } from '../access/roles'
import { inscripcionesACsv } from '../lib/inscripcionSummit'
import {
  MAX_DIAS_RESUMEN,
  diasEntre,
  esFechaISO,
  resumenDeInscripciones,
  sumarDias,
  tokenDeEncabezado,
  tokenValido,
  zonaValida,
} from '../lib/resumenSummit'

const normalizarCorreo: CollectionBeforeValidateHook = ({ data }) => {
  if (data && typeof data.email === 'string') data.email = data.email.trim().toLowerCase()
  return data
}

/** GET /api/inscripciones-summit/exportar: planilla para Excel, solo para quien ya puede verlas. */
const exportarPlanilla: Endpoint = {
  path: '/exportar',
  method: 'get',
  handler: async (req) => {
    if (!esAprobador(req.user as UsuarioConRoles))
      return Response.json(
        { errors: [{ message: 'No tienes permiso para realizar esta acción.' }] },
        { status: 403 },
      )
    const { docs } = await req.payload.find({
      collection: 'inscripciones-summit',
      pagination: false,
      sort: 'createdAt',
      depth: 0,
      overrideAccess: false,
      req,
    })
    const dia = new Date().toISOString().slice(0, 10)
    return new Response(inscripcionesACsv(docs), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inscripciones-summit-${dia}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  },
}

/**
 * GET /api/inscripciones-summit/resumen?desde=AAAA-MM-DD&hasta=AAAA-MM-DD&zona=America/Santiago
 *
 * Cuántas inscripciones hay (total, por día y por país) SIN datos personales: ni nombres, ni
 * correos, ni teléfonos. Lo lee el dashboard "Analytics UAP". Acceso: el token de la variable
 * SUMMIT_RESUMEN_TOKEN (encabezado "Authorization: Bearer …") o un aprobador con sesión. Si el token no
 * está configurado, o es corto, solo entran los aprobadores. `desde` y `hasta` van juntos (máx. 400 días).
 */
const resumenPublicable: Endpoint = {
  path: '/resumen',
  method: 'get',
  handler: async (req) => {
    const sinCache = { 'Cache-Control': 'no-store' }
    const conToken = tokenValido(
      tokenDeEncabezado(req.headers.get('authorization')),
      process.env.SUMMIT_RESUMEN_TOKEN,
    )
    if (!conToken && !esAprobador(req.user as UsuarioConRoles))
      return Response.json(
        { errors: [{ message: 'No tienes permiso para realizar esta acción.' }] },
        { status: 401, headers: sinCache },
      )

    const parametros = new URL(req.url ?? '', 'http://localhost').searchParams
    const desde = parametros.get('desde')
    const hasta = parametros.get('hasta')
    const zona = parametros.get('zona') || 'America/Asuncion'
    const invalido = (mensaje: string) =>
      Response.json({ errors: [{ message: mensaje }] }, { status: 400, headers: sinCache })
    if ((desde === null) !== (hasta === null)) return invalido('Indica "desde" y "hasta" juntos.')
    if (desde !== null && hasta !== null) {
      if (!esFechaISO(desde) || !esFechaISO(hasta)) return invalido('Las fechas van como AAAA-MM-DD.')
      if (desde > hasta) return invalido('"desde" no puede ser posterior a "hasta".')
      if (diasEntre(desde, hasta).length > MAX_DIAS_RESUMEN)
        return invalido(`El rango no puede superar ${MAX_DIAS_RESUMEN} días.`)
    }
    if (!zonaValida(zona)) return invalido('La zona horaria no es válida.')

    // Se leen solo país y fecha (nunca nombre ni correo). El filtro por fecha deja margen de un día
    // a cada lado: el corte exacto se hace después, en la zona pedida.
    const { docs } = await req.payload.find({
      collection: 'inscripciones-summit',
      pagination: false,
      depth: 0,
      select: { pais: true, createdAt: true },
      overrideAccess: true,
      ...(desde !== null && hasta !== null
        ? {
            where: {
              createdAt: {
                greater_than_equal: `${sumarDias(desde, -1)}T00:00:00.000Z`,
                less_than: `${sumarDias(hasta, 2)}T00:00:00.000Z`,
              },
            },
          }
        : {}),
    })
    return Response.json(resumenDeInscripciones(docs, { desde, hasta, zona }), { headers: sinCache })
  },
}

export const InscripcionesSummit: CollectionConfig = {
  slug: 'inscripciones-summit',
  typescript: { interface: 'InscripcionSummit' },
  labels: { singular: 'Inscripción al Summit', plural: 'Inscripciones al Summit' },
  admin: {
    group: 'Eventos',
    useAsTitle: 'email',
    defaultColumns: ['nombre', 'apellido', 'empresa', 'email', 'telefono', 'pais', 'createdAt'],
    listSearchableFields: ['nombre', 'apellido', 'empresa', 'email', 'pais'],
    description:
      'Personas que se inscribieron para asistir al V Summit Internacional UAP 2026 desde el formulario de la landing. Solo lectura: las inscripciones llegan desde el sitio.',
    components: { beforeListTable: ['@/components/admin/ExportarInscripciones#ExportarInscripciones'] },
  },
  defaultSort: '-createdAt',
  access: { read: soloAprobadores, create: nadie, update: nadie, delete: eliminacionDefinitiva },
  endpoints: [exportarPlanilla, resumenPublicable],
  hooks: { beforeValidate: [normalizarCorreo] },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, maxLength: 80 },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true, maxLength: 80 },
    { name: 'empresa', label: 'Empresa / Institución', type: 'text', maxLength: 150 },
    {
      name: 'email',
      label: 'Correo electrónico',
      type: 'email',
      required: true,
      unique: true,
      admin: { description: 'Único: una misma persona no se inscribe dos veces.' },
    },
    { name: 'telefono', label: 'Teléfono', type: 'text', maxLength: 25 },
    { name: 'pais', label: 'País', type: 'text', required: true, maxLength: 80 },
  ],
}
