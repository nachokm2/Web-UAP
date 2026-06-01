import re
import json
import requests
from bs4 import BeautifulSoup

urls = [
    ("https://uap.edu.py/administracion-de-empresas/", "carrera_administracion-de-empresas"),
    ("https://uap.edu.py/ciencias-de-la-educacion/", "carrera_ciencias-de-la-educacion"),
    ("https://uap.edu.py/derecho/", "carrera_derecho"),
    ("https://uap.edu.py/trabajo-social/", "carrera_trabajo-social"),
    ("https://uap.edu.py/marketing-y-publicidad/", "carrera_marketing-y-publicidad"),
    ("https://uap.edu.py/ingenieria-comercial/", "carrera_ingenieria-comercial"),
    ("https://uap.edu.py/ingenieria-en-informatica/", "carrera_ingenieria-en-informatica"),
]

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}

for url, slug in urls:
    print(f"\n=== Procesando: {url} ===")
    resp = requests.get(url, headers=headers, timeout=30)
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    
    # Título (h2 dentro del hero)
    titulo = ""
    for h2 in soup.find_all("h2"):
        t = h2.get_text(strip=True)
        if t and len(t) < 100 and "plan" not in t.lower() and "menú" not in t.lower():
            titulo = t
            break
    print(f"Título: {titulo}")
    
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
    print(f"Brochure: {brochure_url}")
    
    # Extraer campos de las secciones con íconos
    duracion = ""
    sede = ""
    titulo_grado = ""
    
    # Buscar en widgets de icon list
    for widget in soup.find_all("div", class_=re.compile("elementor-widget-icon-list")):
        items = widget.find_all("li", class_="elementor-icon-list-item")
        for item in items:
            text = item.get_text(strip=True)
            if "semestre" in text.lower() or "años" in text.lower():
                duracion = text
            elif "sede" in text.lower():
                sede = text.replace("Sede:", "").replace("Sede", "").strip()
            elif "título" in text.lower() or "licenciado" in text.lower() or "ingeniero" in text.lower():
                titulo_grado = text
    
    # Si no se encontró, buscar en párrafos
    if not duracion:
        for p in soup.find_all("p"):
            text = p.get_text(strip=True)
            if re.search(r'\d+\s*semestres', text, re.I):
                duracion = text
                break
    if not sede:
        for p in soup.find_all("p"):
            text = p.get_text(strip=True)
            if text.lower() in ["central", "asunción", "luque", "villarrica"]:
                sede = text
                break
    
    print(f"Duración: {duracion}")
    print(f"Sede: {sede}")
    print(f"Título grado: {titulo_grado}")
    
    # Extraer secciones de contenido
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
    
    # Buscar secciones con h2 como título
    sections = []
    for widget in soup.find_all("div", class_=re.compile("elementor-widget-container")):
        h2 = widget.find("h2")
        if h2:
            label = h2.get_text(strip=True)
            # Obtener todo el texto del widget
            text = widget.get_text(separator="\n", strip=True)
            sections.append((label, text))
    
    for label, text in sections:
        l = label.lower()
        if "descripci" in l and len(text) > 50:
            descripcion = text.replace(label, "").strip()
        elif l == "objetivo" and len(text) > 50:
            objetivo = text.replace(label, "").strip()
        elif "objetivos espec" in l:
            # Extraer lista
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓" and line.strip() != label]
            objetivos_especificos = lines
        elif "a quién" in l or "dirigido" in l:
            a_quien_va_dirigido = text.replace(label, "").strip()
        elif "campo laboral" in l or "campo de trabajo" in l:
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓"]
            campo_laboral = " ".join(lines)
        elif "perfil de egreso" in l or "perfil del egresado" in l:
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓"]
            perfil_egresado = " ".join(lines)
        elif "competencias disciplinarias" in l:
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓"]
            competencias_disciplinarias = lines
        elif "competencias profesionales" in l:
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓"]
            competencias_profesionales = lines
        elif "competencias genéricas" in l or "competencias genericas" in l:
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓"]
            competencias_genericas = lines
        elif l == "misión" or l == "mision":
            mision = text.replace(label, "").strip()
        elif l == "visión" or l == "vision":
            vision = text.replace(label, "").strip()
        elif l == "valores":
            lines = [line.strip() for line in text.replace(label, "").split("\n") if line.strip() and line.strip() != "✓"]
            valores = lines
        elif "definición" in l and "profesional" in l:
            definicion_profesional = text.replace(label, "").strip()
    
    # Malla curricular - mejorada
    malla = {}
    tab_contents = soup.find_all("div", class_="elementor-tab-content")
    for tc in tab_contents:
        tab = tc.get("data-tab", "")
        if not tab:
            continue
        sem_text = f"{tab}° Semestre"
        materias = []
        for tr in tc.find_all("tr"):
            td = tr.find("td")
            if td:
                mat = td.get_text(strip=True)
                if mat and mat not in materias:
                    materias.append(mat)
        if materias:
            malla[sem_text] = materias
    
    # Para ingeniería en informática, la malla puede estar en tablas normales
    if not malla and "ingenieria-en-informatica" in slug:
        tables = soup.find_all("table")
        sem_num = 1
        for table in tables:
            materias = []
            for td in table.find_all("td"):
                mat = td.get_text(strip=True)
                if mat and len(mat) > 3 and len(mat) < 100:
                    materias.append(mat)
            if materias:
                malla[f"{sem_num}° Semestre"] = materias
                sem_num += 1
    
    print(f"Malla semestres: {list(malla.keys())}")
    
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
