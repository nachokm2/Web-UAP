#!/usr/bin/env python3
"""
Reemplaza emojis en footers de todas las páginas por SVG o texto plano.
"""

import os
import re

pages_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages"

# Reemplazos para footer
replacements = {
    '📍 ': '',
    '📞 ': '',
    '✉️ ': ''
}

archivos = [f for f in os.listdir(pages_dir) if f.endswith('.html')]
archivos.sort()

print(f"Reemplazando emojis en {len(archivos)} páginas...")

for archivo in archivos:
    filepath = os.path.join(pages_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    original = contenido
    
    # Reemplazar emojis
    for emoji, replacement in replacements.items():
        contenido = contenido.replace(emoji, replacement)
    
    if contenido != original:
        with open(filepath, 'w') as f:
            f.write(contenido)
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⏭️  {archivo} (sin emojis)")

print(f"\n✅ Emojis reemplazados!")
