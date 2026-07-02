#!/usr/bin/env node
// K-05: los 23 forms "Solicita información" + contacto + inscripción comparten el mismo
// formulario Bitrix24 (inline/61/hi7fex), así que hoy no se puede saber desde el CRM qué
// carrera le interesó a un lead. No creamos formularios nuevos (requeriría acceso al panel de
// Bitrix24, que no tenemos) — en cambio, antes de cargar el script de Bitrix, seteamos
// utm_source/utm_medium/utm_campaign en la URL de la página (vía history.replaceState, sin
// recargar). Bitrix24 captura automáticamente esos parámetros UTM en cada lead — es un campo
// estándar del CRM, no uno personalizado, así que no requiere ninguna configuración previa en
// el panel de Bitrix24. Verificar en un lead de prueba que "Fuente"/UTM Campaign llegue con el
// nombre de la carrera.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BITRIX_RE = /<script data-b24-form="inline\/61\/hi7fex" data-skip-moving="true">/;

function utmSnippet(campaign) {
  return `<script>(function(){var p=new URLSearchParams(window.location.search);p.set('utm_source','web-uap');p.set('utm_medium','formulario');p.set('utm_campaign','${campaign}');history.replaceState(null,'',window.location.pathname+'?'+p.toString()+window.location.hash);})();</script>\n                `;
}

function process(file, campaign) {
  const html = fs.readFileSync(file, 'utf-8');
  if (html.includes("utm_campaign','" + campaign)) return false;
  if (!BITRIX_RE.test(html)) { console.log('SIN form de Bitrix:', path.relative(ROOT, file)); return false; }
  const newHtml = html.replace(BITRIX_RE, utmSnippet(campaign) + '<script data-b24-form="inline/61/hi7fex" data-skip-moving="true">');
  fs.writeFileSync(file, newHtml, 'utf-8');
  return true;
}

let updated = 0;
const careersDir = path.join(ROOT, 'pages', 'carreras');
for (const f of fs.readdirSync(careersDir)) {
  if (!f.endsWith('.html')) continue;
  const slug = f.replace('.html', '');
  if (process(path.join(careersDir, f), slug)) updated++;
}
if (process(path.join(ROOT, 'pages', 'contacto.html'), 'contacto-general')) updated++;
if (process(path.join(ROOT, 'pages', 'inscripcion.html'), 'inscripcion-general')) updated++;

console.log('Archivos actualizados:', updated);
