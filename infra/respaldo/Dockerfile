# Respaldo diario del CMS (ver respaldo.sh). pg_dump 18, igual que el servidor.
FROM postgres:18-alpine

RUN apk add --no-cache rclone

COPY respaldo.sh probar-restauracion.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/respaldo.sh /usr/local/bin/probar-restauracion.sh

# Sin el entrypoint de la imagen (iniciaría un servidor PostgreSQL): solo corre el respaldo y termina.
ENTRYPOINT []
CMD ["/usr/local/bin/respaldo.sh"]
