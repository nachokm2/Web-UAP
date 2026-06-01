#!/usr/bin/env python3
"""
Genera los HTML completos de cada landing de carrera con la información real de uap.edu.py.
Usa los datos extraídos desde los JSONs y los datos del carreras_full.json.
"""

import os
import json
import re

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web"
DATA_DIR = os.path.join(BASE_DIR, "data")
CARRERAS_DIR = os.path.join(BASE_DIR, "pages/carreras")

# Cargar datos
data = {}
for fname in os.listdir(DATA_DIR):
    if fname.startswith("carrera_") and fname.endswith(".json"):
        slug = fname.replace("carrera_", "").replace(".json", "")
        with open(os.path.join(DATA_DIR, fname), 'r', encoding='utf-8') as f:
            data[slug] = json.load(f)

# Cargar datos full
full_path = os.path.join(DATA_DIR, "carreras_full.json")
if os.path.exists(full_path):
    with open(full_path, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    # Merge full data into data
    for slug, fdata in full_data.items():
        if slug in data:
            for key, val in fdata.items():
                if val and not data[slug].get(key):
                    data[slug][key] = val
        else:
            data[slug] = fdata

# Also load from carreras.json (basic data from web_fetch)
basic_path = os.path.join(DATA_DIR, "carreras.json")
if os.path.exists(basic_path):
    with open(basic_path, 'r', encoding='utf-8') as f:
        basic_data = json.load(f)
    for slug, bdata in basic_data.items():
        if slug not in data:
            data[slug] = bdata
        else:
            for key, val in bdata.items():
                if val and not data[slug].get(key):
                    data[slug][key] = val

# Print what we have
for slug in sorted(data.keys()):
    d = data[slug]
    fields = ['titulo', 'duracion', 'sede', 'descripcion', 'objetivo', 
              'a_quien_va_dirigido', 'campo_laboral', 'perfil_egresado',
              'mision', 'vision', 'brochure_url']
    filled = sum(1 for f in fields if d.get(f))
    malla_count = sum(len(v) if isinstance(v, list) else 0 for v in d.get('malla', {}).values()) if d.get('malla') else 0
    obj_esp = len(d.get('objetivos_especificos', [])) if d.get('objetivos_especificos') else 0
    comp_d = len(d.get('competencias_disciplinarias', [])) if d.get('competencias_disciplinarias') else 0
    comp_p = len(d.get('competencias_profesionales', [])) if d.get('competencias_profesionales') else 0
    comp_g = len(d.get('competencias_genericas', [])) if d.get('competencias_genericas') else 0
    valores = len(d.get('valores', [])) if d.get('valores') else 0
    
    print(f"{slug}: {filled}/11 fields, {obj_esp} obj.esp, {comp_d}/{comp_p}/{comp_g} comp, {valores} valores, {malla_count} materias, brochure={'✓' if d.get('brochure_url') else '✗'}")