#!/bin/bash
# Toma una captura de pantalla completa con Chrome sin ventana.
# Uso: herramientas/capturar.sh <url> <ancho> <alto> <archivo.png>
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --no-sandbox --hide-scrollbars \
  --force-device-scale-factor=1 --virtual-time-budget=4000 \
  --incognito --disable-application-cache --disk-cache-size=1 --media-cache-size=1 \
  --screenshot="$4" --window-size="$2,$3" "$1" 2>/dev/null
