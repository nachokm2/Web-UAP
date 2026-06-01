# Proyecto de Migración UAP Web → WordPress

## Propuesta Técnica de Migración

**Universidad Autónoma del Paraguay**  
**Fecha:** Mayo 2026  
**Versión:** 1.0

---

## 1. Resumen Ejecutivo

El presente documento detalla el plan de migración del sitio web institucional de la Universidad Autónoma del Paraguay (UAP), actualmente desarrollado como sitio estático en HTML/CSS/JS desplegado en Vercel, hacia una plataforma WordPress que permita la gestión autónoma del contenido por parte del equipo institucional.

El sitio actual cuenta con:

- Página principal con carrusel, estadísticas, alianzas, carreras organizadas por facultades y noticias
- 22 páginas de aterrizaje (landing pages) de carreras con datos académicos reales
- Páginas institucionales (autoridades, misión/visión)
- Página de estudiantes
- Formularios de contacto por carrera
- Diseño responsive con menú hamburguesa para mobile

La migración busca preservar el diseño actual mientras habilita la administración descentralizada del contenido.

---

## 2. Objetivos

### 2.1 Objetivo General

Migrar el sitio web institucional de la UAP a WordPress, manteniendo el diseño, rendimiento y funcionalidad actuales, y habilitando la gestión de contenido por parte del equipo institucional sin dependencia externa.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador de Éxito |
|---|----------|-------------------|
| 1 | Preservar diseño visual actual | Aprobación del diseño por dirección UAP |
| 2 | Habilitar gestión de carreras | Administrador puede crear/editar/eliminar carreras desde WP |
| 3 | Habilitar gestión de noticias | Administrador puede publicar noticias con imágenes |
| 4 | Mantener rendimiento | Lighthouse score ≥ 90 en mobile y desktop |
| 5 | SEO técnico | URLs amigables, meta tags, sitemap XML |
| 6 | Seguridad | HTTPS, roles de usuario, backups automáticos |
| 7 | Formularios funcionales | Recibir consultas por carrera en email institucional |

---

## 3. Arquitectura Propuesta

### 3.1 Stack Tecnológico

| Componente | Tecnología | Justificación |
|-----------|-----------|---------------|
| CMS | WordPress 6.x | Ecosistema maduro, documentación extensa |
| Tema | Tema custom UAP | Control total sobre diseño y rendimiento |
| Campos personalizados | ACF Pro | Interfaz intuitiva para edición de contenido |
| Formularios | WPForms o Contact Form 7 | Integración con email institucional |
| SEO | Yoast SEO | Meta tags, sitemap, schema markup |
| Caché | WP Rocket o LiteSpeed Cache | Rendimiento óptimo |
| Hosting | SiteGround / Kinsta / Cloudways | Servidor optimizado para WP |
| SSL | Let's Encrypt / incluido en hosting | HTTPS obligatorio |
| Backups | UpdraftPlus | Backups automáticos diarios |
| Email transaccional | WP Mail SMTP | Envío confiable de formularios |

### 3.2 Estructura de Contenido (Custom Post Types)

```
WordPress
├── Páginas (Pages)
│   ├── Inicio (Home)
│   ├── Institucional
│   ├── Estudiantes
│   ├── Inscripción
│   ├── Contacto
│   └── Investigación
│
├── CPT: Carreras (careers)
│   ├── Título
│   ├── Contenido / Descripción
│   ├── Campos ACF:
│   │   ├── título_otorgado (text)
│   │   ├── duración (text: "8 Semestres")
│   │   ├── sede (select: Central)
│   │   ├── objetivo (textarea)
│   │   ├── campo_laboral (textarea)
│   │   ├── perfil_egresado (textarea)
│   │   ├── misión (textarea) — opcional
│   │   ├── visión (textarea) — opcional
│   │   ├── a_quien_va_dirigido (textarea) — opcional
│   │   ├── objetivos_específicos (repeater)
│   │   ├── competencias_disciplinarias (repeater)
│   │   ├── competencias_profesionales (repeater)
│   │   ├── competencias_genéricas (repeater)
│   │   ├── valores (repeater)
│   │   ├── definición_del_profesional (textarea) — opcional
│   │   ├── brochure_url (file) — enlace a PDF
│   │   ├── facultad (select: Médicas, Ingenierías, Sociales)
│   │   └── malla (repeater por semestre)
│   │       ├── semestre (text: "1° Semestre")
│   │       └── materias (repeater de texto)
│   ├── Imagen destacada (thumbnail)
│   └── URL: /carreras/{slug}/
│
├── CPT: Noticias (news)
│   ├── Título
│   ├── Contenido (editor)
│   ├── Imagen destacada
│   ├── Fecha
│   ├── Categoría
│   └── URL: /noticias/{slug}/
│
├── CPT: Posgrados (postgraduates)
│   ├── Título
│   ├── Contenido
│   ├── Tipo (Maestría / Especialización / Doctorado)
│   └── URL: /posgrados/{slug}/
│
└── Taxonomías
    ├── Facultad (vinculada a Carreras)
    ├── Tipo de Posgrado (vinculada a Posgrados)
    └── Categoría de Noticia (vinculada a Noticias)
```

### 3.3 Jerarquía de Plantillas del Tema

```
uap-theme/
├── style.css                  # Hoja de estilos principal + metadata del tema
├── functions.php              # Registro de CPTs, ACF, menús, widgets
├── index.php                  # Plantilla base
├── front-page.php             # Home (carrusel, estadísticas, alianzas, carreras)
├── page.php                   # Páginas genéricas
├── page-institucional.php     # Página institucional con autoridades
├── page-estudiantes.php       # Página de estudiantes
├── page-contacto.php          # Página de contacto
├── single-career.php          # Landing page de cada carrera
├── archive-careers.php        # Listado de todas las carreras
├── single-news.php            # Noticia individual
├── archive-news.php            # Listado de noticias
├── archive-postgraduates.php  # Listado de posgrados
├── header.php                  # Header con logo, navegación, dropdowns
├── footer.php                  # Footer institucional
├── sidebar.php                 # Sidebar (si aplica)
│
├── template-parts/
│   ├── content-hero.php        # Carrusel del home
│   ├── content-stats.php       # Estadísticas (+50 convenios, etc.)
│   ├── content-partners.php    # Alianzas estratégicas (carrusel)
│   ├── content-careers-tabs.php # Carreras por facultad
│   ├── content-news.php        # Noticias del home
│   ├── content-cta.php         # Call to action "Inscribite ahora"
│   ├── career-info-grid.php    # Info grid (título, duración, sede)
│   ├── career-objective.php    # Objetivo de la carrera
│   ├── career-campo-laboral.php
│   ├── career-perfil.php
│   ├── career-malla.php        # Plan de estudios con tabs
│   ├── career-contact-form.php # Formulario de contacto por carrera
│   └── career-brochure.php     # Botón descargar brochure
│
├── assets/
│   ├── css/
│   │   ├── uap-refined.css     # Estilos principales (migrados del actual)
│   │   ├── uap-marquee.css     # Animación del carrusel de alianzas
│   │   └── uap-responsive.css  # Media queries específicos
│   ├── js/
│   │   ├── main.js             # Carousel, tabs, mobile menu
│   │   └── marquee.js          # (opcional, si se prefiere JS sobre CSS)
│   └── images/
│       ├── logo-uap.png
│       ├── logo-white.png
│       └── (íconos SVG, banners)
│
├── inc/
│   ├── custom-post-types.php   # Registro de CPTs
│   ├── acf-fields.php          # Definición de campos ACF via PHP
│   ├── menus.php               # Registro de menús de navegación
│   ├── widgets.php             # Widgets personalizados
│   └── admin.php               # Personalización del admin
│
└── screenshot.png              # Captura del tema (1200x900px)
```

---

## 4. Detalle de Tareas

### Fase 1: Preparación del Entorno (2 días)

| # | Tarea | Detalle |
|---|-------|---------|
| 1.1 | Provisionar hosting | Contratar hosting WordPress optimizado (SiteGround StartUp o equivalente) |
| 1.2 | Instalar WordPress | WordPress limpio, SSL, permalinks `/carreras/%postname%/` |
| 1.3 | Configurar DNS | Apuntar uap.edu.py al nuevo hosting (o subdominio temporal para pruebas) |
| 1.4 | Instalar plugins base | ACF Pro, Yoast SEO, WPForms, WP Rocket, UpdraftPlus, WP Mail SMTP |
| 1.5 | Configurar roles | Administrador (dirección), Editor (comunicación), Autor (secretarías) |

### Fase 2: Desarrollo del Tema (5 días)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.1 | Crear tema UAP | `uap-theme/` con estructura completa |
| 2.2 | Migrar CSS | `uap-refined.css` → estilos del tema, variables CSS, responsive |
| 2.3 | Header y Footer | Menú dinámico con dropdowns, logo, hamburguesa mobile |
| 2.4 | Home (front-page.php) | Carrusel hero, estadísticas, alianzas marquee, tabs de carreras, noticias, CTA |
| 2.5 | Landing de carrera (single-career.php) | Hero, info grid, objetivo, campo laboral, perfil, malla con tabs, formulario, brochure |
| 2.6 | Páginas institucionales | Institucional, Estudiantes, Contacto |
| 2.7 | Archivos de noticias y posgrados | Listados y páginas individuales |
| 2.8 | Formularios de contacto | WPForms con envío por carrera a email correspondiente |
| 2.9 | SEO técnico | Schema markup, meta tags dinámicos, Open Graph, sitemap XML |

### Fase 3: Migración de Contenido (3 días)

| # | Tarea | Detalle |
|---|-------|---------|
| 3.1 | Migrar 22 carreras | Crear 22 entradas CPT Career con todos los campos ACF |
| 3.2 | Migrar páginas | Inicio, Institucional, Estudiantes, Contacto |
| 3.3 | Migrar noticias | 3 noticias existentes |
| 3.4 | Migrar imágenes | Logo, banners, íconos, fotos de noticias |
| 3.5 | Configurar menús | Navegación principal y footer con links correctos |
| 3.6 | Redirecciones 301 | Desde URLs actuales a nuevas URLs de WP |

### Fase 4: Testing y Ajustes (2 días)

| # | Tarea | Detalle |
|---|-------|---------|
| 4.1 | Testing responsive | Verificar en mobile, tablet y desktop |
| 4.2 | Testing de formularios | Confirmar recepción de emails por carrera |
| 4.3 | Testing de rendimiento | Lighthouse score ≥ 90 |
| 4.4 | Testing de SEO | Verificar meta tags, sitemap, robots.txt |
| 4.5 | Testing de accesibilidad | Contraste, navegación por teclado, alt en imágenes |
| 4.6 | Revisión de contenido | Verificar que todo el contenido migró correctamente |
| 4.7 | Ajustes de diseño | Correcciones basadas en feedback de dirección UAP |

### Fase 5: Lanzamiento (1 día)

| # | Tarea | Detalle |
|---|-------|---------|
| 5.1 | DNS final | Apuntar uap.edu.py al hosting de producción |
| 5.2 | SSL | Certificado SSL activo y forzado HTTPS |
| 5.3 | Verificación final | Smoke test completo en producción |
| 5.4 | Capacitación | Sesión de 2 horas con el equipo UAP sobre gestión de contenido |
| 5.5 | Documentación | Entregar manual de usuario y guía de mantenimiento |

---

## 5. Cronograma

```
Semana 1:  [██████████] Fase 1: Preparación + Inicio Fase 2
Semana 2:  [██████████] Fase 2: Desarrollo del tema (cont.)
Semana 3:  [██████░░░░] Fase 2 (fin) + Fase 3: Migración
Semana 4:  [████████░░] Fase 4: Testing + Fase 5: Lanzamiento
```

| Semana | Actividad | Entregable |
|--------|-----------|-----------|
| 1 | Preparación + Desarrollo tema | Hosting activo, tema base funcional |
| 2 | Desarrollo tema (cont.) | Home y landing de carrera funcionales |
| 3 | Migración de contenido | 22 carreras + páginas migradas |
| 4 | Testing y lanzamiento | Sitio en producción |

**Duración total estimada:** 4 semanas (13 días hábiles efectivos)

---

## 6. Presupuesto Estimado

| Concepto | Detalle | Costo USD |
|----------|---------|-----------|
| **Desarrollo del tema WordPress** | Tema custom UAP con CPTs, ACF, responsive | $2,500 |
| **Migración de contenido** | 22 carreras, páginas, noticias, imágenes | $800 |
| **Configuración de hosting** | Instalación, SSL, DNS, email, caché | $300 |
| **Testing y QA** | Responsive, formularios, rendimiento, SEO | $400 |
| **Capacitación y documentación** | Manual de usuario + sesión de capacitación | $300 |
| **Contingencia (10%)** | Imprevistos y ajustes | $430 |
| | **TOTAL ESTIMADO** | **$4,730** |

### Costos recurrentes (anuales)

| Concepto | Costo USD/año |
|----------|--------------|
| Hosting WordPress optimizado | $120 - $300 |
| Dominio uap.edu.py | ~$50 |
| Mantenimiento y actualizaciones WP | $600 - $1,200 |

---

## 7. Comparativa: Sitio Actual vs. Propuesta WordPress

| Aspecto | Sitio Actual (Estático/Vercel) | Propuesta WordPress |
|---------|-------------------------------|-------------------|
| **Gestión de contenido** | Requiere editar HTML/JSON | Admin visual intuitivo |
| **Agregar carrera** | Editar archivos + deploy | Crear entrada en WP Admin |
| **Agregar noticia** | No implementado | Crear entrada en WP Admin |
| **Modificar autoridades** | Editar HTML | Editar página en WP Admin |
| **Formularios** | No funcional (sin backend) | Envío real a email institucional |
| **SEO** | Manual por archivo | Automático con Yoast |
| **Rendimiento** | Excelente (CDN Vercel) | Muy bueno (caché + CDN) |
| **Costo hosting** | Gratis (Vercel) | $120-300/año |
| **Dependencia técnica** | Alta (desarrollador) | Baja (equipo UAP autónomo) |
| **Escalabilidad** | Limitada | Ilimitada (plugins, CPTs) |
| **Multilingüe** | No implementado | WPML o Polylang listo |
| **Analítica** | No implementado | Google Analytics + Search Console |

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Downtime durante migración DNS | Baja | Alto | Usar subdominio de prueba, cambiar DNS en horario no laboral |
| Pérdida de posicionamiento SEO | Media | Alto | Redirecciones 301, mantener URLs similares, Google Search Console |
| Rendimiento inferior al sitio estático | Media | Medio | WP Rocket + CDN + hosting optimizado |
| Conflictos con plugins | Baja | Medio | Usar plugins probados, mantener actualizados |
| Equipo UAP no gestiona contenido | Media | Bajo | Capacitación + documentación + soporte post-lanzamiento |

---

## 9. Criterios de Aceptación

- [ ] El sitio replica el diseño actual aprobado por dirección UAP
- [ ] Las 22 carreras están cargadas con todos sus datos (título, duración, sede, objetivo, campo laboral, perfil, malla, brochure)
- [ ] El equipo UAP puede crear/editar/eliminar carreras desde WP Admin sin asistencia
- [ ] El equipo UAP puede publicar noticias con imágenes desde WP Admin
- [ ] Los formularios de contacto envían correos al email institucional
- [ ] El sitio es responsive (mobile, tablet, desktop)
- [ ] Lighthouse score ≥ 90 en rendimiento y accesibilidad
- [ ] SSL activo con HTTPS forzado
- [ ] Backups automáticos configurados (diarios)
- [ ] Sitemap XML generado automáticamente
- [ ] Menú hamburguesa funciona en mobile
- [ ] Carrusel de alianzas funciona correctamente
- [ ] Documentación entregada y capacitación realizada

---

## 10. Soporte Post-Lanzamiento

| Servicio | Detalle | Duración |
|----------|---------|----------|
| Corrección de bugs | Fix de errores post-lanzamiento | 30 días |
| Soporte por email | Consultas sobre gestión de contenido | 30 días |
| Actualizaciones WP | WordPress, plugins, tema | Según necesidad |

Soporte extendido disponible bajo contrato de mantenimiento mensual.

---

## 11. Anexos

### Anexo A: Mapa del Sitio Actual

```
uap.edu.py
├── Inicio (Home)
│   ├── Carrusel hero
│   ├── Estadísticas
│   ├── Alianzas estratégicas (carrusel)
│   ├── Carreras por facultad (tabs)
│   ├── Noticias
│   └── CTA Inscripción
│
├── Carreras (landing pages)
│   ├── Odontología
│   ├── Derecho
│   ├── Psicología
│   ├── Nutrición
│   ├── Fisioterapia
│   ├── Fonoaudiología
│   ├── Podología
│   ├── Óptica y Contactología
│   ├── Ingeniería en Informática
│   ├── Ingeniería en Tecnología de Alimentos
│   ├── Ingeniería Comercial
│   ├── Ingeniería en Comercio Internacional
│   ├── Ingeniería en Marketing
│   ├── Marketing y Publicidad
│   ├── Periodismo
│   ├── Ciencias de la Educación
│   ├── Educación Parvularia
│   ├── Trabajo Social
│   ├── Administración Pública
│   ├── Administración de Empresas
│   ├── Ciencias Contables
│   ├── Contabilidad y Auditoría
│   └── Contaduría Pública (pendiente)
│
├── Posgrados
├── Noticias
├── Institucional (misión, visión, autoridades)
├── Estudiantes
├── Investigación
└── Contacto
```

### Anexo B: Campos ACF por Carrera

| Campo ACF | Tipo | Requerido | Notas |
|-----------|------|-----------|-------|
| título_otorgado | text | Sí | Ej: "Doctor en Odontología" |
| duración | text | Sí | Ej: "8 Semestres" |
| sede | select | Sí | Central |
| facultad | select | Sí | Médicas / Ingenierías / Sociales |
| descripción | wysiwyg | Sí | Texto principal de la carrera |
| objetivo | textarea | Sí | Objetivo general |
| campo_laboral | textarea | Sí | Campo laboral del egresado |
| perfil_egresado | textarea | Sí | Perfil del graduado |
| misión | textarea | No | Solo 3 carreras lo tienen |
| visión | textarea | No | Solo 3 carreras lo tienen |
| a_quien_va_dirigido | textarea | No | Solo 3 carreras lo tienen |
| objetivos_específicos | repeater(text) | No | Lista de objetivos |
| competencias_disciplinarias | repeater(text) | No | Competencias disciplinares |
| competencias_profesionales | repeater(text) | No | Competencias profesionales |
| competencias_genéricas | repeater(text) | No | Competencias genéricas |
| valores | repeater(text) | No | Valores de la carrera |
| definición_del_profesional | textarea | No | Definición del profesional |
| brochure | file | No | PDF del brochure |
| malla | group | Sí | Plan de estudios |
| └ semestres | repeater | Sí | Lista de semestres |
|   └ nombre | text | Sí | Ej: "1° Semestre" |
|   └ materias | repeater(text) | Sí | Materias del semestre |

### Anexo C: Estructura de Menús de WordPress

**Menú Principal:**
- Inicio
- Carreras ▾ (dropdown por facultad)
  - Ciencias Médicas y de la Salud
    - Odontología
    - Psicología
    - Nutrición
    - Fisioterapia
    - Fonoaudiología
    - Podología
    - Óptica y Contactología
  - Ingenierías y Tecnologías
    - Ingeniería en Informática
    - Ingeniería en Tecnología de Alimentos
    - Ingeniería Comercial
    - Ingeniería en Comercio Internacional
    - Ingeniería en Marketing
  - Ciencias Sociales y Humanas
    - Marketing y Publicidad
    - Periodismo
    - Ciencias de la Educación
    - Educación Parvularia
    - Derecho
    - Trabajo Social
    - Administración Pública
    - Administración de Empresas
    - Ciencias Contables
    - Contabilidad y Auditoría
    - Contaduría Pública
- Posgrados ▾
- Noticias
- Institucional ▾
  - Misión, Visión y Valores
  - Autoridades
  - Convenios
  - Reglamentos
- Investigación
- Estudiantes
- Contacto

**Menú Footer:**
- Carreras (Odontología, Psicología, Fisioterapia, Marketing, Ver todas)
- Posgrados (Maestrías, Especializaciones)
- Institucional (Sobre la UAP, Autoridades, Contacto)

---

*Documento preparado como propuesta técnica para la Universidad Autónoma del Paraguay.*