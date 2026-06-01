#!/usr/bin/env python3
"""
Script para actualizar landings de carreras en /pages/carreras/*.html
"""
import os
import re
import glob

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# Footer nuevo para páginas en /pages/carreras/ (rutas ../../)
NEW_FOOTER = '''    
    <!-- Footer limpio -->
    <footer style="background: #003366; color: white; padding: 40px 0 20px;">
        <div class="container">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 30px;">
                <div>
                    <img src="../../images/logo-white.png" alt="UAP" style="height: 45px; margin-bottom: 16px;">
                    <p style="opacity: 0.8; line-height: 1.6; margin-bottom: 16px;">
                        Universidad Autónoma del Paraguay.<br>
                        Comprometidos con la excelencia académica y el desarrollo del país.
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; opacity: 0.7;">
                        <span>📍 Colón Nº 658 e/Haedo, Asunción, Paraguay</span>
                        <span>📞 +595 21 447 579</span>
                        <span>✉️ info@uap.edu.py</span>
                    </div>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600;">Carreras</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                        <li><a href="odontologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Odontología</a></li>
                        <li><a href="psicologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Psicología</a></li>
                        <li><a href="fisioterapia.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Fisioterapia</a></li>
                        <li><a href="marketing-y-publicidad.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Marketing</a></li>
                        <li><a href="../carreras.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Ver todas →</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600;">Posgrados</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                        <li><a href="../posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Maestrías</a></li>
                        <li><a href="../posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Especializaciones</a></li>
                        <li><a href="../posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Doctorados</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600;">Institucional</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                        <li><a href="../institucional.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Sobre la UAP</a></li>
                        <li><a href="../institucional.html#autoridades" style="color: rgba(255,255,255,0.7); text-decoration: none;">Autoridades</a></li>
                        <li><a href="../investigacion.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Investigación</a></li>
                        <li><a href="../contacto.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Contacto</a></li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; text-align: center; font-size: 14px; opacity: 0.6;">
                Universidad Autónoma del Paraguay © 2026
            </div>
        </div>
    </footer>'''

# CSS para menú hamburguesa
MOBILE_CSS = '''        .mobile-menu-btn { display: none; }
        @media (max-width: 768px) {
            .nav { display: none; position: absolute; top: 100%; left: 0; width: 100%; background: white; flex-direction: column; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .nav.active { display: flex; }
            .mobile-menu-btn { display: block; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-primary); }
        }'''

HAMBURGER_BTN = '            <button class="mobile-menu-btn" onclick="document.querySelector(\'.nav\').classList.toggle(\'active\')">☰</button>'

# Sección de formulario y botones para agregar antes del </div> que cierra el container principal
FORM_SECTION = '''
            <section style="margin-top: var(--space-12); padding: var(--space-8) 0; border-top: 1px solid var(--color-border);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8);">
                    <div>
                        <h2 style="margin-bottom: var(--space-4);">Consultá por esta carrera</h2>
                        <form style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <label>Nombre completo</label>
                            <input type="text" placeholder="Tu nombre" style="padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                            <label>Email</label>
                            <input type="email" placeholder="tu@email.com" style="padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                            <label>Teléfono</label>
                            <input type="tel" placeholder="+595 9XX XXX XXX" style="padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                            <label>Mensaje</label>
                            <textarea placeholder="Escribí tu consulta..." rows="4" style="padding: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md);"></textarea>
                            <button type="submit" class="btn btn-primary" style="margin-top: var(--space-2);">Enviar consulta</button>
                        </form>
                    </div>
                    <div>
                        <h2 style="margin-bottom: var(--space-4);">Información Adicional</h2>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div class="info-card" style="border-left-color: var(--color-success);">
                                <h3>🎯 Perfil del Graduado</h3>
                                <p>Profesional capacitado para desempeñarse con excelencia en su campo, con sólidos conocimientos teóricos y prácticos.</p>
                            </div>
                            <div class="info-card" style="border-left-color: var(--color-warning);">
                                <h3>💼 Áreas de Desempeño</h3>
                                <p>Sector público y privado, consultorías, instituciones educativas, organizaciones nacionales e internacionales.</p>
                            </div>
                            <div class="info-card" style="border-left-color: var(--color-info);">
                                <h3>🌐 Convenios Internacionales</h3>
                                <p>Intercambios académicos y convenios de cooperación con universidades de Argentina, Brasil, España y más.</p>
                            </div>
                            <div class="info-card" style="border-left-color: var(--color-primary);">
                                <h3>📈 Salidas Profesionales</h3>
                                <p>Alta demanda laboral con proyección internacional y posibilidades de emprendimiento.</p>
                            </div>
                        </div>
                        <a href="#" class="btn btn-outline" style="margin-top: var(--space-6); display: inline-block;">📥 Descargar Brochure</a>
                    </div>
                </div>
            </section>
'''

def update_career_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Reemplazar footer
    footer_pattern = r'<footer\b[^>]*>.*?</footer>'
    content = re.sub(footer_pattern, NEW_FOOTER, content, flags=re.DOTALL)
    
    # 2. Agregar CSS para menú hamburguesa si no existe
    if '.mobile-menu-btn' not in content:
        style_close_match = re.search(r'(\s+)</style>', content)
        if style_close_match:
            indent = style_close_match.group(1)
            css_to_insert = MOBILE_CSS.replace('        ', indent)
            content = content[:style_close_match.start()] + css_to_insert + content[style_close_match.start():]
    
    # 3. Agregar botón hamburguesa antes del cierre de </header>
    if 'mobile-menu-btn' not in content or 'document.querySelector' not in content:
        nav_close_pattern = r'(\s+)</nav>(\s+)</div>(\s+)</header>'
        match = re.search(nav_close_pattern, content)
        if match:
            replacement = match.group(1) + '</nav>' + match.group(2) + HAMBURGER_BTN + match.group(3) + '</div>' + match.group(3) + '</header>'
            content = content[:match.start()] + replacement + content[match.end():]
    
    # 4. Agregar sección de formulario y botones antes del cierre del </div> del container principal (antes del </main> o </footer>)
    # Buscar el patrón: </div> seguido de espacios y </main> o </footer>
    if 'Consultá por esta carrera' not in content:
        # Insertar antes del </main> o </footer>
        main_close_pattern = r'(\s+)</main>'
        match = re.search(main_close_pattern, content)
        if match:
            indent = match.group(1)
            form_to_insert = FORM_SECTION.replace('            ', indent)
            content = content[:match.start()] + form_to_insert + content[match.start():]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Actualizado: {filepath}")

def main():
    html_files = glob.glob(os.path.join(BASE_DIR, '*.html'))
    
    for filepath in html_files:
        update_career_page(filepath)

if __name__ == '__main__':
    main()
