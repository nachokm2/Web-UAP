#!/usr/bin/env node
// Verifica con HEAD requests que todos los recursos externos migrados (brochures, reglamentos,
// noticias) respondan 200 y no 404. Concurrencia limitada para no saturar uap.edu.py.
const posgrados = require('../data/posgrados.json');
const reglamentos = require('../data/reglamentos.json');
const noticias = require('../data/noticias.json');
const fs = require('fs');
const path = require('path');

const urls = new Set();
posgrados.forEach(p => { if (p.brochure_url) urls.add(p.brochure_url); });
reglamentos.forEach(r => urls.add(r.url));
noticias.forEach(n => { urls.add(n.imagen); urls.add(n.url_original); });

// Brochures de las 23 carreras de grado
const carrerasDir = path.join(__dirname, '..', 'pages', 'carreras');
for (const f of fs.readdirSync(carrerasDir)) {
  if (!f.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(carrerasDir, f), 'utf-8');
  const m = html.match(/href="([^"]+)" class="brochure-btn-glass"/);
  if (m) urls.add(m[1]);
}

const list = [...urls].filter(Boolean);
console.log('Total URLs a verificar:', list.length);

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { url, status: res.status, ok: res.ok };
  } catch (e) {
    return { url, status: 'ERROR', ok: false, error: e.message };
  }
}

async function run() {
  const CONCURRENCY = 8;
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < list.length) {
      const i = idx++;
      results.push(await checkUrl(list[i]));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const broken = results.filter(r => !r.ok);
  console.log('OK:', results.length - broken.length, '/ Rotos:', broken.length);
  broken.forEach(b => console.log(' -', b.status, b.url));
  fs.writeFileSync(path.join(__dirname, '..', '..', '.firecrawl', 'link-check-results.json'), JSON.stringify(results, null, 2));
}

run();
