const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function getFooter(prefix) {
    return `    <!-- Footer institucional -->
    <footer style="background: #002244; color: white; padding: 56px 0 0;">
        <div class="container">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                <div>
                    <a href="${prefix}index.html"><img src="${prefix}images/logo-white.png" alt="UAP – Universidad Autónoma del Paraguay" style="height: 45px; margin-bottom: 20px; display:block;" loading="lazy"></a>
                    <p style="opacity: 0.75; line-height: 1.7; margin-bottom: 20px; font-size: 14px; max-width: none;">
                        Universidad habilitada por el Ministerio de Educación y Ciencias (MEC) y acreditada por la ANEAES. Comprometidos con la excelencia académica y el desarrollo del Paraguay.
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; opacity: 0.65; margin-bottom: 20px;">
                        <span>📍 Colón Nº 658 e/Haedo, Asunción, Paraguay</span>
                        <span>📞 +595 21 447 579</span>
                        <span>✉️ info@uap.edu.py</span>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
                        <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;">MEC Habilitada</span>
                        <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;font-size:12px;font-weight:600;">ANEAES</span>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <a href="https://www.facebook.com/UAP.Paraguay" target="_blank" rel="noopener" aria-label="Facebook UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                        </a>
                        <a href="https://www.instagram.com/uap.paraguay" target="_blank" rel="noopener" aria-label="Instagram UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>
                        </a>
                        <a href="https://www.youtube.com/@UAPParaguay" target="_blank" rel="noopener" aria-label="YouTube UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/school/universidad-autonoma-del-paraguay" target="_blank" rel="noopener" aria-label="LinkedIn UAP" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Carreras</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="${prefix}pages/carreras/odontologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Odontología</a></li>
                        <li><a href="${prefix}pages/carreras/psicologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Psicología</a></li>
                        <li><a href="${prefix}pages/carreras/fisioterapia.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Fisioterapia</a></li>
                        <li><a href="${prefix}pages/carreras/ingenieria-en-informatica.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Ingeniería en Informática</a></li>
                        <li><a href="${prefix}pages/carreras/derecho.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Derecho</a></li>
                        <li><a href="${prefix}pages/carreras.html" style="color: rgba(255,255,255,0.5); text-decoration: none; font-size: 13px;">Ver todas →</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Posgrados</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="${prefix}pages/posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Maestrías</a></li>
                        <li><a href="${prefix}pages/posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Especializaciones</a></li>
                        <li><a href="${prefix}pages/posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Doctorados</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Institucional</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="${prefix}pages/institucional.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Sobre la UAP</a></li>
                        <li><a href="${prefix}pages/institucional.html#autoridades" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Autoridades</a></li>
                        <li><a href="${prefix}pages/investigacion.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Investigación</a></li>
                        <li><a href="${prefix}pages/estudiantes.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Estudiantes</a></li>
                        <li><a href="${prefix}pages/contacto.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Contacto</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5;">Legal</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                        <li><a href="${prefix}pages/privacidad.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Política de privacidad</a></li>
                        <li><a href="${prefix}pages/privacidad.html#terminos" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Términos de uso</a></li>
                        <li><a href="${prefix}pages/inscripcion.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px;">Inscripción</a></li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.15); padding: 20px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; font-size: 13px; opacity: 0.5;">
                <span>© 2026 Universidad Autónoma del Paraguay. Todos los derechos reservados.</span>
                <div style="display:flex;gap:20px;">
                    <a href="${prefix}pages/privacidad.html" style="color:inherit;text-decoration:none;">Privacidad</a>
                    <a href="${prefix}pages/privacidad.html#terminos" style="color:inherit;text-decoration:none;">Términos</a>
                    <a href="${prefix}pages/contacto.html" style="color:inherit;text-decoration:none;">Contacto</a>
                </div>
            </div>
        </div>
    </footer>`;
}

function processFile(filePath, prefix) {
    let html = fs.readFileSync(filePath, 'utf8');
    // Match old footer: starts with <footer and contains background: #003366 or #002244
    const footerRegex = /(\s*<!-- Footer[^>]*-->\s*)*\s*<footer[^>]*(?:background:\s*#003366|background:\s*#002244)[^>]*>[\s\S]*?<\/footer>/i;
    if (!footerRegex.test(html)) {
        console.log(`SKIP (no old footer): ${path.basename(filePath)}`);
        return;
    }
    html = html.replace(footerRegex, '\n' + getFooter(prefix));
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ Updated: ${path.relative(ROOT, filePath)}`);
}

// pages/*.html → prefix = "../"
const pagesDir = path.join(ROOT, 'pages');
fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).forEach(f => {
    processFile(path.join(pagesDir, f), '../');
});

// pages/carreras/*.html → prefix = "../../"
const carrerasDir = path.join(ROOT, 'pages', 'carreras');
fs.readdirSync(carrerasDir).filter(f => f.endsWith('.html')).forEach(f => {
    processFile(path.join(carrerasDir, f), '../../');
});

console.log('\nDone.');
