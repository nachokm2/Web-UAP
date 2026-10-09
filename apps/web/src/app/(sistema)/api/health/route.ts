// Health check para Railway: responde 200 solo si la app puede consultar la base.
import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'usuarios', overrideAccess: true })
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ status: 'error' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
