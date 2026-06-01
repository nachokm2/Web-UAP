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
    # Remove extra whitespace
    text = re.sub(r'\n\s*\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

for url, slug, titulo_default in urls:
    print(f"\n=== Procesando: {url} ===")
    resp = requests.get(url, headers=headers, timeout=30)
    html = resp.text
    soup = BeautifulSoup(html, "html.parser")
    
    # Título - buscar h2 del hero/título principal
    titulo = titulo_default
    for h2 in soup.find_all("h2", class_=re.compile("elementor-heading-title")):
        t = h2.get_text(strip=True)
        if t and len(t) < 100 and t not in ["Título", "Duración", "Sede", "plan de estudios", "Otras carreras", "Menú", "link de interes", "contacto"]:
            if "administraci" in t.lower() or "educaci" in t.lower() or "derecho" in t.lower() or "trabajo" in t.lower() or "marketing" in t.lower() or "ingeniería" in t.lower() or "ingenieria" in t.lower():
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
    
    # Extraer duración y sede de los widgets de icon list
    duracion = ""
    sede = ""
    titulo_grado = ""
    
    # Buscar en todos los widgets
    for widget in soup.find_all("div", class_=re.compile("elementor-widget")):
        h2 = widget.find("h2")
        if h2:
            label = h2.get_text(strip=True).lower()
            # Duración
            if "duraci" in label:
                p = widget.find("p")
                if p:
                    duracion = p.get_text(strip=True)
            # Sede
            elif "sede" in label:
                # Buscar texto cercano
                text = widget.get_text(separator=" ", strip=True)
                if "central" in text.lower():
                    sede = "Central"
                elif "asunci" in text.lower():
                    sede = "Asunción"
                elif "luque" in text.lower():
                    sede = "Luque"
                elif "villarrica" in text.lower():
                    sede = "Villarrica"
                elif "sede" in text.lower():
                    # Extraer después de "sede"
                    parts = text.lower().split("sede")
                    if len(parts) > 1:
                        sede = parts[1].strip().rstrip(":").strip()
            # Título del grado
            elif label == "título":
                p = widget.find("p")
                if p:
                    titulo_grado = p.get_text(strip=True)
    
    # Si no se encontró sede, buscar más ampliamente
    if not sede:
        for span in soup.find_all("span", class_="elementor-icon-list-text"):
            text = span.get_text(strip=True)
            if text.lower() in ["central", "asunción", "luque", "villarrica"]:
                sede = text
                break
    
    # Extraer descripción, objetivo, etc. buscando secciones específicas
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
    
    # Recorrer todas las secciones del contenido principal
    content_area = soup.find("main", id="main") or soup.find("div", class_=re.compile("elementor-section-wrap"))
    if content_area:
        # Buscar todos los widgets
        for widget in content_area.find_all("div", class_=re.compile("elementor-widget")):
            h2 = widget.find("h2")
            if h2:
                label = h2.get_text(strip=True)
                l = label.lower()
                
                # Obtener todo el texto limpio
                all_text = widget.get_text(separator="\n", strip=True)
                # Remover el label
                body = all_text.replace(label, "").strip()
                
                if "descripci" in l and len(body) > 50:
                    descripcion = clean_text(body)
                elif l == "objetivo" and len(body) > 50 and "espec" not in l:
                    objetivo = clean_text(body)
                elif "objetivos espec" in l:
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    objetivos_especificos = lines
                elif ("a quién" in l or "dirigido" in l) and len(body) > 20:
                    a_quien_va_dirigido = clean_text(body)
                elif "campo laboral" in l or "campo de trabajo" in l:
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    campo_laboral = " ".join(lines)
                elif "perfil de egreso" in l or "perfil del egresado" in l:
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    perfil_egresado = " ".join(lines)
                elif "competencias disciplinarias" in l:
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    competencias_disciplinarias = lines
                elif "competencias profesionales" in l:
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    competencias_profesionales = lines
                elif "competencias genéricas" in l or "competencias genericas" in l:
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    competencias_genericas = lines
                elif l == "misión" or l == "mision":
                    mision = clean_text(body)
                elif l == "visión" or l == "vision":
                    vision = clean_text(body)
                elif l == "valores":
                    lines = [line.strip() for line in body.split("\n") if line.strip() and line.strip() not in ["✓", label, ""]]
                    valores = lines
                elif "definición del profesional" in l or "definicion del profesional" in l:
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
    print(f"Descripción: {descripcion[:100]}...")
    print(f"Objetivo: {objetivo[:100]}...")
    print(f"Campo Laboral: {campo_laboral[:100]}...")
    print(f"Perfil: {perfil_egresado[:100]}...")
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
