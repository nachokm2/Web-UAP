#!/usr/bin/env node
'use strict';

// Migra reglamentos (PDF), imagenes de noticias y brochures de carreras
// desde uap.edu.py (WordPress) al bucket "rbrochures" de Supabase Storage.
// Requiere SUPABASE_URL y SUPABASE_SECRET_KEY como variables de entorno.

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = 'rbrochures';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Falta SUPABASE_URL o SUPABASE_SECRET_KEY en el entorno.');
    process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function filenameFromUrl(url) {
    try {
        const u = new URL(url);
        return sanitizeFilename(decodeURIComponent(path.basename(u.pathname)));
    } catch (e) {
        return sanitizeFilename(path.basename(url));
    }
}

async function downloadBuffer(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    return { buf, contentType };
}

async function uploadToSupabase(folder, filename, buf, contentType) {
    const objectPath = folder + '/' + filename;
    const uploadUrl = SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + objectPath;
    const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'apikey': SUPABASE_KEY,
            'Content-Type': contentType,
            'x-upsert': 'true',
        },
        body: buf,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error('Upload ' + objectPath + ' -> ' + res.status + ': ' + text);
    }
    return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + objectPath;
}

async function migrateReglamentos() {
    const file = path.join(ROOT, 'data', 'reglamentos.json');
    const items = JSON.parse(fs.readFileSync(file, 'utf8'));
    let ok = 0, fail = 0;
    for (const item of items) {
        const filename = filenameFromUrl(item.url);
        process.stdout.write('reglamento: ' + filename + ' ... ');
        try {
            const { buf, contentType } = await downloadBuffer(item.url);
            item.url = await uploadToSupabase('reglamentos', filename, buf, contentType);
            console.log('OK');
            ok++;
        } catch (e) {
            console.log('FAIL: ' + e.message);
            fail++;
        }
    }
    fs.writeFileSync(file, JSON.stringify(items, null, 2) + '\n');
    console.log('reglamentos:', ok, 'ok,', fail, 'fail');
}

async function migrateNoticias() {
    const file = path.join(ROOT, 'data', 'noticias.json');
    const items = JSON.parse(fs.readFileSync(file, 'utf8'));
    let ok = 0, fail = 0;
    for (const item of items) {
        if (!item.imagen) continue;
        const filename = filenameFromUrl(item.imagen);
        process.stdout.write('noticia: ' + filename + ' ... ');
        try {
            const { buf, contentType } = await downloadBuffer(item.imagen);
            item.imagen = await uploadToSupabase('noticias', filename, buf, contentType);
            console.log('OK');
            ok++;
        } catch (e) {
            console.log('FAIL: ' + e.message);
            fail++;
        }
    }
    fs.writeFileSync(file, JSON.stringify(items, null, 2) + '\n');
    console.log('noticias:', ok, 'ok,', fail, 'fail');
}

async function migrateBrochures() {
    const carrerasDir = path.join(ROOT, 'pages', 'carreras');
    const files = fs.readdirSync(carrerasDir).filter(function (f) { return f.endsWith('.html'); });
    let ok = 0, fail = 0;
    for (const f of files) {
        const filePath = path.join(carrerasDir, f);
        let html = fs.readFileSync(filePath, 'utf8');
        const match = html.match(/data-brochure-id="(\d+)"/);
        if (!match) continue;
        const mediaId = match[1];
        process.stdout.write('brochure ' + f + ' (id ' + mediaId + ') ... ');
        try {
            const metaRes = await fetch('https://uap.edu.py/wp-json/wp/v2/media/' + mediaId + '?_fields=source_url');
            if (!metaRes.ok) throw new Error('media API -> ' + metaRes.status);
            const meta = await metaRes.json();
            if (!meta.source_url) throw new Error('sin source_url');
            const { buf, contentType } = await downloadBuffer(meta.source_url);
            const filename = filenameFromUrl(meta.source_url);
            const publicUrl = await uploadToSupabase('brochures', filename, buf, contentType);

            const anchorRegex = /<a href="#" class="brochure-btn-glass" data-brochure-id="\d+" aria-disabled="true"([^>]*)>/;
            if (!anchorRegex.test(html)) throw new Error('no se encontro el anchor esperado en el HTML');
            html = html.replace(anchorRegex, function (m, rest) {
                return '<a href="' + publicUrl + '" class="brochure-btn-glass"' + rest + '>';
            });
            fs.writeFileSync(filePath, html);
            console.log('OK');
            ok++;
        } catch (e) {
            console.log('FAIL: ' + e.message);
            fail++;
        }
    }
    console.log('brochures:', ok, 'ok,', fail, 'fail');
}

(async function main() {
    await migrateReglamentos();
    await migrateNoticias();
    await migrateBrochures();
})();
