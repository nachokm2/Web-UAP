#!/usr/bin/env python3
"""
Extrae el texto completo de cada página de carrera desde uap.edu.py usando web_fetch
y lo guarda en JSON para posterior parsing.
"""

import os
import json
import time
import subprocess

CARRERAS = [
    "odontologia",
    "optica-y-contactologia",
    "fisioterapia",
    "fonoaudiologia",
    "psicologia",
    "nutricion",
    "podologia",
    "administracion-de-empresas",
    "ciencias-de-la-educacion",
    "derecho",
    "trabajo-social",
    "marketing-y-publicidad",
    "ingenieria-comercial",
    "ingenieria-en-informatica",
    "ingenieria-en-tecnologia-de-alimentos",
    "periodismo",
    "educacion-parvularia",
    "administracion-publica",
    "ciencias-contables",
    "contabilidad-y-auditoria",
    "contaduria-publica",
    "ingenieria-en-comercio-internacional",
    "ingenieria-en-marketing",
]

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web/data"

# Read the existing JSON files and check which ones need the full_text
for slug in CARRERAS:
    filepath = os.path.join(BASE_DIR, f"carrera_{slug}.json")
    
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        
        # Check if we need more data
        needs_data = not existing.get('full_text')
        
        # Also check specific fields
        if not needs_data:
            fields_to_check = ['objetivos_especificos', 'competencias_disciplinarias', 
                              'competencias_profesionales', 'competencias_genericas',
                              'mision', 'vision', 'valores', 'a_quien_va_dirigido']
            for field in fields_to_check:
                val = existing.get(field)
                if not val or (isinstance(val, list) and len(val) == 0):
                    needs_data = True
                    break
        
        if not needs_data:
            print(f"  SKIP {slug} (already complete)")
            continue
    
    print(f"  NEED {slug}")

print("\nDone.")