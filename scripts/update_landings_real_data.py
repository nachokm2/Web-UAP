#!/usr/bin/env python3
"""
Actualiza todos los landings de carrera con la información real de uap.edu.py
"""

import os
import json
import re

base_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web"
carreras_dir = os.path.join(base_dir, "pages/carreras")

# Mapeo de slug de archivo a key del JSON
slug_map = {
    "odontologia": "odontologia",
    "optica-y-contactologia": "optica-y-contactologia",
    "fisioterapia": "fisioterapia",
    "fonoaudiologia": "fonoaudiologia",
    "psicologia": "psicologia",
    "nutricion": "nutricion",
    "podologia": "podologia",
    "administracion-de-empresas": "administracion-de-empresas",
    "ciencias-de-la-educacion": "ciencias-de-la-educacion",
    "derecho": "derecho",
    "trabajo-social": "trabajo-social",
    "marketing-y-publicidad": "marketing-y-publicidad",
    "ingenieria-comercial": "ingenieria-comercial",
    "ingenieria-en-informatica": "ingenieria-en-informatica",
    "ingenieria-en-tecnologia-de-alimentos": "ingenieria-en-tecnologia-de-alimentos",
    "periodismo": "periodismo",
    "educacion-parvularia": "educacion-parvularia",
    "administracion-publica": "administracion-publica",
    "ciencias-contables": "ciencias-contables",
    "contabilidad-y-auditoria": "contabilidad-y-auditoria",
    "contaduria-publica": "contaduria-publica",
    "ingenieria-en-comercio-internacional": "ingenieria-en-comercio-internacional",
    "ingenieria-en-marketing": "ingenieria-en-marketing",
}

# Cargar datos del JSON
with open(os.path.join(base_dir, "data/carreras.json"), 'r') as f:
    carreras_data = json.load(f)

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

updated = 0
skipped = 0

for archivo in archivos:
    slug = archivo.replace('.html', '')
    filepath = os.path.join(carreras_dir, archivo)
    
    if slug not in slug_map or slug_map[slug] not in carreras_data:
        print(f"  ⏭️  {archivo} (sin datos)")
        skipped += 1
        continue
    
    key = slug_map[slug]
    data = carreras_data[key]
    
    # Skip si no hay descripción
    if not data.get('descripcion'):
        print(f"  ⏭️  {archivo} (sin descripción)")
        skipped += 1
        continue
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Actualizar título en el hero
    # Buscar el h1 dentro de career-hero
    hero_match = re.search(r'(<div class="career-hero"[^>]*>\s*<h1[^>]*>)(.*?)(</h1>)', contenido, re.DOTALL)
    if hero_match:
        contenido = contenido.replace(hero_match.group(0), 
            f'<div class="career-hero">\n                <h1>{data["titulo"]}</h1>')
    
    # Actualizar descripción en el hero
    desc_match = re.search(r'(<div class="career-hero"[^>]*>.*?<h1>.*?</h1>\s*<p[^>]*>)(.*?)(</p>)', contenido, re.DOTALL)
    if desc_match:
        contenido = contenido.replace(desc_match.group(0),
            f'{desc_match.group(1)}{data["descripcion"]}</p>')
    
    # Actualizar info cards (título, duración, modalidad, carga horaria)
    # Título
    contenido = re.sub(
        r'(<div class="info-card">\s*<h3>\s*)Titulo(\s*</h3>\s*<p>)(.*?)(</p>\s*</div>)',
        lambda m: f'{m.group(1)}Título{m.group(2)}{data["titulo"]}{m.group(4)}',
        contenido, flags=re.DOTALL
    )
    
    # Duración
    duracion_text = data.get("duracion", "") or ""
    if duracion_text:
        contenido = re.sub(
            r'(<div class="info-card">\s*<h3>\s*)Duracion(\s*</h3>\s*<p>)(.*?)(</p>\s*</div>)',
            lambda m: f'{m.group(1)}Duración{m.group(2)}{duracion_text}{m.group(4)}',
            contenido, flags=re.DOTALL
        )
    
    # Campo laboral - buscar la sección
    campo_match = re.search(r'(Areas de Desempeno|Campo Laboral|Áreas de Desempeño)', contenido)
    if campo_match and data.get('campo_laboral'):
        # Reemplazar el párrafo después del h3
        # Buscar el h3 y reemplazar el párrafo siguiente
        patterns = [
            (r'(<h3[^>]*>\s*)Areas de Desempeno(\s*</h3>\s*<p>)(.*?)(</p>)', 
             f'\\1Áreas de Desempeño\\2{data["campo_laboral"]}\\4'),
            (r'(<h3[^>]*>\s*)Campo Laboral(\s*</h3>\s*<p>)(.*?)(</p>)', 
             f'\\1Campo Laboral\\2{data["campo_laboral"]}\\4'),
        ]
        for pattern, replacement in patterns:
            new_contenido = re.sub(pattern, replacement, contenido, flags=re.DOTALL)
            if new_contenido != contenido:
                contenido = new_contenido
                break
    
    # Perfil de egresado
    if data.get('perfil_egresado'):
        # Buscar la sección "Perfil del Graduado" y reemplazar
        perfil_match = re.search(
            r'(<h2[^>]*>\s*)Perfil del Graduado(\s*</h2>\s*<p[^>]*>)(.*?)(</p>)',
            contenido, flags=re.DOTALL
        )
        if perfil_match:
            contenido = contenido.replace(
                perfil_match.group(0),
                f'<h2 style="color: #003366; margin-bottom: 16px;">Perfil del Graduado</h2>\n                <p style="margin-bottom: 16px;">{data["perfil_egresado"]}</p>'
            )
    
    with open(filepath, 'w') as f:
        f.write(contenido)
    
    print(f"  ✅ {archivo} - {data['titulo']}")
    updated += 1

print(f"\n✅ Actualizados: {updated}, Saltados: {skipped}")