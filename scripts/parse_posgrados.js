#!/usr/bin/env node
// Parsea los .md scrapeados de uap.edu.py/{posgrado}/ y arma data/posgrados.json
const fs = require('fs');
const path = require('path');

const FIRECRAWL_DIR = path.join(__dirname, '..', '..', '.firecrawl');
const OUT = path.join(__dirname, '..', 'data', 'posgrados.json');

const urls = require(path.join(FIRECRAWL_DIR, 'posgrado-urls.json'));

// Categorías reales según el mega-menu de diplomados del sitio oficial (uap.edu.py)
const DIPLOMADO_CATEGORIAS = {
  'diplomado-en-modelacion-bim': 'Arquitectura, construcción y medio ambiente',
  'diplomado-en-normas-internacionales-de-informacion-financiera': 'Administración y Negocios',
  'diplomado-en-comunicacion-estrategica': 'Administración y Negocios',
  'diplomado-audiologia-clinica': 'Ciencias de la Salud',
  'diplomado-en-el-trastorno-de-deficit-de-atencion-e-hiperactividad-tdah': 'Ciencias de la Salud',
  'diplomado-trastorno-del-espectro-autista-tea': 'Ciencias de la Salud',
  'diplomado-en-salud-mental-y-psiquiatria': 'Ciencias de la Salud',
  'diplomado-en-mindfulness': 'Ciencias de la Salud',
  'diplomado-atencion-oportuna-con-enfasis-en-motricidad-orofacial': 'Ciencias de la Salud',
  'diplomado-internacional-en-neurorrehabilitacion-infantil-e-integracion-sensorial': 'Ciencias de la Salud',
  'diplomado-en-nutricion-y-alimentacion-para-el-rendimiento-deportivo-y-salud': 'Ciencias de la Salud',
  'diplomado-en-cuidados-paliativos-y-manejo-del-dolor': 'Ciencias de la Salud',
  'diplomado-abordaje-del-lenguaje-en-ninos-y-adolescentes': 'Ciencias Sociales y Humanidades',
  'diplomado-en-psicologia-deportiva': 'Ciencias Sociales y Humanidades',
  'diplomado-en-estimulacion-temprana-e-integral-en-el-desarrollo-infantil-2': 'Ciencias Sociales y Humanidades',
  'diplomado-en-psicoterapia-breve': 'Ciencias Sociales y Humanidades',
  'diplomado-en-intervencion-en-problemas-de-pareja': 'Ciencias Sociales y Humanidades',
  'diplomado-en-docencia-e-innovacion-en-la-educacion-superior': 'Educación',
  'diplomado-en-metodos-de-investigacion-y-publicaciones-academicas': 'Educación',
  'diplomado-internacional-en-competencias-digitales-para-la-docencia': 'Educación',
  'diplomado-internacional-en-diseno-gestion-e-innovacion-curricular': 'Educación',
  'diplomado-internacional-en-educacion-por-competencias-y-sistema-de-creditos-transferibles-en-educacion-superior': 'Educación',
  'diplomado-internacionalen-cariologia-clinica': 'Odontología',
  'diplomado-en-seguridad-ciudadana-con-enfasis-en-gestion-municipal': 'Administración y Negocios',
  'diplomado-en-inteligencia-artificial-aplicada-a-la-educacion-y-la-innovacion-pedagogica': 'Educación',
  'diplomado-internacional-en-transformacion-digital-e-inteligencia-artificial': 'Ingeniería',
  'diplomado-en-transformacion-digital-empresarial-con-inteligencia-artificial': 'Administración y Negocios',
  'diplomado-en-estrategias-politicas-y-marketing-digital-con-inteligencia-artificial': 'Administración y Negocios',
  'diplomado-en-ciencias-de-la-inteligencia-artificial-aplicada': 'Ingeniería',
  'diplomado-en-inteligencia-artificial-aplicada-a-la-salud-y-las-ciencias-medicas': 'Ciencias de la Salud',
  'diplomado-procesamiento-sensorial-en-tea': 'Ciencias de la Salud',
  'diplomado-en-abordaje-cognitivo-auditivo-y-linguistico-del-adulto': 'Ciencias de la Salud',
  'diplomado-estimulacion-temprana-e-integral-en-el-desarrollo-infantil': 'Ciencias Sociales y Humanidades',
  'diplomado-en-ciencias-de-la-inteligencia-artificial-aplicada': 'Ingeniería',
  'diplomado-en-inteligencia-artificial-aplicada-al-derecho': 'Ciencias Sociales y Humanidades',
};

function tipoFromSlug(slug) {
  if (slug.startsWith('diplomado')) return 'Diplomado';
  if (slug.startsWith('especializacion')) return 'Especialización';
  if (slug.startsWith('maestria-y-doctorado')) return 'Maestría y Doctorado';
  if (slug.startsWith('maestria')) return 'Maestría';
  if (slug.startsWith('doctorado')) return 'Doctorado';
  return 'Posgrado';
}

const ESPECIALIZACION_ODONTO = new Set([
  'especializacion-en-endodoncia',
  'especializacion-en-odontopediatria-y-salud-comunitaria',
  'especializacion-en-ortodoncia',
  'especializacion-en-ortopedia-maxilar',
  'especializacion-en-rehabilitacion-oral-y-estetica',
  'especializacion-en-cirugia-dentoalveolar',
  'especializacion-en-implantologia-oral',
  'especializacion-en-cirugia-y-traumatologia-bucomaxilo-facial',
]);

function categoriaFor(slug, tipo) {
  if (tipo === 'Diplomado') return DIPLOMADO_CATEGORIAS[slug] || 'Otros Diplomados';
  if (tipo === 'Especialización') return ESPECIALIZACION_ODONTO.has(slug) ? 'Especializaciones en Odontología' : 'Otras Especializaciones';
  if (tipo === 'Maestría') return 'Maestrías';
  if (tipo === 'Doctorado') return 'Doctorados';
  if (tipo === 'Maestría y Doctorado') return 'Maestría y Doctorado';
  return 'Otros';
}

function stripMd(s) {
  return s.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').trim();
}

function grab(md, label) {
  const re = new RegExp('## ' + label + '\\s*\\n+([^\\n#!\\[][^\\n]*)');
  const m = md.match(re);
  if (!m) return '';
  const value = stripMd(m[1].trim());
  return /\d/.test(value) || label !== 'Duraci[oó]n' ? value : '';
}

function grabBrochure(md) {
  const m = md.match(/\[Descargar Brochure\]\(([^)]+)\)/);
  return m ? m[1] : '';
}

function grabDescripcion(md) {
  const m = md.match(/- Descripci[oó]n\s*\n+([\s\S]*?)(?=\n##|\n- )/);
  if (!m) return '';
  return stripMd(m[1].replace(/\n+/g, ' ').trim());
}

// Páginas "stub" del sitio oficial sin contenido real (mensaje "seguimos mejorando la web")
const STUB_SLUGS = new Set(['doctorado', 'maestrias']);
// Páginas duplicadas/desactualizadas del mismo programa (título en mayúsculas + brochure roto,
// mientras la versión enlazada en el menú oficial tiene título correcto y brochure propio)
const DUPLICATE_SLUGS = new Set([
  'diplomado-en-trastorno-del-espectroautista-tea',
  'diplomado-estimulacion-temprana-e-integral-en-el-desarrollo-infantil',
  'diplomado-en-educacion-por-competencias-y-sistema-de-creditos-transferibles-en-educacion-superior',
]);

// Caso especial: página combinada Maestría+Doctorado sin brochure ni "Descripción" simple
const MANUAL_OVERRIDES = {
  'maestria-y-doctorado-en-ciencias-odontologicas-con-enfasis-en-endodoncia-odontopediatria-rehabilitacion-oral-y-periodoncia': {
    modalidad: 'Presencial y a distancia',
    descripcion: 'Formar profesionales con sólido conocimiento pedagógico y metodología de investigación científica para formar entre sus estudiantes un pensamiento crítico orientado a la creación de conocimientos. Doctorado: formar científicos investigadores de alto perfil académico, capaces de liderar proyectos y equipos de investigación en Ciencias Odontológicas.',
  },
  // Bug de contenido en el sitio oficial: esta URL sirve el mismo encabezado que "Ciencias de la
  // Inteligencia Artificial Aplicada"; se usa el nombre correcto del campo interno "Título". El
  // brochure compartido/equivocado se resuelve más abajo (dedup automático por brochure_url).
  'diplomado-en-inteligencia-artificial-aplicada-al-derecho': {
    nombre: 'Diplomado en Inteligencia Artificial Aplicada al Derecho',
  },
  'diplomado-procesamiento-sensorial-en-tea': { nombre: 'Diplomado Procesamiento Sensorial en TEA' },
};

const results = [];
const missing = [];
const skipped = [];

for (const url of urls) {
  const slug = url.replace('https://uap.edu.py/', '').replace(/\/$/, '');
  if (STUB_SLUGS.has(slug) || DUPLICATE_SLUGS.has(slug)) {
    skipped.push(slug);
    continue;
  }
  const filename = 'uap.edu.py-' + slug.replace(/\//g, '-') + '.md';
  const filepath = path.join(FIRECRAWL_DIR, filename);
  if (!fs.existsSync(filepath)) {
    missing.push(slug);
    continue;
  }
  const md = fs.readFileSync(filepath, 'utf-8');
  const tipo = tipoFromSlug(slug);
  const titulo = grab(md, 'T[ií]tulo') || (md.match(/^#{1,2} (.+)$/m) || [, slug])[1];
  const nombrePagina = (md.match(/^#{1,2} (.+)$/m) || [, titulo])[1].trim();
  const override = MANUAL_OVERRIDES[slug] || {};
  results.push({
    slug,
    url,
    tipo,
    categoria: categoriaFor(slug, tipo),
    nombre: override.nombre || nombrePagina,
    titulo_otorgado: titulo,
    duracion: override.duracion || grab(md, 'Duraci[oó]n'),
    modalidad: override.modalidad || grab(md, 'Modalidad') || grab(md, 'Sede'),
    descripcion: override.descripcion || grabDescripcion(md),
    brochure_url: 'brochure_url' in override ? override.brochure_url : grabBrochure(md),
    ...(override.brochure_error ? { brochure_error: override.brochure_error } : {}),
  });
}

// Bug de plantilla detectado en el sitio oficial: un mismo PDF "de relleno" queda adjunto a
// varias páginas de posgrado distintas (probablemente un placeholder de Elementor que no se
// reemplazó al publicar cada página). Se detecta agrupando por brochure_url: si dos o más
// programas con nombres distintos comparten el mismo PDF, sólo el programa cuyo nombre coincide
// con el nombre del archivo conserva el link; el resto queda sin brochure y con brochure_error.
function tokens(s) {
  return new Set(s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').split(' ').filter(w => w.length > 3));
}
function overlapScore(a, b) {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return n;
}
const byBrochure = {};
results.forEach(p => { if (p.brochure_url) { (byBrochure[p.brochure_url] = byBrochure[p.brochure_url] || []).push(p); } });
let brokenShared = 0;
for (const [brochureUrl, group] of Object.entries(byBrochure)) {
  if (group.length < 2) continue;
  const filename = decodeURIComponent(brochureUrl.split('/').pop().replace(/\.pdf$/i, ''));
  const fileTokens = tokens(filename);
  let best = group[0], bestScore = -1;
  for (const p of group) {
    const score = overlapScore(tokens(p.nombre), fileTokens);
    if (score > bestScore) { bestScore = score; best = p; }
  }
  for (const p of group) {
    if (p !== best) {
      p.brochure_url = '';
      p.brochure_error = 'El sitio oficial adjuntó a esta página el PDF de otro programa ("' + filename.replace(/-/g, ' ') + '"); no se migra hasta que UAP corrija el recurso en origen.';
      brokenShared++;
    }
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf-8');
console.log('Parsed:', results.length, '/ Missing files:', missing.length, '/ Skipped (stub/duplicate):', skipped.length, '/ Brochures compartidos corregidos:', brokenShared);
if (missing.length) console.log('MISSING:', missing);
if (skipped.length) console.log('SKIPPED:', skipped);
