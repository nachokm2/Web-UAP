#!/usr/bin/env node
// Genera pages/posgrados/{slug}.html para cada programa de data/posgrados.json,
// siguiendo el mismo formato visual que pages/carreras/*.html (career-hero-glass,
// glass-card, cta-section con Bitrix), adaptado a los campos que realmente trae
// el dato de posgrado (no hay malla curricular / objetivos específicos / campo
// laboral como en carreras.json, así que esas secciones no se inventan).
//
// Uso: node scripts/generate_posgrado_landings.js
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DATA = path.join(ROOT_DIR, 'data', 'posgrados.json');
const OUT_DIR = path.join(ROOT_DIR, 'pages', 'posgrados');
const headerTpl = fs.readFileSync(path.join(ROOT_DIR, 'partials', 'header-posgrado.html'), 'utf-8');

const programas = require(DATA);

// Imágenes de hero reales ya usadas para las carreras de grado, reutilizadas por
// categoría (no se genera/inventa fotografía nueva para los 55 programas).
const CATEGORY_HERO = {
  'Ciencias Sociales y Humanidades': 'psicologia.jpg',
  'Ciencias de la Salud': 'medicina.jpg',
  'Educación': 'educacion.jpg',
  'Odontología': 'odontologia.jpg',
  'Administración y Negocios': 'negocios.jpg',
  'Arquitectura, construcción y medio ambiente': 'general.jpg',
  'Ingeniería': 'ingenieria.jpg',
  'Especializaciones en Odontología': 'odontologia.jpg',
  'Otras Especializaciones': 'general.jpg',
  'Maestría y Doctorado': 'odontologia.jpg',
  'Maestrías': 'odontologia.jpg',
  'Doctorados': 'odontologia.jpg',
};

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
}

function cleanTitulo(t) {
  return String(t || '').trim().replace(/\.$/, '');
}

function fillTemplate(tpl, tokens) {
  let out = tpl;
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split('{{' + key + '}}').join(value);
  }
  return out;
}

function infoPill(label, value) {
  if (!value) return '';
  return `                <div class="info-pill">
                    <div class="pill-label">${esc(label)}</div>
                    <div class="pill-value">${esc(value)}</div>
                </div>`;
}

function footerHtml() {
  return `    <footer style="background: #002244; color: white; padding: 56px 0 0;">
        <div class="container">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                <div>
                    <a href="../../index.html"><img src="../../images/logo-white.png" alt="UAP – Universidad Autónoma del Paraguay" style="height: 45px; margin-bottom: 20px; display:block;" loading="lazy"></a>
                    <p style="opacity: 0.75; line-height: 1.7; margin-bottom: 20px; font-size: 14px; max-width: none;">
                        Universidad habilitada por el Ministerio de Educación y Ciencias (MEC) y acreditada por la ANEAES. Comprometidos con la excelencia académica y el desarrollo del Paraguay.
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; opacity: 0.65; margin-bottom: 20px;">
                        <span>📍 Colón Nº 658 e/Haedo, Asunción, Paraguay</span>
                        <span>📞 +595 21 447 579</span>
                        <span>✉️ info@uap.edu.py</span>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
                        <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;">MEC Habilitada</span>
                        <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;">ANEAES</span>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <a href="https://www.facebook.com/UAP.Paraguay" target="_blank" rel="noopener" aria-label="Facebook UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                        </a>
                        <a href="https://www.instagram.com/uap.paraguay" target="_blank" rel="noopener" aria-label="Instagram UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>
                        </a>
                        <a href="https://www.youtube.com/@UAPParaguay" target="_blank" rel="noopener" aria-label="YouTube UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/school/universidad-autonoma-del-paraguay" target="_blank" rel="noopener" aria-label="LinkedIn UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Carreras</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="../../pages/carreras/odontologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Odontología</a></li>
                        <li><a href="../../pages/carreras/psicologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Psicología</a></li>
                        <li><a href="../../pages/carreras/fisioterapia.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Fisioterapia</a></li>
                        <li><a href="../../pages/carreras/ingenieria-en-informatica.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Ingeniería en Informática</a></li>
                        <li><a href="../../pages/carreras/derecho.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Derecho</a></li>
                        <li><a href="../../pages/carreras.html" style="color: rgba(255,255,255,0.5); text-decoration: none; font-size: 13px;">Ver todas →</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Posgrados</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="../../pages/posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Maestrías</a></li>
                        <li><a href="../../pages/posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Especializaciones</a></li>
                        <li><a href="../../pages/posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Doctorados</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Institucional</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="../../pages/institucional.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Sobre la UAP</a></li>
                        <li><a href="../../pages/institucional.html#autoridades" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Autoridades</a></li>
                        <li><a href="../../pages/investigacion.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Investigación</a></li>
                        <li><a href="../../pages/estudiantes.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Estudiantes</a></li>
                        <li><a href="../../pages/contacto.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Contacto</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Legal</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="../../pages/privacidad.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Política de privacidad</a></li>
                        <li><a href="../../pages/privacidad.html#terminos" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Términos de uso</a></li>
                        <li><a href="../../pages/inscripcion.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Inscripción</a></li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.15); padding: 20px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; font-size: 13px; opacity: 0.5;">
                <span>© 2026 Universidad Autónoma del Paraguay. Todos los derechos reservados.</span>
                <div style="display:flex;gap:20px;">
                    <a href="../../pages/privacidad.html" style="color:inherit;text-decoration:none;">Privacidad</a>
                    <a href="../../pages/privacidad.html#terminos" style="color:inherit;text-decoration:none;">Términos</a>
                    <a href="../../pages/contacto.html" style="color:inherit;text-decoration:none;">Contacto</a>
                </div>
            </div>
        </div>
    </footer>`;
}

function pageHtml(p) {
  const header = fillTemplate(headerTpl, { ROOT: '../../', PAGES: '../' });
  const heroImg = CATEGORY_HERO[p.categoria] || 'general.jpg';
  const tituloOtorgado = cleanTitulo(p.titulo_otorgado) || p.nombre;
  const subtitle = truncate(p.descripcion, 220);
  const brochureBtn = p.brochure_url
    ? `\n                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px;">
                    <a href="${esc(p.brochure_url)}" class="brochure-btn-glass" target="_blank" rel="noopener" style="margin-top: 0;">Descargar Brochure</a>
                </div>`
    : '';
  const pills = [
    infoPill('Título otorgado', tituloOtorgado),
    infoPill('Duración', p.duracion),
    infoPill('Modalidad', p.modalidad),
  ].filter(Boolean).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(p.nombre)} - Universidad Autónoma del Paraguay</title>
    <link rel="icon" type="image/svg+xml" href="../../images/favicon.svg">
    <link rel="icon" type="image/png" href="../../images/logo-uap.png">
    <link rel="stylesheet" href="../../css/uap-refined.css?v=20260702">

</head>
<body>
    <!-- HEADER -->
${header}
    <nav aria-label="Ubicación en el sitio" class="breadcrumb-nav">
      <div class="container">
        <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="../../index.html"><span itemprop="name">Inicio</span></a>
        <meta itemprop="position" content="1" />
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="../posgrados.html"><span itemprop="name">Posgrados</span></a>
        <meta itemprop="position" content="2" />
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name">${esc(p.nombre)}</span>
        <meta itemprop="position" content="3" />
      </li>
        </ol>
      </div>
    </nav>

    <main id="main-content">

    <!-- HERO -->
    <section class="career-hero-glass" style="--hero-image: url('../../images/heroes/${heroImg}')">
        <div class="container">
            <h1>${esc(p.nombre)}</h1>
            <p class="hero-subtitle">${esc(subtitle)}</p>
${brochureBtn}
            <div class="info-pills">
${pills}
            </div>
        </div>
    </section>

    <!-- SOBRE EL PROGRAMA -->
    <section style="padding: 48px 0; background: linear-gradient(180deg, #f0f4f8, #fff);">
        <div class="container">
            <div class="glass-card" style="max-width: 900px; margin: 0 auto;">
                <h2>
                    <span class="section-icon"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                    Sobre el Programa
                </h2>
                <p>${esc(p.descripcion)}</p>
            </div>
        </div>
    </section>

    <!-- FORMULARIO DE CONTACTO -->
    <section class="cta-section">
        <div class="container" style="max-width: 640px;">
            <h2 style="color: white; text-align: center; border: none;">Solicita información</h2>
            <p style="color: rgba(255,255,255,0.85); text-align: center; margin-bottom: 28px;">Completa el formulario y un asesor se contactará contigo.</p>
            <div style="background: rgba(255,255,255,0.95); border-radius: 16px; padding: 8px;">
                <script>(function(){var p=new URLSearchParams(window.location.search);p.set('utm_source','web-uap');p.set('utm_medium','formulario');p.set('utm_campaign','${esc(p.slug)}');history.replaceState(null,'',window.location.pathname+'?'+p.toString()+window.location.hash);})();</script>
                <script data-b24-form="inline/61/hi7fex" data-skip-moving="true">(function(w,d,u){var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/180000|0);var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);})(window,document,'https://cdn.bitrix24.es/b23715511/crm/form/loader_61.js');</script>
            </div>
        </div>
    </section>
    </main>
    <!-- Footer institucional -->
${footerHtml()}
        <script src="../../scripts/uap-nav.js"></script>
    <a href="https://wa.me/595981222785?text=Hola%2C%20quisiera%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20UAP." class="whatsapp-float" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp a Recepción">
        <svg viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.83 14.15c-.25.7-1.24 1.29-2.02 1.46-.55.12-1.26.21-3.65-.78-3.06-1.27-5.03-4.34-5.18-4.54-.15-.2-1.23-1.64-1.23-3.12 0-1.48.77-2.2 1.05-2.5.28-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.42-.07.66.5.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.08.13.08.72-.17 1.42z"/></svg>
    </a>
</body>
</html>
`;
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let created = 0;
for (const p of programas) {
  const file = path.join(OUT_DIR, `${p.slug}.html`);
  fs.writeFileSync(file, pageHtml(p), 'utf-8');
  created++;
}
console.log('Landings de posgrado generadas:', created, 'en', path.relative(ROOT_DIR, OUT_DIR));
