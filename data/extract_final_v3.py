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
    
    # Duración, Sede, Título grado - Buscar en TODOS los widgets
    duracion = ""
    sede = ""
    titulo_grado = ""
    
    # Buscar widgets con h2 específico
    for widget in soup.find_all("div", class_=re.compile("elementor-widget")):
        h2 = widget.find("h2", class_=re.compile("elementor-heading-title"))
        if h2:
            label = h2.get_text(strip=True).lower()
            # Obtener todo el texto del widget excepto el h2
            container = widget.find("div", class_="elementor-widget-container")
            if container:
                # Extraer todos los textos que no estén dentro del h2
                all_texts = []
                for elem in container.descendants:
                    if isinstance(elem, str):
                        # Verificar que no esté dentro de un h2
                        parent_h2 = False
                        for parent in elem.parents:
                            if parent.name == "h2":
                                parent_h2 = True
                                break
                        if not parent_h2:
                            t = elem.strip()
                            if t:
                                all_texts.append(t)
                body = " ".join(all_texts).strip()
                
                if "duraci" in label and len(body) > 0 and len(body) < 50:
                    duracion = body
                elif label == "título" and len(body) > 0:
                    titulo_grado = body
                elif "sede" in label and len(body) > 0 and len(body) < 50:
                    sede = body
    
    # Si no se encontró sede
    if not sede:
        for div in soup.find_all("div", class_=re.compile("elementor-widget-text-editor")):
            text = div.get_text(strip=True)
            if text.lower() == "central":
                sede = text
                break
    
    # Extraer secciones del contenido principal
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
    
    main_content = soup.find("main", id="main") or soup.find("div", class_=re.compile("elementor-section-wrap"))
    if main_content:
        widgets = main_content.find_all("div", class_=re.compile("elementor-widget"))
        
        i = 0
        while i < len(widgets):
            widget = widgets[i]
            h2 = widget.find("h2", class_=re.compile("elementor-heading-title"))
            ul = widget.find("ul")
            
            # Si es un widget con h2 label y contenido en el mismo widget
            if h2:
                label = h2.get_text(strip=True).lower()
                container = widget.find("div", class_="elementor-widget-container")
                if container:
                    all_texts = []
                    for elem in container.descendants:
                        if isinstance(elem, str):
                            parent_h2 = False
                            for parent in elem.parents:
                                if parent.name == "h2":
                                    parent_h2 = True
                                    break
                            if not parent_h2:
                                t = elem.strip()
                                if t and t != h2.get_text(strip=True):
                                    all_texts.append(t)
                    body = " ".join(all_texts).strip()
                    if "descripci" in label and len(body) > 50:
                        descripcion = clean_text(body)
                    elif label == "objetivo" and len(body) > 50:
                        objetivo = clean_text(body)
            
            # Si es un ul con label de sección, el contenido está en el siguiente widget
            if ul:
                items = [li.get_text(strip=True) for li in ul.find_all("li")]
                if items:
                    section_name = items[0].lower()
                    if i + 1 < len(widgets):
                        next_widget = widgets[i + 1]
                        next_text = next_widget.get_text(separator="\n", strip=True)
                        lines = [line.strip() for line in next_text.split("\n") if line.strip() and line.strip() not in ["✓", ""]]
                        content = "\n".join(lines)
                        
                        if section_name == "descripción":
                            descripcion = clean_text(content)
                        elif section_name == "objetivo":
                            objetivo = clean_text(content)
                        elif "objetivos espec" in section_name:
                            objetivos_especificos = [l for l in lines if l and l != "✓"]
                        elif "a quién" in section_name or "dirigido" in section_name:
                            a_quien_va_dirigido = clean_text(content)
                        elif section_name == "campo laboral":
                            campo_laboral = " ".join([l for l in lines if l and l != "✓"])
                        elif section_name == "perfil de egreso":
                            perfil_egresado = " ".join([l for l in lines if l and l != "✓"])
                        elif "competencias disciplinarias" in section_name:
                            competencias_disciplinarias = [l for l in lines if l and l != "✓"]
                        elif "competencias profesionales" in section_name:
                            competencias_profesionales = [l for l in lines if l and l != "✓"]
                        elif "competencias genéricas" in section_name or "competencias genericas" in section_name:
                            competencias_genericas = [l for l in lines if l and l != "✓"]
                        elif section_name in ["misión", "mision"]:
                            mision = clean_text(content)
                        elif section_name in ["visión", "vision"]:
                            vision = clean_text(content)
                        elif section_name == "valores":
                            valores = [l for l in lines if l and l != "✓"]
                        elif "definición" in section_name and "profesional" in section_name:
                            definicion_profesional = clean_text(content)
            
            i += 1
    
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
