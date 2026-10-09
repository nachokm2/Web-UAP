#!/usr/bin/env bash
# Prueba las 380 URLs del sitemap del WordPress anterior (urls-wordpress.txt) contra un sitio:
# primero sin seguir redirecciones y luego siguiéndolas. Sirve antes y después del cambio de
# dominio (docs/cambio-de-dominio.md) para confirmar que ninguna URL antigua se pierde.
#
#   bash scripts/migracion/verificar-urls.sh https://uap.edu.py resultado.tsv
#   bash scripts/migracion/verificar-urls.sh https://web-cms-production-fd17.up.railway.app resultado.tsv
#
# Columnas del TSV: primera respuesta, respuesta final, URL final, ruta.
# Esperado: 200, 301 (a su nuevo destino) o 410 (contenido retirado a propósito). Un 404 es
# una URL antigua sin destino: revisar y agregar la redirección en el panel (Configuración > Redirecciones).
set -euo pipefail
B="${1:?Falta el sitio, p. ej. https://uap.edu.py}"
OUT="${2:?Falta el archivo de salida .tsv}"
LISTA="$(dirname "$0")/urls-wordpress.txt"
export B
xargs -P 10 -I{} sh -c '
  p=$(echo "{}" | sed "s#https://uap.edu.py##")
  primero=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$B$p")
  final=$(curl -s -L -o /dev/null -w "%{http_code}\t%{url_effective}" --max-time 30 "$B$p")
  printf "%s\t%s\t%s\n" "$primero" "$final" "$p"
' < "$LISTA" | sed "s#$B##g" > "$OUT"
echo "Primera respuesta:"; cut -f1 "$OUT" | sort | uniq -c
echo "Resultado final (siguiendo redirecciones):"; cut -f2 "$OUT" | sort | uniq -c
