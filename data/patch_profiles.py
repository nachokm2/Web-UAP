import json
import requests
from bs4 import BeautifulSoup

headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}

def patch_carrera(url, slug):
    resp = requests.get(url, headers=headers, timeout=30)
    soup = BeautifulSoup(resp.text, "html.parser")
    
    # Cargar JSON existente
    with open(f"/Users/esteban/.openclaw/workspace-uap/uap-web/data/{slug}.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Extraer perfil de egresado directamente
    # Buscar todos los widgets icon-list
    icon_lists = soup.find_all("div", class_=lambda x: x and "elementor-widget-icon-list" in x)
    
    for idx, widget in enumerate(icon_lists):
        ul = widget.find("ul")
        if ul:
            items = [li.get_text(strip=True) for li in ul.find_all("li")]
            if items:
                label = items[0].lower()
                
                # Perfil de Egresado
                if "perfil de egreso" in label:
                    if len(items) > 1 and len(items[1]) > 50:
                        data["perfil_egresado"] = " ".join(items[1:])
                    elif idx + 1 < len(icon_lists):
                        next_widget = icon_lists[idx + 1]
                        next_ul = next_widget.find("ul")
                        if next_ul:
                            next_items = [li.get_text(strip=True) for li in next_ul.find_all("li")]
                            next_items = [l for l in next_items if l and l != "✓"]
                            if next_items and len(next_items[0]) > 50:
                                data["perfil_egresado"] = " ".join(next_items)
                
                # Campo Laboral (si está vacío)
                if "campo laboral" in label and not data.get("campo_laboral"):
                    if len(items) > 1 and len(items[1]) > 50:
                        data["campo_laboral"] = " ".join(items[1:])
                    elif idx + 1 < len(icon_lists):
                        next_widget = icon_lists[idx + 1]
                        next_ul = next_widget.find("ul")
                        if next_ul:
                            next_items = [li.get_text(strip=True) for li in next_ul.find_all("li")]
                            next_items = [l for l in next_items if l and l != "✓"]
                            if next_items and len(next_items[0]) > 50:
                                data["campo_laboral"] = " ".join(next_items)
    
    # Guardar
    with open(f"/Users/esteban/.openclaw/workspace-uap/uap-web/data/{slug}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Patched {slug}: perfil={bool(data.get('perfil_egresado'))}, campo={bool(data.get('campo_laboral'))}")

# Patch carreras que faltan
patch_carrera("https://uap.edu.py/derecho/", "carrera_derecho")
patch_carrera("https://uap.edu.py/trabajo-social/", "carrera_trabajo-social")
patch_carrera("https://uap.edu.py/marketing-y-publicidad/", "carrera_marketing-y-publicidad")
patch_carrera("https://uap.edu.py/ingenieria-comercial/", "carrera_ingenieria-comercial")
patch_carrera("https://uap.edu.py/ingenieria-informatica/", "carrera_ingenieria-en-informatica")

print("Done!")
