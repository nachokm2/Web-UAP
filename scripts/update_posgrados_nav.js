#!/usr/bin/env node
// Actualiza el dropdown "Posgrados" del header (index.html, pages/*.html, pages/carreras/*.html)
// para que apunte a las categorías reales del nuevo posgrados.html (Diplomados, Especializaciones,
// Maestrías, Doctorados) en vez de los anchors inventados (#salud, #sociales, #odontologicas, etc.)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

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

const BLOCK_RE = /(<li class="dropdown">\s*\n\s*<a href="([^"]*)posgrados\.html"[^>]*>Posgrados<\/a>\s*\n\s*<div class="dropdown-content">)[\s\S]*?(<\/div>\s*\n\s*<\/li>)/;

function newInner(prefix) {
  return `
                            <a href="${prefix}posgrados.html#diplomados">Diplomados</a>
                            <a href="${prefix}posgrados.html#especializaciones">Especializaciones</a>
                            <a href="${prefix}posgrados.html#maestrias">Maestrías</a>
                            <a href="${prefix}posgrados.html#doctorados">Doctorados</a>
                        `;
}

let updated = 0, skipped = [];
for (const file of listFiles()) {
  const html = fs.readFileSync(file, 'utf-8');
  const m = html.match(BLOCK_RE);
  if (!m) { skipped.push(path.relative(ROOT, file)); continue; }
  const prefix = m[2];
  const replaced = html.replace(BLOCK_RE, `$1${newInner(prefix)}$3`);
  if (replaced !== html) {
    fs.writeFileSync(file, replaced, 'utf-8');
    updated++;
  }
}
console.log('Actualizados:', updated);
console.log('Sin dropdown de Posgrados (nav simple, sin cambios):', skipped.length);
if (skipped.length) console.log(skipped);
