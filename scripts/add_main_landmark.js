#!/usr/bin/env node
// A-03: agrega el landmark <main id="main-content"> a las 23 páginas de carrera (index.html,
// posgrados.html e institucional.html ya lo tenían). Envuelve todo el contenido entre el cierre
// del breadcrumb (`    </nav>`, 4 espacios de indentación — distinto del cierre del nav del
// header, que tiene 12) y el comentario "Footer institucional".
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'pages', 'carreras');
const BREADCRUMB_CLOSE_RE = /\r?\n {4}<\/nav>\r?\n/;
const FOOTER_COMMENT = '<!-- Footer institucional -->';

let updated = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.html')) continue;
  const file = path.join(DIR, f);
  let html = fs.readFileSync(file, 'utf-8');
  if (html.includes('<main id="main-content">')) continue;

  const m = html.match(BREADCRUMB_CLOSE_RE);
  const footerIdx = html.indexOf(FOOTER_COMMENT);
  if (!m || footerIdx === -1) { console.log('SIN anclas esperadas:', f); continue; }

  const insertAfter = m.index + m[0].length;
  const newHtml =
    html.slice(0, insertAfter) +
    '\r\n    <main id="main-content">\r\n' +
    html.slice(insertAfter, footerIdx) +
    '    </main>\r\n' +
    html.slice(footerIdx);

  fs.writeFileSync(file, newHtml, 'utf-8');
  updated++;
}
console.log('Archivos actualizados:', updated);
