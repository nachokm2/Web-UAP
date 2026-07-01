#!/usr/bin/env node
// Reemplaza los 6 reglamentos placeholder (href="#") de institucional.html por los reales
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data', 'reglamentos.json');
const TARGET = path.join(__dirname, '..', 'pages', 'institucional.html');

const reglamentos = require(DATA);

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const ACRONYMS = new Set(['uap', 'ua', 'mec', 'aneaes', 'rrhh', 'bim']);

function toTitleCase(s) {
  return s.toLowerCase()
    .replace(/(^|\s|\/|-)([a-záéíóúñ])/g, (_, sep, c) => sep + c.toUpperCase())
    .split(/(\s|\/|-)/)
    .map(w => ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w)
    .join('');
}

const items = reglamentos.map(r => `                    <div class="regulation-item">
                        <strong>${esc(toTitleCase(r.nombre))}</strong><br>
                        <a href="${esc(r.url)}" target="_blank" rel="noopener">Descargar PDF</a>
                    </div>`).join('\n');

// El bloque de reglamentos siempre termina justo antes del comentario "Reconocimientos" (marcador
// estable en institucional.html), así que se reemplaza todo lo que hay entre el div de apertura
// y ese comentario en vez de intentar contar profundidad de <div> (frágil si el bloque ya quedó
// con contenido residual de una corrida anterior).
const html = fs.readFileSync(TARGET, 'utf-8');
const re = /<div class="regulations-list">[\s\S]*?<!-- Reconocimientos -->/;
if (!re.test(html)) throw new Error('No se encontró el bloque regulations-list ... <!-- Reconocimientos --> en institucional.html');
const replacement = `<div class="regulations-list">\n${items}\n                </div>\n            </section>\n\n            <!-- Reconocimientos -->`;
fs.writeFileSync(TARGET, html.replace(re, replacement), 'utf-8');
console.log('institucional.html actualizado:', reglamentos.length, 'reglamentos');
