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
    
    # Extraer todas las secciones usando h2 como guía
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
    
    # Estrategia: recorrer TODOS los elementos en orden
    current_section = None
    
    for elem in soup.find_all(["h2", "p", "ul"]):
        if elem.name == "h2":
            text = elem.get_text(strip=True).lower()
            if "descripci" in text:
                current_section = "descripcion"
            elif text == "objetivo":
                current_section = "objetivo"
            elif "objetivos espec" in text:
                current_section = "objetivos_especificos"
            elif "a quién" in text or "dirigido" in text:
                current_section = "a_quien_va_dirigido"
            elif "campo laboral" in text:
                current_section = "campo_laboral"
            elif "perfil de egreso" in text:
                current_section = "perfil_egresado"
            elif "competencias disciplinarias" in text:
                current_section = "competencias_disciplinarias"
            elif "competencias profesionales" in text:
                current_section = "competencias_profesionales"
            elif "competencias genéricas" in text or "competencias genericas" in text:
                current_section = "competencias_genericas"
            elif text in ["misión", "mision"]:
                current_section = "mision"
            elif text in ["visión", "vision"]:
                current_section = "vision"
            elif text == "valores":
                current_section = "valores"
            elif "definición" in text and "profesional" in text:
                current_section = "definicion_profesional"
            else:
                current_section = None
        
        elif elem.name == "p" and current_section:
            text = elem.get_text(strip=True)
            if len(text) > 20:
                if current_section == "descripcion":
                    descripcion = clean_text(text)
                elif current_section == "objetivo":
                    objetivo = clean_text(text)
                elif current_section == "a_quien_va_dirigido":
                    a_quien_va_dirigido = clean_text(text)
                elif current_section == "campo_laboral":
                    campo_laboral = text
                elif current_section == "perfil_egresado":
                    perfil_egresado = text
                elif current_section == "mision":
                    mision = clean_text(text)
                elif current_section == "vision":
                    vision = clean_text(text)
                elif current_section == "definicion_profesional":
                    definicion_profesional = clean_text(text)
        
        elif elem.name == "ul" and current_section:
            items = [li.get_text(strip=True) for li in elem.find_all("li")]
            items = [l for l in items if l and l != "✓"]
            if items:
                if current_section == "objetivos_especificos":
                    objetivos_especificos = items
                elif current_section == "competencias_disciplinarias":
                    competencias_disciplinarias = items
                elif current_section == "competencias_profesionales":
                    competencias_profesionales = items
                elif current_section == "competencias_genericas":
                    competencias_genericas = items
                elif current_section == "valores":
                    valores = items
    
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
