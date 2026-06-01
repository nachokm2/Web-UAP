#!/usr/bin/env python3
"""
Copia el header del home a estudiantes.html
"""

import re

# Leer el home
with open('/Users/esteban/.openclaw/workspace-uap/uap-web/index.html', 'r') as f:
    home = f.read()

# Extraer header del home
header_match = re.search(r'(<header class="header".*?>.*?</header>)', home, re.DOTALL)
if not header_match:
    print("No se encontró header en index.html")
    exit(1)

home_header = header_match.group(1)

# Adaptar rutas para estudiantes.html
new_header = home_header
new_header = new_header.replace('src="images/', 'src="../images/')
new_header = new_header.replace('href="index.html"', 'href="../index.html"')
new_header = new_header.replace('href="pages/', 'href="')
new_header = new_header.replace('class="nav-active"', '')

# Leer estudiantes.html
with open('/Users/esteban/.openclaw/workspace-uap/uap-web/pages/estudiantes.html', 'r') as f:
    content = f.read()

# Reemplazar header
old_header = re.search(r'(<header class="header".*?>.*?</header>)', content, re.DOTALL)
if old_header:
    content = content.replace(old_header.group(1), new_header)
    
    with open('/Users/esteban/.openclaw/workspace-uap/uap-web/pages/estudiantes.html', 'w') as f:
        f.write(content)
    
    print("✅ Header actualizado en estudiantes.html")
else:
    print("❌ No se encontró header en estudiantes.html")
