#!/usr/bin/env python3
"""
Copia el diseño del modelo (odontologia.html) a todos los demas landings,
preservando el contenido especifico de cada carrera.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"
modelo_path = os.path.join(carreras_dir, "odontologia.html")

# Lee el modelo
with open(modelo_path, 'r') as f:
    modelo = f.read()

# Obtener lista de archivos (todos excepto odontologia.html)
archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html') and f != 'odontologia.html']
archivos.sort()

print(f"Copiando diseno a {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    # Lee contenido original
    with open(filepath, 'r') as f:
        original = f.read()
    
    # Extraer titulo de la carrera
    titulo_match = re.search(r'\u003ctitle\u003e(.*?)\s*[-–]', original)
    titulo = titulo_match.group(1).strip() if titulo_match else archivo.replace('.html', '').replace('-', ' ').title()
    
    # Extraer descripcion del hero
    desc_match = re.search(r'career-hero.*?<p>(.*?)\u003c/p>', original, re.DOTALL)
    descripcion = desc_match.group(1).strip() if desc_match else f"Formacion de excelencia en {titulo}."
    
    # Extraer info grid items (titulo, duracion, modalidad, carga)
    info_matches = re.findall(r'\u003ch3\u003e(.*?)\u003c/h3\u003e\s*\u003cp\u003e(.*?)\u003c/p\u003e', original)
    
    # Extraer plan de estudios
    plan_match = re.search(r'(\u003csection\u003e.*?Plan de Estudios.*?\u003c/section\u003e)', original, re.DOTALL)
    plan_estudios = plan_match.group(1) if plan_match else ''
    
    # Extraer perfil del graduado
    perfil_match = re.search(r'(\u003cdiv class="profile-section".*?\u003c/div\u003e)', original, re.DOTALL)
    perfil = perfil_match.group(1) if perfil_match else ''
    
    # Crear nuevo HTML basado en modelo
    nuevo = modelo.replace('Odontologia', titulo)
    nuevo = nuevo.replace(
        'Formacion integral en salud oral con practica clinica desde los primeros anos. Preparamos profesionales capaces de diagnosticar, prevenir y tratar patologias bucodentales.',
        descripcion
    )
    
    # Reemplazar info grid si existe info extraida
    if len(info_matches) >= 4:
        nuevo = re.sub(
            r'(\u003cdiv class="info-card"\u003e\s*\u003ch3\u003e).*?(\u003c/h3\u003e\s*\u003cp\u003e).*?(\u003c/p\u003e\s*\u003c/div\u003e\s*\u003cdiv class="info-card"\u003e\s*\u003ch3\u003e).*?(\u003c/h3\u003e\s*\u003cp\u003e).*?(\u003c/p\u003e\s*\u003c/div\u003e\s*\u003cdiv class="info-card"\u003e\u003ch3\u003e).*?(\u003c/h3\u003e\s*\u003cp\u003e).*?(\u003c/p\u003e\s*\u003c/div\u003e\s*\u003cdiv class="info-card"\u003e\u003ch3\u003e).*?(\u003c/h3\u003e\s*\u003cp\u003e).*?(\u003c/p\u003e\s*\u003c/div\u003e)',
            lambda m: f'{m.group(1)}{info_matches[0][0]}{m.group(2)}{info_matches[0][1]}{m.group(3)}{info_matches[1][0]}{m.group(4)}{info_matches[1][1]}{m.group(5)}{info_matches[2][0]}{m.group(6)}{info_matches[2][1]}{m.group(7)}{info_matches[3][0]}{m.group(8)}{info_matches[3][1]}{m.group(9)}',
            nuevo,
            count=1,
            flags=re.DOTALL
        )
    
    # Reemplazar plan de estudios
    if plan_estudios:
        plan_modelo = re.search(r'(\u003csection\u003e.*?Plan de Estudios.*?\u003c/section\u003e)', nuevo, re.DOTALL)
        if plan_modelo:
            nuevo = nuevo.replace(plan_modelo.group(1), plan_estudios)
    
    # Reemplazar perfil
    if perfil:
        perfil_modelo = re.search(r'(\u003cdiv class="profile-section".*?\u003c/div\u003e)', nuevo, re.DOTALL)
        if perfil_modelo:
            nuevo = nuevo.replace(perfil_modelo.group(1), perfil)
    
    # Reemplazar link del footer
    carrera_id = archivo.replace('.html', '')
    nuevo = nuevo.replace('href="odontologia.html"', f'href="{archivo}"')
    
    # Guardar
    with open(filepath, 'w') as f:
        f.write(nuevo)
    
    print(f"  ✅ {archivo}")

print(f"\n✅ {len(archivos)} landings actualizados!")
