// Recorrido real del panel en el navegador, contra el build de producción.

import { expect, test, type Page } from '@playwright/test'

const SUPER = { nombre: 'Rodrigo Prueba', email: 'superadmin@uap.test', password: 'clave-super-segura-123' }
const EDITOR = { nombre: 'Editora Carreras', email: 'editora@uap.test', password: 'clave-editora-segura-1' }
const CARRERA = `Carrera E2E ${Date.now()}`

async function login(page: Page, user: { email: string; password: string }) {
  await page.goto('/admin/login')
  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/admin(\/)?$/)
}

/** Llama a la API desde el navegador (usa la cookie de sesión como el panel real). */
async function api(page: Page, ruta: string, init?: { method?: string; body?: unknown }) {
  return page.evaluate(
    async ({ ruta, init }) => {
      const res = await fetch(ruta, {
        method: init?.method ?? 'GET',
        credentials: 'include',
        headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
        body: init?.body ? JSON.stringify(init.body) : undefined,
      })
      return { status: res.status, json: await res.json().catch(() => null) }
    },
    { ruta, init },
  )
}

async function estadoEnPanel(page: Page) {
  return (await page.locator('.flujo-editorial__pill').textContent())?.trim()
}

async function cambiarEstado(page: Page, accion: string, esperado: string) {
  await page.getByRole('button', { name: accion, exact: true }).click()
  await expect(page.locator('.flujo-editorial__pill')).toHaveText(esperado, { timeout: 20_000 })
}

test.describe.serial('Panel de administración', () => {
  let carreraUrl = ''

  test('el primer usuario se crea como Super Admin y el panel está en español', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL(/create-first-user/)
    await page.fill('#field-nombre', SUPER.nombre)
    await page.fill('#field-email', SUPER.email)
    await page.fill('#field-password', SUPER.password)
    await page.fill('#field-confirm-password', SUPER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin(\/)?$/, { timeout: 30_000 })

    await expect(page.getByText('Contenido académico').first()).toBeVisible()
    const yo = await api(page, '/api/usuarios/me')
    expect(yo.json.user.roles).toEqual(['superadmin'])
  })

  test('crea una carrera como borrador y la publica con el flujo editorial', async ({ page }) => {
    await login(page, SUPER)
    await page.goto('/admin/collections/carreras/create')
    await page.fill('#field-nombre', CARRERA)
    await page.click('#action-save-draft')
    await page.waitForURL(/\/admin\/collections\/carreras\/\d+/)
    carreraUrl = page.url()

    await expect(page.locator('.flujo-editorial')).toBeVisible()
    expect(await estadoEnPanel(page)).toBe('Borrador')

    await cambiarEstado(page, 'Enviar a revisión', 'En revisión')
    await cambiarEstado(page, 'Aprobar y publicar', 'Publicado')

    // El público (sin sesión) la ve publicada.
    const slug = CARRERA.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')
    const publico = await page.context().browser()!.newContext({ baseURL: page.url().split('/admin')[0] })
    const res = await publico.request.get(`/api/carreras?where[slug][equals]=${slug}`)
    const json = await res.json()
    expect(json.docs).toHaveLength(1)
    expect(json.docs[0].estado).toBe('publicado')
    await publico.close()
  })

  test('el Super Admin crea una editora; ella no ve "Publicar" y solo puede enviar a revisión', async ({ page, browser }) => {
    await login(page, SUPER)
    const creada = await api(page, '/api/usuarios', {
      method: 'POST',
      body: { ...EDITOR, roles: ['editor_carreras'], activo: true },
    })
    expect(creada.status).toBe(201)

    const ctx = await browser.newContext()
    const editora = await ctx.newPage()
    await login(editora, EDITOR)
    await editora.goto(carreraUrl)
    await expect(editora.locator('.flujo-editorial')).toBeVisible()

    // Corrige un dato: queda como borrador; el sitio sigue mostrando la versión publicada.
    await editora.fill('#field-duracion', '8 semestres')
    await editora.click('#action-save-draft')
    await expect(editora.locator('.flujo-editorial__pill')).toHaveText('Borrador', { timeout: 20_000 })
    await expect(editora.locator('#action-save')).toHaveCount(0)
    await expect(editora.getByRole('button', { name: 'Aprobar y publicar' })).toHaveCount(0)
    await expect(editora.getByText('El sitio sigue mostrando la última versión publicada')).toBeVisible()

    await cambiarEstado(editora, 'Enviar a revisión', 'En revisión')

    // Intento de publicar por la API: rechazado y registrado.
    const id = carreraUrl.split('/').pop()
    const intento = await api(editora, `/api/carreras/${id}/transicion`, { method: 'POST', body: { estado: 'publicado' } })
    expect(intento.status).toBe(403)
    expect(intento.json.error).toMatch(/Administrador/)
    await ctx.close()
  })

  test('la auditoría muestra quién cambió qué, con valor anterior y nuevo', async ({ page }) => {
    await login(page, SUPER)
    const id = carreraUrl.split('/').pop()
    const { json } = await api(page, `/api/auditoria?where[documentoId][equals]=${id}&limit=50&sort=createdAt`)
    const docs = json.docs
    const resumen = docs.map((d: { accion: string; campo?: string; usuarioNombre: string; valorNuevo?: string }) => [d.accion, d.campo, d.usuarioNombre, d.valorNuevo])
    expect(resumen).toContainEqual(['creacion', null, SUPER.nombre, null])
    expect(resumen).toContainEqual(['cambio_estado', 'estado', SUPER.nombre, 'Publicado'])
    expect(resumen).toContainEqual(['actualizacion', 'duracion', EDITOR.nombre, '8 semestres'])
    expect(resumen).toContainEqual(['transicion_rechazada', 'estado', EDITOR.nombre, 'Publicado'])

    await page.goto('/admin/collections/auditoria')
    await expect(page.getByText(EDITOR.nombre).first()).toBeVisible()
  })
})
