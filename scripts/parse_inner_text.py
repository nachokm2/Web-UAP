#!/usr/bin/env python3
"""
Lee los JSON existentes, parsea el full_text si existe, y actualiza los campos.
También sirve para procesar datos extraídos manualmente del browser.
"""
import json, os, re, sys

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web/data"

def parse_inner_text(text):
    """Parse the innerText from a career page into structured data."""
    data = {
        "titulo": "", "duracion": "", "sede": "", "descripcion": "",
        "objetivo": "", "objetivos_especificos": [], "a_quien_va_dirigido": "",
        "campo_laboral": "", "perfil_egresado": "",
        "competencias_disciplinarias": [], "competencias_profesionales": [],
        "competencias_genericas": [], "mision": "", "vision": "",
        "valores": [], "definicion_profesional": ""
    }
    
    if not text:
        return data
    
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove header/footer noise
    # Find where the main content starts (after the career name header)
    lines = text.split('\n')
    
    # Section patterns - case insensitive
    section_patterns = [
        (r'TÍTULO', 'titulo'),
        (r'DURACIÓN', 'duracion'),
        (r'SEDE', 'sede'),
        (r'DESCRIPCIÓN', 'descripcion'),
        (r'OBJETIVO(?!\s+ESPECÍFICO)', 'objetivo'),
        (r'OBJETIVOS ESPECÍFICOS', 'objetivos_especificos'),
        (r'A QUIÉN VA DIRIGIDO', 'a_quien_va_dirigido'),
        (r'CAMPO LABORAL', 'campo_laboral'),
        (r'PERFIL DE EGRESADO', 'perfil_egresado'),
        (r'COMPETENCIAS DISCIPLINARIAS', 'competencias_disciplinarias'),
        (r'COMPETENCIAS PROFESIONALES', 'competencias_profesionales'),
        (r'COMPETENCIAS GENÉRICAS', 'competencias_genericas'),
        (r'MISIÓN', 'mision'),
        (r'VISIÓN', 'vision'),
        (r'VALORES DE LA CARRERA', 'valores_header'),
        (r'DEFINICIÓN DEL PROFESIONAL', 'definicion_profesional'),
        (r'PLAN DE ESTUDIOS', 'malla_header'),
        (r'OTRAS CARRERAS', 'end'),
    ]
    
    # Find all section boundaries
    boundaries = []
    for i, line in enumerate(lines):
        stripped = line.strip().upper()
        if not stripped:
            continue
        for pattern, name in section_patterns:
            if re.match(pattern, stripped, re.IGNORECASE):
                boundaries.append((i, name, pattern))
                break
    
    if not boundaries:
        return data
    
    boundaries.sort(key=lambda x: x[0])
    
    # Extract text between boundaries
    for idx, (start_line, section_name, pattern) in enumerate(boundaries):
        # Find end of section
        end_line = boundaries[idx+1][0] if idx < len(boundaries) - 1 else len(lines)
        
        # Get text between start+1 and end
        section_lines = lines[start_line+1:end_line]
        section_text = '\n'.join(l for l in section_lines if l.strip()).strip()
        
        # Remove form noise
        form_idx = section_text.find('Completa este formulario')
        if form_idx > 0:
            section_text = section_text[:form_idx].strip()
        section_text = re.sub(r'Reportar un abuso', '', section_text).strip()
        section_text = re.sub(r'Malla sujeta a cambios', '', section_text).strip()
        
        # Assign to data
        if section_name == 'titulo':
            data['titulo'] = section_lines[0].strip() if section_lines else ''
        elif section_name == 'duracion':
            data['duracion'] = section_lines[0].strip() if section_lines else ''
        elif section_name == 'sede':
            data['sede'] = section_lines[0].strip() if section_lines else ''
        elif section_name in ['descripcion', 'objetivo', 'a_quien_va_dirigido', 'campo_laboral', 'perfil_egresado', 'mision', 'vision', 'definicion_profesional']:
            if section_text:
                data[section_name] = section_text
        elif section_name == 'objetivos_especificos':
            items = [l.strip() for l in section_lines if l.strip() and len(l.strip()) > 10]
            data['objetivos_especificos'] = items
        elif section_name in ['competencias_disciplinarias', 'competencias_profesionales', 'competencias_genericas']:
            items = [l.strip() for l in section_lines if l.strip() and len(l.strip()) > 10]
            data[section_name] = items
        elif section_name == 'valores_header':
            # Parse valores - could be intro text + list items
            items = [l.strip() for l in section_lines if l.strip() and len(l.strip()) > 10]
            data['valores'] = items
    
    return data


def merge_into_file(slug, parsed_data):
    """Merge parsed data into existing JSON file, only filling empty fields."""
    filepath = os.path.join(BASE_DIR, f"carrera_{slug}.json")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    
    changed = False
    for key in ['titulo', 'duracion', 'sede', 'descripcion', 'objetivo', 
                'a_quien_va_dirigido', 'campo_laboral', 'perfil_egresado',
                'mision', 'vision', 'definicion_profesional']:
        if parsed_data.get(key) and not existing.get(key):
            existing[key] = parsed_data[key]
            changed = True
    
    for key in ['objetivos_especificos', 'competencias_disciplinarias', 
                'competencias_profesionales', 'competencias_genericas', 'valores']:
        new_val = parsed_data.get(key, [])
        old_val = existing.get(key, [])
        if new_val and (not old_val or (isinstance(old_val, list) and len(old_val) == 0)):
            existing[key] = new_val
            changed = True
    
    # Remove full_text to save space
    if 'full_text' in existing:
        del existing['full_text']
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)
    
    return changed


if __name__ == '__main__':
    # Test with a text string from stdin
    if len(sys.argv) > 1 and sys.argv[1] == '--stdin':
        slug = sys.argv[2]
        text = sys.stdin.read()
        parsed = parse_inner_text(text)
        changed = merge_into_file(slug, parsed)
        print(f"{'UPDATED' if changed else 'NO_CHANGE'} {slug}")
    elif len(sys.argv) > 1 and sys.argv[1] == '--check':
        # Check current data completeness
        for fname in sorted(os.listdir(BASE_DIR)):
            if not fname.startswith('carrera_') or not fname.endswith('.json') or 'full' in fname:
                continue
            slug = fname.replace('carrera_','').replace('.json','')
            with open(os.path.join(BASE_DIR, fname)) as f:
                d = json.load(f)
            key_fields = ['titulo','duracion','sede','descripcion','objetivo','a_quien_va_dirigido',
                         'campo_laboral','perfil_egresado','mision','vision','brochure_url']
            filled = sum(1 for k in key_fields if d.get(k))
            lists = {'obj_esp': d.get('objetivos_especificos',[]), 'comp_d': d.get('competencias_disciplinarias',[]),
                    'comp_p': d.get('competencias_profesionales',[]), 'comp_g': d.get('competencias_genericas',[]),
                    'valores': d.get('valores',[])}
            list_info = ' '.join(f'{k}={len(v)}' for k,v in lists.items() if v)
            malla = sum(len(v) for v in d.get('malla',{}).values()) if isinstance(d.get('malla'), dict) else 0
            print(f'{slug}: {filled}/11 fields | {list_info} | malla={malla} | brochure={"Y" if d.get("brochure_url") else "N"}')