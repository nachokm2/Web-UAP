/**
 * Descarga las fuentes Google Fonts de forma local.
 * Ejecutar una sola vez: node download-fonts.js
 * Después de ejecutar, el sitio ya no depende de Google Fonts CDN.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS_DIR = path.join(__dirname, 'css', 'fonts');

// URLs verificadas contra fonts.googleapis.com el 2026-07-02 (las anteriores estaban vencidas:
// Google Fonts rota los hashes de archivo entre versiones y 5 de las 6 URLs previas daban 404).
// Playfair Display, JetBrains Mono e Inter se sirven hoy como "variable fonts": un solo archivo
// cubre todo el rango de pesos, por eso hay un único request por familia/estilo en vez de uno por peso.
const FONT_REQUESTS = [
    {
        name: 'playfair-variable',
        url: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2'
    },
    {
        name: 'playfair-variable-italic',
        url: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTXtHA-Q.woff2'
    },
    {
        name: 'jetbrains-variable',
        url: 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbv2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwBNntkaToggR7BYRbKPxDcwg.woff2'
    },
    {
        name: 'inter-variable',
        url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2'
    }
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                fs.unlinkSync(dest);
                download(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} para ${url}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        });
        req.on('error', err => { fs.unlink(dest, () => {}); reject(err); });
    });
}

async function main() {
    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
        console.log('Directorio creado:', FONTS_DIR);
    }

    for (const font of FONT_REQUESTS) {
        const dest = path.join(FONTS_DIR, font.name + '.woff2');
        if (fs.existsSync(dest)) {
            console.log('Ya existe, saltando:', font.name);
            continue;
        }
        process.stdout.write(`Descargando ${font.name}... `);
        try {
            await download(font.url, dest);
            console.log('OK');
        } catch (err) {
            console.log('ERROR:', err.message);
        }
    }

    console.log('\nFuentes descargadas en:', FONTS_DIR);
    console.log('Pasos siguientes:');
    console.log('1. Verificar que los archivos .woff2 existen en css/fonts/');
    console.log('2. Eliminar las 3 lineas de Google Fonts en index.html');
    console.log('3. Las declaraciones @font-face ya están en uap-refined.css');
}

main().catch(console.error);
