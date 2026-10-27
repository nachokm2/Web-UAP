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

    // Cada facultad es un desplegable cerrado: se abre la suya, como haría una persona.
    await page.goto('/carreras/')
    await page.locator('main summary', { hasText: `Facultad de Prueba ${sufijo}` }).click()
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

  test('si el formulario de Bitrix24 no carga, se ofrecen otras formas de contacto', async ({ page }) => {
    await sesionSuperAdmin(page)
    const config = await api(page, '/api/globals/configuracion', {
      method: 'POST',
      body: {
        email: 'admision@uap.test',
        bitrixFormulario: 'inline/61/hi7fex',
        bitrixLoaderUrl: 'https://cdn.bitrix24.es/b23715511/crm/form/loader_61.js',
      },
    })
    expect(config.status).toBe(200)
    // Como si el CDN de Bitrix24 fallara (o lo bloqueara una extensión del navegador).
    await page.route('https://cdn.bitrix24.es/**', (r) => r.abort())
    await page.addInitScript(() => {
      ;(window as unknown as { dataLayer: unknown[] }).dataLayer = []
    })
    await page.goto('/contacto/')
    const aviso = page.locator('.formulario-respaldo')
    await expect(aviso).toContainText('No pudimos cargar el formulario')
    await expect(aviso.getByRole('link', { name: 'admision@uap.test' })).toBeVisible()
    const eventos = await page.evaluate(() => (window as unknown as { dataLayer: { event?: string }[] }).dataLayer.map((e) => e.event))
    expect(eventos).toContain('formulario_no_disponible')
  })

  test('un formulario deshabilitado en Bitrix24 también muestra el aviso; uno con campos, no', async ({ page }) => {
    test.setTimeout(120_000)
    // Imita lo que dibuja Bitrix24 (visto en producción el 27-oct): deshabilitado = botón Enviar,
    // un <select> oculto propio y el mensaje, sin campos. El configurado en la prueba anterior es el 61.
    const dibujar = (html: string) =>
      `document.querySelectorAll('script[data-b24-form]').forEach(function (s) { var d = document.createElement('div'); d.className = 'b24-form'; d.innerHTML = ${JSON.stringify(html)}; s.after(d) })`
    const deshabilitado = '<button type="submit">Enviar</button><select style="display:none"></select><p>El formulario está deshabilitado</p>'
    const conCampos = '<input type="string" name="name"><button type="submit">Enviar</button><select style="display:none"></select>'

    await page.route('https://cdn.bitrix24.es/**', (r) => r.fulfill({ contentType: 'application/javascript', body: dibujar(deshabilitado) }))
    await page.goto('/contacto/')
    await expect(page.getByText('El formulario está deshabilitado')).toBeVisible()
    await expect(page.locator('.formulario-respaldo')).toBeVisible({ timeout: 25_000 })

    await page.unroute('https://cdn.bitrix24.es/**')
    await page.route('https://cdn.bitrix24.es/**', (r) => r.fulfill({ contentType: 'application/javascript', body: dibujar(conCampos) }))
    await page.goto('/inscripcion/')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await page.waitForTimeout(16_000)
    await expect(page.locator('.formulario-respaldo')).toHaveCount(0)
  })

  test('la portada permite pausar el carrusel y la cinta de logos (WCAG 2.2.2)', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Pausar la presentación' }).click()
    await expect(page.getByRole('button', { name: 'Reanudar la presentación' })).toBeVisible()
    // Sin el puntero ni el foco dentro del carrusel: solo el botón lo mantiene quieto.
    await page.mouse.move(0, 0)
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    const indice = () => page.locator('.carousel-slide').evaluateAll((els) => els.findIndex((e) => e.classList.contains('carousel-active')))
    const antes = await indice()
    await page.waitForTimeout(6500)
    expect(await indice()).toBe(antes)

    await page.getByRole('button', { name: 'Pausar el desplazamiento de los logos' }).click()
    await expect(page.locator('.partners-track')).toHaveCSS('animation-play-state', 'paused')
    await expect(page.getByRole('button', { name: 'Reanudar el desplazamiento de los logos' })).toBeVisible()
  })
})
