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

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Actualizando logo en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Patrón más flexible para encontrar el logo
    # Busca: <a href="../index.html" class="logo"> seguido de contenido hasta </a>
    pattern = r'<a href="../index\.html" class="logo">\s*<img src="../images/logo-uap\.png"[^/]*>\s*</a>'
    
    match = re.search(pattern, contenido)
    if match:
        new_logo = f'<a href="../index.html" class="logo">{logo_svg}</a>'
        contenido = contenido.replace(match.group(0), new_logo)
        
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        # Si no encuentra, mostrar qué tiene
        logo_match = re.search(r'<a href="../index\.html" class="logo".*?>.*?img.*?logo.*?</a>', contenido, re.DOTALL)
        if logo_match:
            print(f"  ⚠️  Encontrado en {archivo} pero no coincidió exactamente:")
            print(f"     {logo_match.group(0)[:100]}...")
        else:
            print(f"  ❌ No se encontró logo en {archivo}")

print(f"\n✅ Logo actualizado donde fue posible!")
