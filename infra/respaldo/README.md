# Respaldos del CMS (Railway)

## Qué se respalda y dónde

| Qué | Cómo | Cada cuánto | Se conserva |
|---|---|---|---|
| Base de datos (PostgreSQL) | Respaldo del volumen (Railway) | Diario / semanal / mensual | 6 días / 27 días / 89 días |
| Base de datos | Recuperación a un momento exacto, PITR (Railway, bucket `Postgres-PITR`) | Continuo | ~4 semanas |
| Base de datos | Volcado `pg_dump` en el bucket `respaldos-uap` (región iad), `base/AAAA-MM-DD.dump` | Diario, 07:00 UTC (04:00 Paraguay) | 30 días |
| Imágenes y PDF del CMS (bucket `collected-carrier`, región sjc) | Copia espejo en `respaldos-uap/archivos/` | Diario, misma tarea | Siempre la última copia |
| Archivos borrados o reemplazados en el CMS | Se mueven a `respaldos-uap/eliminados/AAAA-MM-DD/` | Diario | 30 días |
| Punto fijo después de la importación | Respaldo manual del volumen `post-importacion-2026-10-08` | Una vez | Sin vencimiento |

La tarea diaria es el servicio **respaldo** de Railway (cron `0 7 * * *`), con este `Dockerfile` y `respaldo.sh`. Sus variables son referencias a la base y a los dos buckets: ninguna clave queda en el repositorio.

## Cómo restaurar

**Un dato borrado o mal editado (un programa, una noticia):** primero mire el historial de versiones del documento en el panel (Versiones → Restaurar) y la Auditoría, que guarda el valor anterior de cada campo. No hace falta tocar respaldos.

**La base completa, a un momento exacto (p. ej. antes de un error a las 10:00):**

```bash
railway postgres pitr restore --service Postgres --at 2026-10-08T13:00:00Z --new-service-name postgres-restaurada
```

Crea una base **nueva** con los datos de ese momento; la actual no cambia. Revise los datos y recién después apunte `DATABASE_URL` de `web-cms` a la nueva.

**La base completa desde un respaldo diario/semanal/mensual:** panel de Railway → servicio Postgres → Backups → Restore. Reemplaza los datos actuales (Railway conserva el volumen anterior desmontado).

**La base en otro servidor (fuera de Railway):** baje `respaldos-uap/base/AAAA-MM-DD.dump` y restáurelo con `pg_restore --no-owner --no-privileges -d <base nueva> archivo.dump` (PostgreSQL 18).

**Imágenes o PDF:** el archivo está en `respaldos-uap/archivos/<mismo nombre>`; si se borró o reemplazó en los últimos 30 días, en `respaldos-uap/eliminados/<fecha>/<nombre>`. Para devolver todo:

```bash
rclone copy respaldo:<bucket-respaldo>/archivos principal:<bucket-principal>
```

## Prueba mensual de restauración

`probar-restauracion.sh` restaura el último volcado en un PostgreSQL temporal (no toca nada real), cuenta el contenido y compara los dos buckets. Instrucciones de uso en el encabezado del script. Anote la fecha y el resultado aquí:

| Fecha | Volcado | Resultado |
|---|---|---|
| 2026-10-08 | `base/2026-10-08.dump` (1 MB) | Restaurado completo: 23 carreras, 70 posgrados, 246 noticias, 18 autoridades, 35 formularios, 178 redirecciones, 958 imágenes, 126 documentos, 2.270 registros de auditoría. Archivos: 4.424 de 4.424 iguales (2,52 GB), 0 diferencias. |
