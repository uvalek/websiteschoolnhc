#!/bin/bash
# Captura una pagina a un ancho de celular de verdad.
#
# Chrome sin ventana no baja de 500 px de ancho, asi que metemos la pagina en
# un iframe del ancho exacto que queremos: el iframe si tiene su propio
# viewport y las media queries se evaluan contra el.
#
# Uso: herramientas/capturar-movil.sh <url> <ancho> <alto> <archivo.png>
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cat > "$TMP/marco.html" <<HTML
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:#fff}iframe{border:0;display:block}</style></head>
<body><iframe src="$1" width="$2" height="$3" scrolling="no"></iframe></body></html>
HTML
PUERTO=8799
(cd "$TMP" && python3 -m http.server $PUERTO >/dev/null 2>&1 &)
sleep 1
"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --virtual-time-budget=6000 \
  --screenshot="$TMP/full.png" --window-size="500,$3" \
  "http://localhost:$PUERTO/marco.html" 2>/dev/null
python3 -c "
from PIL import Image
Image.open('$TMP/full.png').convert('RGB').crop((0,0,$2,$3)).save('$4')
"
pkill -f "http.server $PUERTO" 2>/dev/null || true
