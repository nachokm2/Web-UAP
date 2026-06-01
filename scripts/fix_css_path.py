#!/usr/bin/env python3
"""
Corrige la ruta del CSS en todos los landings de carrera.
De ../css/uap-refined.css a ../../css/uap-refined.css
"""

import os

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Corrigiendo ruta CSS en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    contenido = contenido.replace('href="../css/uap-refined.css"', 'href="../../css/uap-refined.css"')
    
    with open(filepath, 'w') as f:
        f.write(contenido)
    
    print(f"  ✅ {archivo}")

print(f"\n✅ Ruta CSS corregida!")