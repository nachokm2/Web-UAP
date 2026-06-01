#!/usr/bin/env python3
"""
Script para actualizar footers y agregar menú hamburguesa en páginas UAP
"""
import os
import re
import glob

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages"

# Footer nuevo para páginas en /pages/
NEW_FOOTER = '''    <!-- Footer limpio -->
    <footer style="background: #003366; color: white; padding: 40px 0 20px;">
        <div class="container">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 30px;">
                <div>
                    <img src="../images/logo-white.png" alt="UAP" style="height: 45px; margin-bottom: 16px;">
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
                        <li><a href="carreras/odontologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Odontología</a></li>
                        <li><a href="carreras/psicologia.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Psicología</a></li>
                        <li><a href="carreras/fisioterapia.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Fisioterapia</a></li>
                        <li><a href="carreras/marketing.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Marketing</a></li>
                        <li><a href="carreras.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Ver todas →</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600;">Posgrados</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                        <li><a href="posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Maestrías</a></li>
                        <li><a href="posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Especializaciones</a></li>
                        <li><a href="posgrados.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Doctorados</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 16px; font-weight: 600;">Institucional</h4>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
                        <li><a href="institucional.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Sobre la UAP</a></li>
                        <li><a href="institucional.html#autoridades" style="color: rgba(255,255,255,0.7); text-decoration: none;">Autoridades</a></li>
                        <li><a href="investigacion.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Investigación</a></li>
                        <li><a href="contacto.html" style="color: rgba(255,255,255,0.7); text-decoration: none;">Contacto</a></li>
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

# Botón hamburguesa
HAMBURGER_BTN = '            <button class="mobile-menu-btn" onclick="document.querySelector(\'.nav\').classList.toggle(\'active\')">☰</button>'

def update_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Reemplazar footer
    # Encontrar desde <footer hasta </footer>
    footer_pattern = r'<footer\b[^>]*>.*?</footer>'
    content = re.sub(footer_pattern, NEW_FOOTER, content, flags=re.DOTALL)
    
    # 2. Agregar CSS para menú hamburguesa antes de </style> en el head
    # Buscar el primer bloque <style> y agregar el CSS antes del cierre
    # Solo si no existe ya .mobile-menu-btn
    if '.mobile-menu-btn' not in content:
        # Encontrar el primer </style> y agregar el CSS antes
        style_close_match = re.search(r'(\s+)</style>', content)
        if style_close_match:
            indent = style_close_match.group(1)
            css_to_insert = MOBILE_CSS.replace('        ', indent)
            content = content[:style_close_match.start()] + css_to_insert + content[style_close_match.start():]
    
    # 3. Agregar botón hamburguesa antes del cierre de </header>
    # Buscar la última instancia de </nav> antes de </header> e insertar el botón después
    if 'mobile-menu-btn' not in content:
        # Encontrar </nav> seguido de espacios y luego </div> antes de </header>
        nav_close_pattern = r'(\s+)</nav>(\s+)</div>(\s+)</header>'
        match = re.search(nav_close_pattern, content)
        if match:
            replacement = match.group(1) + '</nav>' + match.group(2) + HAMBURGER_BTN + match.group(3) + '</div>' + match.group(3) + '</header>'
            content = content[:match.start()] + replacement + content[match.end():]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Actualizado: {filepath}")

def main():
    pages = [
        'carreras.html', 'posgrados.html', 'institucional.html', 
        'contacto.html', 'noticias.html', 'investigacion.html',
        'inscripcion.html', 'estudiantes.html'
    ]
    
    for page in pages:
        filepath = os.path.join(BASE_DIR, page)
        if os.path.exists(filepath):
            update_page(filepath)
        else:
            print(f"⚠ No existe: {filepath}")

if __name__ == '__main__':
    main()
