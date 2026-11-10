// Se ejecuta una vez al iniciar el servidor de Next (no durante `next build`).
//
// Carga inicial del contenido del V Summit en el CMS (lib/eventos/sembrar.ts). Corre en
// segundo plano y sin esperar: el sitio atiende pedidos mientras tanto, y si falla solo queda
// el aviso en los logs (la página del Summit se sigue viendo con su contenido de respaldo).
// Es idempotente; para desactivarla, definir SEMBRAR_EVENTOS=false.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.SEMBRAR_EVENTOS === 'false') return

  void (async () => {
    try {
      const [{ getPayload }, { default: config }, { repararImagenesSummit, sembrarSummit }] = await Promise.all([
        import('payload'),
        import('@payload-config'),
        import('@/lib/eventos/sembrar'),
      ])
      const payload = await getPayload({ config })
      const resultado = await sembrarSummit(payload)
      if (resultado === 'creado') console.log('[eventos] Contenido inicial del Summit cargado en el CMS.')
      const reparadas = await repararImagenesSummit(payload)
      if (reparadas > 0) console.log(`[eventos] Se repararon ${reparadas} imágenes del Summit que habían quedado mal en el almacenamiento.`)
    } catch (error) {
      console.error(
        '[eventos] No se pudo cargar el contenido inicial del Summit:',
        error instanceof Error ? error.message : error,
      )
    }
  })()
}
