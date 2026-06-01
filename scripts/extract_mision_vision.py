#!/usr/bin/env python3
"""
Extrae MISIÓN y VISIÓN de cada carrera desde el HTML crudo de uap.edu.py.
Usa un enfoque más preciso: busca el texto de la sección y extrae el contenido
del siguiente elemento hermano.
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

def extract_section_from_html(html, section_name):
    """Extract a section's content from HTML by finding the heading and getting the next text editor."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Strategy: Find all elements that contain the section name as text
    # Then look for the nearest text-editor widget after it
    
    # Find heading elements that contain the section name
    for heading_el in soup.find_all(string=re.compile(section_name, re.IGNORECASE)):
        # Find the parent container (usually an elementor-widget-wrap)
        parent = heading_el.parent
        for _ in range(15):  # Walk up the tree
            if parent is None:
                break
            parent_classes = ' '.join(parent.get('class', []))
            if 'elementor-element' in parent_classes:
                break
            parent = parent.parent
        
        if parent is None:
            continue
        
        # Now find the NEXT elementor-element sibling that contains a text-editor or icon-list
        sibling = parent.find_next_sibling()
        while sibling:
            sibling_classes = ' '.join(sibling.get('class', []))
            
            # Check if this sibling has a text-editor widget
            text_editor = sibling.find(class_=re.compile(r'elementor-widget-text-editor'))
            icon_list = sibling.find(class_=re.compile(r'elementor-widget-icon-list'))
            
            if text_editor:
                # Get all the text from the text editor
                content = text_editor.get_text(separator='\n', strip=True)
                # Clean up
                content = re.sub(r'\n{2,}', '\n', content)
                content = content.strip()
                if content and len(content) > 20:
                    # Check it's not another section header
                    upper = content.upper()
                    if not any(s in upper for s in ['TÍTULO', 'DURACIÓN', 'SEDE', 'DESCRIPCIÓN', 'OBJETIVO', 'CAMPO LABORAL', 'PERFIL DE EGRESADO', 'PLAN DE ESTUDIOS']):
                        return content
            
            if icon_list:
                items = icon_list.find_all(class_=re.compile(r'elementor-icon-list-item'))
                content_parts = []
                for item in items:
                    text = item.get_text(strip=True)
                    if text and len(text) > 5:
                        content_parts.append(text)
                if content_parts:
                    return '\n'.join(content_parts)
            
            # Check if we've hit another major section heading
            next_heading = sibling.find(class_=re.compile(r'elementor-heading-title'))
            if next_heading:
                next_text = next_heading.get_text(strip=True).upper()
                # These are section headers - stop if we hit one
                if any(s in next_text for s in ['TÍTULO', 'DURACIÓN', 'SEDE', 'DESCRIPCIÓN', 'OBJETIVO', 
                                                  'CAMPO LABORAL', 'PERFIL DE EGRESADO', 'PLAN DE ESTUDIOS',
                                                  'COMPETENCIAS', 'MISIÓN', 'VISIÓN', 'VALORES']):
                    # We've hit the next section, stop
                    break
            
            sibling = sibling.find_next_sibling()
    
    return ''

def extract_descripcion(html):
    """Extract the DESCRIPCIÓN section specifically."""
    return extract_section_from_html(html, 'DESCRIPCIÓN')

def extract_objetivo(html):
    """Extract the OBJETIVO section (not OBJETIVOS ESPECÍFICOS)."""
    soup = BeautifulSoup(html, 'html.parser')
    # Find heading that says exactly "OBJETIVO" (not "OBJETIVOS ESPECÍFICOS")
    for heading_el in soup.find_all(class_=re.compile(r'elementor-heading-title')):
        text = heading_el.get_text(strip=True).upper()
        if text == 'OBJETIVO' or (text.startswith('OBJETIVO') and 'ESPECÍFICO' not in text):
            # Found it - now find the next text editor
            parent = heading_el.parent
            for _ in range(15):
                if parent is None:
                    break
                parent_classes = ' '.join(parent.get('class', []))
                if 'elementor-element' in parent_classes:
                    break
                parent = parent.parent
            
            if parent:
                sibling = parent.find_next_sibling()
                while sibling:
                    text_editor = sibling.find(class_=re.compile(r'elementor-widget-text-editor'))
                    if text_editor:
                        content = text_editor.get_text(separator='\n', strip=True)
                        content = re.sub(r'\n{2,}', '\n', content).strip()
                        if content and len(content) > 20:
                            # Make sure it's not the form
                            if 'Completa este formulario' in content:
                                content = content[:content.index('Completa este formulario')].strip()
                            return content
                    
                    # Check if we hit OBJETIVOS ESPECÍFICOS
                    next_heading = sibling.find(class_=re.compile(r'elementor-heading-title'))
                    if next_heading and 'ESPECÍFICO' in next_heading.get_text(strip=True).upper():
                        break
                    
                    sibling = sibling.find_next_sibling()
    
    return ''

# Process each career
for slug in CARRERAS:
    filepath = os.path.join(BASE_DIR, f"carrera_{slug}.json")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    
    # Check what's missing
    missing = []
    if not existing.get('mision'):
        missing.append('mision')
    if not existing.get('vision'):
        missing.append('vision')
    if not existing.get('descripcion'):
        missing.append('descripcion')
    if not existing.get('objetivo'):
        missing.append('objetivo')
    
    if not missing:
        print(f"  SKIP {slug} (all fields present)")
        continue
    
    print(f"Processing {slug} (missing: {', '.join(missing)})...")
    
    # Fetch HTML
    url = f"https://uap.edu.py/{slug}/"
    try:
        resp = requests.get(url, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        resp.raise_for_status()
    except Exception as e:
        print(f"  ERROR: {e}")
        continue
    
    html = resp.text
    changed = False
    
    if 'mision' in missing:
        mision = extract_section_from_html(html, 'MISIÓN')
        if mision and len(mision) > 20:
            existing['mision'] = mision
            changed = True
            print(f"  Found MISIÓN: {mision[:60]}...")
    
    if 'vision' in missing:
        vision = extract_section_from_html(html, 'VISIÓN')
        if vision and len(vision) > 20:
            existing['vision'] = vision
            changed = True
            print(f"  Found VISIÓN: {vision[:60]}...")
    
    if 'descripcion' in missing:
        desc = extract_descripcion(html)
        if desc and len(desc) > 20:
            existing['descripcion'] = desc
            changed = True
            print(f"  Found DESCRIPCIÓN: {desc[:60]}...")
    
    if 'objetivo' in missing:
        obj = extract_objetivo(html)
        if obj and len(obj) > 20:
            existing['objetivo'] = obj
            changed = True
            print(f"  Found OBJETIVO: {obj[:60]}...")
    
    if changed:
        if 'full_text' in existing:
            del existing['full_text']
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)
        print(f"  SAVED {slug}")
    else:
        print(f"  NO_CHANGE {slug}")
    
    time.sleep(0.5)

print("\nDone.")