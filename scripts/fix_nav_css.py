#!/usr/bin/env python3
"""
Agrega estilos para el menu hamburguesa a todos los landings.
"""

import os
import re

carreras_dir = "/Users/esteban/.openclaw/workspace-uap/uap-web/pages/carreras"

# Estilos para el menu hamburguesa
estilos_nav = '''        .nav.active {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        .nav.active li {
            margin: 10px 0;
        }
        .nav.active a {
            color: #003366 !important;
            font-size: 16px;
        }'''

archivos = [f for f in os.listdir(carreras_dir) if f.endswith('.html')]
archivos.sort()

print(f"Agregando estilos de menu a {len(archivos)} landings...")

for archivo in archivos:
    filepath = os.path.join(carreras_dir, archivo)
    
    with open(filepath, 'r') as f:
        contenido = f.read()
    
    # Buscar el cierre del style
    if '.nav.active' not in contenido:
        # Insertar antes del cierre del style
        contenido = contenido.replace('</style>', f'{estilos_nav}\n    </style>')
        
        with open(filepath, 'w') as f:
            f.write(contenido)
        
        print(f"  ✅ {archivo}")
    else:
        print(f"  ⏭️  {archivo} (ya tiene estilos)")

print(f"\n✅ Estilos agregados!")
