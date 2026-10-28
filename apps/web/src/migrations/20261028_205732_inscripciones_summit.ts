import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "inscripciones_summit" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"apellido" varchar NOT NULL,
  	"empresa" varchar,
  	"email" varchar NOT NULL,
  	"telefono" varchar,
  	"pais" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inscripciones_summit_id" integer;
  CREATE UNIQUE INDEX "inscripciones_summit_email_idx" ON "inscripciones_summit" USING btree ("email");
  CREATE INDEX "inscripciones_summit_updated_at_idx" ON "inscripciones_summit" USING btree ("updated_at");
  CREATE INDEX "inscripciones_summit_created_at_idx" ON "inscripciones_summit" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inscripciones_summit_fk" FOREIGN KEY ("inscripciones_summit_id") REFERENCES "public"."inscripciones_summit"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_inscripciones_summit_id_idx" ON "payload_locked_documents_rels" USING btree ("inscripciones_summit_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inscripciones_summit" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "inscripciones_summit" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inscripciones_summit_fk";
  
  DROP INDEX "payload_locked_documents_rels_inscripciones_summit_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inscripciones_summit_id";`)
}
