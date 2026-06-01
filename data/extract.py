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
    print(f"Procesando: {url}")
    resp = requests.get(url, headers=headers, timeout=30)
    soup = BeautifulSoup(resp.text, "html.parser")
    
    # Título
    titulo_tag = soup.find("h2")
    titulo = titulo_tag.get_text(strip=True) if titulo_tag else ""
    
    # Brochure
    brochure_url = ""
    for a in soup.find_all("a", href=True):
        if "Brochure" in a.get_text() or "brochure" in a.get("href", "").lower():
            brochure_url = a["href"]
            if brochure_url.startswith("/"):
                brochure_url = "https://uap.edu.py" + brochure_url
            break
    
    # Extraer campos básicos de los sections
    duracion = ""
    sede = ""
    for section in soup.find_all("div", class_=re.compile("elementor-widget-container")):
        h2 = section.find("h2")
        if h2:
            label = h2.get_text(strip=True).lower()
            p = section.find("p")
            text = p.get_text(strip=True) if p else ""
            if "duraci" in label:
                duracion = text
            elif "sede" in label:
                sede = text
    
    # Descripción, Objetivo, etc.
    descripcion = ""
    objetivo = ""
    campo_laboral = ""
    perfil_egresado = ""
    
    for div in soup.find_all("div", class_=re.compile("elementor-widget-container")):
        h2 = div.find("h2")
        if h2:
            label = h2.get_text(strip=True).lower()
            p = div.find("p")
            text = p.get_text(strip=True) if p else ""
            if "descripci" in label and len(text) > 50:
                descripcion = text
            elif "objetivo" in label and "espec" not in label and len(text) > 50:
                objetivo = text
    
    # Campo Laboral y Perfil
    for div in soup.find_all("div", class_=re.compile("elementor-widget-container")):
        lis = div.find_all("li")
        h2 = div.find("h2")
        if h2:
            label = h2.get_text(strip=True).lower()
            if "campo laboral" in label:
                for li in lis:
                    t = li.get_text(strip=True)
                    if t and t != "✓":
                        campo_laboral = t
                        break
            elif "perfil de egreso" in label:
                for li in lis:
                    t = li.get_text(strip=True)
                    if t and t != "✓":
                        perfil_egresado = t
                        break
    
    # Malla curricular
    malla = {}
    tab_contents = soup.find_all("div", class_="elementor-tab-content")
    for tc in tab_contents:
        tab = tc.get("data-tab", "")
        sem_text = f"{tab}° Semestre"
        materias = []
        for tr in tc.find_all("tr"):
            td = tr.find("td")
            if td:
                mat = td.get_text(strip=True)
                if mat:
                    materias.append(mat)
        if materias:
            malla[sem_text] = materias
    
    data = {
        "titulo": titulo,
        "duracion": duracion,
        "sede": sede,
        "descripcion": descripcion,
        "objetivo": objetivo,
        "objetivos_especificos": [],
        "a_quien_va_dirigido": "",
        "campo_laboral": campo_laboral,
        "perfil_egresado": perfil_egresado,
        "competencias_disciplinarias": [],
        "competencias_profesionales": [],
        "competencias_genericas": [],
        "mision": "",
        "vision": "",
        "valores": [],
        "definicion_profesional": "",
        "malla": malla,
        "brochure_url": brochure_url
    }
    
    out_path = f"/Users/esteban/.openclaw/workspace-uap/uap-web/data/{slug}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  Guardado en {out_path}")
    print(f"  Semestres: {list(malla.keys())}")
    print()

print("¡Listo!")
