#!/usr/bin/env node
// Regenera el bloque de contenido de pages/posgrados.html a partir de data/posgrados.json
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data', 'posgrados.json');
const TARGET = path.join(__dirname, '..', 'pages', 'posgrados.html');

const programas = require(DATA);

const BADGE_CLASS = {
  'Diplomado': '',
  'Especialización': 'badge-especializacion',
  'Maestría': 'badge-maestria',
  'Doctorado': 'badge-doctorado',
  'Maestría y Doctorado': 'badge-doctorado',
};

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
}

function card(p) {
  const badge = BADGE_CLASS[p.tipo] || '';
  const meta = [p.duracion, p.modalidad].filter(Boolean).join(' · ');
  const desc = truncate(p.descripcion, 150);
  const brochure = p.brochure_url
    ? `<a href="${esc(p.brochure_url)}" class="posgrado-brochure-link" target="_blank" rel="noopener">Descargar Brochure</a>`
    : '';
  return `                        <div class="career-card">
                            <div class="posgrado-badge ${badge}">${esc(p.tipo)}</div>
                            <h3>${esc(p.nombre)}</h3>
                            ${meta ? `<p class="posgrado-meta">${esc(meta)}</p>` : ''}
                            ${desc ? `<p>${esc(desc)}</p>` : ''}
                            ${brochure}
                        </div>`;
}

function section(id, title, items, subgroupByCategoria) {
  let body;
  if (subgroupByCategoria) {
    const byCat = {};
    items.forEach(p => { (byCat[p.categoria] = byCat[p.categoria] || []).push(p); });
    body = Object.entries(byCat).map(([cat, group]) => `
                    <h3 class="posgrado-subtitle">${esc(cat)}</h3>
                    <div class="careers-grid">
${group.map(card).join('\n')}
                    </div>`).join('\n');
  } else {
    body = `
                    <div class="careers-grid">
${items.map(card).join('\n')}
                    </div>`;
  }
  return `                <div class="faculty-section" id="${id}">
                    <h2 class="faculty-title">${esc(title)}</h2>${body}
                </div>`;
}

const diplomados = programas.filter(p => p.tipo === 'Diplomado');
const especializaciones = programas.filter(p => p.tipo === 'Especialización');
const maestrias = programas.filter(p => p.tipo === 'Maestría' || p.tipo === 'Maestría y Doctorado');
const doctorados = programas.filter(p => p.tipo === 'Doctorado');

const content = [
  section('diplomados', 'Diplomados', diplomados, true),
  section('especializaciones', 'Especializaciones', especializaciones, true),
  section('maestrias', 'Maestrías', maestrias, false),
  section('doctorados', 'Doctorados', doctorados, false),
].join('\n\n');

const lines = fs.readFileSync(TARGET, 'utf-8').split('\n');
const startIdx = lines.findIndex(l => l.trim() === '<section class="section section-alt">');
if (startIdx === -1) throw new Error('No se encontró <section class="section section-alt"> en posgrados.html');
const containerIdx = startIdx + 1;
if (lines[containerIdx].trim() !== '<div class="container">') {
  throw new Error('Estructura inesperada: se esperaba <div class="container"> justo después de la sección');
}
let endIdx = -1;
for (let i = containerIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === '</section>') { endIdx = i; break; }
}
if (endIdx === -1) throw new Error('No se encontró el </section> de cierre en posgrados.html');
// endIdx es la línea "</section>"; la línea anterior con el </div> del container también se descarta
const newLines = [
  ...lines.slice(0, containerIdx + 1),
  content,
  '            </div>',
  ...lines.slice(endIdx, lines.length),
];
fs.writeFileSync(TARGET, newLines.join('\n'), 'utf-8');
console.log('posgrados.html actualizado:', programas.length, 'programas',
  `(${diplomados.length} diplomados, ${especializaciones.length} especializaciones, ${maestrias.length} maestrías, ${doctorados.length} doctorados)`);
