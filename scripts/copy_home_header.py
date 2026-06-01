#!/usr/bin/env python3
"""
Copia exactamente el header del home (index.html) a todos los landings de carrera,
adaptando las rutas correctamente.
"""

import os
import re

base_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web"
carreras_dir = os.path.join(base_dir, "pages/carreras")

# Leer el header del home
with open(os.path.join(base_dir, "index.html"), 'r') as f:
    home_content = f.read()

# Extraer el header del home (desde <header> hasta </header>)
header_match = re.search(r'(<header class="header".*?>.*?</header>)', home_content, re.DOTALL)
if not header_match:
    print("❌ No se encontró el header en index.html")
    exit(1)

home_header = header_match.group(1)

# Archivos a actualizar
archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Copiando header del home a {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Extraer el header actual del landing
    landing_header_match = re.search(r'(<header.*?>.*?</header>)', contenido, re.DOTALL)
    if not landing_header_match:
        print(f"  ⚠️  No se encontró header en {archivo}")
        continue
    
    # Crear header adaptado para el landing
    new_header = home_header
    
    # Adaptar rutas de imágenes: images/ -> ../images/
    new_header = new_header.replace('src="images/', 'src="../images/')
    new_header = new_header.replace('src="icons/', 'src="../icons/')
    
    # Adaptar rutas de páginas: pages/carreras/ ->  (quitar pages/ para links internos)
    # Pero dejar pages/ para posgrados, institucional, etc.
    new_header = new_header.replace('href="index.html"', 'href="../index.html"')
    new_header = new_header.replace('href="pages/carreras.html"', 'href="carreras.html"')
    new_header = new_header.replace('href="pages/posgrados.html"', 'href="../posgrados.html"')
    new_header = new_header.replace('href="pages/noticias.html"', 'href="../noticias.html"')
    new_header = new_header.replace('href="pages/institucional.html"', 'href="../institucional.html"')
    new_header = new_header.replace('href="pages/investigacion.html"', 'href="../investigacion.html"')
    new_header = new_header.replace('href="pages/estudiantes.html"', 'href="../estudiantes.html"')
    new_header = new_header.replace('href="pages/contacto.html"', 'href="../contacto.html"')
    
    # Adaptar rutas de carreras en dropdown: pages/carreras/ -> 
    new_header = new_header.replace('href="pages/carreras/', 'href="')
    
    # Remover clase nav-active del inicio
    new_header = new_header.replace('class="nav-active"', '')
    
    # Reemplazar header en el landing
    contenido = contenido.replace(landing_header_match.group(1), new_header)
    
    with open(filepath, 'w') as f:
        f.write(contenido)
    
    print(f"  ✅ {archivo}")

print(f"\n✅ Header del home copiado a {len(archivos)} landings!")
