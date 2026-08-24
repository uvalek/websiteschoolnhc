#!/usr/bin/env python3
"""
Genera las máscaras de contraste del hero.

Problema: el texto del hero es azul oscuro (#2f557f) y las fotos que van
pasando por detrás tienen una mancha del MISMO azul. Donde se encima, el texto
desaparece.

Solución: por cada foto se calcula, pixel por pixel, si el fondo que va a
quedar detrás es oscuro o claro. Donde es oscuro, el texto tiene que ir blanco.
El resultado es un PNG blanco cuyo canal alfa marca exactamente esas zonas; la
página lo usa para pintar de blanco solo esos pixeles del texto, aunque el
borde parta una letra por la mitad.

Uso:  python3 herramientas/generar-mascaras.py
"""
import os
from PIL import Image, ImageFilter
import numpy as np

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(RAIZ, 'assets/originales/img')
DEST = os.path.join(RAIZ, 'assets/img')

# Fondo de la sección del hero: es lo que se ve donde la foto es transparente.
FONDO = (251, 252, 253)          # #fbfcfd

# Las fotos del hero. 900 px es exactamente el ancho al que el navegador
# dibuja el hero en escritorio, asi que la mascara queda 1:1 con la foto.
FOTOS = ('hero-1', 'hero-2', 'hero-3')
ANCHO = 900


def luminancia(arr):
    """Luminancia relativa segun WCAG. arr: float 0-1, forma (alto, ancho, 3)."""
    c = np.where(arr <= 0.03928, arr / 12.92, ((arr + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


# Punto exacto donde el blanco empieza a contrastar mejor que el azul del texto.
# Se despeja de igualar las dos razones de contraste de la WCAG:
#   (L+0.05)/(L_texto+0.05) = 1.05/(L+0.05)
L_TEXTO = luminancia(np.array([[[47 / 255, 85 / 255, 127 / 255]]]))[0, 0]
UMBRAL = float(np.sqrt((L_TEXTO + 0.05) * 1.05) - 0.05)


def main():
    print(f'  Umbral de luminancia: {UMBRAL:.4f}')
    print(f'  (por debajo de eso el blanco contrasta mejor que el azul del texto)\n')

    for nombre in FOTOS:
        ancho = ANCHO
        src = os.path.join(ORIG, nombre + '.png')
        im = Image.open(src).convert('RGBA')
        alto = round(im.height * ancho / im.width)
        im = im.resize((ancho, alto), Image.LANCZOS)

        a = np.asarray(im, dtype=np.float64) / 255.0
        rgb, alfa = a[..., :3], a[..., 3:4]

        # Lo que realmente se ve: la foto encima del fondo de la sección.
        fondo = np.array(FONDO, dtype=np.float64) / 255.0
        visible = rgb * alfa + fondo * (1 - alfa)

        L = luminancia(visible)

        # Rampa suave de 0.06 alrededor del umbral: así el borde queda con
        # antialias en vez de escalonado, y una letra partida a la mitad se ve
        # limpia.
        m = np.clip((UMBRAL + 0.03 - L) / 0.06, 0, 1)

        mascara = Image.fromarray((m * 255).astype(np.uint8))
        mascara = mascara.filter(ImageFilter.GaussianBlur(0.6))

        salida = Image.new('RGBA', mascara.size, (255, 255, 255, 0))
        salida.putalpha(mascara)
        tmp = os.path.join(DEST, nombre + '-mascara.png')
        salida.save(tmp, optimize=True)
        # WebP sin perdida: para una mancha plana pesa la tercera parte que PNG.
        ruta = os.path.join(DEST, nombre + '-mascara.webp')
        os.system(f'cwebp -quiet -lossless -exact "{tmp}" -o "{ruta}"')
        os.remove(tmp)

        pct = (np.asarray(mascara) > 127).mean() * 100
        print(f'  {nombre}-mascara.webp  {ancho}x{alto}  '
              f'{os.path.getsize(ruta) / 1024:6.0f} KB   {pct:4.1f}% de la foto es zona oscura')


if __name__ == '__main__':
    main()
