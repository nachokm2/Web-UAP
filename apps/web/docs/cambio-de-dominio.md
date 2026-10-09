# Cambio de dominio: uap.edu.py al sitio nuevo (CMS)

Procedimiento para que `uap.edu.py` deje de mostrar el WordPress de SiteGround y pase al
servicio `web-cms` de Railway, con vuelta atrás en minutos. El WordPress **no se toca ni se
da de baja** hasta 30 días después de un cambio estable.

## Situación al 9 de octubre de 2026

| | Hoy |
|---|---|
| DNS de `uap.edu.py` | Servidores propios de la UAP: `tcadnse.uap.edu.py` y `alerce.uap.edu.py` |
| `uap.edu.py` y `www.uap.edu.py` | Registro A → `34.174.80.21` (WordPress en SiteGround) |
| Dirección principal | `https://uap.edu.py` (sin www; `www` redirige con 301, igual que hará el sitio nuevo) |
| Railway | `uap.edu.py` está agregado al servicio **estático** `Web-UAP` (sin verificar, nunca recibió tráfico). Hay que pasarlo a `web-cms`. |
| Sitio nuevo | `https://web-cms-production-fd17.up.railway.app` con `NOINDEX=true` (no se indexa) |
| URLs del WordPress (380) | 279 responden, 29 retiradas a propósito (410), 72 sin decisión (404) |

## Decisión pendiente: cómo apuntar el dominio raíz

Railway **no entrega una IP fija**. Para un dominio raíz como `uap.edu.py` pide un registro
CNAME hacia `xxxx.up.railway.app` más un TXT de verificación (`_railway-verify`). Un CNAME en la
raíz solo es posible si el DNS admite *CNAME flattening* o registros *ALIAS/ANAME*; los
servidores DNS habituales (BIND, Windows DNS) no lo hacen.

- **A. Recomendada: delegar la zona `uap.edu.py` en Cloudflare (plan gratuito).** Admite el
  CNAME en la raíz y, además, guarda imágenes, CSS y JS en servidores de Asunción y São Paulo,
  la mayor mejora de velocidad pendiente para Paraguay. Requiere exportar la zona actual
  **completa**, recrearla en Cloudflare y cambiar los servidores de nombre en NIC.py. La zona
  incluye el correo de Microsoft 365 (MX y SPF, y DKIM si está configurado), `canvas.uap.edu.py`
  y los demás subdominios. Si la zona
  queda idéntica, el cambio de servidores de nombre no corta nada.
- **B. Mantener el DNS de la UAP** solo si su software admite ALIAS/ANAME. Debe confirmarlo TI.
- **C. No recomendada: usar `www.uap.edu.py` como dirección principal** (CNAME normal) y que
  `uap.edu.py` redirija a `www`. Cambia el dominio de todas las URLs: funciona con 301, pero
  pierde la ventaja de mantener exactamente las direcciones actuales.

## Antes del día del cambio (no afecta al sitio actual)

1. **Contenido aprobado**: decisión sobre las 72 URLs en 404 (página de revisión), lista final
   de carreras habilitadas y destino de "Consultas Académicas".
2. **Usuarios**: crear las cuentas reales con su rol y cambiar la contraseña del Super Admin
   de pruebas (panel → cuenta propia).
3. **Código en `main`**: unir `feat/cms-payload` a `main`. Después, en
   `apps/web/.railway/railway.ts` cambiar `branch: 'feat/cms-payload'` por `branch: 'main'`,
   y correr `railway config plan` (revisar) y luego `railway config apply`.
4. **Dominio en Railway**: quitar `uap.edu.py` del servicio `Web-UAP` y agregar `uap.edu.py` y
   `www.uap.edu.py` a `web-cms`. Railway entrega, para cada uno, el CNAME de destino y el TXT
   `_railway-verify`.
5. **TI crea los TXT `_railway-verify`** con anticipación (no cambian el tráfico) y **baja el
   TTL** de `uap.edu.py` y `www` a 300 s al menos 24 h antes.
6. **Respaldo**: respaldo manual bloqueado de Postgres en Railway (Postgres → Backups) el mismo día.

## Día del cambio (horario de baja actividad, sin cargar contenido durante la ventana)

1. **Variables de producción** en `apps/web/.railway/railway.ts`:
   `SITE_URL: 'https://uap.edu.py'` y borrar la línea `NOINDEX`. Luego `railway config plan`
   y `railway config apply` (despliega solo; esperar SUCCESS).
   - Va **antes** del DNS a propósito: si `uap.edu.py` llegara a recibir tráfico con
     `NOINDEX=true`, Google podría guardar hasta 24 h un `robots.txt` que prohíbe todo.
   - Desde este paso el panel se usa en `https://uap.edu.py/admin`: la protección CSRF solo
     acepta `SITE_URL`, así que en el dominio de Railway ya no se puede iniciar sesión.
   - El dominio de Railway sigue respondiendo, con `noindex` (lo agrega `proxy.ts` a todo
     dominio que no sea el oficial).
2. **TI cambia los registros**: `uap.edu.py` y `www` pasan a los CNAME que dio Railway (con
   flattening en la raíz).
3. **Certificado**: Railway lo emite al ver el CNAME (minutos). Seguir el estado en el
   servicio → Settings → Networking.
4. **Verificación** (en este orden):
   - `curl -I https://uap.edu.py/` → 200 y sin cabecera `X-Robots-Tag`.
   - `https://uap.edu.py/robots.txt` → `Allow: /` y la línea `Sitemap:`.
   - `https://www.uap.edu.py/carreras/` → 301 a `https://uap.edu.py/carreras/`.
   - `bash scripts/migracion/verificar-urls.sh https://uap.edu.py resultado.tsv` → mismos
     números que en el dominio de Railway (ningún 404 nuevo).
   - Enviar un formulario de prueba (inscripción y un formulario de asesor) y confirmar que
     llega a Bitrix24.
   - Iniciar sesión en `https://uap.edu.py/admin`.
5. **Google Search Console**: enviar `https://uap.edu.py/sitemap.xml` e inspeccionar la
   portada y dos carreras.

## Vuelta atrás

- **DNS**: volver `uap.edu.py` y `www` al registro A `34.174.80.21`. Con TTL de 300 s el
  WordPress vuelve en 5–10 minutos. Con Cloudflare se cambia el registro desde su panel, sin
  tocar los servidores de nombre.
- **Variables**: volver `SITE_URL` al dominio de Railway y `NOINDEX: 'true'` (plan y apply)
  para seguir probando.
- El contenido del CMS no se pierde: base con respaldo diario, semanal y mensual, PITR y la
  copia nocturna en el bucket `respaldos-uap` (`infra/respaldo/README.md`).

## Las dos semanas siguientes

- Revisar a diario los 404 en los logs de `web-cms` y agregar las redirecciones que falten en
  el panel.
- No dar de baja SiteGround antes de 30 días estables.
