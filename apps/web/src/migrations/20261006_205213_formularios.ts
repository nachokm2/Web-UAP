import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "formularios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"asesor" varchar,
  	"slug" varchar NOT NULL,
  	"codigo_bitrix" varchar NOT NULL,
  	"bitrix_formulario" varchar,
  	"bitrix_loader_url" varchar,
  	"activo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "formularios_id" integer;
  CREATE UNIQUE INDEX "formularios_slug_idx" ON "formularios" USING btree ("slug");
  CREATE INDEX "formularios_updated_at_idx" ON "formularios" USING btree ("updated_at");
  CREATE INDEX "formularios_created_at_idx" ON "formularios" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_formularios_fk" FOREIGN KEY ("formularios_id") REFERENCES "public"."formularios"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_formularios_id_idx" ON "payload_locked_documents_rels" USING btree ("formularios_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "formularios" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "formularios" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_formularios_fk";
  
  DROP INDEX "payload_locked_documents_rels_formularios_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "formularios_id";`)
}
