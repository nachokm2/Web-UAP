import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medios" ADD COLUMN "origen" varchar;
  ALTER TABLE "documentos" ADD COLUMN "origen" varchar;
  CREATE INDEX "medios_origen_idx" ON "medios" USING btree ("origen");
  CREATE INDEX "documentos_origen_idx" ON "documentos" USING btree ("origen");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "medios_origen_idx";
  DROP INDEX "documentos_origen_idx";
  ALTER TABLE "medios" DROP COLUMN "origen";
  ALTER TABLE "documentos" DROP COLUMN "origen";`)
}
