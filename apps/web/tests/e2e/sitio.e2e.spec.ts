// Sitio público contra el build de producción: lo que se publica en el CMS aparece
// en su URL, en el listado y en el sitemap; redirecciones, 404, 410 y noindex.

import { expect, test, type Page } from '@playwright/test'

const SUPER = { nombre: 'Rodrigo Prueba', email: 'superadmin@uap.test', password: 'clave-super-segura-123' }
const sufijo = Date.now().toString(36)
const NOMBRE = `Ingeniería de Prueba ${sufijo}`
const SLUG = `ingenieria-de-prueba-${sufijo}`

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

/** Sesión de Super Admin (lo crea si la base está vacía, por ejemplo si este archivo corre solo). */
async function sesionSuperAdmin(page: Page) {
  await page.goto('/admin/login')
  const login = await api(page, '/api/usuarios/login', { method: 'POST', body: { email: SUPER.email, password: SUPER.password } })
  if (login.status !== 200) {
    const alta = await api(page, '/api/usuarios/first-register', { method: 'POST', body: { ...SUPER, confirmPassword: SUPER.password } })
    expect(alta.status).toBe(200)
  }
}

test.describe.serial('Sitio público', () => {
  let carreraId: number

  test('una carrera publicada en el CMS aparece en su URL, en el listado y en el sitemap', async ({ page, request }) => {
    await sesionSuperAdmin(page)
    const facultad = await api(page, '/api/facultades', { method: 'POST', body: { nombre: `Facultad de Prueba ${sufijo}` } })
    expect(facultad.status).toBe(201)
    const creada = await api(page, '/api/carreras', {
      method: 'POST',
      body: {
        nombre: NOMBRE,
        slug: SLUG,
        facultad: facultad.json.doc.id,
        duracion: '10 semestres',
        modalidad: 'presencial',
        tituloOtorgado: 'Ingeniero de Prueba',
        descripcionCorta: 'Carrera creada por el test de extremo a extremo.',
        malla: [{ nombre: '1° Semestre', asignaturas: [{ nombre: 'Álgebra' }, { nombre: 'Cálculo I' }] }],
        _status: 'published',
      },
    })
    expect(creada.status).toBe(201)
    carreraId = creada.json.doc.id

    await page.goto(`/${SLUG}/`)
    await expect(page.locator('h1')).toHaveText(NOMBRE)
    await expect(page.locator('.info-pill', { hasText: 'Duración' })).toContainText('10 semestres')
    await expect(page.locator('.info-pill', { hasText: 'Modalidad' })).toContainText('Presencial')
    await expect(page.getByRole('tab', { name: '1° Semestre' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel')).toContainText('Cálculo I')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toMatch(new RegExp(`/${SLUG}/$`))
    const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}')
    expect(jsonLd).toMatchObject({ '@type': 'Course', name: NOMBRE, educationalCredentialAwarded: 'Ingeniero de Prueba' })

    await page.goto('/carreras/')
    await expect(page.locator('main').getByRole('link', { name: NOMBRE, exact: true })).toHaveAttribute('href', `/${SLUG}/`)

    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain(`/${SLUG}/</loc>`)
  })

  test('URLs: barra final, alias del sitio anterior, 404 y noindex fuera del dominio oficial', async ({ request }) => {
    const sinBarra = await request.get(`/${SLUG}`, { maxRedirects: 0 })
    expect(sinBarra.status()).toBe(301)
    expect(sinBarra.headers()['location']).toMatch(new RegExp(`/${SLUG}/$`))

    const posgrados = await request.get('/posgrados/', { maxRedirects: 0 })
    expect(posgrados.status()).toBe(301)
    expect(posgrados.headers()['location']).toMatch(/\/postgrados\/$/)

    const noExiste = await request.get('/esta-pagina-no-existe/')
    expect(noExiste.status()).toBe(404)
    expect(await noExiste.text()).toContain('No encontramos esta página')

    const oficial = await request.get('/carreras/')
    expect(oficial.headers()['x-robots-tag']).toBeUndefined()
    expect(oficial.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
    const pruebas = await request.get('/carreras/', { headers: { Host: 'web-cms-production.up.railway.app' } })
    expect(pruebas.headers()['x-robots-tag']).toContain('noindex')
  })

  test('cambiar la dirección de una carrera publicada redirige la URL anterior (301)', async ({ page, request }) => {
    await sesionSuperAdmin(page)
    const nuevo = `${SLUG}-nuevo`
    const r = await api(page, `/api/carreras/${carreraId}`, { method: 'PATCH', body: { slug: nuevo, _status: 'published' } })
    expect(r.status).toBe(200)

    const viejo = await request.get(`/${SLUG}/`, { maxRedirects: 0 })
    expect(viejo.status()).toBe(301)
    expect(viejo.headers()['location']).toMatch(new RegExp(`/${nuevo}/$`))
    expect((await request.get(`/${nuevo}/`)).status()).toBe(200)
  })

  test('una página eliminada del sitio anterior responde 410', async ({ page, request }) => {
    await sesionSuperAdmin(page)
    const desde = `/sample-page-${sufijo}/`
    expect((await api(page, '/api/redirecciones', { method: 'POST', body: { desde, tipo: '410' } })).status).toBe(201)
    const r = await request.get(desde, { maxRedirects: 0 })
    expect(r.status()).toBe(410)
    expect(r.headers()['x-robots-tag']).toContain('noindex')
  })
})
