#!/bin/sh
# Respaldo diario del CMS de la UAP. Lo ejecuta el servicio "respaldo" de Railway (cron).
#
#   1. Base de datos: volcado lógico (pg_dump, formato custom), restaurable con pg_restore
#      en cualquier PostgreSQL 18. Complementa los respaldos de volumen y el PITR de Railway.
#   2. Archivos (imágenes y PDF del bucket del CMS): copia espejo. Lo que se borra o se
#      reemplaza en el bucket principal se guarda en eliminados/AAAA-MM-DD/.
#   3. Retención: volcados y eliminados de más de RETENCION_DIAS días (30 por defecto).
#
# Variables (referencias en Railway, sin valores en el repositorio):
#   DATABASE_URL
#   PRINCIPAL_ENDPOINT PRINCIPAL_BUCKET PRINCIPAL_REGION PRINCIPAL_ACCESS_KEY_ID PRINCIPAL_SECRET_ACCESS_KEY
#   RESPALDO_ENDPOINT  RESPALDO_BUCKET  RESPALDO_REGION  RESPALDO_ACCESS_KEY_ID  RESPALDO_SECRET_ACCESS_KEY
#   RETENCION_DIAS (opcional)

set -eu

remoto() { # remoto NOMBRE PREFIJO_DE_VARIABLES
  eval "export RCLONE_CONFIG_$1_TYPE=s3 RCLONE_CONFIG_$1_PROVIDER=Other RCLONE_CONFIG_$1_FORCE_PATH_STYLE=false"
  eval "export RCLONE_CONFIG_$1_ENDPOINT=\"\$$2_ENDPOINT\" RCLONE_CONFIG_$1_REGION=\"\$$2_REGION\""
  eval "export RCLONE_CONFIG_$1_ACCESS_KEY_ID=\"\$$2_ACCESS_KEY_ID\" RCLONE_CONFIG_$1_SECRET_ACCESS_KEY=\"\$$2_SECRET_ACCESS_KEY\""
}
remoto PRINCIPAL PRINCIPAL
remoto RESPALDO RESPALDO

FECHA=$(date -u +%Y-%m-%d)
DIAS=${RETENCION_DIAS:-30}
CORTE=$(date -u -d "@$(( $(date -u +%s) - DIAS * 86400 ))" +%Y-%m-%d)
ORIGEN="principal:$PRINCIPAL_BUCKET"
DESTINO="respaldo:$RESPALDO_BUCKET"

echo "== Respaldo $FECHA (se conservan $DIAS días: se borra lo anterior a $CORTE)"

# 1) Base de datos
pg_dump --format=custom --no-owner --no-privileges --dbname="$DATABASE_URL" --file=/tmp/base.dump
rclone copyto /tmp/base.dump "$DESTINO/base/$FECHA.dump"
echo "base de datos: $(du -h /tmp/base.dump | cut -f1) -> base/$FECHA.dump"

# 2) Archivos del CMS
rclone sync "$ORIGEN" "$DESTINO/archivos" --backup-dir "$DESTINO/eliminados/$FECHA" --fast-list --transfers 16 --checkers 16
echo "archivos: $(rclone size "$DESTINO/archivos" --fast-list | tr '\n' ' ')"

# 3) Retención, por la fecha del nombre (los archivos movidos a eliminados/ conservan su fecha
#    original, así que no sirve --min-age). Fechas comparadas como números AAAAMMDD.
LIMITE=$(echo "$CORTE" | tr -d '-')
for f in $(rclone lsf "$DESTINO/base" --files-only 2>/dev/null || true); do
  if [ "$(echo "${f%.dump}" | tr -d '-')" -lt "$LIMITE" ]; then
    rclone deletefile "$DESTINO/base/$f"
    echo "retención: borrado base/$f"
  fi
done
for d in $(rclone lsf "$DESTINO/eliminados" --dirs-only 2>/dev/null || true); do
  if [ "$(echo "${d%/}" | tr -d '-')" -lt "$LIMITE" ]; then
    rclone purge "$DESTINO/eliminados/$d"
    echo "retención: borrado eliminados/$d"
  fi
done

echo "== Respaldo terminado"
