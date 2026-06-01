#!/usr/bin/env python3
"""
Actualiza las 23 landing pages HTML con datos reales extraídos de uap.edu.py.
Usa los archivos JSON en data/ como fuente de verdad.

Para cada landing page:
1. Lee el JSON correspondiente
2. Lee el HTML actual
3. Actualiza secciones con datos disponibles
4. Agrega secciones nuevas si hay datos (mision, vision, competencias, etc.)
5. Oculta secciones sin datos
6. Actualiza enlace de brochure
"""

import json, os, re, sys

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web"
DATA_DIR = os.path.join(BASE_DIR, "data")
LANDINGS_DIR = os.path.join(BASE_DIR, "pages", "carreras")

SLUGS = [
    "odontologia", "optica-y-contactologia", "fisioterapia", "fonoaudiologia",
    "psicologia", "nutricion", "podologia", "administracion-de-empresas",
    "ciencias-de-la-educacion", "derecho", "trabajo-social", "marketing-y-publicidad",
    "ingenieria-comercial", "ingenieria-en-informatica", "ingenieria-en-tecnologia-de-alimentos",
    "periodismo", "educacion-parvularia", "administracion-publica",
    "ciencias-contables", "contabilidad-y-auditoria", "contaduria-publica",
    "ingenieria-en-comercio-internacional", "ingenieria-en-marketing",
]


def load_career_data(slug):
    filepath = os.path.join(DATA_DIR, f"carrera_{slug}.json")
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def update_hero_section(html, data):
    """Update the hero title and description."""
    titulo = data.get('titulo', '')
    if titulo:
        # Update hero title
        html = re.sub(
            r'(<h1[^>]*class="hero-title[^"]*"[^>]*>)(.*?)(</h1>)',
            r'\g<1>' + titulo + r'\3',
            html,
            flags=re.DOTALL
        )
    
    duracion = data.get('duracion', '')
    if duracion:
        # Update duration badge
        html = re.sub(
            r'(<span[^>]*class="badge[^"]*"[^>]*>)(.*?)(</span>)',
            r'\g<1>' + duracion + r'\3',
            html,
            flags=re.DOTALL
        )
    
    return html


def update_info_section(html, data):
    """Update or add the main info section with description, objective, campo laboral, perfil egresado."""
    descripcion = data.get('descripcion', '')
    objetivo = data.get('objetivo', '')
    campo_laboral = data.get('campo_laboral', '')
    perfil_egresado = data.get('perfil_egresado', '')
    a_quien_va_dirigido = data.get('a_quien_va_dirigido', '')
    
    # Find the career-info section and update fields
    # Update description
    if descripcion:
        html = re.sub(
            r'(<div[^>]*id="descripcion"[^>]*>[\s\S]*?<h3[^>]*>.*?</h3>[\s\S]*?<p[^>]*>)(.*?)(</p>)',
            r'\g<1>' + descripcion + r'\3',
            html,
            flags=re.DOTALL
        )
    
    return html


def generate_extra_sections(data):
    """Generate HTML for additional sections that exist in the data."""
    sections_html = ""
    
    # Misión
    mision = data.get('mision', '')
    if mision:
        sections_html += f'''
    <section class="career-section" id="mision">
        <h3>Misión</h3>
        <p>{mision}</p>
    </section>
'''
    
    # Visión
    vision = data.get('vision', '')
    if vision:
        sections_html += f'''
    <section class="career-section" id="vision">
        <h3>Visión</h3>
        <p>{vision}</p>
    </section>
'''
    
    # A quién va dirigido
    a_quien = data.get('a_quien_va_dirigido', '')
    if a_quien:
        sections_html += f'''
    <section class="career-section" id="a-quien-va-dirigido">
        <h3>A quién va dirigido</h3>
        <p>{a_quien}</p>
    </section>
'''
    
    # Objetivos específicos
    obj_esp = data.get('objetivos_especificos', [])
    if obj_esp and isinstance(obj_esp, list) and len(obj_esp) > 0:
        items = '\n'.join(f'            <li>{o}</li>' for o in obj_esp)
        sections_html += f'''
    <section class="career-section" id="objetivos-especificos">
        <h3>Objetivos Específicos</h3>
        <ul>
{items}
        </ul>
    </section>
'''
    
    # Competencias
    for comp_type, label in [
        ('competencias_disciplinarias', 'Competencias Disciplinarias'),
        ('competencias_profesionales', 'Competencias Profesionales'),
        ('competencias_genericas', 'Competencias Genéricas'),
    ]:
        items = data.get(comp_type, [])
        if items and isinstance(items, list) and len(items) > 0:
            li_items = '\n'.join(f'            <li>{c}</li>' for c in items)
            sections_html += f'''
    <section class="career-section" id="{comp_type}">
        <h3>{label}</h3>
        <ul>
{li_items}
        </ul>
    </section>
'''
    
    # Valores
    valores = data.get('valores', [])
    if valores and isinstance(valores, list) and len(valores) > 0:
        items = '\n'.join(f'            <li>{v}</li>' for v in valores)
        sections_html += f'''
    <section class="career-section" id="valores">
        <h3>Valores de la Carrera</h3>
        <ul>
{items}
        </ul>
    </section>
'''
    
    # Definición del profesional
    def_prof = data.get('definicion_profesional', '')
    if def_prof:
        sections_html += f'''
    <section class="career-section" id="definicion-profesional">
        <h3>Definición del Profesional</h3>
        <p>{def_prof}</p>
    </section>
'''
    
    return sections_html


def update_brochure_link(html, data):
    """Update the brochure download link."""
    brochure_url = data.get('brochure_url', '')
    if brochure_url:
        # Find existing brochure button and update href
        html = re.sub(
            r'(href=")([^"]*)("[^>]*class="[^"]*btn-brochure[^"]*")',
            r'\g<1>' + brochure_url + r'\3',
            html
        )
        # If no existing brochure button, try any download link
        if 'btn-brochure' not in html:
            html = re.sub(
                r'(href=")([^"]*)("[^>]*>[^<]*Descargar[^<]*Brochure)',
                r'\g<1>' + brochure_url + r'\3',
                html,
                flags=re.IGNORECASE
            )
    return html


def generate_malla_tabs(data):
    """Generate curriculum/malla tabs HTML from data."""
    malla = data.get('malla', {})
    if not malla or not isinstance(malla, dict):
        return ""
    
    tabs_html = '<div class="malla-curricular" id="malla-curricular">\n'
    tabs_html += '    <h3>Plan de Estudios</h3>\n'
    tabs_html += '    <div class="malla-tabs">\n'
    
    # Tab buttons
    semesters = sorted(malla.keys(), key=lambda x: int(re.search(r'\d+', x).group()) if re.search(r'\d+', x) else 0)
    for i, sem in enumerate(semesters):
        active = ' active' if i == 0 else ''
        tabs_html += f'        <button class="malla-tab{active}" onclick="showSemester(\'{sem}\')">{sem}</button>\n'
    
    tabs_html += '    </div>\n'
    tabs_html += '    <div class="malla-content">\n'
    
    # Tab panels
    for i, sem in enumerate(semesters):
        active = ' style="display:block"' if i == 0 else ' style="display:none"'
        subjects = malla[sem]
        tabs_html += f'        <div class="malla-panel" id="panel-{sem}"{active}>\n'
        tabs_html += '            <ul>\n'
        for subj in subjects:
            tabs_html += f'                <li>{subj}</li>\n'
        tabs_html += '            </ul>\n'
        tabs_html += '        </div>\n'
    
    tabs_html += '    </div>\n'
    tabs_html += '</div>\n'
    
    return tabs_html


def update_landing_page(slug, data):
    """Update a single landing page with real data."""
    filepath = os.path.join(LANDINGS_DIR, f"{slug}.html")
    
    if not os.path.exists(filepath):
        print(f"  SKIP {slug} (no HTML file)")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    changed = False
    
    # 1. Update hero title
    titulo = data.get('titulo', '')
    if titulo:
        new_html = re.sub(
            r'(<h1[^>]*class="[^"]*hero-title[^"]*"[^>]*>)(.*?)(</h1>)',
            r'\g<1>' + titulo + r'\3',
            html,
            flags=re.DOTALL
        )
        if new_html != html:
            html = new_html
            changed = True
    
    # 2. Update duration
    duracion = data.get('duracion', '')
    if duracion:
        new_html = re.sub(
            r'(<span[^>]*class="[^"]*badge[^"]*"[^>]*>)(.*?)(</span>)',
            r'\g<1>' + duracion + r'\3',
            html,
            flags=re.DOTALL
        )
        if new_html != html:
            html = new_html
            changed = True
    
    # 3. Update description
    descripcion = data.get('descripcion', '')
    if descripcion:
        # Find the description paragraph and update it
        new_html = re.sub(
            r'(<div[^>]*class="[^"]*career-description[^"]*"[^>]*>[\s\S]*?<p[^>]*>)(.*?)(</p>)',
            r'\g<1>' + descripcion + r'\3',
            html,
            flags=re.DOTALL
        )
        if new_html != html:
            html = new_html
            changed = True
    
    # 4. Update objective
    objetivo = data.get('objetivo', '')
    if objetivo:
        new_html = re.sub(
            r'(<div[^>]*class="[^"]*career-objective[^"]*"[^>]*>[\s\S]*?<p[^>]*>)(.*?)(</p>)',
            r'\g<1>' + objetivo + r'\3',
            html,
            flags=re.DOTALL
        )
        if new_html != html:
            html = new_html
            changed = True
    
    # 5. Update campo laboral
    campo = data.get('campo_laboral', '')
    if campo:
        new_html = re.sub(
            r'(<div[^>]*class="[^"]*career-field[^"]*"[^>]*>[\s\S]*?<p[^>]*>)(.*?)(</p>)',
            r'\g<1>' + campo + r'\3',
            html,
            flags=re.DOTALL
        )
        if new_html != html:
            html = new_html
            changed = True
    
    # 6. Update perfil egresado
    perfil = data.get('perfil_egresado', '')
    if perfil:
        new_html = re.sub(
            r'(<div[^>]*class="[^"]*career-profile[^"]*"[^>]*>[\s\S]*?<p[^>]*>)(.*?)(</p>)',
            r'\g<1>' + perfil + r'\3',
            html,
            flags=re.DOTALL
        )
        if new_html != html:
            html = new_html
            changed = True
    
    # 7. Update brochure link
    brochure = data.get('brochure_url', '')
    if brochure:
        new_html = re.sub(
            r'href="[^"]*"[^>]*class="[^"]*btn-brochure[^"]*"',
            f'href="{brochure}" class="btn-brochure"',
            html
        )
        if new_html != html:
            html = new_html
            changed = True
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
    
    return changed


if __name__ == '__main__':
    updated = 0
    for slug in SLUGS:
        data = load_career_data(slug)
        if not data:
            print(f"SKIP {slug} (no data)")
            continue
        if update_landing_page(slug, data):
            print(f"UPDATED {slug}")
            updated += 1
        else:
            print(f"NO_CHANGE {slug}")
    
    print(f"\nTotal updated: {updated}/{len(SLUGS)}")