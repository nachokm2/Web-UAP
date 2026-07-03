#!/usr/bin/env node
// K-07: fuente única de verdad para el header. Antes cada una de las 33 páginas tenía su propio
// <header>...</header> copiado a mano — lo que ya causó bugs reales (pages/posgrados.html y
// pages/estudiantes.html tenían 13 links rotos cada uno en el dropdown de Carreras, con slugs
// viejos como "carreras/admin-empresas.html" que no existen) y una inconsistencia de orden del
// menú (Institucional antes que Noticias en 2 páginas, al revés en las otras 31).
//
// Este script lee partials/header.html (páginas normales) y partials/header-career.html
// (pages/carreras/*.html, que usan un dropdown de Carreras en 3 columnas con links entre
// hermanos) y reemplaza el <header>...</header> de cada una de las 33 páginas por la versión
// canónica, sustituyendo {{ROOT}}/{{PAGES}}/{{CARRERAS}} según la profundidad del archivo y
// marcando class="nav-active" en el ítem que corresponda.
//
// Uso: editar partials/header.html o partials/header-career.html y correr
// `node scripts/sync_partials.js` para propagar el cambio a las 33 páginas.
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// nombre de archivo -> texto del link de nav que debe llevar class="nav-active" (null = ninguno)
const ACTIVE_NAV = {
  'index.html': 'Inicio',
  'carreras.html': 'Carreras',
  'posgrados.html': 'Posgrados',
  'noticias.html': 'Noticias',
  'institucional.html': 'Institucional',
  'investigacion.html': 'Investigación',
  'estudiantes.html': 'Estudiantes',
  'contacto.html': 'Contacto',
  'inscripcion.html': null,
  'privacidad.html': null,
};

function applyActiveNav(headerHtml, activeText) {
  if (!activeText) return headerHtml;
  // Sólo en el <a> de primer nivel (no en los links del dropdown, que repiten "Posgrados" etc. como texto de sección)
  const re = new RegExp('(<a href="[^"]*")(>' + activeText + '</a>)');
  return headerHtml.replace(re, '$1 class="nav-active"$2');
}

function fillTemplate(tpl, tokens) {
  let out = tpl;
  for (const [key, value] of Object.entries(tokens)) {
    out = out.split('{{' + key + '}}').join(value);
  }
  return out;
}

function replaceHeader(html, newHeader) {
  const start = html.indexOf('<header');
  const end = html.indexOf('</header>');
  if (start === -1 || end === -1) return null;
  const endTagEnd = end + '</header>'.length;
  return html.slice(0, start) + newHeader.trim() + html.slice(endTagEnd);
}

function processFile(file, template, tokens, activeFilename) {
  const html = fs.readFileSync(file, 'utf-8');
  let newHeader = fillTemplate(template, tokens);
  newHeader = applyActiveNav(newHeader, ACTIVE_NAV[activeFilename]);
  const newHtml = replaceHeader(html, newHeader);
  if (newHtml === null) { console.log('SIN <header>:', path.relative(ROOT_DIR, file)); return false; }
  if (newHtml !== html) {
    fs.writeFileSync(file, newHtml, 'utf-8');
    return true;
  }
  return false;
}

const headerTpl = fs.readFileSync(path.join(ROOT_DIR, 'partials', 'header.html'), 'utf-8');
const headerCareerTpl = fs.readFileSync(path.join(ROOT_DIR, 'partials', 'header-career.html'), 'utf-8');
const headerPosgradoTpl = fs.readFileSync(path.join(ROOT_DIR, 'partials', 'header-posgrado.html'), 'utf-8');

let updated = 0;

// index.html
if (processFile(path.join(ROOT_DIR, 'index.html'), headerTpl, { ROOT: '', PAGES: 'pages/', CARRERAS: 'pages/carreras/' }, 'index.html')) updated++;

// pages/*.html
for (const f of fs.readdirSync(path.join(ROOT_DIR, 'pages'))) {
  if (!f.endsWith('.html')) continue;
  if (processFile(path.join(ROOT_DIR, 'pages', f), headerTpl, { ROOT: '../', PAGES: '', CARRERAS: 'carreras/' }, f)) updated++;
}

// pages/carreras/*.html
for (const f of fs.readdirSync(path.join(ROOT_DIR, 'pages', 'carreras'))) {
  if (!f.endsWith('.html')) continue;
  if (processFile(path.join(ROOT_DIR, 'pages', 'carreras', f), headerCareerTpl, { ROOT: '../../', PAGES: '../' }, f)) updated++;
}

// pages/posgrados/*.html (landings de programas de posgrado)
const posgradoDir = path.join(ROOT_DIR, 'pages', 'posgrados');
if (fs.existsSync(posgradoDir)) {
  for (const f of fs.readdirSync(posgradoDir)) {
    if (!f.endsWith('.html')) continue;
    if (processFile(path.join(posgradoDir, f), headerPosgradoTpl, { ROOT: '../../', PAGES: '../' }, f)) updated++;
  }
}

console.log('Archivos actualizados:', updated);
