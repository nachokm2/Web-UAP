#!/usr/bin/env node
// Quita el <style> inline (glassmorphism) de las 23 páginas de carrera, ahora que vive una sola
// vez en css/uap-refined.css (ver K-06 de la auditoría UX/UI). La imagen del hero, única variación
// real entre páginas, pasa a una custom property en el propio elemento .career-hero-glass.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'pages', 'carreras');
const STYLE_RE = /\n?[ \t]*<style>\s*\/\*[\s\S]*?<\/style>\n?/;

let updated = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.html')) continue;
  const file = path.join(DIR, f);
  let html = fs.readFileSync(file, 'utf-8');

  const heroMatch = html.match(/url\('([^']*images\/heroes\/[^']*)'\)/);
  if (!heroMatch) { console.log('SIN imagen de hero:', f); continue; }
  const heroUrl = heroMatch[1];

  const before = html;
  html = html.replace(STYLE_RE, '\n');
  if (html === before) { console.log('SIN <style> removido:', f); continue; }

  html = html.replace(
    '<section class="career-hero-glass">',
    `<section class="career-hero-glass" style="--hero-image: url('${heroUrl}')">`
  );

  fs.writeFileSync(file, html, 'utf-8');
  updated++;
}
console.log('Archivos actualizados:', updated);
