#!/usr/bin/env python3
"""
Descarga y prepara las fotos de las entradas del blog.

Las fotos vienen de Pexels. Su licencia permite uso comercial y NO exige dar
crédito, pero el autor de cada una queda registrado en contenido/blog.json y en
assets/originales/blog/CREDITOS.md por si el colegio alguna vez lo pregunta.

  ORIGINALES:  assets/originales/blog/   <- como se descargaron, no se tocan
  RESULTADO:   assets/img/blog/          <- lo que usa la pagina

Uso:  python3 herramientas/fotos-blog.py
"""
import json, os, subprocess, sys, urllib.request
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(RAIZ, 'assets/originales/blog')
DEST = os.path.join(RAIZ, 'assets/img/blog')

# Las dos medidas que se usan, al doble de como se ven en pantalla (retina).
TARJETA = (760, 425)     # la tarjeta de la portada y de la lista
PORTADA = (1520, 690)    # la banda de arriba de cada articulo
COMPARTIR = (1200, 630)  # la que sale al compartir el link (JPG: WhatsApp no
                         # siempre lee WebP, y esto no se negocia)


def descargar(id_pexels, destino):
    if os.path.exists(destino):
        return False
    url = (f'https://images.pexels.com/photos/{id_pexels}/'
           f'pexels-photo-{id_pexels}.jpeg?auto=compress&cs=tinysrgb&w=2000')
    pet = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(pet, timeout=40) as r, open(destino, 'wb') as f:
        f.write(r.read())
    return True


def recortar(im, ancho, alto, anclaje=0.40):
    """Recorta al formato pedido. El anclaje vertical va un poco arriba del
    centro porque las caras casi siempre estan en la mitad de arriba."""
    objetivo = ancho / alto
    actual = im.width / im.height
    if actual > objetivo:
        nuevo_an = int(im.height * objetivo)
        x = (im.width - nuevo_an) // 2
        im = im.crop((x, 0, x + nuevo_an, im.height))
    else:
        nuevo_al = int(im.width / objetivo)
        y = int((im.height - nuevo_al) * anclaje)
        im = im.crop((0, y, im.width, y + nuevo_al))
    return im.resize((ancho, alto), Image.LANCZOS)


def a_webp(im, ruta, calidad=90):
    tmp = ruta + '.png'
    im.save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', str(calidad), '-m', '6',
                    '-sharp_yuv', '-metadata', 'none', tmp, '-o', ruta], check=True)
    os.remove(tmp)


def main():
    os.makedirs(ORIG, exist_ok=True)
    os.makedirs(DEST, exist_ok=True)
    entradas = json.load(open(os.path.join(RAIZ, 'contenido/blog.json'), encoding='utf-8'))

    creditos = ['# Créditos de las fotos del blog', '',
                'Fotos de **Pexels**. Su licencia permite uso comercial y no exige dar',
                'crédito (https://www.pexels.com/license/). Se registra de todos modos.', '']

    for e in entradas:
        f = e.get('foto')
        if not f:
            print(f'  (sin foto) {e["slug"]}')
            continue
        src = os.path.join(ORIG, e['slug'] + '.jpg')
        nuevo = descargar(f['pexels'], src)
        im = Image.open(src).convert('RGB')

        anc = f.get('anclaje', 0.40)
        a_webp(recortar(im, *TARJETA, anc), os.path.join(DEST, e['slug'] + '-tarjeta.webp'))
        a_webp(recortar(im, *PORTADA, anc), os.path.join(DEST, e['slug'] + '-portada.webp'))
        recortar(im, *COMPARTIR, anc).save(
            os.path.join(DEST, e['slug'] + '-og.jpg'), quality=88, optimize=True, progressive=True)

        kb = lambda n: os.path.getsize(os.path.join(DEST, n)) / 1024
        print(f'  {e["slug"]}')
        print(f'    original {im.size[0]}x{im.size[1]}  ({"descargado" if nuevo else "ya estaba"})')
        print(f'    tarjeta  {TARJETA[0]}x{TARJETA[1]}  {kb(e["slug"] + "-tarjeta.webp"):.0f} KB')
        print(f'    portada  {PORTADA[0]}x{PORTADA[1]}  {kb(e["slug"] + "-portada.webp"):.0f} KB')
        print(f'    compartir {COMPARTIR[0]}x{COMPARTIR[1]} {kb(e["slug"] + "-og.jpg"):.0f} KB')

        creditos.append(f'- **{e["titulo"]}** — foto de {f["autor"]}, '
                        f'Pexels #{f["pexels"]} · https://www.pexels.com/photo/{f["pexels"]}/')

    open(os.path.join(ORIG, 'CREDITOS.md'), 'w', encoding='utf-8').write('\n'.join(creditos) + '\n')
    print('\n  Créditos en assets/originales/blog/CREDITOS.md')


if __name__ == '__main__':
    main()
