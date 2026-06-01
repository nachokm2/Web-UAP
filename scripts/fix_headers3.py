#!/usr/bin/env python3
"""
Corrige los headers de todos los landings con estilos inline correctos.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# Header correcto con estilos inline
header_correcto = '''    <header class="header" style="background: #003366; color: white; padding: 12px 0;">
        <div class="container header-inner" style="display: flex; justify-content: space-between; align-items: center;">
            <a href="../index.html" class="logo" style="display: flex; align-items: center;"><img src="../images/logo-uap.png" alt="UAP" style="height: 40px;"></a>
            <button class="mobile-menu-btn" onclick="document.querySelector('.nav').classList.toggle('active')" style="display: block; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">☰</button>
            <nav>
                <ul class="nav" style="list-style: none; display: flex; gap: 20px; margin: 0; padding: 0;">
                    <li><a href="../index.html" style="color: white; text-decoration: none; font-size: 14px;">Inicio</a></li>
                    <li><a href="carreras.html" style="color: white; text-decoration: none; font-size: 14px;">Carreras</a></li>
                    <li><a href="posgrados.html" style="color: white; text-decoration: none; font-size: 14px;">Posgrados</a></li>
                    <li><a href="noticias.html" style="color: white; text-decoration: none; font-size: 14px;">Noticias</a></li>
                    <li><a href="institucional.html" style="color: white; text-decoration: none; font-size: 14px;">Institucional</a></li>
                    <li><a href="contacto.html" style="color: white; text-decoration: none; font-size: 14px;">Contacto</a></li>
                </ul>
            </nav>
        </div>
    </header>'''

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Corrigiendo headers en {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Buscar header existente
    header_pattern = r'<header class="header".*?</header>'
    header_match = re.search(header_pattern, contenido, re.DOTALL)
    
    if header_match:
        contenido = contenido.replace(header_match.group(0), header_correcto)
        
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⚠️  No se encontro header en {archivo}")

print(f"\n✅ Headers corregidos!")
