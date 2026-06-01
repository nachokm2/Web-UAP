#!/usr/bin/env python3
"""
Extrae la información COMPLETA de cada carrera desde uap.edu.py usando el browser.
Para cada carrera: título, duración, sede, descripción, objetivo, objetivos específicos,
a quién va dirigido, campo laboral, perfil de egresado, competencias, misión, visión,
valores, definición del profesional, malla (plan de estudios), y brochure URL.
"""

import os
import json
import time

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

# Template for extraction - JavaScript to run in browser
EXTRACT_JS = """
() => {
    const result = {
        titulo: '', duracion: '', sede: '', descripcion: '', objetivo: '',
        objetivos_especificos: [], a_quien_va_dirigido: '', campo_laboral: '',
        perfil_egresado: '', competencias_disciplinarias: [], competencias_profesionales: [],
        competencias_genericas: [], mision: '', vision: '', valores: [],
        definicion_profesional: '', malla: {}, brochure_url: '', full_text: ''
    };
    
    // Get full text
    const mainContent = document.querySelector('.elementor-inner') || document.querySelector('main') || document.querySelector('#content') || document.body;
    result.full_text = mainContent.innerText;
    
    // Get brochure PDF link
    const links = document.querySelectorAll('a[href]');
    for (const l of links) {
        const href = l.getAttribute('href') || '';
        const text = l.textContent.trim().toLowerCase();
        if ((text.includes('brochure') || text.includes('descargar') || text.includes('pdf')) && href.includes('.pdf')) {
            result.brochure_url = href;
            break;
        }
    }
    // Also check for any PDF link in the page
    if (!result.brochure_url) {
        for (const l of links) {
            const href = l.getAttribute('href') || '';
            if (href.includes('Brochure') && href.includes('.pdf')) {
                result.brochure_url = href;
                break;
            }
        }
    }
    
    // Get malla - click each tab and extract
    const tabTitles = document.querySelectorAll('.elementor-tab-title');
    const tabContents = document.querySelectorAll('.elementor-tab-content');
    
    // Desktop tabs
    const desktopTabs = document.querySelectorAll('.elementor-tab-desktop-title');
    
    // Try to get malla from existing visible content
    for (let i = 0; i < tabContents.length; i++) {
        const title = i < desktopTabs.length ? desktopTabs[i].textContent.trim() : (i < tabTitles.length ? tabTitles[i].textContent.trim() : '');
        const content = tabContents[i];
        if (!content || !title) continue;
        
        // Extract subject names from the content
        const subjectNames = [];
        // Look for table cells or list items
        const cells = content.querySelectorAll('td, li, p');
        for (const cell of cells) {
            const text = cell.textContent.trim();
            if (text && text.length > 3 && !text.startsWith('table') && !text.startsWith('{') && !text.includes('width:') && !text.includes('border:') && !text.includes('padding:') && !text.includes('display:')) {
                subjectNames.push(text);
            }
        }
        
        if (subjectNames.length > 0 && title.includes('semestre')) {
            result.malla[title] = subjectNames;
        }
    }
    
    return result;
}
"""

# First, collect the full text from each page and brochure URLs
for slug in CARRERAS:
    filepath = os.path.join(BASE_DIR, f"carrera_{slug}.json")
    
    # Check if we already have a complete file
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            existing = json.load(f)
        # Skip if we have full data (more than just basics)
        if existing.get('objetivos_especificos') or existing.get('competencias_disciplinarias') or existing.get('mision'):
            print(f"  SKIP {slug} (already has detailed data)")
            continue
    
    print(f"  NEED {slug}")

print("\nDone checking. Run the browser extraction separately.")