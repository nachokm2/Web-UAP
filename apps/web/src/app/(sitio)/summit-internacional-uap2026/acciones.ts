'use server'

// Guardado de la inscripción al Summit: valida en el servidor (nunca se confía en el navegador),
// frena el spam (campo trampa, tiempo mínimo y límite por visitante) y guarda una fila en la
// tabla inscripciones-summit. Se escribe con la API local de Payload (sin pasar por la API
// pública, que tiene la creación cerrada). Después avisa por correo al equipo del evento.

import config from '@payload-config'
import { headers } from 'next/headers'
import { after } from 'next/server'
import { getPayload, type Payload } from 'payload'

import { SUMMIT } from '@/components/sitio/SummitUap2026'
import { correoConfigurado, listaDeCorreos } from '@/lib/correo'
import {
  avisoDeInscripcion,
  crearLimitador,
  validarInscripcion,
  type CampoInscripcion,
  type EstadoInscripcion,
  type FilaInscripcion,
} from '@/lib/inscripcionSummit'
import { urlAbsoluta } from '@/lib/urls'

/** 5 envíos cada 10 minutos por visitante. */
const puedeEnviar = crearLimitador(5, 10 * 60 * 1000)

/** Un envío humano tarda más que esto desde que se dibuja el formulario. */
const TIEMPO_MINIMO_MS = 2500

const MENSAJE_GENERAL =
  'No pudimos guardar tu inscripción. Probá de nuevo en unos minutos o escribinos a marketing@uap.edu.py.'

export async function inscribirse(
  _anterior: EstadoInscripcion,
  formData: FormData,
): Promise<EstadoInscripcion> {
  const encabezados = await headers()
  const visitante =
    encabezados.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    encabezados.get('x-real-ip') ||
    'desconocido'

  const resultado = validarInscripcion(formData)
  if (!resultado.ok) {
    const valores: Partial<Record<CampoInscripcion, string>> = {}
    for (const campo of ['nombre', 'apellido', 'empresa', 'email', 'telefono', 'pais'] as const) {
      const v = formData.get(campo)
      if (typeof v === 'string') valores[campo] = v.slice(0, 200)
    }
    return { estado: 'error', errores: resultado.errores, valores }
  }
  const { datos } = resultado

  // Robots: el campo oculto "sitio_web" lo llena un robot, y un envío casi instantáneo no es una persona.
  // Se responde "ok" sin guardar para no darles pistas.
  const trampa = formData.get('sitio_web')
  const dibujadoEn = Number(formData.get('dibujado_en'))
  const muyRapido = !Number.isFinite(dibujadoEn) || Date.now() - dibujadoEn < TIEMPO_MINIMO_MS
  if ((typeof trampa === 'string' && trampa !== '') || muyRapido)
    return { estado: 'ok', nombre: datos.nombre }

  if (!puedeEnviar(visitante)) {
    return {
      estado: 'error',
      mensaje: 'Enviaste varias inscripciones seguidas. Esperá unos minutos y probá de nuevo.',
      valores: datos,
    }
  }

  try {
    const payload = await getPayload({ config })
    const { totalDocs } = await payload.count({
      collection: 'inscripciones-summit',
      where: { email: { equals: datos.email } },
    })
    // Ya inscripta con ese correo: se confirma igual y no se duplica (tampoco se revela que el correo ya existía).
    if (totalDocs === 0) {
      const inscripcion = await payload.create({
        collection: 'inscripciones-summit',
        data: {
          ...datos,
          empresa: datos.empresa || undefined,
          telefono: datos.telefono || undefined,
        },
      })
      // El aviso sale después de responder: la persona no espera al servidor de correo.
      after(() => avisarAlEquipo(payload, inscripcion))
    }
    return { estado: 'ok', nombre: datos.nombre }
  } catch (error) {
    // Dos envíos simultáneos con el mismo correo: el segundo choca con el índice único y es un éxito.
    const ya = await getPayload({ config })
      .then((p) =>
        p.count({ collection: 'inscripciones-summit', where: { email: { equals: datos.email } } }),
      )
      .catch(() => null)
    if (ya && ya.totalDocs > 0) return { estado: 'ok', nombre: datos.nombre }
    console.error('[summit] no se pudo guardar la inscripción:', error)
    return { estado: 'error', mensaje: MENSAJE_GENERAL, valores: datos }
  }
}

/**
 * Correo al equipo del evento: a SUMMIT_AVISO_PARA (correos separados por coma) o, si no está, al
 * correo del Summit. Si falla, la inscripción ya quedó guardada: se registra solo el motivo.
 */
async function avisarAlEquipo(payload: Payload, inscripcion: FilaInscripcion) {
  if (!correoConfigurado()) return
  const para = listaDeCorreos(process.env.SUMMIT_AVISO_PARA)
  try {
    const { totalDocs } = await payload.count({ collection: 'inscripciones-summit' })
    await payload.sendEmail({
      to: para.length ? para : SUMMIT.correo,
      replyTo: { name: `${inscripcion.nombre} ${inscripcion.apellido}`, address: inscripcion.email },
      ...avisoDeInscripcion(
        inscripcion,
        totalDocs,
        SUMMIT.nombre,
        urlAbsoluta('/admin/collections/inscripciones-summit'),
      ),
    })
  } catch (error) {
    console.error(
      '[summit] no se pudo enviar el aviso de inscripción:',
      error instanceof Error ? error.message : error,
    )
  }
}
