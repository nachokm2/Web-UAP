#!/usr/bin/env node
// Quita .btn-glass/.brochure-btn-glass (+:hover) del <style> inline de las 23 páginas de carrera,
// ahora que viven una sola vez en css/uap-refined.css (ver K-04/K-06 de la auditoría UX/UI).
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'pages', 'carreras');

const RULES = [
  /\s*\.btn-glass \{[^}]*\}/,
  /\s*\.btn-glass:hover \{[^}]*\}/,
  /\s*\.brochure-btn-glass \{[^}]*\}/,
  /\s*\.brochure-btn-glass:hover \{[^}]*\}/,
];

let updated = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.html')) continue;
  const file = path.join(DIR, f);
  let html = fs.readFileSync(file, 'utf-8');
  const before = html;
  for (const re of RULES) html = html.replace(re, '');
  if (html !== before) {
    fs.writeFileSync(file, html, 'utf-8');
    updated++;
  }
}
console.log('Archivos actualizados:', updated);
