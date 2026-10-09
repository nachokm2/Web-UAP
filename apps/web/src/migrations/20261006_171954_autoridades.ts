import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_autoridades_grupo" AS ENUM('consejo', 'directivos', 'carreras', 'posgrado');
  CREATE TABLE "autoridades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"cargo" varchar NOT NULL,
  	"grupo" "enum_autoridades_grupo" NOT NULL,
  	"foto_id" integer,
  	"orden" numeric DEFAULT 100,
  	"activo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "autoridades_id" integer;
  ALTER TABLE "autoridades" ADD CONSTRAINT "autoridades_foto_id_medios_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "autoridades_foto_idx" ON "autoridades" USING btree ("foto_id");
  CREATE INDEX "autoridades_updated_at_idx" ON "autoridades" USING btree ("updated_at");
  CREATE INDEX "autoridades_created_at_idx" ON "autoridades" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autoridades_fk" FOREIGN KEY ("autoridades_id") REFERENCES "public"."autoridades"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_autoridades_id_idx" ON "payload_locked_documents_rels" USING btree ("autoridades_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "autoridades" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "autoridades" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_autoridades_fk";
  
  DROP INDEX "payload_locked_documents_rels_autoridades_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "autoridades_id";
  DROP TYPE "public"."enum_autoridades_grupo";`)
}
