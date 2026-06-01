#!/usr/bin/env python3
"""
Corrige los headers de los landings para que usen el CSS global correctamente.
Elimina estilos inline problematicos del header.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Corrigiendo headers en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Buscar y reemplazar el header
    header_pattern = r'(<header class="header".*?>)(.*?)(</header>)'
    header_match = re.search(header_pattern, contenido, re.DOTALL)
    
    if header_match:
        # Crear nuevo header limpio
        nuevo_header = '''<header class="header">
    <div class="container header-inner">
        <a href="../index.html" class="logo"><img src="../images/logo-uap.png" alt="UAP"></a>
        <nav>
            <ul class="nav">
                <li><a href="../index.html">Inicio</a></li>
                <li><a href="carreras.html">Carreras</a></li>
                <li><a href="posgrados.html">Posgrados</a></li>
                <li><a href="noticias.html">Noticias</a></li>
                <li><a href="institucional.html">Institucional</a></li>
                <li><a href="contacto.html">Contacto</a></li>
            </ul>
        </nav>
    </div>
</header>'''
        
        contenido = contenido.replace(header_match.group(0), nuevo_header)
        
        # Guardar
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⚠️  No se encontro header en {archivo}")

print(f"\n✅ Headers corregidos!")
