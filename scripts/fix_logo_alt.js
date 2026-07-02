#!/usr/bin/env node
// Unifica el alt text del logo de UAP en las 33 páginas. Hoy convive "UAP", "UAP - ..." (guion)
// y "UAP – ..." (en dash) según el archivo; se estandariza al texto completo con en dash, que
// ya es el usado en el logo del footer en todo el sitio.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STANDARD_ALT = 'UAP – Universidad Autónoma del Paraguay';

function listFiles() {
  const files = [path.join(ROOT, 'index.html')];
  for (const f of fs.readdirSync(path.join(ROOT, 'pages'))) {
    if (f.endsWith('.html')) files.push(path.join(ROOT, 'pages', f));
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'pages', 'carreras'))) {
    if (f.endsWith('.html')) files.push(path.join(ROOT, 'pages', 'carreras', f));
  }
  return files;
}

// Sólo toca <img> cuyo src apunte al logo (logo-uap.png o logo-white.png), sin tocar
// alt text de imágenes no relacionadas (ej. noticias, que también contienen "UAP" en su alt).
const LOGO_IMG_RE = /(<img\s+src="[^"]*logo-(?:uap|white)\.(?:png|svg)"[^>]*\balt=")[^"]*(")/g;

let updated = 0, replacements = 0;
for (const file of listFiles()) {
  const html = fs.readFileSync(file, 'utf-8');
  let count = 0;
  const newHtml = html.replace(LOGO_IMG_RE, (_, pre, post) => {
    count++;
    return pre + STANDARD_ALT + post;
  });
  if (newHtml !== html) {
    fs.writeFileSync(file, newHtml, 'utf-8');
    updated++;
    replacements += count;
  }
}
console.log('Archivos actualizados:', updated, '/ Ocurrencias de alt normalizadas:', replacements);
