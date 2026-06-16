/**
 * Descarga las fuentes Google Fonts de forma local.
 * Ejecutar una sola vez: node download-fonts.js
 * Después de ejecutar, el sitio ya no depende de Google Fonts CDN.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const FONTS_DIR = path.join(__dirname, 'css', 'fonts');

const FONT_REQUESTS = [
    {
        name: 'playfair-400',
        url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xRbPQ.woff2'
    },
    {
        name: 'playfair-600',
        url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXJDHYgEM86xRbPQ.woff2'
    },
    {
        name: 'playfair-700',
        url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXBTLYgEM86xRbPQ.woff2'
    },
    {
        name: 'playfair-400-italic',
        url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXBYf9lW4e5j5hNKc.woff2'
    },
    {
        name: 'jetbrains-400',
        url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOTk6OThhvAWV8.woff2'
    },
    {
        name: 'jetbrains-500',
        url: 'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOlOTk6OThhnAWV8.woff2'
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
