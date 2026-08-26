#!/bin/bash
# Aplica los cambios de contenido/blog.json:
#   - vuelve a generar blog/index.html y la pagina de cada entrada
#   - actualiza las tres tarjetas de la portada
#
# NO toca el resto de index.html: telefonos, horarios y textos quedan como
# los tengas.
#
# Uso:  ./actualizar-blog.sh
set -e
cd "$(dirname "$0")"
node herramientas/generar-blog.js
echo ""
echo "  Listo. Revisa index.html y blog/index.html antes de publicar."
