import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_carreras_modalidad" AS ENUM('presencial', 'virtual', 'hibrida', 'presencial_y_distancia');
  CREATE TYPE "public"."enum_carreras_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'no_publicado', 'archivado');
  CREATE TYPE "public"."enum_carreras_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__carreras_v_version_modalidad" AS ENUM('presencial', 'virtual', 'hibrida', 'presencial_y_distancia');
  CREATE TYPE "public"."enum__carreras_v_version_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'no_publicado', 'archivado');
  CREATE TYPE "public"."enum__carreras_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posgrados_tipo" AS ENUM('diplomado', 'especializacion', 'maestria', 'doctorado', 'maestria_doctorado', 'otro');
  CREATE TYPE "public"."enum_posgrados_modalidad" AS ENUM('presencial', 'virtual', 'hibrida', 'presencial_y_distancia');
  CREATE TYPE "public"."enum_posgrados_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'no_publicado', 'archivado');
  CREATE TYPE "public"."enum_posgrados_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posgrados_v_version_tipo" AS ENUM('diplomado', 'especializacion', 'maestria', 'doctorado', 'maestria_doctorado', 'otro');
  CREATE TYPE "public"."enum__posgrados_v_version_modalidad" AS ENUM('presencial', 'virtual', 'hibrida', 'presencial_y_distancia');
  CREATE TYPE "public"."enum__posgrados_v_version_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'no_publicado', 'archivado');
  CREATE TYPE "public"."enum__posgrados_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_noticias_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'no_publicado', 'archivado');
  CREATE TYPE "public"."enum_noticias_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__noticias_v_version_estado" AS ENUM('borrador', 'en_revision', 'publicado', 'no_publicado', 'archivado');
  CREATE TYPE "public"."enum__noticias_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_documentos_tipo" AS ENUM('brochure', 'malla', 'reglamento', 'otro');
  CREATE TYPE "public"."enum_redirecciones_tipo" AS ENUM('301', '302', '410');
  CREATE TYPE "public"."enum_redirecciones_destino_tipo" AS ENUM('interno', 'url');
  CREATE TYPE "public"."enum_redirecciones_origen" AS ENUM('manual', 'automatica', 'migracion');
  CREATE TYPE "public"."enum_usuarios_roles" AS ENUM('superadmin', 'admin', 'editor_carreras', 'editor_posgrados', 'editor_noticias', 'lectura');
  CREATE TYPE "public"."enum_auditoria_accion" AS ENUM('creacion', 'actualizacion', 'cambio_estado', 'eliminacion', 'inicio_sesion', 'transicion_rechazada');
  CREATE TABLE "carreras_secciones_adicionales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"contenido" jsonb
  );
  
  CREATE TABLE "carreras_malla_asignaturas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar
  );
  
  CREATE TABLE "carreras_malla" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar
  );
  
  CREATE TABLE "carreras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"nombre_corto" varchar,
  	"facultad_id" integer,
  	"grado_academico" varchar,
  	"titulo_otorgado" varchar,
  	"duracion" varchar,
  	"modalidad" "enum_carreras_modalidad",
  	"jornada" varchar,
  	"descripcion_corta" varchar,
  	"descripcion" jsonb,
  	"objetivo" jsonb,
  	"perfil_ingreso" jsonb,
  	"perfil_egreso" jsonb,
  	"campo_laboral" jsonb,
  	"requisitos" jsonb,
  	"malla_pdf_id" integer,
  	"imagen_principal_id" integer,
  	"brochure_id" integer,
  	"contacto_email" varchar,
  	"contacto_telefono" varchar,
  	"contacto_whatsapp" varchar,
  	"cta_texto" varchar,
  	"cta_url" varchar,
  	"formulario_bitrix" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"estado" "enum_carreras_estado" DEFAULT 'borrador',
  	"orden" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_carreras_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "carreras_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sedes_id" integer,
  	"medios_id" integer,
  	"documentos_id" integer
  );
  
  CREATE TABLE "_carreras_v_version_secciones_adicionales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"contenido" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_carreras_v_version_malla_asignaturas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_carreras_v_version_malla" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_carreras_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nombre" varchar,
  	"version_nombre_corto" varchar,
  	"version_facultad_id" integer,
  	"version_grado_academico" varchar,
  	"version_titulo_otorgado" varchar,
  	"version_duracion" varchar,
  	"version_modalidad" "enum__carreras_v_version_modalidad",
  	"version_jornada" varchar,
  	"version_descripcion_corta" varchar,
  	"version_descripcion" jsonb,
  	"version_objetivo" jsonb,
  	"version_perfil_ingreso" jsonb,
  	"version_perfil_egreso" jsonb,
  	"version_campo_laboral" jsonb,
  	"version_requisitos" jsonb,
  	"version_malla_pdf_id" integer,
  	"version_imagen_principal_id" integer,
  	"version_brochure_id" integer,
  	"version_contacto_email" varchar,
  	"version_contacto_telefono" varchar,
  	"version_contacto_whatsapp" varchar,
  	"version_cta_texto" varchar,
  	"version_cta_url" varchar,
  	"version_formulario_bitrix" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_estado" "enum__carreras_v_version_estado" DEFAULT 'borrador',
  	"version_orden" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__carreras_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_carreras_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sedes_id" integer,
  	"medios_id" integer,
  	"documentos_id" integer
  );
  
  CREATE TABLE "posgrados_secciones_adicionales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"contenido" jsonb
  );
  
  CREATE TABLE "posgrados_malla_asignaturas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar
  );
  
  CREATE TABLE "posgrados_malla" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"nombre" varchar
  );
  
  CREATE TABLE "posgrados" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"nombre_corto" varchar,
  	"tipo" "enum_posgrados_tipo",
  	"area_id" integer,
  	"titulo_otorgado" varchar,
  	"duracion" varchar,
  	"modalidad" "enum_posgrados_modalidad",
  	"jornada" varchar,
  	"descripcion_corta" varchar,
  	"descripcion" jsonb,
  	"objetivo" jsonb,
  	"objetivos_especificos" jsonb,
  	"dirigido_a" jsonb,
  	"certificacion" jsonb,
  	"perfil_ingreso" jsonb,
  	"perfil_egreso" jsonb,
  	"campo_laboral" jsonb,
  	"requisitos" jsonb,
  	"malla_pdf_id" integer,
  	"imagen_principal_id" integer,
  	"brochure_id" integer,
  	"contacto_email" varchar,
  	"contacto_telefono" varchar,
  	"contacto_whatsapp" varchar,
  	"cta_texto" varchar,
  	"cta_url" varchar,
  	"formulario_bitrix" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"estado" "enum_posgrados_estado" DEFAULT 'borrador',
  	"orden" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posgrados_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posgrados_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sedes_id" integer,
  	"medios_id" integer,
  	"documentos_id" integer
  );
  
  CREATE TABLE "_posgrados_v_version_secciones_adicionales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"contenido" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posgrados_v_version_malla_asignaturas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posgrados_v_version_malla" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posgrados_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nombre" varchar,
  	"version_nombre_corto" varchar,
  	"version_tipo" "enum__posgrados_v_version_tipo",
  	"version_area_id" integer,
  	"version_titulo_otorgado" varchar,
  	"version_duracion" varchar,
  	"version_modalidad" "enum__posgrados_v_version_modalidad",
  	"version_jornada" varchar,
  	"version_descripcion_corta" varchar,
  	"version_descripcion" jsonb,
  	"version_objetivo" jsonb,
  	"version_objetivos_especificos" jsonb,
  	"version_dirigido_a" jsonb,
  	"version_certificacion" jsonb,
  	"version_perfil_ingreso" jsonb,
  	"version_perfil_egreso" jsonb,
  	"version_campo_laboral" jsonb,
  	"version_requisitos" jsonb,
  	"version_malla_pdf_id" integer,
  	"version_imagen_principal_id" integer,
  	"version_brochure_id" integer,
  	"version_contacto_email" varchar,
  	"version_contacto_telefono" varchar,
  	"version_contacto_whatsapp" varchar,
  	"version_cta_texto" varchar,
  	"version_cta_url" varchar,
  	"version_formulario_bitrix" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_estado" "enum__posgrados_v_version_estado" DEFAULT 'borrador',
  	"version_orden" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posgrados_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posgrados_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sedes_id" integer,
  	"medios_id" integer,
  	"documentos_id" integer
  );
  
  CREATE TABLE "noticias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"bajada" varchar,
  	"imagen_destacada_id" integer,
  	"contenido" jsonb,
  	"autor" varchar,
  	"categoria_id" integer,
  	"url_original" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"fecha_publicacion" timestamp(3) with time zone,
  	"estado" "enum_noticias_estado" DEFAULT 'borrador',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_noticias_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "noticias_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "noticias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medios_id" integer
  );
  
  CREATE TABLE "_noticias_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_bajada" varchar,
  	"version_imagen_destacada_id" integer,
  	"version_contenido" jsonb,
  	"version_autor" varchar,
  	"version_categoria_id" integer,
  	"version_url_original" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_fecha_publicacion" timestamp(3) with time zone,
  	"version_estado" "enum__noticias_v_version_estado" DEFAULT 'borrador',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__noticias_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_noticias_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_noticias_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"medios_id" integer
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "medios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credito" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_miniatura_url" varchar,
  	"sizes_miniatura_width" numeric,
  	"sizes_miniatura_height" numeric,
  	"sizes_miniatura_mime_type" varchar,
  	"sizes_miniatura_filesize" numeric,
  	"sizes_miniatura_filename" varchar,
  	"sizes_tarjeta_url" varchar,
  	"sizes_tarjeta_width" numeric,
  	"sizes_tarjeta_height" numeric,
  	"sizes_tarjeta_mime_type" varchar,
  	"sizes_tarjeta_filesize" numeric,
  	"sizes_tarjeta_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "documentos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar NOT NULL,
  	"tipo" "enum_documentos_tipo" DEFAULT 'otro' NOT NULL,
  	"descripcion" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "facultades" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"orden" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sedes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"direccion" varchar,
  	"ciudad" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirecciones" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"desde" varchar NOT NULL,
  	"tipo" "enum_redirecciones_tipo" DEFAULT '301' NOT NULL,
  	"destino_tipo" "enum_redirecciones_destino_tipo" DEFAULT 'interno',
  	"url" varchar,
  	"origen" "enum_redirecciones_origen" DEFAULT 'manual',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirecciones_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"carreras_id" integer,
  	"posgrados_id" integer,
  	"noticias_id" integer
  );
  
  CREATE TABLE "usuarios_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_usuarios_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "usuarios_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"activo" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "auditoria" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"usuario_id" integer,
  	"usuario_nombre" varchar,
  	"usuario_email" varchar,
  	"accion" "enum_auditoria_accion" NOT NULL,
  	"coleccion" varchar NOT NULL,
  	"documento_id" varchar NOT NULL,
  	"documento_titulo" varchar,
  	"campo" varchar,
  	"valor_anterior" varchar,
  	"valor_nuevo" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"carreras_id" integer,
  	"posgrados_id" integer,
  	"noticias_id" integer,
  	"categorias_id" integer,
  	"medios_id" integer,
  	"documentos_id" integer,
  	"facultades_id" integer,
  	"sedes_id" integer,
  	"redirecciones_id" integer,
  	"usuarios_id" integer,
  	"auditoria_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "configuracion" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"telefono" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"direccion" varchar,
  	"mapa_url" varchar,
  	"horario" varchar,
  	"redes_facebook" varchar,
  	"redes_instagram" varchar,
  	"redes_youtube" varchar,
  	"redes_linkedin" varchar,
  	"campus_virtual_url" varchar,
  	"leyenda_institucional" varchar,
  	"seo_titulo" varchar DEFAULT 'Universidad Autónoma del Paraguay',
  	"seo_descripcion" varchar,
  	"seo_imagen_id" integer,
  	"bitrix_formulario" varchar,
  	"bitrix_loader_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "carreras_secciones_adicionales" ADD CONSTRAINT "carreras_secciones_adicionales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carreras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carreras_malla_asignaturas" ADD CONSTRAINT "carreras_malla_asignaturas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carreras_malla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carreras_malla" ADD CONSTRAINT "carreras_malla_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carreras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carreras" ADD CONSTRAINT "carreras_facultad_id_facultades_id_fk" FOREIGN KEY ("facultad_id") REFERENCES "public"."facultades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carreras" ADD CONSTRAINT "carreras_malla_pdf_id_documentos_id_fk" FOREIGN KEY ("malla_pdf_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carreras" ADD CONSTRAINT "carreras_imagen_principal_id_medios_id_fk" FOREIGN KEY ("imagen_principal_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carreras" ADD CONSTRAINT "carreras_brochure_id_documentos_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carreras" ADD CONSTRAINT "carreras_meta_image_id_medios_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carreras_rels" ADD CONSTRAINT "carreras_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."carreras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carreras_rels" ADD CONSTRAINT "carreras_rels_sedes_fk" FOREIGN KEY ("sedes_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carreras_rels" ADD CONSTRAINT "carreras_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carreras_rels" ADD CONSTRAINT "carreras_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v_version_secciones_adicionales" ADD CONSTRAINT "_carreras_v_version_secciones_adicionales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_carreras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v_version_malla_asignaturas" ADD CONSTRAINT "_carreras_v_version_malla_asignaturas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_carreras_v_version_malla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v_version_malla" ADD CONSTRAINT "_carreras_v_version_malla_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_carreras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v" ADD CONSTRAINT "_carreras_v_parent_id_carreras_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."carreras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carreras_v" ADD CONSTRAINT "_carreras_v_version_facultad_id_facultades_id_fk" FOREIGN KEY ("version_facultad_id") REFERENCES "public"."facultades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carreras_v" ADD CONSTRAINT "_carreras_v_version_malla_pdf_id_documentos_id_fk" FOREIGN KEY ("version_malla_pdf_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carreras_v" ADD CONSTRAINT "_carreras_v_version_imagen_principal_id_medios_id_fk" FOREIGN KEY ("version_imagen_principal_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carreras_v" ADD CONSTRAINT "_carreras_v_version_brochure_id_documentos_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carreras_v" ADD CONSTRAINT "_carreras_v_version_meta_image_id_medios_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_carreras_v_rels" ADD CONSTRAINT "_carreras_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_carreras_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v_rels" ADD CONSTRAINT "_carreras_v_rels_sedes_fk" FOREIGN KEY ("sedes_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v_rels" ADD CONSTRAINT "_carreras_v_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_carreras_v_rels" ADD CONSTRAINT "_carreras_v_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados_secciones_adicionales" ADD CONSTRAINT "posgrados_secciones_adicionales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posgrados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados_malla_asignaturas" ADD CONSTRAINT "posgrados_malla_asignaturas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posgrados_malla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados_malla" ADD CONSTRAINT "posgrados_malla_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posgrados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_area_id_facultades_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."facultades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_malla_pdf_id_documentos_id_fk" FOREIGN KEY ("malla_pdf_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_imagen_principal_id_medios_id_fk" FOREIGN KEY ("imagen_principal_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_brochure_id_documentos_id_fk" FOREIGN KEY ("brochure_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posgrados" ADD CONSTRAINT "posgrados_meta_image_id_medios_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posgrados_rels" ADD CONSTRAINT "posgrados_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posgrados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados_rels" ADD CONSTRAINT "posgrados_rels_sedes_fk" FOREIGN KEY ("sedes_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados_rels" ADD CONSTRAINT "posgrados_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posgrados_rels" ADD CONSTRAINT "posgrados_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v_version_secciones_adicionales" ADD CONSTRAINT "_posgrados_v_version_secciones_adicionales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posgrados_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v_version_malla_asignaturas" ADD CONSTRAINT "_posgrados_v_version_malla_asignaturas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posgrados_v_version_malla"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v_version_malla" ADD CONSTRAINT "_posgrados_v_version_malla_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posgrados_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v" ADD CONSTRAINT "_posgrados_v_parent_id_posgrados_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posgrados"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posgrados_v" ADD CONSTRAINT "_posgrados_v_version_area_id_facultades_id_fk" FOREIGN KEY ("version_area_id") REFERENCES "public"."facultades"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posgrados_v" ADD CONSTRAINT "_posgrados_v_version_malla_pdf_id_documentos_id_fk" FOREIGN KEY ("version_malla_pdf_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posgrados_v" ADD CONSTRAINT "_posgrados_v_version_imagen_principal_id_medios_id_fk" FOREIGN KEY ("version_imagen_principal_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posgrados_v" ADD CONSTRAINT "_posgrados_v_version_brochure_id_documentos_id_fk" FOREIGN KEY ("version_brochure_id") REFERENCES "public"."documentos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posgrados_v" ADD CONSTRAINT "_posgrados_v_version_meta_image_id_medios_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posgrados_v_rels" ADD CONSTRAINT "_posgrados_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posgrados_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v_rels" ADD CONSTRAINT "_posgrados_v_rels_sedes_fk" FOREIGN KEY ("sedes_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v_rels" ADD CONSTRAINT "_posgrados_v_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posgrados_v_rels" ADD CONSTRAINT "_posgrados_v_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias" ADD CONSTRAINT "noticias_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "noticias" ADD CONSTRAINT "noticias_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "noticias" ADD CONSTRAINT "noticias_meta_image_id_medios_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "noticias_texts" ADD CONSTRAINT "noticias_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "noticias_rels" ADD CONSTRAINT "noticias_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_parent_id_noticias_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."noticias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_version_imagen_destacada_id_medios_id_fk" FOREIGN KEY ("version_imagen_destacada_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_version_categoria_id_categorias_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v" ADD CONSTRAINT "_noticias_v_version_meta_image_id_medios_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_noticias_v_texts" ADD CONSTRAINT "_noticias_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_noticias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_noticias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_noticias_v_rels" ADD CONSTRAINT "_noticias_v_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirecciones_rels" ADD CONSTRAINT "redirecciones_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirecciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirecciones_rels" ADD CONSTRAINT "redirecciones_rels_carreras_fk" FOREIGN KEY ("carreras_id") REFERENCES "public"."carreras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirecciones_rels" ADD CONSTRAINT "redirecciones_rels_posgrados_fk" FOREIGN KEY ("posgrados_id") REFERENCES "public"."posgrados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirecciones_rels" ADD CONSTRAINT "redirecciones_rels_noticias_fk" FOREIGN KEY ("noticias_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carreras_fk" FOREIGN KEY ("carreras_id") REFERENCES "public"."carreras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posgrados_fk" FOREIGN KEY ("posgrados_id") REFERENCES "public"."posgrados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_noticias_fk" FOREIGN KEY ("noticias_id") REFERENCES "public"."noticias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_medios_fk" FOREIGN KEY ("medios_id") REFERENCES "public"."medios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documentos_fk" FOREIGN KEY ("documentos_id") REFERENCES "public"."documentos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_facultades_fk" FOREIGN KEY ("facultades_id") REFERENCES "public"."facultades"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sedes_fk" FOREIGN KEY ("sedes_id") REFERENCES "public"."sedes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirecciones_fk" FOREIGN KEY ("redirecciones_id") REFERENCES "public"."redirecciones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_auditoria_fk" FOREIGN KEY ("auditoria_id") REFERENCES "public"."auditoria"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracion" ADD CONSTRAINT "configuracion_seo_imagen_id_medios_id_fk" FOREIGN KEY ("seo_imagen_id") REFERENCES "public"."medios"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "carreras_secciones_adicionales_order_idx" ON "carreras_secciones_adicionales" USING btree ("_order");
  CREATE INDEX "carreras_secciones_adicionales_parent_id_idx" ON "carreras_secciones_adicionales" USING btree ("_parent_id");
  CREATE INDEX "carreras_malla_asignaturas_order_idx" ON "carreras_malla_asignaturas" USING btree ("_order");
  CREATE INDEX "carreras_malla_asignaturas_parent_id_idx" ON "carreras_malla_asignaturas" USING btree ("_parent_id");
  CREATE INDEX "carreras_malla_order_idx" ON "carreras_malla" USING btree ("_order");
  CREATE INDEX "carreras_malla_parent_id_idx" ON "carreras_malla" USING btree ("_parent_id");
  CREATE INDEX "carreras_facultad_idx" ON "carreras" USING btree ("facultad_id");
  CREATE INDEX "carreras_malla_pdf_idx" ON "carreras" USING btree ("malla_pdf_id");
  CREATE INDEX "carreras_imagen_principal_idx" ON "carreras" USING btree ("imagen_principal_id");
  CREATE INDEX "carreras_brochure_idx" ON "carreras" USING btree ("brochure_id");
  CREATE INDEX "carreras_meta_meta_image_idx" ON "carreras" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "carreras_slug_idx" ON "carreras" USING btree ("slug");
  CREATE INDEX "carreras_estado_idx" ON "carreras" USING btree ("estado");
  CREATE INDEX "carreras_updated_at_idx" ON "carreras" USING btree ("updated_at");
  CREATE INDEX "carreras_created_at_idx" ON "carreras" USING btree ("created_at");
  CREATE INDEX "carreras__status_idx" ON "carreras" USING btree ("_status");
  CREATE INDEX "carreras_rels_order_idx" ON "carreras_rels" USING btree ("order");
  CREATE INDEX "carreras_rels_parent_idx" ON "carreras_rels" USING btree ("parent_id");
  CREATE INDEX "carreras_rels_path_idx" ON "carreras_rels" USING btree ("path");
  CREATE INDEX "carreras_rels_sedes_id_idx" ON "carreras_rels" USING btree ("sedes_id");
  CREATE INDEX "carreras_rels_medios_id_idx" ON "carreras_rels" USING btree ("medios_id");
  CREATE INDEX "carreras_rels_documentos_id_idx" ON "carreras_rels" USING btree ("documentos_id");
  CREATE INDEX "_carreras_v_version_secciones_adicionales_order_idx" ON "_carreras_v_version_secciones_adicionales" USING btree ("_order");
  CREATE INDEX "_carreras_v_version_secciones_adicionales_parent_id_idx" ON "_carreras_v_version_secciones_adicionales" USING btree ("_parent_id");
  CREATE INDEX "_carreras_v_version_malla_asignaturas_order_idx" ON "_carreras_v_version_malla_asignaturas" USING btree ("_order");
  CREATE INDEX "_carreras_v_version_malla_asignaturas_parent_id_idx" ON "_carreras_v_version_malla_asignaturas" USING btree ("_parent_id");
  CREATE INDEX "_carreras_v_version_malla_order_idx" ON "_carreras_v_version_malla" USING btree ("_order");
  CREATE INDEX "_carreras_v_version_malla_parent_id_idx" ON "_carreras_v_version_malla" USING btree ("_parent_id");
  CREATE INDEX "_carreras_v_parent_idx" ON "_carreras_v" USING btree ("parent_id");
  CREATE INDEX "_carreras_v_version_version_facultad_idx" ON "_carreras_v" USING btree ("version_facultad_id");
  CREATE INDEX "_carreras_v_version_version_malla_pdf_idx" ON "_carreras_v" USING btree ("version_malla_pdf_id");
  CREATE INDEX "_carreras_v_version_version_imagen_principal_idx" ON "_carreras_v" USING btree ("version_imagen_principal_id");
  CREATE INDEX "_carreras_v_version_version_brochure_idx" ON "_carreras_v" USING btree ("version_brochure_id");
  CREATE INDEX "_carreras_v_version_meta_version_meta_image_idx" ON "_carreras_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_carreras_v_version_version_slug_idx" ON "_carreras_v" USING btree ("version_slug");
  CREATE INDEX "_carreras_v_version_version_estado_idx" ON "_carreras_v" USING btree ("version_estado");
  CREATE INDEX "_carreras_v_version_version_updated_at_idx" ON "_carreras_v" USING btree ("version_updated_at");
  CREATE INDEX "_carreras_v_version_version_created_at_idx" ON "_carreras_v" USING btree ("version_created_at");
  CREATE INDEX "_carreras_v_version_version__status_idx" ON "_carreras_v" USING btree ("version__status");
  CREATE INDEX "_carreras_v_created_at_idx" ON "_carreras_v" USING btree ("created_at");
  CREATE INDEX "_carreras_v_updated_at_idx" ON "_carreras_v" USING btree ("updated_at");
  CREATE INDEX "_carreras_v_latest_idx" ON "_carreras_v" USING btree ("latest");
  CREATE INDEX "_carreras_v_rels_order_idx" ON "_carreras_v_rels" USING btree ("order");
  CREATE INDEX "_carreras_v_rels_parent_idx" ON "_carreras_v_rels" USING btree ("parent_id");
  CREATE INDEX "_carreras_v_rels_path_idx" ON "_carreras_v_rels" USING btree ("path");
  CREATE INDEX "_carreras_v_rels_sedes_id_idx" ON "_carreras_v_rels" USING btree ("sedes_id");
  CREATE INDEX "_carreras_v_rels_medios_id_idx" ON "_carreras_v_rels" USING btree ("medios_id");
  CREATE INDEX "_carreras_v_rels_documentos_id_idx" ON "_carreras_v_rels" USING btree ("documentos_id");
  CREATE INDEX "posgrados_secciones_adicionales_order_idx" ON "posgrados_secciones_adicionales" USING btree ("_order");
  CREATE INDEX "posgrados_secciones_adicionales_parent_id_idx" ON "posgrados_secciones_adicionales" USING btree ("_parent_id");
  CREATE INDEX "posgrados_malla_asignaturas_order_idx" ON "posgrados_malla_asignaturas" USING btree ("_order");
  CREATE INDEX "posgrados_malla_asignaturas_parent_id_idx" ON "posgrados_malla_asignaturas" USING btree ("_parent_id");
  CREATE INDEX "posgrados_malla_order_idx" ON "posgrados_malla" USING btree ("_order");
  CREATE INDEX "posgrados_malla_parent_id_idx" ON "posgrados_malla" USING btree ("_parent_id");
  CREATE INDEX "posgrados_tipo_idx" ON "posgrados" USING btree ("tipo");
  CREATE INDEX "posgrados_area_idx" ON "posgrados" USING btree ("area_id");
  CREATE INDEX "posgrados_malla_pdf_idx" ON "posgrados" USING btree ("malla_pdf_id");
  CREATE INDEX "posgrados_imagen_principal_idx" ON "posgrados" USING btree ("imagen_principal_id");
  CREATE INDEX "posgrados_brochure_idx" ON "posgrados" USING btree ("brochure_id");
  CREATE INDEX "posgrados_meta_meta_image_idx" ON "posgrados" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posgrados_slug_idx" ON "posgrados" USING btree ("slug");
  CREATE INDEX "posgrados_estado_idx" ON "posgrados" USING btree ("estado");
  CREATE INDEX "posgrados_updated_at_idx" ON "posgrados" USING btree ("updated_at");
  CREATE INDEX "posgrados_created_at_idx" ON "posgrados" USING btree ("created_at");
  CREATE INDEX "posgrados__status_idx" ON "posgrados" USING btree ("_status");
  CREATE INDEX "posgrados_rels_order_idx" ON "posgrados_rels" USING btree ("order");
  CREATE INDEX "posgrados_rels_parent_idx" ON "posgrados_rels" USING btree ("parent_id");
  CREATE INDEX "posgrados_rels_path_idx" ON "posgrados_rels" USING btree ("path");
  CREATE INDEX "posgrados_rels_sedes_id_idx" ON "posgrados_rels" USING btree ("sedes_id");
  CREATE INDEX "posgrados_rels_medios_id_idx" ON "posgrados_rels" USING btree ("medios_id");
  CREATE INDEX "posgrados_rels_documentos_id_idx" ON "posgrados_rels" USING btree ("documentos_id");
  CREATE INDEX "_posgrados_v_version_secciones_adicionales_order_idx" ON "_posgrados_v_version_secciones_adicionales" USING btree ("_order");
  CREATE INDEX "_posgrados_v_version_secciones_adicionales_parent_id_idx" ON "_posgrados_v_version_secciones_adicionales" USING btree ("_parent_id");
  CREATE INDEX "_posgrados_v_version_malla_asignaturas_order_idx" ON "_posgrados_v_version_malla_asignaturas" USING btree ("_order");
  CREATE INDEX "_posgrados_v_version_malla_asignaturas_parent_id_idx" ON "_posgrados_v_version_malla_asignaturas" USING btree ("_parent_id");
  CREATE INDEX "_posgrados_v_version_malla_order_idx" ON "_posgrados_v_version_malla" USING btree ("_order");
  CREATE INDEX "_posgrados_v_version_malla_parent_id_idx" ON "_posgrados_v_version_malla" USING btree ("_parent_id");
  CREATE INDEX "_posgrados_v_parent_idx" ON "_posgrados_v" USING btree ("parent_id");
  CREATE INDEX "_posgrados_v_version_version_tipo_idx" ON "_posgrados_v" USING btree ("version_tipo");
  CREATE INDEX "_posgrados_v_version_version_area_idx" ON "_posgrados_v" USING btree ("version_area_id");
  CREATE INDEX "_posgrados_v_version_version_malla_pdf_idx" ON "_posgrados_v" USING btree ("version_malla_pdf_id");
  CREATE INDEX "_posgrados_v_version_version_imagen_principal_idx" ON "_posgrados_v" USING btree ("version_imagen_principal_id");
  CREATE INDEX "_posgrados_v_version_version_brochure_idx" ON "_posgrados_v" USING btree ("version_brochure_id");
  CREATE INDEX "_posgrados_v_version_meta_version_meta_image_idx" ON "_posgrados_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posgrados_v_version_version_slug_idx" ON "_posgrados_v" USING btree ("version_slug");
  CREATE INDEX "_posgrados_v_version_version_estado_idx" ON "_posgrados_v" USING btree ("version_estado");
  CREATE INDEX "_posgrados_v_version_version_updated_at_idx" ON "_posgrados_v" USING btree ("version_updated_at");
  CREATE INDEX "_posgrados_v_version_version_created_at_idx" ON "_posgrados_v" USING btree ("version_created_at");
  CREATE INDEX "_posgrados_v_version_version__status_idx" ON "_posgrados_v" USING btree ("version__status");
  CREATE INDEX "_posgrados_v_created_at_idx" ON "_posgrados_v" USING btree ("created_at");
  CREATE INDEX "_posgrados_v_updated_at_idx" ON "_posgrados_v" USING btree ("updated_at");
  CREATE INDEX "_posgrados_v_latest_idx" ON "_posgrados_v" USING btree ("latest");
  CREATE INDEX "_posgrados_v_rels_order_idx" ON "_posgrados_v_rels" USING btree ("order");
  CREATE INDEX "_posgrados_v_rels_parent_idx" ON "_posgrados_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posgrados_v_rels_path_idx" ON "_posgrados_v_rels" USING btree ("path");
  CREATE INDEX "_posgrados_v_rels_sedes_id_idx" ON "_posgrados_v_rels" USING btree ("sedes_id");
  CREATE INDEX "_posgrados_v_rels_medios_id_idx" ON "_posgrados_v_rels" USING btree ("medios_id");
  CREATE INDEX "_posgrados_v_rels_documentos_id_idx" ON "_posgrados_v_rels" USING btree ("documentos_id");
  CREATE INDEX "noticias_imagen_destacada_idx" ON "noticias" USING btree ("imagen_destacada_id");
  CREATE INDEX "noticias_categoria_idx" ON "noticias" USING btree ("categoria_id");
  CREATE INDEX "noticias_meta_meta_image_idx" ON "noticias" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "noticias_slug_idx" ON "noticias" USING btree ("slug");
  CREATE INDEX "noticias_fecha_publicacion_idx" ON "noticias" USING btree ("fecha_publicacion");
  CREATE INDEX "noticias_estado_idx" ON "noticias" USING btree ("estado");
  CREATE INDEX "noticias_updated_at_idx" ON "noticias" USING btree ("updated_at");
  CREATE INDEX "noticias_created_at_idx" ON "noticias" USING btree ("created_at");
  CREATE INDEX "noticias__status_idx" ON "noticias" USING btree ("_status");
  CREATE INDEX "noticias_texts_order_parent" ON "noticias_texts" USING btree ("order","parent_id");
  CREATE INDEX "noticias_rels_order_idx" ON "noticias_rels" USING btree ("order");
  CREATE INDEX "noticias_rels_parent_idx" ON "noticias_rels" USING btree ("parent_id");
  CREATE INDEX "noticias_rels_path_idx" ON "noticias_rels" USING btree ("path");
  CREATE INDEX "noticias_rels_medios_id_idx" ON "noticias_rels" USING btree ("medios_id");
  CREATE INDEX "_noticias_v_parent_idx" ON "_noticias_v" USING btree ("parent_id");
  CREATE INDEX "_noticias_v_version_version_imagen_destacada_idx" ON "_noticias_v" USING btree ("version_imagen_destacada_id");
  CREATE INDEX "_noticias_v_version_version_categoria_idx" ON "_noticias_v" USING btree ("version_categoria_id");
  CREATE INDEX "_noticias_v_version_meta_version_meta_image_idx" ON "_noticias_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_noticias_v_version_version_slug_idx" ON "_noticias_v" USING btree ("version_slug");
  CREATE INDEX "_noticias_v_version_version_fecha_publicacion_idx" ON "_noticias_v" USING btree ("version_fecha_publicacion");
  CREATE INDEX "_noticias_v_version_version_estado_idx" ON "_noticias_v" USING btree ("version_estado");
  CREATE INDEX "_noticias_v_version_version_updated_at_idx" ON "_noticias_v" USING btree ("version_updated_at");
  CREATE INDEX "_noticias_v_version_version_created_at_idx" ON "_noticias_v" USING btree ("version_created_at");
  CREATE INDEX "_noticias_v_version_version__status_idx" ON "_noticias_v" USING btree ("version__status");
  CREATE INDEX "_noticias_v_created_at_idx" ON "_noticias_v" USING btree ("created_at");
  CREATE INDEX "_noticias_v_updated_at_idx" ON "_noticias_v" USING btree ("updated_at");
  CREATE INDEX "_noticias_v_latest_idx" ON "_noticias_v" USING btree ("latest");
  CREATE INDEX "_noticias_v_texts_order_parent" ON "_noticias_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_noticias_v_rels_order_idx" ON "_noticias_v_rels" USING btree ("order");
  CREATE INDEX "_noticias_v_rels_parent_idx" ON "_noticias_v_rels" USING btree ("parent_id");
  CREATE INDEX "_noticias_v_rels_path_idx" ON "_noticias_v_rels" USING btree ("path");
  CREATE INDEX "_noticias_v_rels_medios_id_idx" ON "_noticias_v_rels" USING btree ("medios_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE INDEX "medios_updated_at_idx" ON "medios" USING btree ("updated_at");
  CREATE INDEX "medios_created_at_idx" ON "medios" USING btree ("created_at");
  CREATE UNIQUE INDEX "medios_filename_idx" ON "medios" USING btree ("filename");
  CREATE INDEX "medios_sizes_miniatura_sizes_miniatura_filename_idx" ON "medios" USING btree ("sizes_miniatura_filename");
  CREATE INDEX "medios_sizes_tarjeta_sizes_tarjeta_filename_idx" ON "medios" USING btree ("sizes_tarjeta_filename");
  CREATE INDEX "medios_sizes_hero_sizes_hero_filename_idx" ON "medios" USING btree ("sizes_hero_filename");
  CREATE INDEX "medios_sizes_og_sizes_og_filename_idx" ON "medios" USING btree ("sizes_og_filename");
  CREATE INDEX "documentos_tipo_idx" ON "documentos" USING btree ("tipo");
  CREATE INDEX "documentos_updated_at_idx" ON "documentos" USING btree ("updated_at");
  CREATE INDEX "documentos_created_at_idx" ON "documentos" USING btree ("created_at");
  CREATE UNIQUE INDEX "documentos_filename_idx" ON "documentos" USING btree ("filename");
  CREATE UNIQUE INDEX "facultades_slug_idx" ON "facultades" USING btree ("slug");
  CREATE INDEX "facultades_updated_at_idx" ON "facultades" USING btree ("updated_at");
  CREATE INDEX "facultades_created_at_idx" ON "facultades" USING btree ("created_at");
  CREATE INDEX "sedes_updated_at_idx" ON "sedes" USING btree ("updated_at");
  CREATE INDEX "sedes_created_at_idx" ON "sedes" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirecciones_desde_idx" ON "redirecciones" USING btree ("desde");
  CREATE INDEX "redirecciones_updated_at_idx" ON "redirecciones" USING btree ("updated_at");
  CREATE INDEX "redirecciones_created_at_idx" ON "redirecciones" USING btree ("created_at");
  CREATE INDEX "redirecciones_rels_order_idx" ON "redirecciones_rels" USING btree ("order");
  CREATE INDEX "redirecciones_rels_parent_idx" ON "redirecciones_rels" USING btree ("parent_id");
  CREATE INDEX "redirecciones_rels_path_idx" ON "redirecciones_rels" USING btree ("path");
  CREATE INDEX "redirecciones_rels_carreras_id_idx" ON "redirecciones_rels" USING btree ("carreras_id");
  CREATE INDEX "redirecciones_rels_posgrados_id_idx" ON "redirecciones_rels" USING btree ("posgrados_id");
  CREATE INDEX "redirecciones_rels_noticias_id_idx" ON "redirecciones_rels" USING btree ("noticias_id");
  CREATE INDEX "usuarios_roles_order_idx" ON "usuarios_roles" USING btree ("order");
  CREATE INDEX "usuarios_roles_parent_idx" ON "usuarios_roles" USING btree ("parent_id");
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE INDEX "auditoria_usuario_idx" ON "auditoria" USING btree ("usuario_id");
  CREATE INDEX "auditoria_accion_idx" ON "auditoria" USING btree ("accion");
  CREATE INDEX "auditoria_coleccion_idx" ON "auditoria" USING btree ("coleccion");
  CREATE INDEX "auditoria_documento_id_idx" ON "auditoria" USING btree ("documento_id");
  CREATE INDEX "auditoria_updated_at_idx" ON "auditoria" USING btree ("updated_at");
  CREATE INDEX "auditoria_created_at_idx" ON "auditoria" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_carreras_id_idx" ON "payload_locked_documents_rels" USING btree ("carreras_id");
  CREATE INDEX "payload_locked_documents_rels_posgrados_id_idx" ON "payload_locked_documents_rels" USING btree ("posgrados_id");
  CREATE INDEX "payload_locked_documents_rels_noticias_id_idx" ON "payload_locked_documents_rels" USING btree ("noticias_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_medios_id_idx" ON "payload_locked_documents_rels" USING btree ("medios_id");
  CREATE INDEX "payload_locked_documents_rels_documentos_id_idx" ON "payload_locked_documents_rels" USING btree ("documentos_id");
  CREATE INDEX "payload_locked_documents_rels_facultades_id_idx" ON "payload_locked_documents_rels" USING btree ("facultades_id");
  CREATE INDEX "payload_locked_documents_rels_sedes_id_idx" ON "payload_locked_documents_rels" USING btree ("sedes_id");
  CREATE INDEX "payload_locked_documents_rels_redirecciones_id_idx" ON "payload_locked_documents_rels" USING btree ("redirecciones_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_locked_documents_rels_auditoria_id_idx" ON "payload_locked_documents_rels" USING btree ("auditoria_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "configuracion_seo_imagen_idx" ON "configuracion" USING btree ("seo_imagen_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "carreras_secciones_adicionales" CASCADE;
  DROP TABLE "carreras_malla_asignaturas" CASCADE;
  DROP TABLE "carreras_malla" CASCADE;
  DROP TABLE "carreras" CASCADE;
  DROP TABLE "carreras_rels" CASCADE;
  DROP TABLE "_carreras_v_version_secciones_adicionales" CASCADE;
  DROP TABLE "_carreras_v_version_malla_asignaturas" CASCADE;
  DROP TABLE "_carreras_v_version_malla" CASCADE;
  DROP TABLE "_carreras_v" CASCADE;
  DROP TABLE "_carreras_v_rels" CASCADE;
  DROP TABLE "posgrados_secciones_adicionales" CASCADE;
  DROP TABLE "posgrados_malla_asignaturas" CASCADE;
  DROP TABLE "posgrados_malla" CASCADE;
  DROP TABLE "posgrados" CASCADE;
  DROP TABLE "posgrados_rels" CASCADE;
  DROP TABLE "_posgrados_v_version_secciones_adicionales" CASCADE;
  DROP TABLE "_posgrados_v_version_malla_asignaturas" CASCADE;
  DROP TABLE "_posgrados_v_version_malla" CASCADE;
  DROP TABLE "_posgrados_v" CASCADE;
  DROP TABLE "_posgrados_v_rels" CASCADE;
  DROP TABLE "noticias" CASCADE;
  DROP TABLE "noticias_texts" CASCADE;
  DROP TABLE "noticias_rels" CASCADE;
  DROP TABLE "_noticias_v" CASCADE;
  DROP TABLE "_noticias_v_texts" CASCADE;
  DROP TABLE "_noticias_v_rels" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "medios" CASCADE;
  DROP TABLE "documentos" CASCADE;
  DROP TABLE "facultades" CASCADE;
  DROP TABLE "sedes" CASCADE;
  DROP TABLE "redirecciones" CASCADE;
  DROP TABLE "redirecciones_rels" CASCADE;
  DROP TABLE "usuarios_roles" CASCADE;
  DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "auditoria" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "configuracion" CASCADE;
  DROP TYPE "public"."enum_carreras_modalidad";
  DROP TYPE "public"."enum_carreras_estado";
  DROP TYPE "public"."enum_carreras_status";
  DROP TYPE "public"."enum__carreras_v_version_modalidad";
  DROP TYPE "public"."enum__carreras_v_version_estado";
  DROP TYPE "public"."enum__carreras_v_version_status";
  DROP TYPE "public"."enum_posgrados_tipo";
  DROP TYPE "public"."enum_posgrados_modalidad";
  DROP TYPE "public"."enum_posgrados_estado";
  DROP TYPE "public"."enum_posgrados_status";
  DROP TYPE "public"."enum__posgrados_v_version_tipo";
  DROP TYPE "public"."enum__posgrados_v_version_modalidad";
  DROP TYPE "public"."enum__posgrados_v_version_estado";
  DROP TYPE "public"."enum__posgrados_v_version_status";
  DROP TYPE "public"."enum_noticias_estado";
  DROP TYPE "public"."enum_noticias_status";
  DROP TYPE "public"."enum__noticias_v_version_estado";
  DROP TYPE "public"."enum__noticias_v_version_status";
  DROP TYPE "public"."enum_documentos_tipo";
  DROP TYPE "public"."enum_redirecciones_tipo";
  DROP TYPE "public"."enum_redirecciones_destino_tipo";
  DROP TYPE "public"."enum_redirecciones_origen";
  DROP TYPE "public"."enum_usuarios_roles";
  DROP TYPE "public"."enum_auditoria_accion";`)
}
