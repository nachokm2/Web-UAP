#!/usr/bin/env python3
"""
Agrega el script JavaScript para el menu hamburguesa a todos los landings.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

script_js = '''    <script>
        // Menu hamburguesa
        document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
            document.querySelector('.nav').classList.toggle('active');
        });
    </script>'''

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Agregando script a {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Verificar si ya tiene el script
    if 'mobile-menu-btn' in contenido and 'addEventListener' not in contenido:
        # Reemplazar </body> con script + </body>
        contenido = contenido.replace('</body>', f'{script_js}\n</body>')
        
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⏭️  {archivo} (ya tiene script o no necesita)")

print(f"\n✅ Script agregado!")
