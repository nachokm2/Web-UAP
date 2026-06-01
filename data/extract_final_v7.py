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
    
    # Extraer secciones usando todas las listas icon-list
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
    
    # Primero, procesar TODOS los widgets y extraer su información
    all_sections = []
    
    for widget in soup.find_all("div", class_=re.compile("elementor-widget")):
        ul = widget.find("ul")
        h2 = widget.find("h2")
        
        if h2:
            label = h2.get_text(strip=True).lower()
            # Obtener contenido del widget excluyendo el h2
            container = widget.find("div", class_="elementor-widget-container")
            if container:
                texts = []
                for elem in container.descendants:
                    if isinstance(elem, str):
                        inside_h2 = any(p.name == "h2" for p in elem.parents)
                        if not inside_h2:
                            t = elem.strip()
                            if t and t != h2.get_text(strip=True):
                                texts.append(t)
                body = " ".join(texts).strip()
                if body and len(body) > 10:
                    all_sections.append((label, body))
        
        if ul:
            items = [li.get_text(strip=True) for li in ul.find_all("li")]
            if items:
                label = items[0].lower()
                if len(items) > 1:
                    body = " ".join(items[1:])
                    all_sections.append((label, body))
    
    # Procesar las secciones encontradas
    for label, body in all_sections:
        l = label.lower()
        if "descripci" in l and len(body) > 50:
            if not descripcion or len(body) > len(descripcion):
                descripcion = clean_text(body)
        elif l == "objetivo" and len(body) > 50:
            if not objetivo or len(body) > len(objetivo):
                objetivo = clean_text(body)
        elif "objetivos espec" in l:
            if not objetivos_especificos:
                objetivos_especificos = [line for line in body.split("\n") if line.strip() and line.strip() != "✓"]
        elif "a quién" in l or "dirigido" in l:
            a_quien_va_dirigido = clean_text(body)
        elif "campo laboral" in l or "campo de trabajo" in l:
            if not campo_laboral or len(body) > len(campo_laboral):
                campo_laboral = body
        elif "perfil de egreso" in l or "perfil del egresado" in l:
            if not perfil_egresado or len(body) > len(perfil_egresado):
                perfil_egresado = body
        elif "competencias disciplinarias" in l:
            competencias_disciplinarias = [line for line in body.split("\n") if line.strip() and line.strip() != "✓"]
        elif "competencias profesionales" in l:
            competencias_profesionales = [line for line in body.split("\n") if line.strip() and line.strip() != "✓"]
        elif "competencias genéricas" in l or "competencias genericas" in l:
            competencias_genericas = [line for line in body.split("\n") if line.strip() and line.strip() != "✓"]
        elif l == "misión" or l == "mision":
            mision = clean_text(body)
        elif l == "visión" or l == "vision":
            vision = clean_text(body)
        elif l == "valores":
            valores = [line for line in body.split("\n") if line.strip() and line.strip() != "✓"]
        elif "definición" in l and "profesional" in l:
            definicion_profesional = clean_text(body)
    
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
