#!/usr/bin/env python3
"""
Rebuild all 23 career landing pages with real data from uap.edu.py.
Preserves the header and footer structure but replaces all career content
with real data from the carrera_*.json files.
"""

import json, os, re

BASE_DIR = "/Users/esteban/.openclaw/workspace-uap/uap-web"
DATA_DIR = os.path.join(BASE_DIR, "data")
LANDINGS_DIR = os.path.join(BASE_DIR, "pages", "carreras")

# Read the derecho landing as template for header
with open(os.path.join(LANDINGS_DIR, "derecho.html"), 'r', encoding='utf-8') as f:
    TEMPLATE_HTML = f.read()

# Use a corrected header with proper career slugs
HEADER = '''<header class="header" style="position: relative;">
        <div class="container header-inner">
            <a href="../index.html" class="logo">
                <img src="../../images/logo-uap.png" alt="UAP - Universidad Aut\u00f3noma del Paraguay" class="logo-img">
            </a>
            <button class="mobile-menu-btn" onclick="document.querySelector(\'.nav\').classList.toggle(\'active\')">\u2630</button>
            <nav>
                <ul class="nav">
                    <li><a href="../index.html" >Inicio</a></li>
                    <li class="dropdown">
                        <a href="../carreras.html">Carreras</a>
                        <div class="dropdown-content careers-dropdown">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-2);">
                                <div>
                                    <div class="dropdown-faculty">Ciencias M\u00e9dicas y de la Salud</div>
                                    <a href="odontologia.html">Odontolog\u00eda</a>
                                    <a href="fisioterapia.html">Fisioterapia</a>
                                    <a href="fonoaudiologia.html">Fonoaudiolog\u00eda</a>
                                    <a href="psicologia.html">Psicolog\u00eda</a>
                                    <a href="nutricion.html">Nutrici\u00f3n</a>
                                    <a href="podologia.html">Podolog\u00eda</a>
                                    <a href="optica-y-contactologia.html">\u00d3ptica y Contactolog\u00eda</a>
                                </div>
                                <div>
                                    <div class="dropdown-faculty">Ingenier\u00edas y Tecnolog\u00edas</div>
                                    <a href="ingenieria-en-informatica.html">Ingenier\u00eda en Inform\u00e1tica</a>
                                    <a href="ingenieria-en-tecnologia-de-alimentos.html">Ingenier\u00eda en Tecnolog\u00eda de Alimentos</a>
                                    <a href="ingenieria-comercial.html">Ingenier\u00eda Comercial</a>
                                    <a href="ingenieria-en-comercio-internacional.html">Ingenier\u00eda en Comercio Internacional</a>
                                    <a href="ingenieria-en-marketing.html">Ingenier\u00eda en Marketing</a>
                                </div>
                                <div>
                                    <div class="dropdown-faculty">Ciencias Sociales y Humanas</div>
                                    <a href="marketing-y-publicidad.html">Marketing y Publicidad</a>
                                    <a href="periodismo.html">Periodismo</a>
                                    <a href="ciencias-de-la-educacion.html">Ciencias de la Educaci\u00f3n</a>
                                    <a href="educacion-parvularia.html">Educaci\u00f3n Parvularia</a>
                                    <a href="derecho.html">Derecho</a>
                                    <a href="trabajo-social.html">Trabajo Social</a>
                                    <a href="administracion-publica.html">Administraci\u00f3n P\u00fablica</a>
                                    <a href="administracion-de-empresas.html">Administraci\u00f3n de Empresas</a>
                                    <a href="ciencias-contables.html">Ciencias Contables</a>
                                    <a href="contabilidad-y-auditoria.html">Contabilidad y Auditor\u00eda</a>
                                    <a href="contaduria-publica.html">Contadur\u00eda P\u00fablica</a>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li class="dropdown">
                        <a href="../posgrados.html">Posgrados</a>
                        <div class="dropdown-content">
                            <div class="dropdown-faculty">Facultad de Ciencias M\u00e9dicas y de la Salud</div>
                            <a href="../posgrados.html#odontologicas">Odontolog\u00eda</a>
                            <div class="dropdown-faculty">Facultad de Ciencias Sociales y Humanas</div>
                            <a href="../posgrados.html#educacion">Educaci\u00f3n</a>
                            <a href="../posgrados.html#psicologia">Psicolog\u00eda</a>
                        </div>
                    </li>
                    <li><a href="../noticias.html">Noticias</a></li>
                    <li class="dropdown">
                        <a href="../institucional.html">Institucional</a>
                        <div class="dropdown-content">
                            <a href="../institucional.html">Misi\u00f3n, Visi\u00f3n y Valores</a>
                            <a href="../institucional.html#autoridades">Autoridades</a>
                            <a href="../institucional.html#convenios">Convenios</a>
                            <a href="../institucional.html#reglamentos">Reglamentos</a>
                        </div>
                    </li>
                    <li><a href="../investigacion.html">Investigaci\u00f3n</a></li>
                    <li><a href="../estudiantes.html">Estudiantes</a></li>
                    <li><a href="../contacto.html">Contacto</a></li>
                </ul>
            </nav>
        </div>
    </header>'''

# Use a generic, correct footer
FOOTER = '''<footer style="background: #003366; color: white; padding: 40px 0 20px; margin-top: 40px;">
        <div class="container">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div>
                    <img src="../../images/logo-white.png" alt="UAP" style="height: 40px; margin-bottom: 12px;">
                    <p style="opacity: 0.8; font-size: 14px;">Universidad Autónoma del Paraguay.<br>Comprometidos con la excelencia académica.</p>
                    <p style="opacity: 0.6; font-size: 13px; margin-top: 12px;">Colón No 658 e/Haedo, Asunción<br>+595 21 447 579<br>info@uap.edu.py</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 12px; font-size: 14px;">Carreras</h4>
                    <ul style="list-style: none; font-size: 13px; opacity: 0.7;">
                        <li><a href="odontologia.html" style="color: white; text-decoration: none;">Odontología</a></li>
                        <li><a href="derecho.html" style="color: white; text-decoration: none;">Derecho</a></li>
                        <li><a href="psicologia.html" style="color: white; text-decoration: none;">Psicología</a></li>
                        <li><a href="../carreras.html" style="color: white; text-decoration: none;">Ver todas</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 12px; font-size: 14px;">Posgrados</h4>
                    <ul style="list-style: none; font-size: 13px; opacity: 0.7;">
                        <li><a href="../posgrados.html" style="color: white; text-decoration: none;">Maestrías</a></li>
                        <li><a href="../posgrados.html" style="color: white; text-decoration: none;">Especializaciones</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 12px; font-size: 14px;">Institucional</h4>
                    <ul style="list-style: none; font-size: 13px; opacity: 0.7;">
                        <li><a href="../institucional.html" style="color: white; text-decoration: none;">Sobre la UAP</a></li>
                        <li><a href="../institucional.html#autoridades" style="color: white; text-decoration: none;">Autoridades</a></li>
                        <li><a href="../contacto.html" style="color: white; text-decoration: none;">Contacto</a></li>
                    </ul>
                </div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; text-align: center; font-size: 13px; opacity: 0.6;">
                Universidad Autónoma del Paraguay &copy; 2026
            </div>
        </div>
    </footer>'''

# Extract the inline CSS
STYLE_MATCH = re.search(r'<style>(.*?)</style>', TEMPLATE_HTML, re.DOTALL)
INLINE_CSS = STYLE_MATCH.group(1) if STYLE_MATCH else ''

SLUGS = [
    "odontologia", "optica-y-contactologia", "fisioterapia", "fonoaudiologia",
    "psicologia", "nutricion", "podologia", "administracion-de-empresas",
    "ciencias-de-la-educacion", "derecho", "trabajo-social", "marketing-y-publicidad",
    "ingenieria-comercial", "ingenieria-en-informatica", "ingenieria-en-tecnologia-de-alimentos",
    "periodismo", "educacion-parvularia", "administracion-publica",
    "ciencias-contables", "contabilidad-y-auditoria", "contaduria-publica",
    "ingenieria-en-comercio-internacional", "ingenieria-en-marketing",
]


def build_info_grid(data):
    """Build the info cards grid with titulo, duracion, sede."""
    cards = []
    titulo = data.get('titulo', '')
    if titulo:
        cards.append(f'''                <div class="info-card">
                    <h3>Título</h3>
                    <p>{titulo}</p>
                </div>''')
    
    duracion = data.get('duracion', '')
    if duracion:
        cards.append(f'''                <div class="info-card">
                    <h3>Duración</h3>
                    <p>{duracion}</p>
                </div>''')
    
    sede = data.get('sede', '')
    if sede:
        cards.append(f'''                <div class="info-card">
                    <h3>Sede</h3>
                    <p>{sede}</p>
                </div>''')
    
    return '\n'.join(cards) if cards else ''


def build_malla_section(data):
    """Build curriculum section from malla data."""
    malla = data.get('malla', {})
    if not malla or not isinstance(malla, dict):
        return ''
    
    # Sort semesters
    def sort_key(sem):
        m = re.search(r'(\d+)', sem)
        return int(m.group(1)) if m else 999
    
    semesters = sorted(malla.keys(), key=sort_key)
    if not semesters:
        return ''
    
    tabs = []
    panels = []
    for i, sem in enumerate(semesters):
        active = ' active' if i == 0 else ''
        tabs.append(f'                <button class="malla-tab{active}" onclick="showSemester(\'{sem}\')">{sem}</button>')
        
        subjects = malla[sem]
        subject_items = '\n'.join(f'                        <li>{s}</li>' for s in subjects)
        display = 'block' if i == 0 else 'none'
        panels.append(f'''            <div class="malla-panel" id="panel-{sem}" style="display:{display}">
                <ul>
{subject_items}
                </ul>
            </div>''')
    
    return f'''
            <section class="malla-section">
                <h2 style="color: #003366; margin-bottom: 20px;">Plan de Estudios</h2>
                <div class="malla-tabs">
{chr(10).join(tabs)}
                </div>
                <div class="malla-content">
{chr(10).join(panels)}
                </div>
            </section>'''


def build_profile_section(data):
    """Build perfil de egresado section."""
    perfil = data.get('perfil_egresado', '')
    if not perfil:
        return ''
    
    return f'''
            <div class="profile-section">
                <h2 style="color: #003366; margin-bottom: 16px;">Perfil del Graduado</h2>
                <p>{perfil}</p>
            </div>'''


def build_campo_laboral_section(data):
    """Build campo laboral section."""
    campo = data.get('campo_laboral', '')
    if not campo:
        return ''
    
    return f'''
            <div class="profile-section" style="border-left: 4px solid #0066cc;">
                <h2 style="color: #003366; margin-bottom: 16px;">Campo Laboral</h2>
                <p>{campo}</p>
            </div>'''


def build_extra_sections(data):
    """Build additional sections: mision, vision, objetivos, competencias, valores."""
    sections = []
    
    # Misión
    mision = data.get('mision', '')
    if mision:
        sections.append(f'''
            <div class="profile-section" style="background: #f0f4f8; border-left: 4px solid #003366;">
                <h2 style="color: #003366; margin-bottom: 16px;">Misión</h2>
                <p>{mision}</p>
            </div>''')
    
    # Visión
    vision = data.get('vision', '')
    if vision:
        sections.append(f'''
            <div class="profile-section" style="background: #f0f4f8; border-left: 4px solid #0066cc;">
                <h2 style="color: #003366; margin-bottom: 16px;">Visión</h2>
                <p>{vision}</p>
            </div>''')
    
    # A quién va dirigido
    a_quien = data.get('a_quien_va_dirigido', '')
    if a_quien:
        sections.append(f'''
            <div class="profile-section" style="background: #fafafa; border-left: 4px solid #666;">
                <h2 style="color: #003366; margin-bottom: 16px;">A quién va dirigido</h2>
                <p>{a_quien}</p>
            </div>''')
    
    # Objetivos específicos
    obj_esp = data.get('objetivos_especificos', [])
    if obj_esp and isinstance(obj_esp, list) and len(obj_esp) > 0:
        items = '\n'.join(f'                    <li>{o}</li>' for o in obj_esp)
        sections.append(f'''
            <div class="profile-section">
                <h2 style="color: #003366; margin-bottom: 16px;">Objetivos Específicos</h2>
                <ul style="list-style: none; padding: 0;">
{items}
                </ul>
            </div>''')
    
    # Competencias
    for comp_type, label in [
        ('competencias_disciplinarias', 'Competencias Disciplinarias'),
        ('competencias_profesionales', 'Competencias Profesionales'),
        ('competencias_genericas', 'Competencias Genéricas'),
    ]:
        items = data.get(comp_type, [])
        if items and isinstance(items, list) and len(items) > 0:
            li_items = '\n'.join(f'                    <li>{c}</li>' for c in items)
            sections.append(f'''
            <div class="profile-section">
                <h2 style="color: #003366; margin-bottom: 16px;">{label}</h2>
                <ul style="list-style: none; padding: 0;">
{li_items}
                </ul>
            </div>''')
    
    # Valores
    valores = data.get('valores', [])
    if valores and isinstance(valores, list) and len(valores) > 0:
        items = '\n'.join(f'                    <li>{v}</li>' for v in valores)
        sections.append(f'''
            <div class="profile-section">
                <h2 style="color: #003366; margin-bottom: 16px;">Valores de la Carrera</h2>
                <ul style="list-style: none; padding: 0;">
{items}
                </ul>
            </div>''')
    
    # Definición del profesional
    def_prof = data.get('definicion_profesional', '')
    if def_prof:
        sections.append(f'''
            <div class="profile-section">
                <h2 style="color: #003366; margin-bottom: 16px;">Definición del Profesional</h2>
                <p>{def_prof}</p>
            </div>''')
    
    return '\n'.join(sections)


def build_contact_form(data):
    """Build contact form section."""
    titulo = data.get('titulo', '')
    return f'''
            <div style="background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 32px 0;">
                <h2 style="color: #003366; margin-bottom: 8px;">Solicita información</h2>
                <p style="color: #666; margin-bottom: 24px;">Completa el formulario y un asesor se contactará contigo.</p>
                <form class="contact-form">
                    <div class="form-group full">
                        <label>Nombre completo *</label>
                        <input type="text" placeholder="Tu nombre completo" required>
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" placeholder="tu@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" placeholder="+595 9XX XXX XXX" required>
                    </div>
                    <div class="form-group full">
                        <label>Mensaje</label>
                        <textarea placeholder="Tus dudas o consultas sobre {titulo}..." rows="4"></textarea>
                    </div>
                    <button type="submit" class="btn-submit">Enviar consulta</button>
                </form>
            </div>'''


def build_brochure_button(data):
    """Build brochure download button."""
    brochure_url = data.get('brochure_url', '')
    if brochure_url:
        return f'\n            <a href="{brochure_url}" class="brochure-btn" target="_blank">Descargar Brochure</a>'
    return ''


def build_career_page(slug, data):
    """Build complete career landing page."""
    titulo = data.get('titulo', slug.replace('-', ' ').title())
    descripcion = data.get('descripcion', '')
    objetivo = data.get('objetivo', '')
    
    # Hero description: use descripcion if available, otherwise objetivo
    hero_desc = descripcion if descripcion else objetivo
    
    # Page title
    page_title = f"{titulo} - UAP"
    
    info_grid = build_info_grid(data)
    malla_section = build_malla_section(data)
    perfil_section = build_profile_section(data)
    campo_section = build_campo_laboral_section(data)
    extra_sections = build_extra_sections(data)
    contact_form = build_contact_form(data)
    brochure_btn = build_brochure_button(data)
    
    # Build objective section if both descripcion and objetivo exist
    objective_section = ''
    if descripcion and objetivo:
        objective_section = f'''
            <div class="profile-section" style="background: #f5f5f5;">
                <h2 style="color: #003366; margin-bottom: 16px;">Objetivo</h2>
                <p>{objetivo}</p>
            </div>'''
    
    # Malla tabs CSS + JS
    malla_css_js = '''
        .malla-tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .malla-tab { padding: 8px 16px; border: 1px solid #003366; background: white; color: #003366; border-radius: 6px; cursor: pointer; font-size: 13px; }
        .malla-tab.active { background: #003366; color: white; }
        .malla-panel ul { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 8px; }
        .malla-panel li { padding: 10px 16px; background: #f5f5f5; border-radius: 6px; font-size: 14px; border-left: 3px solid #003366; }
        @media (max-width: 768px) { .malla-tab { font-size: 12px; padding: 6px 12px; } .malla-panel ul { grid-template-columns: 1fr; } }
    '''
    malla_js = '''
        function showSemester(sem) {
            document.querySelectorAll('.malla-panel').forEach(p => p.style.display = 'none');
            document.querySelectorAll('.malla-tab').forEach(t => t.classList.remove('active'));
            var panel = document.getElementById('panel-' + sem);
            if (panel) panel.style.display = 'block';
            event.target.classList.add('active');
        }
    '''
    
    html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{page_title}</title>
    <link rel="stylesheet" href="../../css/uap-refined.css">
    <style>
        .career-hero {{
            background: linear-gradient(135deg, #003366 0%, #0066cc 100%);
            color: white;
            padding: 60px 0 40px;
        }}
        .career-hero h1 {{
            font-size: 36px;
            margin-bottom: 12px;
        }}
        .career-hero p {{
            font-size: 16px;
            opacity: 0.9;
            max-width: 700px;
            line-height: 1.6;
        }}
        .info-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 32px 0;
        }}
        .info-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #003366;
        }}
        .info-card h3 {{
            color: #003366;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }}
        .info-card p {{
            color: #333;
            font-weight: 600;
        }}
        .profile-section {{
            background: #f5f5f5;
            padding: 32px;
            border-radius: 8px;
            margin: 32px 0;
        }}
        .profile-section p {{
            line-height: 1.7;
        }}
        .profile-section ul li {{
            padding: 8px 0;
            color: #555;
            line-height: 1.5;
        }}
        .contact-form {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 24px 0;
        }}
        .form-group {{
            display: flex;
            flex-direction: column;
        }}
        .form-group.full {{
            grid-column: 1 / -1;
        }}
        .form-group label {{
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 4px;
            color: #555;
        }}
        .form-group input,
        .form-group textarea {{
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
        }}
        .btn-submit {{
            grid-column: 1 / -1;
            background: #003366;
            color: white;
            border: none;
            padding: 14px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
        }}
        .btn-submit:hover {{
            background: #0066cc;
        }}
        .brochure-btn {{
            display: inline-block;
            background: white;
            color: #003366;
            border: 2px solid #003366;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
            transition: all 0.2s;
        }}
        .brochure-btn:hover {{
            background: #003366;
            color: white;
        }}
        {malla_css_js}
        @media (max-width: 768px) {{
            .career-hero {{ padding: 40px 0 30px; }}
            .career-hero h1 {{ font-size: 28px; }}
            .contact-form {{ grid-template-columns: 1fr; }}
            .info-grid {{ grid-template-columns: 1fr; }}
            .profile-section {{ padding: 20px; }}
        }}
        .nav.active {{
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
        }}
        .nav.active li {{
            margin: 10px 0;
        }}
        .nav.active a {{
            color: #003366 !important;
            font-size: 16px;
        }}
    </style>
</head>
<body>
    {HEADER}

    <main class="page">
        <div class="career-hero">
            <div class="container">
                <h1>{titulo}</h1>
                {'<p>' + hero_desc + '</p>' if hero_desc else ''}
            </div>
        </div>

        <div class="container">
{info_grid}

{objective_section}

{campo_section}

{perfil_section}

{extra_sections}

{malla_section}

{contact_form}
{brochure_btn}
        </div>
    </main>

    {FOOTER}

    <script>
        // Menu hamburguesa
        document.querySelector('.mobile-menu-btn').addEventListener('click', function() {{
            document.querySelector('.nav').classList.toggle('active');
        }});
        {malla_js}
    </script>
</body>
</html>'''
    
    return html


def main():
    updated = 0
    for slug in SLUGS:
        filepath = os.path.join(DATA_DIR, f"carrera_{slug}.json")
        if not os.path.exists(filepath):
            print(f"SKIP {slug} (no data file)")
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Skip careers with essentially no data
        available_fields = sum(1 for k in ['titulo', 'duracion', 'sede', 'descripcion', 'objetivo', 'campo_laboral', 'perfil_egresado'] if data.get(k))
        if available_fields < 2:
            print(f"SKIP {slug} (only {available_fields} basic fields)")
            continue
        
        html = build_career_page(slug, data)
        
        landing_path = os.path.join(LANDINGS_DIR, f"{slug}.html")
        with open(landing_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"REBUILT {slug} ({available_fields} fields, malla={sum(len(v) for v in data.get('malla',{}).values()) if isinstance(data.get('malla'), dict) else 0} subjects)")
        updated += 1
    
    print(f"\nTotal rebuilt: {updated}/{len(SLUGS)}")


if __name__ == '__main__':
    main()