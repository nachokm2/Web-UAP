# Cambio de dominio: uap.edu.py al sitio nuevo (CMS)

Procedimiento para que `uap.edu.py` deje de mostrar el WordPress de SiteGround y pase al
servicio `web-cms` de Railway, con vuelta atrás en minutos. El WordPress **no se toca ni se
da de baja** hasta 30 días después de un cambio estable.

## Situación al 16 de octubre de 2026

| | Hoy |
|---|---|
| DNS de `uap.edu.py` | **Cloudflare** (plan Free) desde el 16-oct, 16:43 (hora de Paraguay): servidores `arya.ns.cloudflare.com` y `fred.ns.cloudflare.com`, cambiados en NIC.py por Fernando Fajardo (TI). Los anteriores eran `tcadnse` y `alerce` (BIND de la UAP). |
| Zona en Cloudflare | 29 registros, todos en "DNS only": sitio, Microsoft 365 de `uap.edu.py` y de `cloud.uap.edu.py`, Canvas, Brevo, `tcadnse`, `alerce` y los dos TXT de Railway. SSL/TLS **Full**; Email Address Obfuscation y Rocket Loader **desactivados**. |
| DNSSEC | Activado en Cloudflare, **pendiente**: el DS todavía no se cargó en NIC.py (ver más abajo). |
| `uap.edu.py` y `www.uap.edu.py` | Registro A → `34.174.80.21` (WordPress en SiteGround), "DNS only", TTL Auto (5 min) |
| Dirección principal | `https://uap.edu.py` (sin www; `www` redirige con 301, igual que hará el sitio nuevo) |
| Railway | `uap.edu.py` y `www.uap.edu.py` agregados a `web-cms`; Railway todavía no los marca como verificados aunque los TXT ya se ven. `web-cms` despliega desde `main`. |
| Sitio nuevo | `https://web-cms-production-fd17.up.railway.app` con `NOINDEX=true` (no se indexa) |
| URLs del WordPress (380) | 279 responden, 29 retiradas a propósito (410), 72 sin decisión (404) |

**Incidente del 16-oct (lección):** la zona se armó con los registros visibles desde internet.
`cloud.uap.edu.py` (un dominio aparte de Microsoft 365: correo, Teams y registro de equipos)
solo existía en el BIND y no se vio. Desde el cambio en NIC.py (16:43) hasta que se cargaron
sus 9 registros (17:03) no resolvía en Cloudflare. **Ningún cambio de DNS sin comparar antes
contra el archivo de zona completo.**

## Antes del día del cambio (no afecta al sitio actual)

1. **Contenido aprobado**: decisión sobre las 72 URLs en 404 (página de revisión), lista final
   de carreras habilitadas y destino de "Consultas Académicas".
2. **Usuarios**: crear las cuentas reales con su rol y cambiar la contraseña del Super Admin
   de pruebas (panel → cuenta propia).
3. **DNS**: comparar la zona de Cloudflare con el listado completo del BIND que mande TI.
4. **Railway**: confirmar en *web-cms → Settings → Networking* si `uap.edu.py` y `www` ya figuran
   verificados. Sin verificación (TXT), Railway responde 404 aunque el CNAME apunte bien.
5. **Respaldo**: respaldo manual bloqueado de Postgres en Railway (Postgres → Backups) el mismo día.

Hechos: código en `main` (PR #2 a #4), dominios agregados en Railway (9-oct), zona en
Cloudflare y cambio de servidores de nombre en NIC.py (16-oct).

## Día del cambio (horario de baja actividad, sin cargar contenido durante la ventana)

1. **Variables de producción**: unir el PR de lanzamiento, que deja en
   `apps/web/.railway/railway.ts` `SITE_URL: 'https://uap.edu.py'` y sin `NOINDEX`. Desde
   `apps/web`: `railway config plan` (debe mostrar **solo** "Update variable SITE_URL" y
   "Delete variable NOINDEX") y `railway config apply --confirm-destructive` (lo "destructivo"
   es borrar `NOINDEX`). Despliega solo; esperar SUCCESS.
   - Va **antes** del DNS a propósito: si `uap.edu.py` llegara a recibir tráfico con
     `NOINDEX=true`, Google podría guardar hasta 24 h un `robots.txt` que prohíbe todo.
   - Desde este paso el panel se usa en `https://uap.edu.py/admin`: la protección CSRF solo
     acepta `SITE_URL`, así que en el dominio de Railway ya no se puede iniciar sesión.
   - El dominio de Railway sigue respondiendo, con `noindex` (lo agrega `proxy.ts` a todo
     dominio que no sea el oficial).
2. **Cloudflare (DNS → Records)**: cambiar solo dos registros, con **proxy activado** (nube
   naranja), según la guía de Railway para Cloudflare:
   - `uap.edu.py`: borrar el A `34.174.80.21` y crear CNAME `@` → `rau3h7lr.up.railway.app`.
   - `www`: borrar el A `34.174.80.21` y crear CNAME `www` → `bhanuyjy.up.railway.app`.
   - No tocar ningún otro registro (correo, Teams, Canvas, `cloud`, Brevo). Deben seguir siendo 29.
3. **Railway**: debe mostrar "Cloudflare proxy detected" en ambos dominios. Con proxy, el
   certificado que ve el público es el de Cloudflare (modo SSL **Full**, no Full strict).
4. **Verificación** (en este orden):
   - `curl -I https://uap.edu.py/` → 200 y sin cabecera `X-Robots-Tag`.
   - `https://uap.edu.py/robots.txt` → `Allow: /` y la línea `Sitemap:`. Revisar que Cloudflare
     (Bot Management / AI Crawl Control) no le haya agregado reglas que no queremos.
   - `https://www.uap.edu.py/carreras/` → 301 a `https://uap.edu.py/carreras/`.
   - `bash scripts/migracion/verificar-urls.sh https://uap.edu.py resultado.tsv` → mismos
     números que en el dominio de Railway (ningún 404 nuevo).
   - Enviar un formulario de prueba (inscripción y un formulario de asesor) y confirmar que
     llega a Bitrix24.
   - Iniciar sesión en `https://uap.edu.py/admin`.
   - Medición: en Google Analytics 4 (G-WK32BB1JK5) → Tiempo real aparecen visitas, y en Meta
     Business el dominio sigue verificado. Tag Manager (GTM-MMNLDBHC) se activa solo con
     `SITE_URL=https://uap.edu.py` y sin `NOINDEX` (ver `medicionActiva()` en `src/lib/urls.ts`).
   - Correo, Teams y Canvas siguen respondiendo (sus registros no se tocan, pero se verifica).
5. **Google Search Console**: enviar `https://uap.edu.py/sitemap.xml` e inspeccionar la
   portada y dos carreras.

## Vuelta atrás

- **DNS (Cloudflare)**: borrar los dos CNAME y volver a crear A `@` y A `www` → `34.174.80.21`,
  "DNS only". Con TTL de 5 min el WordPress vuelve en 5–10 minutos.
- **Variables**: volver `SITE_URL` al dominio de Railway y `NOINDEX: 'true'` (plan y apply)
  para seguir probando.
- **Servidores de nombre**: volver a `tcadnse`/`alerce` en NIC.py solo como último recurso
  (tarda más y, con DNSSEC activo, primero hay que quitar el DS).
- El contenido del CMS no se pierde: base con respaldo diario, semanal y mensual, PITR y la
  copia nocturna en el bucket `respaldos-uap` (`infra/respaldo/README.md`).

## DNSSEC (después de comparar con el BIND y 1–2 días estables)

TI carga en NIC.py el DS que publica Cloudflare (verificado contra su clave KSK):
`uap.edu.py. 3600 IN DS 2371 13 2 57F546E27765ADFF2B57786ABEC2DBE05F8E5EF5A46B246C08D52760778DA3EF`.
Antes de cualquier cambio de servidores de nombre, quitar primero el DS en NIC.py.

## Las dos semanas siguientes

- Revisar a diario los 404 en los logs de `web-cms` y agregar las redirecciones que falten en
  el panel.
- No dar de baja SiteGround antes de 30 días estables.
