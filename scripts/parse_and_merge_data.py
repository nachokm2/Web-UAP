#!/usr/bin/env python3
"""
Parsea el full_text extraído de cada página de carrera y lo estructura en JSON.
Llena los campos faltantes en cada archivo carrera_{slug}.json.
"""

import json
import os
import re
import sys

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web/data"

CARRERAS = [
    "odontologia", "optica-y-contactologia", "fisioterapia", "fonoaudiologia",
    "psicologia", "nutricion", "podologia", "administracion-de-empresas",
    "ciencias-de-la-educacion", "derecho", "trabajo-social", "marketing-y-publicidad",
    "ingenieria-comercial", "ingenieria-en-informatica", "ingenieria-en-tecnologia-de-alimentos",
    "periodismo", "educacion-parvularia", "administracion-publica",
    "ciencias-contables", "contabilidad-y-auditoria", "contaduria-publica",
    "ingenieria-en-comercio-internacional", "ingenieria-en-marketing",
]

def parse_full_text(slug, text):
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
    
    if not text:
        return data
    
    # Normalize text
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Clean up common artifacts
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Define section headers in order of appearance
    section_patterns = [
        (r'TÍTULO\s*\n', 'titulo_header'),
        (r'DURACIÓN\s*\n', 'duracion_header'),
        (r'SEDE\s*\n', 'sede_header'),
        (r'DESCRIPCIÓN\s*\n', 'descripcion_header'),
        (r'OBJETIVO\s*\n', 'objetivo_header'),
        (r'OBJETIVOS ESPECÍFICOS\s*\n', 'obj_especificos_header'),
        (r'A QUIÉN VA DIRIGIDO\s*\n', 'a_quien_header'),
        (r'CAMPO LABORAL\s*\n', 'campo_laboral_header'),
        (r'PERFIL DE EGRESADO\s*\n', 'perfil_header'),
        (r'COMPETENCIAS DISCIPLINARIAS\s*\n', 'comp_disc_header'),
        (r'COMPETENCIAS PROFESIONALES\s*\n', 'comp_prof_header'),
        (r'COMPETENCIAS GENÉRICAS\s*\n', 'comp_gen_header'),
        (r'MISIÓN\s*\n', 'mision_header'),
        (r'VISIÓN\s*\n', 'vision_header'),
        (r'VALORES DE LA CARRERA\s*\n', 'valores_header'),
        (r'DEFINICIÓN DEL PROFESIONAL\s*\n', 'definicion_header'),
        (r'PLAN DE ESTUDIOS\s*\n', 'malla_header'),
        (r'OTRAS CARRERAS', 'otras_header'),
    ]
    
    # Find all section boundaries
    boundaries = []
    for pattern, name in section_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            boundaries.append((match.start(), match.end(), name))
    
    boundaries.sort(key=lambda x: x[0])
    
    # Extract text between boundaries
    for i, (start, end_match, name) in enumerate(boundaries):
        # Find the end of this section (start of next section or end of text)
        section_end = boundaries[i+1][0] if i < len(boundaries) - 1 else len(text)
        section_text = text[end_match:section_end].strip()
        
        # Remove form section if present
        form_idx = section_text.find('Completa este formulario')
        if form_idx > 0:
            section_text = section_text[:form_idx].strip()
        
        # Also remove common noise
        section_text = re.sub(r'Reportar un abuso', '', section_text)
        section_text = re.sub(r'Malla sujeta a cambios', '', section_text)
        section_text = section_text.strip()
        
        # Assign to data fields
        if name == 'titulo_header':
            data["titulo"] = section_text.split('\n')[0].strip()
        elif name == 'duracion_header':
            data["duracion"] = section_text.split('\n')[0].strip()
        elif name == 'sede_header':
            data["sede"] = section_text.split('\n')[0].strip()
        elif name == 'descripcion_header':
            data["descripcion"] = section_text
        elif name == 'objetivo_header':
            data["objetivo"] = section_text
        elif name == 'obj_especificos_header':
            items = [item.strip() for item in section_text.split('\n') if item.strip() and len(item.strip()) > 5]
            data["objetivos_especificos"] = items
        elif name == 'a_quien_header':
            data["a_quien_va_dirigido"] = section_text
        elif name == 'campo_laboral_header':
            data["campo_laboral"] = section_text
        elif name == 'perfil_header':
            data["perfil_egresado"] = section_text
        elif name == 'comp_disc_header':
            items = [item.strip() for item in section_text.split('\n') if item.strip() and len(item.strip()) > 5]
            data["competencias_disciplinarias"] = items
        elif name == 'comp_prof_header':
            items = [item.strip() for item in section_text.split('\n') if item.strip() and len(item.strip()) > 5]
            data["competencias_profesionales"] = items
        elif name == 'comp_gen_header':
            items = [item.strip() for item in section_text.split('\n') if item.strip() and len(item.strip()) > 5]
            data["competencias_genericas"] = items
        elif name == 'mision_header':
            data["mision"] = section_text
        elif name == 'vision_header':
            data["vision"] = section_text
        elif name == 'valores_header':
            items = [item.strip() for item in section_text.split('\n') if item.strip() and len(item.strip()) > 5]
            data["valores"] = items
        elif name == 'definicion_header':
            data["definicion_profesional"] = section_text
    
    return data

def process_all(dry_run=False):
    """Process all career JSONs and merge parsed data."""
    updated = 0
    
    # Discover all carrera JSON files
    files = [f for f in os.listdir(BASE_DIR) if f.startswith('carrera_') and f.endswith('.json') and 'full' not in f]
    
    for fname in sorted(files):
        slug = fname.replace('carrera_', '').replace('.json', '')
        filepath = os.path.join(BASE_DIR, fname)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        
        full_text = existing.get('full_text', '')
        if not full_text:
            print(f"  NO_FULL_TEXT {slug}")
            continue
        
        parsed = parse_full_text(slug, full_text)
        
        # Merge: only fill empty fields
        changed = False
        for key in ['titulo', 'duracion', 'sede', 'descripcion', 'objetivo', 
                    'a_quien_va_dirigido', 'campo_laboral', 'perfil_egresado',
                    'mision', 'vision', 'definicion_profesional']:
            if parsed.get(key) and not existing.get(key):
                existing[key] = parsed[key]
                changed = True
        
        for key in ['objetivos_especificos', 'competencias_disciplinarias', 
                    'competencias_profesionales', 'competencias_genericas', 'valores']:
            if parsed.get(key) and (not existing.get(key) or len(existing.get(key, [])) == 0):
                existing[key] = parsed[key]
                changed = True
        
        if changed:
            if not dry_run:
                # Don't save full_text back to save disk space
                save_data = {k: v for k, v in existing.items() if k != 'full_text'}
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(save_data, f, ensure_ascii=False, indent=2)
            print(f"  UPDATED {slug}")
            updated += 1
        else:
            print(f"  NO_CHANGE {slug}")
    
    print(f"\nUpdated {updated} careers.")
    return updated


if __name__ == '__main__':
    dry = '--dry' in sys.argv
    process_all(dry_run=dry)