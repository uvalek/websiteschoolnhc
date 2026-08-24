#!/usr/bin/env python3
"""
Genera el favicon, los iconos de la app y el manifest a partir del logo.

Usa solo el emblema (la llama y el libro abierto) en blanco sobre el azul del
colegio, porque el logo completo lleva texto que a 32 px seria ilegible.

Uso:  python3 herramientas/generar-iconos.py
"""
import json, os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(RAIZ, 'assets/originales/img/logo.png')
DEST = os.path.join(RAIZ, 'assets/icons')
AZUL = (47, 85, 127)      # #2f557f
VINO = (138, 47, 67)      # #8a2f43

os.makedirs(DEST, exist_ok=True)
logo = Image.open(LOGO).convert('RGBA')

# El emblema ocupa la parte de arriba; debajo empieza "EDUCACION ADVENTISTA".
# La franja vacia entre ambos esta alrededor de y=1580.
emblema = logo.crop((0, 0, logo.width, 1575))
caja = emblema.split()[3].getbbox()
emblema = emblema.crop(caja)
print(f'  emblema recortado: {emblema.size[0]} x {emblema.size[1]}')

# Version en blanco: se usa el canal alfa como plantilla.
blanco = Image.new('RGBA', emblema.size, (255, 255, 255, 0))
blanco.putalpha(emblema.split()[3])
blanco = Image.composite(Image.new('RGBA', emblema.size, (255, 255, 255, 255)),
                         Image.new('RGBA', emblema.size, (255, 255, 255, 0)),
                         emblema.split()[3])

def icono(lado, ocupacion=0.62, fondo=AZUL):
    """Cuadrado de color con el emblema blanco centrado."""
    lienzo = Image.new('RGBA', (lado, lado), fondo + (255,))
    alto = int(lado * ocupacion)
    ancho = max(1, int(alto * blanco.width / blanco.height))
    if ancho > lado * 0.86:
        ancho = int(lado * 0.86)
        alto = max(1, int(ancho * blanco.height / blanco.width))
    marca = blanco.resize((ancho, alto), Image.LANCZOS)
    lienzo.paste(marca, ((lado - ancho) // 2, (lado - alto) // 2), marca)
    return lienzo

# Favicon: a 16 y 32 px el emblema tiene que ir mas grande para leerse.
ico = [icono(s, 0.78 if s <= 32 else 0.70) for s in (16, 32, 48)]
ico[0].save(os.path.join(DEST, 'favicon.ico'), format='ICO',
            sizes=[(16, 16), (32, 32), (48, 48)])

icono(192).convert('RGB').save(os.path.join(DEST, 'icono-192.png'), optimize=True)
icono(512).convert('RGB').save(os.path.join(DEST, 'icono-512.png'), optimize=True)
# El icono de iPhone lleva el emblema un poco mas chico: iOS le recorta las esquinas.
icono(180, 0.58).convert('RGB').save(os.path.join(DEST, 'apple-touch-icon.png'), optimize=True)

manifest = {
    "name": "Colegio Niños Héroes de Chapultepec",
    "short_name": "Niños Héroes",
    "description": "Primaria y Secundaria en Apizaco, Tlaxcala. Institución de la "
                   "Iglesia Adventista del Séptimo Día.",
    "lang": "es-MX",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#2f557f",
    "icons": [
        {"src": "/assets/icons/icono-192.png", "sizes": "192x192", "type": "image/png",
         "purpose": "any maskable"},
        {"src": "/assets/icons/icono-512.png", "sizes": "512x512", "type": "image/png",
         "purpose": "any maskable"},
    ],
}
with open(os.path.join(DEST, 'manifest.webmanifest'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

for n in sorted(os.listdir(DEST)):
    print(f'  {os.path.getsize(os.path.join(DEST, n)):>7} B  {n}')
