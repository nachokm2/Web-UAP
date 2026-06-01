#!/usr/bin/env python3
"""Actualiza landings de carrera copiando el diseño de odontología.html y preservando el contenido."""

import os
import re
import shutil

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# Lee modelo
with open(os.path.join(carreras_dir, "odontologia.html"), 'r') as f:
    modelo = f.read()

# Archivos a actualizar (todos excepto odontología)
archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html') and f != 'odontologia.html']
archivos.sort()

print(f"Actualizando {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    # Lee contenido original
    with open(filepath, 'r') as f:
        original = f.read()
    
    # Extrae título
    titulo_match = re.search(r'<title>(.*?)\s*–', original)
    titulo = titulo_match.group(1).strip() if titulo_match else archivo.replace('.html', '').replace('-', ' ').title()
    
    # Extrae descripción del hero (todo después de <h1>... </h1> hasta </div>)
    desc_match = re.search(r'career-hero>.*?\u003cdiv class="container">.*?\u003ch1>.*?\u003c/h1>.*?\u003cp>(.*?)\u003c/p>', original, re.DOTALL)
    descripcion = desc_match.group(1).strip() if desc_match else f"Formación de excelencia en {titulo}."
    
    # Extrae info grid (título, duración, modalidad, carga)
    info_match = re.findall(r'\u003ch3\u003e.*?\u003c/h3\u003e\s*\u003cp\u003e(.*?)\u003c/p\u003e', original)
    
    # Extrae plan de estudios completo
    plan_match = re.search(r'(\u003csection class="curriculum".*?\u003c/section\u003e)', original, re.DOTALL)
    plan_estudios = plan_match.group(1) if plan_match else ''
    
    # Extrae perfil del graduado
    perfil_match = re.search(r'(\u003csection class="profile-section".*?\u003c/section\u003e)', original, re.DOTALL)
    perfil = perfil_match.group(1) if perfil_match else ''
    
    # Crea nuevo HTML basado en modelo
    nuevo = modelo.replace('Odontología', titulo)
    nuevo = nuevo.replace(
        'Formación integral en salud oral con práctica clínica desde los primeros años. Preparamos profesionales capaces de diagnosticar, prevenir y tratar patologías bucodentales.',
        descripcion
    )
    
    # Reemplaza plan de estudios si existe
    if plan_estudios:
        plan_modelo_match = re.search(r'(\u003csection class="curriculum".*?\u003c/section\u003e)', nuevo, re.DOTALL)
        if plan_modelo_match:
            nuevo = nuevo.replace(plan_modelo_match.group(1), plan_estudios)
    
    # Reemplaza perfil si existe
    if perfil:
        perfil_modelo_match = re.search(r'(\u003csection class="profile-section".*?\u003c/section\u003e)', nuevo, re.DOTALL)
        if perfil_modelo_match:
            nuevo = nuevo.replace(perfil_modelo_match.group(1), perfil)
    
    # Guarda
    with open(filepath, 'w') as f:
        f.write(nuevo)
    
    print(f"  ✅ {archivo}")

print("\n✅ Todos los landings actualizados con diseño responsive!")
