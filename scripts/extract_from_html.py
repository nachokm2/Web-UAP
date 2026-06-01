#!/usr/bin/env python3
"""
Extrae la información COMPLETA de cada carrera desde el HTML crudo de uap.edu.py.
Usa requests para obtener el HTML y BeautifulSoup para parsearlo.
"""

import os
import json
import re
import time
import sys

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing dependencies...")
    os.system(f"{sys.executable} -m pip install requests beautifulsoup4 -q")
    import requests
    from bs4 import BeautifulSoup

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

def extract_from_html(slug):
    """Extract career data from the raw HTML of uap.edu.py"""
    url = f"https://uap.edu.py/{slug}/"
    
    try:
        resp = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        resp.raise_for_status()
    except Exception as e:
        print(f"  ERROR fetching {slug}: {e}")
        return None
    
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    # Extract brochure URL
    brochure_url = ''
    for a in soup.find_all('a', href=True):
        href = a['href']
        text = a.get_text(strip=True).lower()
        if '.pdf' in href.lower() and ('brochure' in href.lower() or 'brochure' in text or 'descargar' in text):
            if 'brochure' in href.lower() or 'brochure' in text:
                brochure_url = href
                break
    
    if not brochure_url:
        # Search for any PDF with "Brochure" in the href
        for a in soup.find_all('a', href=True):
            href = a['href']
            if 'brochure' in href.lower() and '.pdf' in href.lower():
                brochure_url = href
                break
    
    # Extract section content from Elementor widgets
    # Elementor uses heading widgets and text-editor widgets
    # The pattern is: a heading with the section title, followed by a text widget with the content
    
    data = {
        "titulo": "", "duracion": "", "sede": "", "descripcion": "",
        "objetivo": "", "objetivos_especificos": [], "a_quien_va_dirigido": "",
        "campo_laboral": "", "perfil_egresado": "",
        "competencias_disciplinarias": [], "competencias_profesionales": [],
        "competencias_genericas": [], "mision": "", "vision": "",
        "valores": [], "definicion_profesional": "",
        "brochure_url": brochure_url, "slug": slug
    }
    
    # Find all Elementor heading widgets
    headings = soup.find_all(class_=re.compile(r'elementor-heading-title'))
    
    # Build a map of heading text -> following content
    sections = {}
    for heading_el in headings:
        heading_text = heading_el.get_text(strip=True).upper()
        
        # Map heading to our field names
        field_map = {
            'TÍTULO': 'titulo', 'DURACIÓN': 'duracion', 'SEDE': 'sede',
            'DESCRIPCIÓN': 'descripcion', 'OBJETIVO': 'objetivo',
            'OBJETIVOS ESPECÍFICOS': 'objetivos_especificos',
            'A QUIÉN VA DIRIGIDO': 'a_quien_va_dirigido',
            'CAMPO LABORAL': 'campo_laboral',
            'PERFIL DE EGRESADO': 'perfil_egresado',
            'COMPETENCIAS DISCIPLINARIAS': 'competencias_disciplinarias',
            'COMPETENCIAS PROFESIONALES': 'competencias_profesionales',
            'COMPETENCIAS GENÉRICAS': 'competencias_genericas',
            'MISIÓN': 'mision', 'VISIÓN': 'vision',
            'VALORES DE LA CARRERA': 'valores',
            'DEFINICIÓN DEL PROFESIONAL': 'definicion_profesional',
        }
        
        for key, field in field_map.items():
            if key in heading_text and field not in sections:
                # Find the parent widget container, then find the next sibling text widget
                parent_widget = heading_el
                for _ in range(10):
                    parent_widget = parent_widget.parent
                    if parent_widget and 'elementor-element' in parent_widget.get('class', []):
                        break
                
                if parent_widget:
                    # Find the next text-editor widget sibling
                    next_el = parent_widget.find_next_sibling()
                    content_parts = []
                    seen_count = 0
                    while next_el and seen_count < 3:
                        classes = ' '.join(next_el.get('class', []))
                        if 'elementor-heading-title' in next_el.get_text('', strip=True).upper() if next_el.find(class_=re.compile(r'heading-title')) else '':
                            break
                        if 'elementor-widget-text-editor' in classes or 'elementor-widget-icon-list' in classes:
                            text = next_el.get_text(strip=True)
                            if text:
                                content_parts.append(text)
                            seen_count += 1
                        elif 'elementor-element' in classes:
                            # Check if it's a text editor or icon list
                            te = next_el.find(class_=re.compile(r'elementor-widget-text-editor|elementor-widget-icon-list'))
                            if te:
                                text = te.get_text(strip=True)
                                if text:
                                    content_parts.append(text)
                            seen_count += 1
                        next_el = next_el.find_next_sibling()
                    
                    sections[field] = '\n'.join(content_parts) if content_parts else ''
                break
    
    # Now extract the content more reliably by searching all Elementor containers
    # Alternative approach: find all text-editor and icon-list widgets with their preceding headings
    
    all_widgets = soup.find_all(class_=re.compile(r'elementor-element'))
    
    current_heading = None
    for widget in all_widgets:
        heading = widget.find(class_=re.compile(r'elementor-heading-title'))
        if heading:
            heading_text = heading.get_text(strip=True).upper()
            for key, field in field_map.items():
                if key in heading_text and field not in data or (field in ['objetivos_especificos', 'competencias_disciplinarias', 'competencias_profesionales', 'competencias_genericas', 'valores'] and not data.get(field)):
                    current_heading = field
                    break
            else:
                # This is a different heading, might not map to our fields
                pass
            continue
        
        if current_heading:
            # Check for text editor content
            text_editor = widget.find(class_=re.compile(r'elementor-widget-text-editor|elementor-widget-icon-list'))
            if text_editor:
                text = text_editor.get_text(separator='\n', strip=True)
                if text and len(text) > 5:
                    # Clean up the text
                    text = re.sub(r'\n{2,}', '\n', text)
                    
                    if current_heading in ['objetivos_especificos', 'competencias_disciplinarias', 'competencias_profesionales', 'competencias_genericas', 'valores']:
                        # These are list fields
                        items = [item.strip() for item in text.split('\n') if item.strip() and len(item.strip()) > 5]
                        if isinstance(data[current_heading], list):
                            data[current_heading].extend(items)
                    else:
                        if not data.get(current_heading):
                            data[current_heading] = text
    
    # Now extract malla (plan de estudios) from tabs
    # Elementor tabs have tab titles and tab content
    malla = {}
    tab_titles = soup.find_all(class_=re.compile(r'elementor-tab-title|elementor-tab-desktop-title'))
    tab_contents = soup.find_all(class_=re.compile(r'elementor-tab-content'))
    
    # Try to match tab titles with content
    # First, let's find all tab titles that contain "semestre"
    for i, title_el in enumerate(tab_titles):
        title_text = title_el.get_text(strip=True)
        if 'semestre' in title_text.lower():
            # Find the corresponding content
            # The content is usually in a sibling or nearby element
            # Try tab_contents by index
            if i < len(tab_contents):
                content_el = tab_contents[i]
                # Extract subject names - they're usually in table cells or list items
                subjects = []
                for td in content_el.find_all('td'):
                    text = td.get_text(strip=True)
                    if text and len(text) > 3 and not text.startswith(('table', '{', 'width', 'border', 'padding', 'display')):
                        subjects.append(text)
                for li in content_el.find_all('li'):
                    text = li.get_text(strip=True)
                    if text and len(text) > 3:
                        subjects.append(text)
                
                if subjects:
                    malla[title_text] = subjects
    
    if malla:
        data['malla'] = malla
    
    return data

# Process each career
for slug in CARRERAS:
    print(f"Processing {slug}...")
    
    filepath = os.path.join(BASE_DIR, f"carrera_{slug}.json")
    
    # Fetch and extract data
    extracted = extract_from_html(slug)
    if not extracted:
        print(f"  FAILED {slug}")
        continue
    
    # Load existing data
    existing = {}
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    
    # Merge: only fill empty fields
    changed = False
    for key in ['titulo', 'duracion', 'sede', 'descripcion', 'objetivo', 
                'a_quien_va_dirigido', 'campo_laboral', 'perfil_egresado',
                'mision', 'vision', 'definicion_profesional', 'brochure_url']:
        if extracted.get(key) and not existing.get(key):
            existing[key] = extracted[key]
            changed = True
    
    for key in ['objetivos_especificos', 'competencias_disciplinarias', 
                'competencias_profesionales', 'competencias_genericas', 'valores']:
        new_val = extracted.get(key, [])
        old_val = existing.get(key, [])
        if new_val and (not old_val or len(old_val) == 0):
            existing[key] = new_val
            changed = True
    
    # Merge malla
    if extracted.get('malla') and (not existing.get('malla') or len(existing.get('malla', {})) == 0):
        existing['malla'] = extracted['malla']
        changed = True
    
    if changed:
        # Remove full_text to save space
        if 'full_text' in existing:
            del existing['full_text']
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)
        print(f"  UPDATED {slug}")
    else:
        print(f"  NO_CHANGE {slug}")
    
    time.sleep(1)  # Be polite to the server

print("\nDone.")