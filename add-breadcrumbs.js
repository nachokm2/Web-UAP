const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// Map filename → breadcrumb label for pages/*.html
const pageLabels = {
    'carreras.html': 'Carreras',
    'contacto.html': 'Contacto',
    'estudiantes.html': 'Estudiantes',
    'inscripcion.html': 'Inscripción',
    'institucional.html': 'Institucional',
    'investigacion.html': 'Investigación',
    'noticias.html': 'Noticias',
    'posgrados.html': 'Posgrados',
    'privacidad.html': 'Privacidad',
};

// Map filename → label for pages/carreras/*.html
const carreraLabels = {
    'administracion-de-empresas.html': 'Administración de Empresas',
    'administracion-publica.html': 'Administración Pública',
    'ciencias-contables.html': 'Ciencias Contables',
    'ciencias-de-la-educacion.html': 'Ciencias de la Educación',
    'contabilidad-y-auditoria.html': 'Contabilidad y Auditoría',
    'contaduria-publica.html': 'Contaduría Pública',
    'derecho.html': 'Derecho',
    'educacion-parvularia.html': 'Educación Parvularia',
    'fisioterapia.html': 'Fisioterapia',
    'fonoaudiologia.html': 'Fonoaudiología',
    'ingenieria-comercial.html': 'Ingeniería Comercial',
    'ingenieria-en-comercio-internacional.html': 'Ingeniería en Comercio Internacional',
    'ingenieria-en-informatica.html': 'Ingeniería en Informática',
    'ingenieria-en-marketing.html': 'Ingeniería en Marketing',
    'ingenieria-en-tecnologia-de-alimentos.html': 'Ingeniería en Tecnología de Alimentos',
    'marketing-y-publicidad.html': 'Marketing y Publicidad',
    'nutricion.html': 'Nutrición',
    'odontologia.html': 'Odontología',
    'optica-y-contactologia.html': 'Óptica y Contactología',
    'periodismo.html': 'Periodismo',
    'podologia.html': 'Podología',
    'psicologia.html': 'Psicología',
    'trabajo-social.html': 'Trabajo Social',
};

function makeBreadcrumb(items) {
    const listItems = items.map((item, i) => {
        const pos = i + 1;
        if (item.href) {
            return `      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="${item.href}"><span itemprop="name">${item.label}</span></a>
        <meta itemprop="position" content="${pos}" />
      </li>`;
        } else {
            return `      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name">${item.label}</span>
        <meta itemprop="position" content="${pos}" />
      </li>`;
        }
    }).join('\n');

    return `    <nav aria-label="Ubicación en el sitio" class="breadcrumb-nav">
      <div class="container">
        <ol class="breadcrumb" itemscope itemtype="https://schema.org/BreadcrumbList">
${listItems}
        </ol>
      </div>
    </nav>`;
}

function addBreadcrumb(filePath, breadcrumbHtml) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('breadcrumb-nav')) {
        console.log(`SKIP (already has breadcrumb): ${path.basename(filePath)}`);
        return;
    }
    // Insert breadcrumb right after </header>
    if (!html.includes('</header>')) {
        console.log(`SKIP (no </header>): ${path.basename(filePath)}`);
        return;
    }
    html = html.replace('</header>', '</header>\n' + breadcrumbHtml);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ Updated: ${path.relative(ROOT, filePath)}`);
}

// pages/*.html
const pagesDir = path.join(ROOT, 'pages');
for (const [filename, label] of Object.entries(pageLabels)) {
    const filePath = path.join(pagesDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const breadcrumb = makeBreadcrumb([
        { label: 'Inicio', href: '../index.html' },
        { label },
    ]);
    addBreadcrumb(filePath, breadcrumb);
}

// pages/carreras/*.html
const carrerasDir = path.join(ROOT, 'pages', 'carreras');
for (const [filename, label] of Object.entries(carreraLabels)) {
    const filePath = path.join(carrerasDir, filename);
    if (!fs.existsSync(filePath)) continue;
    const breadcrumb = makeBreadcrumb([
        { label: 'Inicio', href: '../../index.html' },
        { label: 'Carreras', href: '../carreras.html' },
        { label },
    ]);
    addBreadcrumb(filePath, breadcrumb);
}

console.log('\nDone.');
