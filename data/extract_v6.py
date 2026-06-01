import re
import json
import requests
from bs4 import BeautifulSoup

urls = [
    ("https://uap.edu.py/administracion-de-empresas/", "carrera_administracion-de-empresas", "Administración de Empresas"),
    ("https://uap.edu.py/ciencias-de-la-educacion/", "carrera_ciencias-de-la-educacion", "Ciencias de la Educación"),
    ("https://uap.edu.py/derecho/", "carrera_derecho", "Derecho"),
    ("https://uap.edu.py/trabajo-social/", "carrera_trabajo-social", "Trabajo Social"),
    ("https://uap.edu.py/marketing-y-publicidad/", "carrera_marketing-y-publicidad", "Marketing y Publicidad"),
    ("https://uap.edu.py/ingenieria-comercial/", "carrera_ingenieria-comercial", "Ingeniería Comercial"),
    ("https://uap.edu.py/ingenieria-informatica/", "carrera_ingenieria-en-informatica", "Ingeniería en Informática"),
]

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\n\s*\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

for url, slug, titulo_default in urls:
    print(f"\n=== Procesando: {url} ===")
    resp = requests.get(url, headers=headers, timeout=30)
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    
    # Título
    titulo = titulo_default
    for h2 in soup.find_all("h2", class_=re.compile("elementor-heading-title")):
        t = h2.get_text(strip=True)
        if t and len(t) < 100 and t not in ["Título", "Duración", "Sede", "plan de estudios", "Otras carreras", "Menú", "link de interes", "contacto"]:
            if any(word in t.lower() for word in ["administraci", "educaci", "derecho", "trabajo", "marketing", "ingeniería", "ingenieria"]):
                titulo = t
                break
    
    # Brochure
    brochure_url = ""
    for a in soup.find_all("a", href=True):
        text = a.get_text(strip=True).lower()
        href = a["href"]
        if "brochure" in text or "brochure" in href.lower():
            brochure_url = href
            if brochure_url.startswith("/"):
                brochure_url = "https://uap.edu.py" + brochure_url
            break
    
    # Duración y Sede
    duracion = ""
    sede = ""
    for widget in soup.find_all("div", class_=lambda x: x and "elementor-widget-text-editor" in x):
        text = widget.get_text(strip=True)
        if re.search(r'\d+\s*semestres?', text, re.I) and len(text) < 50:
            duracion = text
        elif text.lower() == "central" and len(text) < 20:
            sede = text
    
    # Extraer secciones usando una estrategia diferente:
    # Buscar todos los widgets icon-list que tengan labels
    descripcion = ""
    objetivo = ""
    objetivos_especificos = []
    a_quien_va_dirigido = ""
    campo_laboral = ""
    perfil_egresado = ""
    competencias_disciplinarias = []
    competencias_profesionales = []
    competencias_genericas = []
    mision = ""
    vision = ""
    valores = []
    definicion_profesional = ""
    
    # Buscar todos los icon-list widgets
    icon_lists = soup.find_all("div", class_=re.compile("elementor-widget-icon-list"))
    
    for idx, widget in enumerate(icon_lists):
        ul = widget.find("ul")
        if ul:
            items = [li.get_text(strip=True) for li in ul.find_all("li")]
            if not items:
                continue
            
            section_name = items[0].lower()
            
            # Si el contenido está en los items del mismo widget (items[1], items[2], etc.)
            if len(items) > 1 and len(items[1]) > 50:
                content = " ".join(items[1:])
                if section_name == "descripción":
                    descripcion = clean_text(content)
                elif section_name == "objetivo":
                    objetivo = clean_text(content)
                elif "objetivos espec" in section_name:
                    objetivos_especificos = [l for l in items[1:] if l and l != "✓"]
                elif "a quién" in section_name or "dirigido" in section_name:
                    a_quien_va_dirigido = clean_text(content)
                elif section_name == "campo laboral":
                    campo_laboral = content
                elif section_name == "perfil de egreso":
                    perfil_egresado = content
                elif "competencias disciplinarias" in section_name:
                    competencias_disciplinarias = [l for l in items[1:] if l and l != "✓"]
                elif "competencias profesionales" in section_name:
                    competencias_profesionales = [l for l in items[1:] if l and l != "✓"]
                elif "competencias genéricas" in section_name or "competencias genericas" in section_name:
                    competencias_genericas = [l for l in items[1:] if l and l != "✓"]
                elif section_name in ["misión", "mision"]:
                    mision = clean_text(content)
                elif section_name in ["visión", "vision"]:
                    vision = clean_text(content)
                elif section_name == "valores":
                    valores = [l for l in items[1:] if l and l != "✓"]
                elif "definición" in section_name and "profesional" in section_name:
                    definicion_profesional = clean_text(content)
            
            # Si solo hay un item (el label), buscar el siguiente icon-list widget
            elif len(items) == 1:
                if idx + 1 < len(icon_lists):
                    next_widget = icon_lists[idx + 1]
                    next_ul = next_widget.find("ul")
                    if next_ul:
                        next_items = [li.get_text(strip=True) for li in next_ul.find_all("li")]
                        next_items = [l for l in next_items if l and l != "✓"]
                        if next_items and len(next_items[0]) > 50:
                            content = " ".join(next_items)
                            if section_name == "descripción":
                                descripcion = clean_text(content)
                            elif section_name == "objetivo":
                                objetivo = clean_text(content)
                            elif "objetivos espec" in section_name:
                                objetivos_especificos = next_items
                            elif "a quién" in section_name or "dirigido" in section_name:
                                a_quien_va_dirigido = clean_text(content)
                            elif section_name == "campo laboral":
                                campo_laboral = content
                            elif section_name == "perfil de egreso":
                                perfil_egresado = content
                            elif "competencias disciplinarias" in section_name:
                                competencias_disciplinarias = next_items
                            elif "competencias profesionales" in section_name:
                                competencias_profesionales = next_items
                            elif "competencias genéricas" in section_name or "competencias genericas" in section_name:
                                competencias_genericas = next_items
                            elif section_name in ["misión", "mision"]:
                                mision = clean_text(content)
                            elif section_name in ["visión", "vision"]:
                                vision = clean_text(content)
                            elif section_name == "valores":
                                valores = next_items
                            elif "definición" in section_name and "profesional" in section_name:
                                definicion_profesional = clean_text(content)
    
    # Malla curricular
    malla = {}
    tab_contents = soup.find_all("div", class_="elementor-tab-content")
    for tc in tab_contents:
        tab = tc.get("data-tab", "")
        if not tab or not tab.isdigit():
            continue
        sem_text = f"{tab}° Semestre"
        materias = []
        for tr in tc.find_all("tr"):
            td = tr.find("td")
            if td:
                mat = td.get_text(strip=True)
                if mat and mat not in materias and len(mat) > 2:
                    materias.append(mat)
        if materias:
            malla[sem_text] = materias
    
    print(f"Título: {titulo}")
    print(f"Duración: {duracion}")
    print(f"Sede: {sede}")
    print(f"Brochure: {brochure_url}")
    print(f"Descripción: {descripcion[:80] if descripcion else 'EMPTY'}...")
    print(f"Objetivo: {objetivo[:80] if objetivo else 'EMPTY'}...")
    print(f"Campo Laboral: {campo_laboral[:80] if campo_laboral else 'EMPTY'}...")
    print(f"Perfil: {perfil_egresado[:80] if perfil_egresado else 'EMPTY'}...")
    print(f"Malla: {list(malla.keys())}")
    
    data = {
        "titulo": titulo,
        "duracion": duracion,
        "sede": sede,
        "descripcion": descripcion,
        "objetivo": objetivo,
        "objetivos_especificos": objetivos_especificos,
        "a_quien_va_dirigido": a_quien_va_dirigido,
        "campo_laboral": campo_laboral,
        "perfil_egresado": perfil_egresado,
        "competencias_disciplinarias": competencias_disciplinarias,
        "competencias_profesionales": competencias_profesionales,
        "competencias_genericas": competencias_genericas,
        "mision": mision,
        "vision": vision,
        "valores": valores,
        "definicion_profesional": definicion_profesional,
        "malla": malla,
        "brochure_url": brochure_url
    }
    
    out_path = f"/Users/esteban/.openclaw/workspace-uap/uap-web/data/{slug}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Guardado en {out_path}")

print("\n¡Listo!")
