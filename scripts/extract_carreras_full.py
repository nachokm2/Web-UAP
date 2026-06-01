#!/usr/bin/env python3
"""
Extrae la información COMPLETA de cada carrera desde uap.edu.py
Incluye: título, duración, sede, descripción, objetivo, objetivos específicos,
a quién va dirigido, campo laboral, perfil de egresado, competencias,
misión, visión, valores, malla, y brochure URL.
"""

import json
import os

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

# Resultado completo
all_data = {}

for slug in CARRERAS:
    url = f"https://uap.edu.py/{slug}/"
    all_data[slug] = {
        "url": url,
        "slug": slug,
        "titulo": "",
        "duracion": "",
        "sede": "",
        "descripcion": "",
        "objetivo": "",
        "objetivos_especificos": [],
        "a_quien_va_dirigido": "",
        "campo_laboral": "",
        "perfil_egresado": "",
        "competencias_disciplinarias": [],
        "competencias_profesionales": [],
        "competencias_genericas": [],
        "mision": "",
        "vision": "",
        "valores": [],
        "definicion_profesional": "",
        "malla": {},
        "brochure_url": ""
    }

output_path = "/Users/esteban/.openclaw/workspace-uap/uap-web/data/carreras_full.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"Created skeleton for {len(CARRERAS)} carreras at {output_path}")