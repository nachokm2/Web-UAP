#!/usr/bin/env node
'use strict';

// Arma dist/ con SOLO los archivos públicos del sitio estático, para que Railway
// no sirva el repositorio completo (scripts de mantenimiento, data/, notas, etc.).
// Después de copiar, verifica que cada referencia local de los HTML y CSS exista
// dentro de dist/; si falta alguna, el build falla y no se despliega.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const DIRS = ['pages', 'css', 'images', 'icons', 'videos'];
const FILES = ['index.html', 'robots.txt', 'sitemap.xml'];
// JS que cargan las páginas; el resto de scripts/ son herramientas de mantenimiento.
const RUNTIME_SCRIPTS = ['uap-nav.js', 'uap-carrera.js', 'noticias-paginate.js'];

function copy(rel) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) throw new Error('No existe: ' + rel);
    fs.cpSync(src, path.join(DIST, rel), { recursive: true });
}

function walk(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

function localRefs(content, isCss) {
    const refs = [];
    const patterns = [/url\(\s*['"]?([^'")]+)['"]?\s*\)/g];
    if (!isCss) patterns.push(/\s(?:href|src|poster)="([^"]+)"/g);
    for (const re of patterns) {
        for (const m of content.matchAll(re)) {
            const ref = m[1].trim();
            if (!ref || /^(?:[a-z]+:|\/\/|#|\{\{)/i.test(ref)) continue;
            refs.push(ref.split(/[?#]/)[0]);
        }
    }
    return refs;
}

function verify() {
    const missing = [];
    const files = walk(DIST, []).filter(function (f) { return /\.(html|css)$/.test(f); });
    for (const file of files) {
        // Sin comentarios: el CSS documenta patrones como url('...') que no son referencias reales.
        const content = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g, '');
        for (const ref of localRefs(content, file.endsWith('.css'))) {
            const target = ref.startsWith('/') ? path.join(DIST, ref) : path.resolve(path.dirname(file), ref);
            const decoded = decodeURIComponent(target);
            if (!decoded.startsWith(DIST) || !fs.existsSync(decoded)) {
                missing.push(path.relative(DIST, file) + ' -> ' + ref);
            }
        }
    }
    return { checked: files.length, missing: missing };
}

// Los botones con data-brochure-id se resolvían en el navegador contra la API de
// WordPress, pero la caché de SiteGround devuelve algunas respuestas sin la
// cabecera CORS y esos botones quedaban en "#". Acá se resuelven en el build
// (sin CORS) y se escribe el enlace real. Si un ID no se puede resolver, el botón
// conserva data-brochure-id y scripts/uap-carrera.js lo intenta en el navegador.
const WP_MEDIA_API = 'https://uap.edu.py/wp-json/wp/v2/media/';
const ANCHOR_WITH_ID = /<a\b[^>]*\bdata-brochure-id="(\d+)"[^>]*>/g;

async function fetchSourceUrl(id) {
    const res = await fetch(WP_MEDIA_API + id + '?_fields=source_url', { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const url = new URL((await res.json()).source_url);
    if (url.protocol !== 'https:' || url.hostname !== 'uap.edu.py') throw new Error('URL no permitida: ' + url.href);
    return url.href;
}

async function resolveBrochures() {
    const htmlFiles = walk(DIST, []).filter(function (f) { return f.endsWith('.html'); });
    const ids = new Set();
    htmlFiles.forEach(function (f) {
        for (const m of fs.readFileSync(f, 'utf8').matchAll(ANCHOR_WITH_ID)) ids.add(m[1]);
    });

    const resolved = new Map();
    const failed = [];
    const queue = Array.from(ids);
    await Promise.all(Array.from({ length: 8 }, async function () {
        while (queue.length) {
            const id = queue.shift();
            try { resolved.set(id, await fetchSourceUrl(id)); } catch (e) { failed.push(id + ' (' + e.message + ')'); }
        }
    }));

    let links = 0;
    htmlFiles.forEach(function (f) {
        const html = fs.readFileSync(f, 'utf8');
        const out = html.replace(ANCHOR_WITH_ID, function (tag, id) {
            const url = resolved.get(id);
            if (!url || !/\bhref="#"/.test(tag)) return tag;
            links++;
            return tag
                .replace(/\bhref="#"/, 'href="' + url + '"')
                .replace(/\s+data-brochure-id="\d+"/, '')
                .replace(/\s+aria-disabled="true"/, '');
        });
        if (out !== html) fs.writeFileSync(f, out);
    });
    return { ids: ids.size, resolved: resolved.size, links: links, failed: failed };
}

(async function main() {
    fs.rmSync(DIST, { recursive: true, force: true });
    fs.mkdirSync(DIST, { recursive: true });
    DIRS.forEach(copy);
    FILES.forEach(copy);
    fs.mkdirSync(path.join(DIST, 'scripts'));
    RUNTIME_SCRIPTS.forEach(function (name) { copy(path.join('scripts', name)); });

    const result = verify();
    if (result.missing.length) {
        console.error('Referencias locales sin archivo en dist/ (' + result.missing.length + '):');
        result.missing.slice(0, 50).forEach(function (m) { console.error('  ' + m); });
        process.exit(1);
    }

    const brochures = await resolveBrochures();
    console.log('Brochures/PDF: ' + brochures.resolved + '/' + brochures.ids + ' IDs de WordPress resueltos, ' + brochures.links + ' enlaces escritos.');
    if (brochures.failed.length) {
        console.warn('Sin resolver (quedan con resolución en el navegador): ' + brochures.failed.join(', '));
    }
    console.log('dist/ listo: ' + walk(DIST, []).length + ' archivos; ' + result.checked + ' HTML/CSS verificados, 0 referencias rotas.');
})().catch(function (e) {
    console.error(e);
    process.exit(1);
});
