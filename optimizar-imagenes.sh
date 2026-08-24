#!/bin/bash
#
# Optimiza las imagenes del sitio del Colegio Ninos Heroes de Chapultepec.
#
#   ORIGINALES:  assets/originales/img/   <- NUNCA se tocan ni se sobrescriben
#   RESULTADO:   assets/img/              <- lo que usa la pagina
#
# Requiere:  brew install webp pngquant
# Uso:       ./optimizar-imagenes.sh
#
set -euo pipefail
cd "$(dirname "$0")"

ORIG="assets/originales/img"
DEST="assets/img"
REPORTE="reporte-imagenes.txt"

for prog in cwebp pngquant node; do
  command -v "$prog" >/dev/null || { echo "Falta '$prog'. Corre: brew install webp pngquant"; exit 1; }
done

# Asegura que los originales existan (no los sobrescribe si ya estan).
node herramientas/extraer-bundle.js >/dev/null
mkdir -p "$DEST"

dims() { sips -g pixelWidth -g pixelHeight "$1" 2>/dev/null | awk '/pixelWidth/{w=$2}/pixelHeight/{h=$2}END{print w"x"h}'; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
: > "$REPORTE"

# fila <etiqueta> <archivo_original> <archivo_final>
# Escribe una linea del reporte: peso antes -> despues, % de ahorro y medidas.
# Marca con (*) los que bajan mas del 80% para que los revises a ojo.
fila() {
  node herramientas/fila-reporte.js "$1" "$2" "$3" "$(dims "$2")" "$(dims "$3")" >> "$REPORTE"
}

echo ""
echo "  Optimizando imagenes..."
echo ""

# ---------------------------------------------------------------- LOGO
# Arte plano de 2 colores con bordes duros. Se reduce 10x (se muestra a 150px
# de alto como maximo) y se guarda SIN PERDIDA: identico al original, cero
# artefactos posibles. Conserva la transparencia.
echo "  logo             (sin perdida, 2994x3200 -> 300x321)"
cp "$ORIG/logo.png" "$TMP/logo.png"
sips -Z 321 "$TMP/logo.png" --out "$TMP/logo-chico.png" >/dev/null
cwebp -lossless -exact -metadata none -q 100 "$TMP/logo-chico.png" -o "$DEST/logo.webp" 2>/dev/null
# Respaldo PNG optimizado, por si algun dia hace falta
pngquant --quality 90-100 --speed 1 --force --output "$DEST/logo.png" "$TMP/logo-chico.png"
fila "logo.webp" "$ORIG/logo.png" "$DEST/logo.webp"

# ---------------------------------------------------------------- HERO
# Fotos recortadas con fondo transparente. WebP con canal alfa a calidad 92
# (extremo alto del rango: son rostros). Nunca JPG, perderian el recorte.
#   -alpha_q 100  = el recorte se guarda sin perdida
#   -m 6          = compresion mas lenta pero mas eficiente
#   -sharp_yuv    = mejor fidelidad de color en bordes y piel
hero() {
  local nombre="$1" ancho_grande="$2"
  local src="$ORIG/$nombre.png"
  echo "  $nombre           (calidad 92 + alfa)"

  if [ "$ancho_grande" = "nativo" ]; then
    cp "$src" "$TMP/$nombre-g.png"
  else
    sips -Z "$ancho_grande" "$src" --out "$TMP/$nombre-g.png" >/dev/null
  fi
  cwebp -q 92 -alpha_q 100 -m 6 -sharp_yuv -metadata none \
        "$TMP/$nombre-g.png" -o "$DEST/$nombre.webp" 2>/dev/null

  sips -Z 900 "$src" --out "$TMP/$nombre-p.png" >/dev/null
  cwebp -q 92 -alpha_q 100 -m 6 -sharp_yuv -metadata none \
        "$TMP/$nombre-p.png" -o "$DEST/$nombre-900.webp" 2>/dev/null

  fila "$nombre.webp" "$src" "$DEST/$nombre.webp"
  fila "$nombre-900.webp" "$src" "$DEST/$nombre-900.webp"
}
hero hero-1 1800     # 1920x1080 -> 1800x1013 (el @2x exacto que se necesita)
hero hero-2 nativo   # 1440x1080 ya esta en su tamano ideal
hero hero-3 nativo   # 1440x1080 ya esta en su tamano ideal

# ------------------------------------------------------- WEBP YA BUENOS
# Claude Design ya los exporto en WebP al tamano correcto. Volver a
# comprimirlos solo agregaria artefactos sin quitar peso (perdida
# generacional). Se copian tal cual.
echo "  webp existentes  (se copian sin recomprimir)"
for n in nivel-primaria nivel-secundaria fachada inst-primaria inst-secundaria admisiones testimonios; do
  cp -f "$ORIG/$n.webp" "$DEST/$n.webp"
  fila "$n.webp" "$ORIG/$n.webp" "$DEST/$n.webp"
done

# ---------------------------------------------------------------- FUENTES
# Los .woff2 ya vienen comprimidos de fabrica (woff2 ES compresion Brotli).
# No hay nada que optimizar: se copian tal cual.
echo "  fuentes          (se copian tal cual)"
mkdir -p assets/fonts
cp -f assets/originales/fonts/*.woff2 assets/fonts/

# ------------------------------------------------------------- TOTALES
node -e '
const fs=require("fs"),p=require("path");
const s=d=>fs.readdirSync(d).filter(f=>/\.(webp|png|jpg)$/.test(f)).reduce((t,f)=>t+fs.statSync(p.join(d,f)).size,0);
const a=s("assets/originales/img"), b=s("assets/img");
const l=["","  TOTAL de imagenes","  antes:   "+(a/1048576).toFixed(2)+" MB","  despues: "+(b/1048576).toFixed(2)+" MB","  ahorro:  "+(100-b*100/a).toFixed(0)+"%",""].join("\n");
fs.appendFileSync("reporte-imagenes.txt",l);
'

cat "$REPORTE"
echo "  (reporte guardado en $REPORTE)"
echo ""
