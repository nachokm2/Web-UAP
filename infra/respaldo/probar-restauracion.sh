#!/bin/sh
# Prueba de restauración (repetirla una vez al mes). No toca la base ni el bucket reales:
#   1. Baja el último volcado del bucket de respaldo y lo restaura en un PostgreSQL 18
#      temporal dentro del contenedor; cuenta el contenido restaurado.
#   2. Compara el bucket de respaldo con el principal (mismos archivos y tamaños).
#
# Uso, desde la raíz del repositorio (las variables las inyecta Railway, sin mostrarlas):
#   docker build -t uap-respaldo infra/respaldo
#   railway run --service respaldo -- sh -c 'docker run --rm \
#     -e PRINCIPAL_ENDPOINT -e PRINCIPAL_BUCKET -e PRINCIPAL_REGION -e PRINCIPAL_ACCESS_KEY_ID -e PRINCIPAL_SECRET_ACCESS_KEY \
#     -e RESPALDO_ENDPOINT -e RESPALDO_BUCKET -e RESPALDO_REGION -e RESPALDO_ACCESS_KEY_ID -e RESPALDO_SECRET_ACCESS_KEY \
#     uap-respaldo /usr/local/bin/probar-restauracion.sh'

set -eu

remoto() {
  eval "export RCLONE_CONFIG_$1_TYPE=s3 RCLONE_CONFIG_$1_PROVIDER=Other RCLONE_CONFIG_$1_FORCE_PATH_STYLE=false"
  eval "export RCLONE_CONFIG_$1_ENDPOINT=\"\$$2_ENDPOINT\" RCLONE_CONFIG_$1_REGION=\"\$$2_REGION\""
  eval "export RCLONE_CONFIG_$1_ACCESS_KEY_ID=\"\$$2_ACCESS_KEY_ID\" RCLONE_CONFIG_$1_SECRET_ACCESS_KEY=\"\$$2_SECRET_ACCESS_KEY\""
}
remoto PRINCIPAL PRINCIPAL
remoto RESPALDO RESPALDO
DESTINO="respaldo:$RESPALDO_BUCKET"

# 1) Base de datos
ULTIMO=$(rclone lsf "$DESTINO/base" --files-only | sort | tail -1)
[ -n "$ULTIMO" ] || { echo "No hay volcados en base/"; exit 1; }
echo "== Restaurando base/$ULTIMO en un PostgreSQL temporal"
rclone copyto "$DESTINO/base/$ULTIMO" /tmp/base.dump
mkdir -p /tmp/pg && chown postgres /tmp/pg
su postgres -c 'initdb -D /tmp/pg -A trust >/dev/null && pg_ctl -D /tmp/pg -o "-k /tmp -c listen_addresses=" -l /tmp/pg.log -w start >/dev/null'
su postgres -c 'createdb -h /tmp prueba && pg_restore -h /tmp -d prueba --no-owner --no-privileges /tmp/base.dump'
su postgres -c "psql -h /tmp -d prueba -At -F ' ' -c \"
  select 'carreras', count(*) from carreras union all
  select 'posgrados', count(*) from posgrados union all
  select 'noticias', count(*) from noticias union all
  select 'autoridades', count(*) from autoridades union all
  select 'formularios', count(*) from formularios union all
  select 'redirecciones', count(*) from redirecciones union all
  select 'medios', count(*) from medios union all
  select 'documentos', count(*) from documentos union all
  select 'usuarios', count(*) from usuarios union all
  select 'auditoria', count(*) from auditoria\"" | sed 's/^/  restaurado: /'
su postgres -c 'pg_ctl -D /tmp/pg -w stop >/dev/null'

# 2) Archivos
echo "== Comparando archivos: principal -> respaldo/archivos"
rclone check "principal:$PRINCIPAL_BUCKET" "$DESTINO/archivos" --one-way --size-only --fast-list 2>&1 | tail -3
echo "== Prueba terminada"
