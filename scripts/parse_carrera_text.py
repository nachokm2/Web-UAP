#!/usr/bin/env python3
"""
Parsea el texto completo extraído de cada página de carrera y lo estructura en JSON.
"""

import json
import os
import re

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web/data"

def parse_carrera_text(slug, text):
    """Parse the full text from a career page into structured data."""
    data = {
        "titulo": "", "duracion": "", "sede": "", "descripcion": "",
        "objetivo": "", "objetivos_especificos": [], "a_quien_va_dirigido": "",
        "campo_laboral": "", "perfil_egresado": "",
        "competencias_disciplinarias": [], "competencias_profesionales": [],
        "competencias_genericas": [], "mision": "", "vision": "",
        "valores": [], "definicion_profesional": "",
        "malla": {}, "brochure_url": "", "slug": slug
    }
    
    # Normalize text
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Extract sections by headers
    # The text has sections like: DESCRIPCIÓN, OBJETIVO, OBJETIVOS ESPECÍFICOS, etc.
    
    # Split into sections
    sections = {}
    current_section = "header"
    current_text = []
    
    section_markers = [
        "TÍTULO", "DURACIÓN", "SEDE", "DESCRIPCIÓN", "OBJETIVO",
        "OBJETIVOS ESPECÍFICOS", "A QUIÉN VA DIRIGIDO", "CAMPO LABORAL",
        "PERFIL DE EGRESADO", "COMPETENCIAS DISCIPLINARIAS", 
        "COMPETENCIAS PROFESIONALES", "COMPETENCIAS GENÉRICAS",
        "MISIÓN", "VISIÓN", "VALORES DE LA CARRERA", "VALORES",
        "DEFINICIÓN DEL PROFESIONAL", "PLAN DE ESTUDIOS", "OTRAS CARRERAS"
    ]
    
    lines = text.split('\n')
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Check if this line is a section header
        found_section = None
        for marker in section_markers:
            if stripped.upper().startswith(marker):
                found_section = marker
                break
        
        if found_section:
            # Save previous section
            if current_text:
                sections[current_section] = '\n'.join(current_text).strip()
            current_section = found_section
            current_text = []
        else:
            current_text.append(stripped)
    
    # Save last section
    if current_text:
        sections[current_section] = '\n'.join(current_text).strip()
    
    # Parse each section
    # TÍTULO
    if "TÍTULO" in sections:
        data["titulo"] = sections["TÍTULO"].strip()
    
    # DURACIÓN
    if "DURACIÓN" in sections:
        data["duracion"] = sections["DURACIÓN"].strip()
    
    # SEDE
    if "SEDE" in sections:
        data["sede"] = sections["SEDE"].strip()
    
    # DESCRIPCIÓN
    if "DESCRIPCIÓN" in sections:
        data["descripcion"] = sections["DESCRIPCIÓN"].strip()
    
    # OBJETIVO
    if "OBJETIVO" in sections and "OBJETIVOS ESPECÍFICOS" not in sections:
        data["objetivo"] = sections["OBJETIVO"].strip()
    elif "OBJETIVO" in sections:
        data["objetivo"] = sections["OBJETIVO"].strip()
    
    # OBJETIVOS ESPECÍFICOS
    if "OBJETIVOS ESPECÍFICOS" in sections:
        objs = [o.strip() for o in sections["OBJETIVOS ESPECÍFICOS"].split('\n') if o.strip()]
        data["objetivos_especificos"] = objs
    
    # A QUIÉN VA DIRIGIDO
    if "A QUIÉN VA DIRIGIDO" in sections:
        data["a_quien_va_dirigido"] = sections["A QUIÉN VA DIRIGIDO"].strip()
    
    # CAMPO LABORAL
    if "CAMPO LABORAL" in sections:
        data["campo_laboral"] = sections["CAMPO LABORAL"].strip()
    
    # PERFIL DE EGRESADO
    if "PERFIL DE EGRESADO" in sections:
        data["perfil_egresado"] = sections["PERFIL DE EGRESADO"].strip()
    
    # COMPETENCIAS DISCIPLINARIAS
    if "COMPETENCIAS DISCIPLINARIAS" in sections:
        comps = [c.strip() for c in sections["COMPETENCIAS DISCIPLINARIAS"].split('\n') if c.strip()]
        data["competencias_disciplinarias"] = comps
    
    # COMPETENCIAS PROFESIONALES
    if "COMPETENCIAS PROFESIONALES" in sections:
        comps = [c.strip() for c in sections["COMPETENCIAS PROFESIONALES"].split('\n') if c.strip()]
        data["competencias_profesionales"] = comps
    
    # COMPETENCIAS GENÉRICAS
    if "COMPETENCIAS GENÉRICAS" in sections:
        comps = [c.strip() for c in sections["COMPETENCIAS GENÉRICAS"].split('\n') if c.strip()]
        data["competencias_genericas"] = comps
    
    # MISIÓN
    if "MISIÓN" in sections:
        data["mision"] = sections["MISIÓN"].strip()
    
    # VISIÓN
    if "VISIÓN" in sections:
        data["vision"] = sections["VISIÓN"].strip()
    
    # VALORES
    if "VALORES DE LA CARRERA" in sections:
        vals = [v.strip() for v in sections["VALORES DE LA CARRERA"].split('\n') if v.strip()]
        data["valores"] = vals
    elif "VALORES" in sections:
        vals = [v.strip() for v in sections["VALORES"].split('\n') if v.strip()]
        data["valores"] = vals
    
    # DEFINICIÓN DEL PROFESIONAL
    if "DEFINICIÓN DEL PROFESIONAL" in sections:
        data["definicion_profesional"] = sections["DEFINICIÓN DEL PROFESIONAL"].strip()
    
    return data

# Test with existing data
for fname in sorted(os.listdir(BASE_DIR)):
    if fname.startswith("carrera_") and fname.endswith(".json") and "full" not in fname:
        slug = fname.replace("carrera_", "").replace(".json", "")
        filepath = os.path.join(BASE_DIR, fname)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        
        # If full_text exists, parse it
        if existing.get("full_text"):
            parsed = parse_carrera_text(slug, existing["full_text"])
            # Merge parsed data into existing, only filling empty fields
            for key, val in parsed.items():
                if val and not existing.get(key):
                    existing[key] = val
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
            
            print(f"  Updated {slug}")
        else:
            print(f"  No full_text for {slug}")

print("\nDone.")