#!/usr/bin/env python3
"""
Corrige las rutas de imágenes en todos los landings de carrera.
De ../images/ a ../../images/
"""

import os

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Corrigiendo rutas de imágenes en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Corregir rutas de imágenes en el header y footer
    contenido = contenido.replace('src="../images/', 'src="../../images/')
    
    with open(filepath, 'w') as f:
        f.write(contenido)
    
    print(f"  ✅ {archivo}")

print(f"\n✅ Rutas de imágenes corregidas!")