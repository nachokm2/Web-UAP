import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_eventos_redes_red" AS ENUM('instagram', 'linkedin', 'x');
  CREATE TYPE "public"."enum_eventos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__eventos_v_version_redes_red" AS ENUM('instagram', 'linkedin', 'x');
  CREATE TYPE "public"."enum__eventos_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "eventos_parrafos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar
  );
  
  CREATE TABLE "eventos_certificacion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar
  );
  
  CREATE TABLE "eventos_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"red" "enum_eventos_redes_red",
  	"url" varchar
  );
  
  CREATE TABLE "eventos_colaboran" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"url" varchar,
  	"logo_id" integer
  );
  
  CREATE TABLE "eventos_programa" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hora" varchar,
  	"titulo" varchar,
  	"rol" varchar,
  	"nota" varchar
  );
  
  CREATE TABLE "eventos_comites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"imagen_id" integer
  );
  
  CREATE TABLE "eventos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"titulo" varchar,
  	"slug" varchar,
  	"fecha" timestamp(3) with time zone,
  	"hora_inicio" varchar DEFAULT '08:00',
  	"hora_fin" varchar DEFAULT '13:30',
  	"lugar" varchar,
  	"ciudad" varchar DEFAULT 'Asunción',
  	"direccion" varchar,
  	"mapa" varchar,
  	"hashtag" varchar,
  	"correo" varchar,
  	"texto_boton" varchar DEFAULT 'Inscríbete para asistir al evento',
  	"banner_id" integer,
  	"titulo_intro" varchar,
  	"imagen_evento_id" integer,
  	"organizador_nombre" varchar,
  	"organizador_logo_id" integer,
  	"descripcion_seo" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_eventos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "eventos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expositores_id" integer
  );
  
  CREATE TABLE "_eventos_v_version_parrafos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_eventos_v_version_certificacion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_eventos_v_version_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"red" "enum__eventos_v_version_redes_red",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_eventos_v_version_colaboran" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"url" varchar,
  	"logo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_eventos_v_version_programa" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hora" varchar,
  	"titulo" varchar,
  	"rol" varchar,
  	"nota" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_eventos_v_version_comites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"imagen_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_eventos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nombre" varchar,
  	"version_titulo" varchar,
  	"version_slug" varchar,
  	"version_fecha" timestamp(3) with time zone,
  	"version_hora_inicio" varchar DEFAULT '08:00',
  	"version_hora_fin" varchar DEFAULT '13:30',
  	"version_lugar" varchar,
  	"version_ciudad" varchar DEFAULT 'Asunción',
  	"version_direccion" varchar,
  	"version_mapa" varchar,
  	"version_hashtag" varchar,
  	"version_correo" varchar,
  	"version_texto_boton" varchar DEFAULT 'Inscríbete para asistir al evento',
  	"version_banner_id" integer,
  	"version_titulo_intro" varchar,
  	"version_imagen_evento_id" integer,
  	"version_organizador_nombre" varchar,
  	"version_organizador_logo_id" integer,
  	"version_descripcion_seo" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__eventos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_eventos_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"expositores_id" integer
  );
  
  CREATE TABLE "expositores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"cargo" varchar NOT NULL,
  	"institucion" varchar NOT NULL,
  	"pais" varchar,
  	"foto_id" integer,
  	"logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "eventos_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "expositores_id" integer;
  ALTER TABLE "eventos_parrafos" ADD CONSTRAINT "eventos_parrafos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos_certificacion" ADD CONSTRAINT "eventos_certificacion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos_redes" ADD CONSTRAINT "eventos_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos_colaboran" ADD CONSTRAINT "eventos_colaboran_logo_id_medios_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eventos_colaboran" ADD CONSTRAINT "eventos_colaboran_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos_programa" ADD CONSTRAINT "eventos_programa_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos_comites" ADD CONSTRAINT "eventos_comites_imagen_id_medios_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eventos_comites" ADD CONSTRAINT "eventos_comites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos" ADD CONSTRAINT "eventos_banner_id_medios_id_fk" FOREIGN KEY ("banner_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eventos" ADD CONSTRAINT "eventos_imagen_evento_id_medios_id_fk" FOREIGN KEY ("imagen_evento_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eventos" ADD CONSTRAINT "eventos_organizador_logo_id_medios_id_fk" FOREIGN KEY ("organizador_logo_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eventos_rels" ADD CONSTRAINT "eventos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos_rels" ADD CONSTRAINT "eventos_rels_expositores_fk" FOREIGN KEY ("expositores_id") REFERENCES "public"."expositores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_parrafos" ADD CONSTRAINT "_eventos_v_version_parrafos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_certificacion" ADD CONSTRAINT "_eventos_v_version_certificacion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_redes" ADD CONSTRAINT "_eventos_v_version_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_colaboran" ADD CONSTRAINT "_eventos_v_version_colaboran_logo_id_medios_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_colaboran" ADD CONSTRAINT "_eventos_v_version_colaboran_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_programa" ADD CONSTRAINT "_eventos_v_version_programa_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_comites" ADD CONSTRAINT "_eventos_v_version_comites_imagen_id_medios_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v_version_comites" ADD CONSTRAINT "_eventos_v_version_comites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_parent_id_eventos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."eventos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_version_banner_id_medios_id_fk" FOREIGN KEY ("version_banner_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_version_imagen_evento_id_medios_id_fk" FOREIGN KEY ("version_imagen_evento_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_version_organizador_logo_id_medios_id_fk" FOREIGN KEY ("version_organizador_logo_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v_rels" ADD CONSTRAINT "_eventos_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_eventos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_eventos_v_rels" ADD CONSTRAINT "_eventos_v_rels_expositores_fk" FOREIGN KEY ("expositores_id") REFERENCES "public"."expositores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expositores" ADD CONSTRAINT "expositores_foto_id_medios_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expositores" ADD CONSTRAINT "expositores_logo_id_medios_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "eventos_parrafos_order_idx" ON "eventos_parrafos" USING btree ("_order");
  CREATE INDEX "eventos_parrafos_parent_id_idx" ON "eventos_parrafos" USING btree ("_parent_id");
  CREATE INDEX "eventos_certificacion_order_idx" ON "eventos_certificacion" USING btree ("_order");
  CREATE INDEX "eventos_certificacion_parent_id_idx" ON "eventos_certificacion" USING btree ("_parent_id");
  CREATE INDEX "eventos_redes_order_idx" ON "eventos_redes" USING btree ("_order");
  CREATE INDEX "eventos_redes_parent_id_idx" ON "eventos_redes" USING btree ("_parent_id");
  CREATE INDEX "eventos_colaboran_order_idx" ON "eventos_colaboran" USING btree ("_order");
  CREATE INDEX "eventos_colaboran_parent_id_idx" ON "eventos_colaboran" USING btree ("_parent_id");
  CREATE INDEX "eventos_colaboran_logo_idx" ON "eventos_colaboran" USING btree ("logo_id");
  CREATE INDEX "eventos_programa_order_idx" ON "eventos_programa" USING btree ("_order");
  CREATE INDEX "eventos_programa_parent_id_idx" ON "eventos_programa" USING btree ("_parent_id");
  CREATE INDEX "eventos_comites_order_idx" ON "eventos_comites" USING btree ("_order");
  CREATE INDEX "eventos_comites_parent_id_idx" ON "eventos_comites" USING btree ("_parent_id");
  CREATE INDEX "eventos_comites_imagen_idx" ON "eventos_comites" USING btree ("imagen_id");
  CREATE UNIQUE INDEX "eventos_slug_idx" ON "eventos" USING btree ("slug");
  CREATE INDEX "eventos_banner_idx" ON "eventos" USING btree ("banner_id");
  CREATE INDEX "eventos_imagen_evento_idx" ON "eventos" USING btree ("imagen_evento_id");
  CREATE INDEX "eventos_organizador_organizador_logo_idx" ON "eventos" USING btree ("organizador_logo_id");
  CREATE INDEX "eventos_updated_at_idx" ON "eventos" USING btree ("updated_at");
  CREATE INDEX "eventos_created_at_idx" ON "eventos" USING btree ("created_at");
  CREATE INDEX "eventos__status_idx" ON "eventos" USING btree ("_status");
  CREATE INDEX "eventos_rels_order_idx" ON "eventos_rels" USING btree ("order");
  CREATE INDEX "eventos_rels_parent_idx" ON "eventos_rels" USING btree ("parent_id");
  CREATE INDEX "eventos_rels_path_idx" ON "eventos_rels" USING btree ("path");
  CREATE INDEX "eventos_rels_expositores_id_idx" ON "eventos_rels" USING btree ("expositores_id");
  CREATE INDEX "_eventos_v_version_parrafos_order_idx" ON "_eventos_v_version_parrafos" USING btree ("_order");
  CREATE INDEX "_eventos_v_version_parrafos_parent_id_idx" ON "_eventos_v_version_parrafos" USING btree ("_parent_id");
  CREATE INDEX "_eventos_v_version_certificacion_order_idx" ON "_eventos_v_version_certificacion" USING btree ("_order");
  CREATE INDEX "_eventos_v_version_certificacion_parent_id_idx" ON "_eventos_v_version_certificacion" USING btree ("_parent_id");
  CREATE INDEX "_eventos_v_version_redes_order_idx" ON "_eventos_v_version_redes" USING btree ("_order");
  CREATE INDEX "_eventos_v_version_redes_parent_id_idx" ON "_eventos_v_version_redes" USING btree ("_parent_id");
  CREATE INDEX "_eventos_v_version_colaboran_order_idx" ON "_eventos_v_version_colaboran" USING btree ("_order");
  CREATE INDEX "_eventos_v_version_colaboran_parent_id_idx" ON "_eventos_v_version_colaboran" USING btree ("_parent_id");
  CREATE INDEX "_eventos_v_version_colaboran_logo_idx" ON "_eventos_v_version_colaboran" USING btree ("logo_id");
  CREATE INDEX "_eventos_v_version_programa_order_idx" ON "_eventos_v_version_programa" USING btree ("_order");
  CREATE INDEX "_eventos_v_version_programa_parent_id_idx" ON "_eventos_v_version_programa" USING btree ("_parent_id");
  CREATE INDEX "_eventos_v_version_comites_order_idx" ON "_eventos_v_version_comites" USING btree ("_order");
  CREATE INDEX "_eventos_v_version_comites_parent_id_idx" ON "_eventos_v_version_comites" USING btree ("_parent_id");
  CREATE INDEX "_eventos_v_version_comites_imagen_idx" ON "_eventos_v_version_comites" USING btree ("imagen_id");
  CREATE INDEX "_eventos_v_parent_idx" ON "_eventos_v" USING btree ("parent_id");
  CREATE INDEX "_eventos_v_version_version_slug_idx" ON "_eventos_v" USING btree ("version_slug");
  CREATE INDEX "_eventos_v_version_version_banner_idx" ON "_eventos_v" USING btree ("version_banner_id");
  CREATE INDEX "_eventos_v_version_version_imagen_evento_idx" ON "_eventos_v" USING btree ("version_imagen_evento_id");
  CREATE INDEX "_eventos_v_version_organizador_version_organizador_logo_idx" ON "_eventos_v" USING btree ("version_organizador_logo_id");
  CREATE INDEX "_eventos_v_version_version_updated_at_idx" ON "_eventos_v" USING btree ("version_updated_at");
  CREATE INDEX "_eventos_v_version_version_created_at_idx" ON "_eventos_v" USING btree ("version_created_at");
  CREATE INDEX "_eventos_v_version_version__status_idx" ON "_eventos_v" USING btree ("version__status");
  CREATE INDEX "_eventos_v_created_at_idx" ON "_eventos_v" USING btree ("created_at");
  CREATE INDEX "_eventos_v_updated_at_idx" ON "_eventos_v" USING btree ("updated_at");
  CREATE INDEX "_eventos_v_latest_idx" ON "_eventos_v" USING btree ("latest");
  CREATE INDEX "_eventos_v_rels_order_idx" ON "_eventos_v_rels" USING btree ("order");
  CREATE INDEX "_eventos_v_rels_parent_idx" ON "_eventos_v_rels" USING btree ("parent_id");
  CREATE INDEX "_eventos_v_rels_path_idx" ON "_eventos_v_rels" USING btree ("path");
  CREATE INDEX "_eventos_v_rels_expositores_id_idx" ON "_eventos_v_rels" USING btree ("expositores_id");
  CREATE INDEX "expositores_foto_idx" ON "expositores" USING btree ("foto_id");
  CREATE INDEX "expositores_logo_idx" ON "expositores" USING btree ("logo_id");
  CREATE INDEX "expositores_updated_at_idx" ON "expositores" USING btree ("updated_at");
  CREATE INDEX "expositores_created_at_idx" ON "expositores" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_eventos_fk" FOREIGN KEY ("eventos_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expositores_fk" FOREIGN KEY ("expositores_id") REFERENCES "public"."expositores"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_eventos_id_idx" ON "payload_locked_documents_rels" USING btree ("eventos_id");
  CREATE INDEX "payload_locked_documents_rels_expositores_id_idx" ON "payload_locked_documents_rels" USING btree ("expositores_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "eventos_parrafos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos_certificacion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos_redes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos_colaboran" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos_programa" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos_comites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "eventos_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_version_parrafos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_version_certificacion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_version_redes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_version_colaboran" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_version_programa" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_version_comites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_eventos_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expositores" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "eventos_parrafos" CASCADE;
  DROP TABLE "eventos_certificacion" CASCADE;
  DROP TABLE "eventos_redes" CASCADE;
  DROP TABLE "eventos_colaboran" CASCADE;
  DROP TABLE "eventos_programa" CASCADE;
  DROP TABLE "eventos_comites" CASCADE;
  DROP TABLE "eventos" CASCADE;
  DROP TABLE "eventos_rels" CASCADE;
  DROP TABLE "_eventos_v_version_parrafos" CASCADE;
  DROP TABLE "_eventos_v_version_certificacion" CASCADE;
  DROP TABLE "_eventos_v_version_redes" CASCADE;
  DROP TABLE "_eventos_v_version_colaboran" CASCADE;
  DROP TABLE "_eventos_v_version_programa" CASCADE;
  DROP TABLE "_eventos_v_version_comites" CASCADE;
  DROP TABLE "_eventos_v" CASCADE;
  DROP TABLE "_eventos_v_rels" CASCADE;
  DROP TABLE "expositores" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_eventos_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_expositores_fk";
  
  DROP INDEX "payload_locked_documents_rels_eventos_id_idx";
  DROP INDEX "payload_locked_documents_rels_expositores_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "eventos_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "expositores_id";
  DROP TYPE "public"."enum_eventos_redes_red";
  DROP TYPE "public"."enum_eventos_status";
  DROP TYPE "public"."enum__eventos_v_version_redes_red";
  DROP TYPE "public"."enum__eventos_v_version_status";`)
}
