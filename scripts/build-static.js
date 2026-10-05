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
console.log('dist/ listo: ' + walk(DIST, []).length + ' archivos; ' + result.checked + ' HTML/CSS verificados, 0 referencias rotas.');
