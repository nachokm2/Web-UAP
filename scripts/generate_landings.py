#!/usr/bin/env python3
"""
Genera landings de carrera con contenido basico pero correcto.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# Informacion basica por carrera
carreras_info = {
    "administracion-de-empresas": {
        "titulo": "Administracion de Empresas",
        "titulo_corto": "Licenciado en Administracion de Empresas",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion integral en gestion empresarial, liderazgo y toma de decisiones estrategicas.",
        "materias": [
            ["Introduccion a la Administracion", "Contabilidad Basica", "Matematicas", "Economia", "Derecho Empresarial"],
            ["Marketing", "Finanzas", "Recursos Humanos", "Estadistica", "Comportamiento Organizacional"],
            ["Estrategia Empresarial", "Operaciones", "Costos", "Negocios Internacionales", "Emprendimiento"],
            ["Practica Profesional", "Seminario", "Gestion de Proyectos", "Etica Profesional", "Trabajo Final"]
        ]
    },
    "administracion-publica": {
        "titulo": "Administracion Publica",
        "titulo_corto": "Licenciado en Administracion Publica",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en gestion publica, politicas gubernamentales y desarrollo territorial.",
        "materias": [
            ["Introduccion a la Administracion Publica", "Derecho Constitucional", "Economia", "Sociologia", "Matematicas"],
            ["Gestion Publica", "Presupuesto", "Recursos Humanos", "Politicas Publicas", "Estadistica"],
            ["Planificacion Territorial", "Desarrollo Local", "Transparencia", "Evaluacion", "Proyectos"],
            ["Practica Profesional", "Seminario", "Etica", "Trabajo Final"]
        ]
    },
    "ciencias-contables": {
        "titulo": "Ciencias Contables",
        "titulo_corto": "Licenciado en Ciencias Contables",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en contabilidad, auditoria y finanzas empresariales.",
        "materias": [
            ["Contabilidad Basica", "Matematicas", "Derecho", "Economia", "Informatica"],
            ["Contabilidad Intermedia", "Costos", "Estadistica", "Finanzas", "Auditoria"],
            ["Contabilidad Superior", "Impuestos", "Auditoria Interna", "Presupuestos", "Etica"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "ciencias-de-la-educacion": {
        "titulo": "Ciencias de la Educacion",
        "titulo_corto": "Licenciado en Ciencias de la Educacion",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en pedagogia, didactica y gestion educativa.",
        "materias": [
            ["Fundamentos de la Educacion", "Psicologia del Aprendizaje", "Sociologia", "Filosofia", "Comunicacion"],
            ["Didactica General", "Curriculo", "Evaluacion", "Psicologia Evolutiva", "Metodologia"],
            ["Gestion Educativa", "TICs", "Investigacion", "Practica Docente", "Diversidad"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "contabilidad-y-auditoria": {
        "titulo": "Contabilidad y Auditoria",
        "titulo_corto": "Licenciado en Contabilidad y Auditoria",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en contabilidad avanzada y auditoria financiera.",
        "materias": [
            ["Contabilidad Basica", "Matematicas", "Derecho Comercial", "Economia", "Informatica"],
            ["Contabilidad Intermedia", "Costos", "Auditoria I", "Finanzas", "Estadistica"],
            ["Auditoria II", "Impuestos", "Normas Internacionales", "Control Interno", "Etica"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "contaduria-publica": {
        "titulo": "Contaduria Publica",
        "titulo_corto": "Contador Publico Nacional",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en contabilidad, auditoria y asesoria fiscal.",
        "materias": [
            ["Contabilidad Basica", "Matematicas", "Derecho", "Economia", "Informatica"],
            ["Contabilidad Intermedia", "Costos", "Derecho Tributario", "Estadistica", "Finanzas"],
            ["Auditoria", "Impuestos", "Contabilidad Superior", "Control Interno", "Sociedades"],
            ["Auditoria Avanzada", "Planeamiento Fiscal", "Consolidacion", "Etica", "Normas"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "derecho": {
        "titulo": "Derecho",
        "titulo_corto": "Abogado",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion integral en derecho civil, penal, laboral y constitucional.",
        "materias": [
            ["Introduccion al Derecho", "Derecho Constitucional", "Historia", "Logica", "Sociologia"],
            ["Derecho Civil", "Derecho Comercial", "Derecho Penal", "Procesal", "Derecho Internacional"],
            ["Derecho Laboral", "Derecho Administrativo", "Derecho Tributario", "Derecho Ambiental", "Practica Forense"],
            ["Derecho de Familia", "Derecho Sucesorio", "Mediacion", "Derechos Humanos", "Etica Legal"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "educacion-parvularia": {
        "titulo": "Educacion Parvularia",
        "titulo_corto": "Profesor en Educacion Parvularia",
        "duracion": "3 anos (6 semestres)",
        "descripcion": "Formacion en educacion infantil y desarrollo temprano.",
        "materias": [
            ["Fundamentos de la Educacion Infantil", "Psicologia del Desarrollo", "Expresion Artistica", "Juego", "Salud"],
            ["Didactica Infantil", "Curriculo", "Evaluacion", "Literatura Infantil", "Matematicas"],
            ["Practica Docente", "Gestion", "Familia y Comunidad", "Seminario", "Trabajo Final"]
        ]
    },
    "fisioterapia": {
        "titulo": "Fisioterapia",
        "titulo_corto": "Licenciado en Fisioterapia",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en rehabilitacion fisica y terapia del movimiento.",
        "materias": [
            ["Anatomia", "Fisiologia", "Biomecanica", "Kinesiologia", "Psicologia"],
            ["Fisioterapia I", "Electroterapia", "Hidroterapia", "Terapia Manual", "Evaluacion"],
            ["Fisioterapia II", "Deportiva", "Respiratoria", "Neurologica", "Geriatria"],
            ["Practica Profesional", "Seminario", "Investigacion", "Trabajo Final"]
        ]
    },
    "fonoaudiologia": {
        "titulo": "Fonoaudiologia",
        "titulo_corto": "Licenciado en Fonoaudiologia",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en evaluacion y tratamiento de trastornos de la comunicacion.",
        "materias": [
            ["Anatomia", "Fisiologia", "Audiologia", "Linguistica", "Psicologia"],
            ["Fonoaudiologia Infantil", "Audiologia Clinica", "Voz", "Lenguaje", "Neurociencia"],
            ["Fonoaudiologia Adultos", "Implantes", "Rehabilitacion", "Practica", "Investigacion"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "ingenieria-comercial": {
        "titulo": "Ingenieria Comercial",
        "titulo_corto": "Ingeniero Comercial",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en administracion, economia y negocios internacionales.",
        "materias": [
            ["Calculo", "Economia", "Contabilidad", "Derecho", "Estadistica"],
            ["Finanzas", "Marketing", "Recursos Humanos", "Operaciones", "Macroeconomia"],
            ["Estrategia", "Negocios Internacionales", "Emprendimiento", "Costos", "Investigacion"],
            ["Gestion", "Consultoria", "Logistica", "Etica", "Seminario"],
            ["Practica Profesional", "Trabajo Final"]
        ]
    },
    "ingenieria-en-comercio-internacional": {
        "titulo": "Ingenieria en Comercio Internacional",
        "titulo_corto": "Ingeniero en Comercio Internacional",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en comercio exterior, logistica global y negocios internacionales.",
        "materias": [
            ["Comercio Internacional", "Economia", "Derecho", "Contabilidad", "Idiomas"],
            ["Logistica", "Aduanas", "Negociaciones", "Finanzas", "Marketing Global"],
            ["Exportacion", "Importacion", "Tratados", "Transporte", "Almacenamiento"],
            ["Gestion de Riesgos", "Documentacion", "E-commerce", "Etica", "Seminario"],
            ["Practica Profesional", "Trabajo Final"]
        ]
    },
    "ingenieria-en-informatica": {
        "titulo": "Ingenieria en Informatica",
        "titulo_corto": "Ingeniero en Informatica",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en desarrollo de software, redes y sistemas de informacion.",
        "materias": [
            ["Programacion I", "Matematicas", "Logica", "Sistemas", "Comunicacion"],
            ["Programacion II", "Bases de Datos", "Redes", "Sistemas Operativos", "Algoritmos"],
            ["Ingenieria de Software", "Web", "Seguridad", "Inteligencia Artificial", "Proyectos"],
            ["Arquitectura", "Cloud", "DevOps", "Etica", "Seminario"],
            ["Practica Profesional", "Trabajo Final"]
        ]
    },
    "ingenieria-en-marketing": {
        "titulo": "Ingenieria en Marketing",
        "titulo_corto": "Ingeniero en Marketing",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en estrategias de marketing digital y tradicional.",
        "materias": [
            ["Fundamentos de Marketing", "Psicologia", "Comunicacion", "Estadistica", "Economia"],
            ["Marketing Digital", "Publicidad", "Investigacion de Mercados", "Branding", "Ventas"],
            ["Estrategia", "Social Media", "SEO/SEM", "Analytics", "CRM"],
            ["Marketing Internacional", "Comportamiento del Consumidor", "Etica", "Seminario"],
            ["Practica Profesional", "Trabajo Final"]
        ]
    },
    "ingenieria-en-tecnologia-de-alimentos": {
        "titulo": "Ingenieria en Tecnologia de Alimentos",
        "titulo_corto": "Ingeniero en Tecnologia de Alimentos",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en procesamiento, conservacion y control de calidad de alimentos.",
        "materias": [
            ["Quimica", "Biologia", "Microbiologia", "Matematicas", "Fisica"],
            ["Tecnologia de Alimentos I", "Procesos", "Conservacion", "Empaque", "Higiene"],
            ["Tecnologia de Alimentos II", "Control de Calidad", "Normativas", "Inocuidad", "Proyectos"],
            ["Gestion", "Innovacion", "Sostenibilidad", "Etica", "Seminario"],
            ["Practica Profesional", "Trabajo Final"]
        ]
    },
    "marketing-y-publicidad": {
        "titulo": "Marketing y Publicidad",
        "titulo_corto": "Licenciado en Marketing y Publicidad",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en estrategias de comunicacion y campanas publicitarias.",
        "materias": [
            ["Fundamentos de Marketing", "Comunicacion", "Psicologia", "Diseño", "Redaccion"],
            ["Publicidad", "Medios", "Investigacion", "Digital", "Creatividad"],
            ["Cuentas", "Planificacion", "Produccion", "Eventos", "Etica"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "nutricion": {
        "titulo": "Nutricion",
        "titulo_corto": "Licenciado en Nutricion",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en alimentacion saludable y dietetica clinica.",
        "materias": [
            ["Quimica", "Biologia", "Anatomia", "Fisiologia", "Psicologia"],
            ["Nutricion Basica", "Bioquimica", "Dietetica", "Evaluacion", "Higiene"],
            ["Nutricion Clinica", "Deportiva", "Comunitaria", "Geriatrica", "Pediatrica"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "optica-y-contactologia": {
        "titulo": "Optica y Contactologia",
        "titulo_corto": "Licenciado en Optica y Contactologia",
        "duracion": "3 anos (6 semestres)",
        "descripcion": "Formacion en optometria y adaptacion de lentes de contacto.",
        "materias": [
            ["Anatomia Ocular", "Fisiologia", "Optica", "Optometria", "Instrumental"],
            ["Refraccion", "Contactologia", "Patologia", "Practica", "Baja Vision"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "periodismo": {
        "titulo": "Periodismo",
        "titulo_corto": "Licenciado en Periodismo",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en comunicacion, investigacion y produccion de contenidos.",
        "materias": [
            ["Teoria de la Comunicacion", "Redaccion", "Historia", "Etica", "Tecnologia"],
            ["Periodismo Escrito", "Radio", "Television", "Digital", "Fotografia"],
            ["Investigacion", "Entrevista", "Edicion", "Documentacion", "Derecho"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "podologia": {
        "titulo": "Podologia",
        "titulo_corto": "Licenciado en Podologia",
        "duracion": "3 anos (6 semestres)",
        "descripcion": "Formacion en salud podologica y cuidado del pie.",
        "materias": [
            ["Anatomia", "Fisiologia", "Podologia Basica", "Microbiologia", "Dermatologia"],
            ["Podologia Clinica", "Biomecanica", "Ortesis", "Cirugia Menor", "Diabetes"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "psicologia": {
        "titulo": "Psicologia",
        "titulo_corto": "Licenciado en Psicologia",
        "duracion": "5 anos (10 semestres)",
        "descripcion": "Formacion en psicologia clinica, educativa y organizacional.",
        "materias": [
            ["Introduccion a la Psicologia", "Biologia", "Historia", "Metodologia", "Neurociencia"],
            ["Psicologia del Desarrollo", "Personalidad", "Psicologia Social", "Cognicion", "Evaluacion"],
            ["Psicologia Clinica", "Psicoterapia", "Salud Mental", "Trastornos", "Intervencion"],
            ["Psicologia Organizacional", "Educacional", "Comunitaria", "Forense", "Etica"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    },
    "trabajo-social": {
        "titulo": "Trabajo Social",
        "titulo_corto": "Licenciado en Trabajo Social",
        "duracion": "4 anos (8 semestres)",
        "descripcion": "Formacion en intervencion social y desarrollo comunitario.",
        "materias": [
            ["Fundamentos del Trabajo Social", "Sociologia", "Psicologia", "Derecho", "Economia"],
            ["Intervencion Social", "Familia", "Grupos", "Comunidad", "Metodologia"],
            ["Politicas Sociales", "Gestion", "Proyectos", "Investigacion", "Etica"],
            ["Practica Profesional", "Seminario", "Trabajo Final"]
        ]
    }
}

# Lee el modelo
with open(os.path.join(carreras_dir, "odontologia.html"), 'r') as f:
    modelo = f.read()

print(f"Generando {len(carreras_info)} landings...")

for carrera_id, info in carreras_info.items():
    archivo = f"{carrera_id}.html"
    filepath = os.path.join(carreras_dir, archivo)
    
    # Crear nuevo HTML basado en modelo
    nuevo = modelo.replace('Odontologia', info['titulo'])
    nuevo = nuevo.replace('Doctor en Odontologia', info['titulo_corto'])
    nuevo = nuevo.replace('5 anos (10 semestres)', info['duracion'])
    nuevo = nuevo.replace(
        'Formacion integral en salud oral con practica clinica desde los primeros anos. Preparamos profesionales capaces de diagnosticar, prevenir y tratar patologias bucodentales.',
        info['descripcion']
    )
    
    # Reemplazar perfil
    perfil_texto = f"El egresado de la UAP esta capacitado para ejercer la profesion de {info['titulo']} con excelencia."
    nuevo = nuevo.replace(
        'El odontologo egresado de la UAP esta capacitado para:',
        perfil_texto
    )
    nuevo = nuevo.replace(
        '''<ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; color: #555;">Diagnosticar y tratar enfermedades bucodentales</li>
                    <li style="padding: 8px 0; color: #555;">Realizar procedimientos de cirugia bucal y maxilofacial basicos</li>
                    <li style="padding: 8px 0; color: #555;">Ejecutar tratamientos de ortodoncia y ortopedia maxilar</li>
                    <li style="padding: 8px 0; color: #555;">Restaurar la funcion masticatoria mediante protesis</li>
                    <li style="padding: 8px 0; color: #555;">Implementar programas de salud oral comunitaria</li>
                </ul>''',
        f'<ul style="list-style: none; padding: 0;"><li style="padding: 8px 0; color: #555;">Profesional competente en {info["titulo"]}</li><li style="padding: 8px 0; color: #555;">Capacitado para el ejercicio profesional y la investigacion</li><li style="padding: 8px 0; color: #555;">Con vision etica y compromiso social</li></ul>'
    )
    
    # Reemplazar areas de desempeno
    nuevo = nuevo.replace(
        'Consultorios privados, clinicas odontologicas, hospitales publicos, salud comunitaria.',
        f'Sector publico y privado, consultorias, instituciones educativas y organizaciones.'
    )
    
    # Reemplazar materias
    materias_html = ""
    for i, materias in enumerate(info['materias']):
        año_num = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto"][i]
        materias_list = "\n".join([f"                        <li>{m}</li>" for m in materias])
        materias_html += f'''
                <div class="year-block">
                    <div class="year-title">{año_num} Ano</div>
                    <ul>
{materias_list}
                    </ul>
                </div>'''
    
    # Reemplazar seccion de materias
    materias_modelo = re.search(r'(<section>.*?Plan de Estudios.*?</section>)', nuevo, re.DOTALL)
    if materias_modelo:
        nuevo = nuevo.replace(materias_modelo.group(1), f'<section>\n                <h2 style="color: #003366; margin-bottom: 20px;">Plan de Estudios</h2>{materias_html}\n            </section>')
    
    # Reemplazar link del footer
    nuevo = nuevo.replace('href="odontologia.html"', f'href="{archivo}"')
    nuevo = nuevo.replace('href="psicologia.html"', f'href="{archivo}"')
    nuevo = nuevo.replace('href="derecho.html"', f'href="{archivo}"')
    
    # Guardar
    with open(filepath, 'w') as f:
        f.write(nuevo)
    
    print(f"  ✅ {archivo}")

print(f"\n✅ {len(carreras_info)} landings generados!")
