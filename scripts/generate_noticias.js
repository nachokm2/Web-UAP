#!/usr/bin/env node
// Regenera el grid de pages/noticias.html a partir de data/noticias.json
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data', 'noticias.json');
const TARGET = path.join(__dirname, '..', 'pages', 'noticias.html');

const noticias = require(DATA); // ya viene ordenado por fecha descendente

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatFecha(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1][0].toUpperCase()}${MESES[m - 1].slice(1)}, ${y}`;
}

const PAGE_SIZE = 12;

function card(n, idx) {
  const hidden = idx >= PAGE_SIZE ? ' style="display:none"' : '';
  const batch = Math.floor(idx / PAGE_SIZE);
  return `                <article class="news-card" data-batch="${batch}"${hidden}>
                    <div class="news-image"><img src="${esc(n.imagen)}" alt="${esc(n.titulo)}" loading="lazy"></div>
                    <div class="news-content">
                        <div class="news-meta"><span class="news-tag">${esc(n.categoria)}</span><span class="news-date">${formatFecha(n.fecha)}</span></div>
                        <h3>${esc(n.titulo)}</h3>
                        ${n.excerpt ? `<p>${esc(n.excerpt)}</p>` : ''}
                        <a href="${esc(n.url_original)}" class="news-link" target="_blank" rel="noopener">Leer más →</a>
                    </div>
                </article>`;
}

const totalBatches = Math.ceil(noticias.length / PAGE_SIZE);
const grid = noticias.map(card).join('\n');
const loadMoreBtn = totalBatches > 1
  ? `\n            <div style="text-align:center; margin-top: 32px;">
                <button id="noticias-load-more" class="btn btn-primary" data-next-batch="1" data-total-batches="${totalBatches}">Cargar más noticias</button>
            </div>`
  : '';

const html = fs.readFileSync(TARGET, 'utf-8');
const lines = html.split('\n');
const gridStart = lines.findIndex(l => l.trim() === '<div class="news-grid">');
if (gridStart === -1) throw new Error('No se encontró <div class="news-grid"> en noticias.html');
let depth = 0, gridEnd = -1;
for (let i = gridStart; i < lines.length; i++) {
  depth += (lines[i].match(/<div/g) || []).length;
  depth -= (lines[i].match(/<\/div>/g) || []).length;
  if (i > gridStart && depth === 0) { gridEnd = i; break; }
}
if (gridEnd === -1) throw new Error('No se pudo determinar el cierre de news-grid');

const newLines = [
  ...lines.slice(0, gridStart),
  '<div class="news-grid">',
  grid,
  '            </div>' + loadMoreBtn,
  ...lines.slice(gridEnd + 1),
];

let newHtml = newLines.join('\n');
if (!newHtml.includes('scripts/noticias-paginate.js')) {
  newHtml = newHtml.replace('<script src="../scripts/uap-nav.js"></script>',
    '<script src="../scripts/uap-nav.js"></script>\n    <script src="../scripts/noticias-paginate.js"></script>');
}
fs.writeFileSync(TARGET, newHtml, 'utf-8');
console.log('noticias.html actualizado:', noticias.length, 'noticias en', totalBatches, 'lotes de', PAGE_SIZE);
