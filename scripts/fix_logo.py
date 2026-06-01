#!/usr/bin/env python3
"""
Corrige el logo en todos los landings para que se vea correctamente.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

logo_correcto = '<a href="../index.html" class="logo" style="display: flex; align-items: center; text-decoration: none;"><img src="../images/logo-uap.png" alt="UAP" style="height: 40px; width: auto; display: block;"></a>'
logo_viejo = '<a href="../index.html" class="logo" style="display: flex; align-items: center;"><img src="../images/logo-uap.png" alt="UAP" style="height: 40px;"></a>'

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Corrigiendo logo en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Reemplazar el logo viejo por el nuevo
    if logo_viejo in contenido:
        contenido = contenido.replace(logo_viejo, logo_correcto)
        
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⏭️  {archivo} (ya corregido o no encontrado)")

print(f"\n✅ Logo corregido!")
