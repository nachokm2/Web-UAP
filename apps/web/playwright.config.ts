import fs from 'fs'
import path from 'path'

import { defineConfig, devices } from '@playwright/test'

import { URL_SERVIDOR_PG } from './tests/entorno'

const PUERTO = 3100
export const URL_E2E = `http://localhost:${PUERTO}`
const BASE_E2E = URL_SERVIDOR_PG.replace(/\/[^/]*$/, '/uap_web_e2e')

/** Usa el Chromium ya descargado por Playwright si existe (evita una descarga en cada máquina). */
function chromiumLocal(): string | undefined {
  const raiz = process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'ms-playwright') : ''
  if (!raiz || !fs.existsSync(raiz)) return undefined
  return fs
    .readdirSync(raiz)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort()
    .reverse()
    .map((d) => path.join(raiz, d, 'chrome-win64', 'chrome.exe'))
    .find((exe) => fs.existsSync(exe))
}

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 90_000,
  use: {
    baseURL: URL_E2E,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { executablePath: chromiumLocal() },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Prueba el build de producción (npm run build) como corre en Railway.
    command: `npx tsx tests/e2e/prepararBase.ts && npx next start -p ${PUERTO}`,
    url: URL_E2E,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      DATABASE_URL: BASE_E2E,
      SITE_URL: URL_E2E,
      PAYLOAD_SECRET: 'secreto-solo-para-e2e',
      // El script de E2E carga tsx para los tests; el servidor de Next no debe heredarlo.
      NODE_OPTIONS: '--no-deprecation',
    },
  },
})
