#!/usr/bin/env node
// Agrega/uniforma el favicon (isotipo cuadrado en SVG, con fallback PNG) en las 33 páginas.
// Idempotente: si ya existe un bloque de favicon con este marcador, lo reemplaza en vez de duplicarlo.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function listFiles() {
  const files = [{ file: path.join(ROOT, 'index.html'), prefix: '' }];
  for (const f of fs.readdirSync(path.join(ROOT, 'pages'))) {
    if (f.endsWith('.html')) files.push({ file: path.join(ROOT, 'pages', f), prefix: '../' });
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'pages', 'carreras'))) {
    if (f.endsWith('.html')) files.push({ file: path.join(ROOT, 'pages', 'carreras', f), prefix: '../../' });
  }
  return files;
}

function faviconBlock(prefix) {
  return `    <link rel="icon" type="image/svg+xml" href="${prefix}images/favicon.svg">
    <link rel="icon" type="image/png" href="${prefix}images/logo-uap.png">
`;
}

const OLD_ICON_RE = /^[ \t]*<link rel="icon"[^>]*>[ \t]*\r?\n/gm;
const STYLESHEET_RE = /([ \t]*)(<link rel="stylesheet" href="[^"]*uap-refined\.css[^"]*">)/;

let updated = 0;
for (const { file, prefix } of listFiles()) {
  const html = fs.readFileSync(file, 'utf-8');
  const withoutOldIcons = html.replace(OLD_ICON_RE, '');
  if (!STYLESHEET_RE.test(withoutOldIcons)) { console.log('SIN <link rel=stylesheet> uap-refined.css:', path.relative(ROOT, file)); continue; }
  const newHtml = withoutOldIcons.replace(STYLESHEET_RE, (_, indent, tag) => `${faviconBlock(prefix)}${indent}${tag}`);
  if (newHtml !== html) {
    fs.writeFileSync(file, newHtml, 'utf-8');
    updated++;
  }
}
console.log('Actualizados:', updated);
