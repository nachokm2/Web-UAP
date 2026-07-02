#!/usr/bin/env node
// Agrega el patrón ARIA de tabs (WAI-ARIA APG) a las pestañas de "Plan de Estudios" de las
// 23 páginas de carrera: role="tablist"/"tab"/"tabpanel", aria-selected, aria-controls,
// aria-labelledby y roving tabindex. La navegación con flechas/Home/End se agrega en
// scripts/uap-carrera.js.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'pages', 'carreras');

let updated = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.html')) continue;
  const file = path.join(DIR, f);
  let html = fs.readFileSync(file, 'utf-8');
  if (html.includes('role="tablist"')) continue;

  const before = html;

  html = html.replace(
    '<div class="malla-tabs" id="malla-tabs">',
    '<div class="malla-tabs" id="malla-tabs" role="tablist" aria-label="Plan de estudios por semestre">'
  );

  html = html.replace(
    /<button class="malla-tab( active)?" data-sem="(\d+)">/g,
    (_, active, sem) => `<button class="malla-tab${active || ''}" data-sem="${sem}" role="tab" id="malla-tab-${sem}" aria-controls="malla-panel-${sem}" aria-selected="${active ? 'true' : 'false'}" tabindex="${active ? '0' : '-1'}">`
  );

  html = html.replace(
    /<div class="malla-panel" data-semester="(\d+)"( style="display:none")?>/g,
    (_, sem, hidden) => `<div class="malla-panel" data-semester="${sem}"${hidden || ''} role="tabpanel" id="malla-panel-${sem}" aria-labelledby="malla-tab-${sem}" tabindex="0">`
  );

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf-8');
    updated++;
  } else {
    console.log('SIN cambios (patrón no encontrado):', f);
  }
}
console.log('Archivos actualizados:', updated);
