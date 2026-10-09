import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medios" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "medios" ADD COLUMN "_objectkey" varchar;
  ALTER TABLE "documentos" ADD COLUMN "prefix" varchar DEFAULT '';
  ALTER TABLE "documentos" ADD COLUMN "_objectkey" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "medios" DROP COLUMN "prefix";
  ALTER TABLE "medios" DROP COLUMN "_objectkey";
  ALTER TABLE "documentos" DROP COLUMN "prefix";
  ALTER TABLE "documentos" DROP COLUMN "_objectkey";`)
}
