import json
import requests
from bs4 import BeautifulSoup

headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

def patch_carrera(url, slug):
    resp = requests.get(url, headers=headers, timeout=30)
    soup = BeautifulSoup(resp.text, "html.parser")
    
    with open(f"/Users/esteban/.openclaw/workspace-uap/uap-web/data/{slug}.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Extraer perfil de egresado y campo laboral directamente del HTML
    # Buscar todos los divs con clase elementor-widget-icon-list
    icon_lists = soup.find_all("div", class_=lambda x: x and "elementor-widget-icon-list" in x)
    
    for idx, widget in enumerate(icon_lists):
        ul = widget.find("ul")
        if ul:
            lis = ul.find_all("li")
            if not lis:
                continue
            
            first_text = lis[0].get_text(strip=True).lower()
            
            # Perfil de Egresado - buscar el siguiente icon-list widget
            if "perfil de egreso" in first_text:
                if idx + 1 < len(icon_lists):
                    next_widget = icon_lists[idx + 1]
                    next_ul = next_widget.find("ul")
                    if next_ul:
                        next_lis = next_ul.find_all("li")
                        if next_lis:
                            # Obtener todo el texto del li (incluyendo el icono check)
                            full_text = next_lis[0].get_text(separator=" ", strip=True)
                            if len(full_text) > 50:
                                data["perfil_egresado"] = full_text
            
            # Campo Laboral
            if "campo laboral" in first_text:
                if idx + 1 < len(icon_lists):
                    next_widget = icon_lists[idx + 1]
                    next_ul = next_widget.find("ul")
                    if next_ul:
                        next_lis = next_ul.find_all("li")
                        if next_lis:
                            full_text = next_lis[0].get_text(separator=" ", strip=True)
                            if len(full_text) > 50:
                                data["campo_laboral"] = full_text
    
    with open(f"/Users/esteban/.openclaw/workspace-uap/uap-web/data/{slug}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Patched {slug}: perfil={bool(data.get('perfil_egresado'))}, campo={bool(data.get('campo_laboral'))}")

patch_carrera("https://uap.edu.py/derecho/", "carrera_derecho")
patch_carrera("https://uap.edu.py/trabajo-social/", "carrera_trabajo-social")
patch_carrera("https://uap.edu.py/marketing-y-publicidad/", "carrera_marketing-y-publicidad")
patch_carrera("https://uap.edu.py/ingenieria-comercial/", "carrera_ingenieria-comercial")
patch_carrera("https://uap.edu.py/ingenieria-informatica/", "carrera_ingenieria-en-informatica")

print("Done!")
