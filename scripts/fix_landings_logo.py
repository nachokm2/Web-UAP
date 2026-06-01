#!/usr/bin/env python3
"""
Reemplaza el logo PNG por SVG inline en todos los landings de carrera.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# SVG inline del logo
logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" width="150" height="40" style="display: block;">
                    <rect x="0" y="0" width="50" height="50" rx="8" fill="#003366"/>
                    <text x="25" y="32" text-anchor="middle" fill="white" font-size="22" font-weight="bold" font-family="Georgia, serif">UAP</text>
                    <text x="60" y="28" fill="#003366" font-size="18" font-weight="bold" font-family="Georgia, serif">Universidad</text>
                    <text x="60" y="42" fill="#0066cc" font-size="11" font-family="system-ui, sans-serif">Autónoma del Paraguay</text>
                </svg>'''

# Patrón para encontrar el logo actual
logo_pattern = r'<a href="../index\.html" class="logo"><img src="../images/logo-uap\.png" alt="[^"]*" class="logo-img"></a>'

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Actualizando logo en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Reemplazar logo
    new_contenido = re.sub(logo_pattern, f'<a href="../index.html" class="logo">{logo_svg}</a>', contenido)
    
    if new_contenido != contenido:
        with open(filepath, 'w') as f:
            f.write(new_contenido)
        print(f"  ✅ {archivo}")
    else:
        # Intentar otro patrón
        logo_pattern2 = r'<a href="../index\.html" class="logo"><img src="../images/logo-uap\.png" alt="UAP"[^/]*></a>'
        new_contenido = re.sub(logo_pattern2, f'<a href="../index.html" class="logo">{logo_svg}</a>', contenido)
        
        if new_contenido != contenido:
            with open(filepath, 'w') as f:
                f.write(new_contenido)
            print(f"  ✅ {archivo} (patrón 2)")
        else:
            print(f"  ⚠️  No se encontró logo en {archivo}")

print(f"\n✅ Logo actualizado!")
