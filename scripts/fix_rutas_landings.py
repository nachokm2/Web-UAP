#!/usr/bin/env python3
"""
Corrige rutas en los dropdowns de los landings.
"""

import os

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Corrigiendo rutas en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Corregir rutas de posgrados
    contenido = contenido.replace('href="pages/posgrados.html#', 'href="../posgrados.html#')
    contenido = contenido.replace('href="pages/institucional.html#', 'href="../institucional.html#')
    
    with open(filepath, 'w') as f:
        f.write(contenido)
    
    print(f"  ✅ {archivo}")

print(f"\n✅ Rutas corregidas!")
