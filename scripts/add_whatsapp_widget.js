#!/usr/bin/env node
// Inserta el botón flotante de WhatsApp (Recepción: +595 981 222 785) antes de </body>
// en todas las páginas del sitio. Idempotente: si ya existe, no lo duplica.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function listFiles() {
  const files = [path.join(ROOT, 'index.html')];
  for (const f of fs.readdirSync(path.join(ROOT, 'pages'))) {
    if (f.endsWith('.html')) files.push(path.join(ROOT, 'pages', f));
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'pages', 'carreras'))) {
    if (f.endsWith('.html')) files.push(path.join(ROOT, 'pages', 'carreras', f));
  }
  return files;
}

const WIDGET = `    <a href="https://wa.me/595981222785?text=Hola%2C%20quisiera%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20UAP." class="whatsapp-float" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp a Recepción">
        <svg viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.83 14.15c-.25.7-1.24 1.29-2.02 1.46-.55.12-1.26.21-3.65-.78-3.06-1.27-5.03-4.34-5.18-4.54-.15-.2-1.23-1.64-1.23-3.12 0-1.48.77-2.2 1.05-2.5.28-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.42-.07.66.5.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.72.81 2.02.96.3.15.5.22.57.35.08.13.08.72-.17 1.42z"/></svg>
    </a>
`;

let updated = 0, skipped = 0;
for (const file of listFiles()) {
  const html = fs.readFileSync(file, 'utf-8');
  if (html.includes('whatsapp-float')) { skipped++; continue; }
  const idx = html.lastIndexOf('</body>');
  if (idx === -1) { console.log('SIN </body>:', path.relative(ROOT, file)); continue; }
  const newHtml = html.slice(0, idx) + WIDGET + html.slice(idx);
  fs.writeFileSync(file, newHtml, 'utf-8');
  updated++;
}
console.log('Actualizados:', updated, '/ Ya tenían el widget:', skipped);
