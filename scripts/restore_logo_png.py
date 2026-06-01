#!/usr/bin/env python3
"""
Restaura el logo PNG en todos los landings de carrera.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# Logo correcto con PNG
logo_correcto = '<a href="../index.html" class="logo"><img src="../images/logo-uap.png" alt="UAP - Universidad Autónoma del Paraguay" class="logo-img"></a>'

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Restaurando logo PNG en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Buscar y reemplazar cualquier logo SVG por el PNG
    # Patrón: <a href="../index.html" class="logo"> seguido de SVG hasta </a>
    pattern = r'<a href="../index\.html" class="logo"><svg.*?</a>'
    
    match = re.search(pattern, contenido, re.DOTALL)
    if match:
        contenido = contenido.replace(match.group(0), logo_correcto)
        
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⏭️  {archivo} (ya tiene PNG o no tiene logo)")

print(f"\n✅ Logo PNG restaurado!")
