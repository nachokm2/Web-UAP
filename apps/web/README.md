# Sitio y CMS de la UAP (`apps/web`)

Sitio institucional de la Universidad Autónoma del Paraguay con su administrador de contenido en `/admin`.
Una sola aplicación **Next.js 16 + Payload CMS 3 + PostgreSQL**, con archivos en el bucket S3 de Railway.

> El sitio estático anterior (raíz del repositorio) sigue desplegado como respaldo hasta el cambio de DNS.

## Puesta en marcha local

Requisitos: Node 24, Docker.

```bash
cd apps/web
cp .env.example .env            # completar PAYLOAD_SECRET (ver el comentario en el archivo)
npm ci
npm run db:up                   # PostgreSQL 18 en el puerto 54329
npm run dev                     # http://localhost:3000 y http://localhost:3000/admin
```

La primera vez, `/admin` pide crear el primer usuario: queda como **Super Admin**.
Para cargar el contenido del sitio anterior, ver [Migración de contenido](#migración-de-contenido).

## Cómo está organizado

| Carpeta | Contenido |
| --- | --- |
| `src/collections/` | Tipos de contenido: Carreras, Posgrados, Noticias, Imágenes, Documentos, Facultades, Sedes, Categorías, Redirecciones, Usuarios, Auditoría |
| `src/globals/` | Configuración del sitio (contacto, redes, formulario Bitrix, SEO por defecto) |
| `src/access/roles.ts` | **Matriz de permisos** (única fuente de verdad de quién puede hacer qué) |
| `src/workflow/` | Estados editoriales, transiciones y reglas de publicación |
| `src/audit/` | Registro de cambios campo por campo |
| `src/fields/` | Campos reutilizables (slug, programa, workflow, editor de noticias) |
| `src/app/(payload)/` | Panel `/admin` y API REST (generado por Payload) |
| `src/app/(sitio)/` | Sitio público |
| `src/proxy.ts` | Redirecciones 301/410, barra final en URLs y `noindex` fuera del dominio oficial |
| `src/lib/` | Acceso a datos con caché, rutas públicas, redirecciones |
| `src/migrations/` | Migraciones de la base (versionadas) |
| `scripts/migracion/` | Importación del sitio anterior |
| `tests/` | Unitarios, integración (PostgreSQL real) y E2E (navegador) |

## Roles y workflow

| | Super Admin | Administrador | Editor (Carreras / Postgrados / Noticias) | Solo lectura |
| --- | :-: | :-: | :-: | :-: |
| Ver todo, incluidos borradores | ✓ | ✓ | ✓ | ✓ |
| Crear y editar en su sección (borradores) | ✓ | ✓ | ✓ | — |
| Enviar a revisión | ✓ | ✓ | ✓ | — |
| Publicar, despublicar, archivar | ✓ | ✓ | — | — |
| Facultades, redirecciones, configuración | ✓ | ✓ | — | — |
| Usuarios y roles · eliminar definitivamente | ✓ | — | — | — |
| Ver auditoría | ✓ | ✓ | — | — |

Estados: **Borrador → En revisión → Publicado**, y desde Publicado: **No publicado** o **Archivado**.
Editar algo publicado crea un borrador: el sitio sigue mostrando la versión aprobada hasta que se publique el cambio.
Las reglas se validan en el servidor (`workflow/hooks.ts`); el panel "Flujo editorial" solo muestra los botones permitidos.

Para cambiar permisos se edita `src/access/roles.ts` **y** sus tests (`tests/unit/reglas.spec.ts`).

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | PostgreSQL. En Railway: referencia `${{Postgres.DATABASE_URL}}` |
| `PAYLOAD_SECRET` | Firma de sesiones. Obligatoria en producción; nunca en el repositorio |
| `SITE_URL` | URL pública canónica, sin barra final (ej. `https://uap.edu.py`). Se lee en ejecución |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Bucket de Railway (referencias `${{collected-carrier.*}}`). Vacías = disco local (solo desarrollo) |
| `S3_FORCE_PATH_STYLE` | `true` solo si el bucket lo indica en su pestaña Credentials |

## Base de datos y migraciones

- En desarrollo el esquema se sincroniza solo (`push`).
- En producción **solo** cambia con migraciones: al modificar colecciones, generar una con
  `npm run migrate:create -- descripcion-del-cambio`, revisarla y commitearla.
- Railway ejecuta `npm run migrate` antes de cada despliegue (pre-deploy). Si falla, no se despliega.
- Escribir migraciones compatibles hacia atrás (agregar antes que borrar) para poder volver a la versión anterior.

## Migración de contenido

```bash
npx tsx scripts/migracion/importar.ts                  # simulación: informa sin escribir
npx tsx scripts/migracion/importar.ts --aplicar        # importa a la base de DATABASE_URL
```

Lee los 93 HTML del sitio estático, los reglamentos y las noticias de WordPress (con su texto completo),
sube imágenes y PDF al almacenamiento y crea las redirecciones de las URL viejas. Es idempotente: lo que ya
existe se omite. Opciones: `--solo=programas,noticias,…`, `--noticias=todas`, `--estado=borrador`,
`--max-pdf-mb=N`, `--sin-archivos`. No inventa datos: lo que no puede mapear lo informa como pendiente.

Cada importación aplicada guarda un lote en `scripts/migracion/lotes/`. Para revertirla:
`npx tsx scripts/migracion/revertir.ts scripts/migracion/lotes/lote-XXXX.json --aplicar`
(conserva lo que alguien editó después).

## Tests

```bash
npm run db:up
npm test              # unitarios + integración (crea y borra la base uap_web_test)
npm run build && npm run test:e2e   # navegador contra el build de producción (base uap_web_e2e)
```

## Despliegue (Railway)

1. Push a `feat/cms-payload` (o PR).
2. GitHub Actions (`.github/workflows/cms.yml`) verifica: tipos, lint, tests, build y E2E.
3. Railway espera esa verificación (*Wait for CI*): si pasa, despliega `web-cms`; si falla, no despliega.
4. En Railway: build `npm run build`, pre-deploy `npm run migrate` (si falla, no se despliega), start `npm start`, health check `/api/health`.

La infraestructura del CMS se describe en `apps/web/.railway/railway.ts` (partial `cms`): cambiarla ahí y aplicar con
`railway config plan` → revisar → `railway config apply` (desde `apps/web`; en Windows ver la nota del archivo).

**Si un despliegue queda trabado** en "failed to fetch snapshot" (falla de infraestructura de Railway, no del código):
cancelarlo y usar *Deploy Latest Commit*. Si se repite, desplegar un paquete chico con la CLI:

```bash
git archive HEAD apps/web package.json package-lock.json | tar -x -C /tmp/web-cms
cd /tmp/web-cms && railway up --service web-cms --environment production --detach
```

Respaldos y restauración: ver `infra/respaldo/README.md`.

Paso a producción (apuntar `uap.edu.py` a este servicio, con vuelta atrás): ver `docs/cambio-de-dominio.md`.
Para comprobar que ninguna URL del WordPress anterior se pierde:
`bash scripts/migracion/verificar-urls.sh <sitio> resultado.tsv`.
