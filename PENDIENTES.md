# Pendientes — datos que faltan del cliente

Todo lo técnico está listo. Lo que sigue son **datos que no inventé** porque un dato
falso en la página del colegio cuesta la venta.

## Bloquean la junta con el director

| # | Qué falta | Dónde va | Cómo se arregla |
|---|---|---|---|
| 1 | **URL de Facebook** del colegio | Barra lateral (escritorio) y pie de página — 2 lugares | Buscar `https://www.facebook.com/` en `index.html` |
| 2 | **URL de Instagram** del colegio | Igual, 2 lugares | Buscar `https://www.instagram.com/` en `index.html` |
| 3 | **3 testimonios** con el nombre de quien los dice | Sección "Lo que dicen las familias" | Editar `TESTIMONIOS` en `script.js`. Mientras tanto se puede ocultar la sección con `MOSTRAR_TESTIMONIOS = false` |

Hoy los iconos de Facebook e Instagram llevan a la portada de esas redes, no a la
página del colegio. Si el director hace clic, se nota.

## No bloquean, pero conviene

| # | Qué falta | Nota |
|---|---|---|
| 4 | **Horario de oficinas** | Se muestra `[Horario de oficinas — pendiente]` en Contacto. Si es el mismo que el escolar, se borra la línea |
| 5 | **Aviso de privacidad** | El enlace del pie no va a ningún lado. En México es requisito legal si se recaban datos; hoy la página no tiene formularios, solo WhatsApp, así que el riesgo es bajo |
| 6 | **Coordenadas del colegio** | Para la ficha de Google. En Google Maps: clic derecho sobre el punto → copiar los dos números |
| 7 | **Dominio definitivo** | Hoy apunta a una dirección provisional de Vercel. Hay que cambiarlo en `index.html`, `sitemap.xml` y `robots.txt` |
| 8 | **Foto de la fachada en alta resolución** | La actual mide 1200 px pero la página la muestra a 1440 px en laptop: el navegador la estira y se ve suave. **No la amplié a propósito.** Si existe el original más grande, queda nítida |
| 9 | **RVOE / incorporación a la SEP** | La página no lo menciona (correcto, no tenemos el dato). A los papás les da confianza; vale la pena pedirlo |

## Decisiones que quedaron pendientes de tu visto bueno

**Botón "Cómo llegar".** Lo pediste en el brief y **no lo agregué**, porque es una
adición al diseño aprobado y no me dijiste dónde va. Hoy existen dos enlaces
"Ver en mapa" en las tarjetas de Instalaciones, pero la sección de Contacto —que es
donde un papá lo buscaría— no tiene botón. Dime dónde lo quieres y lo pongo.

**Contraste de los textos grises.** Cuatro colores del diseño quedan por debajo del
mínimo de accesibilidad (AA = 4.5:1). **No los cambié**, son colores del diseño:

| Elemento | Color actual | Contraste | Mínimo ajuste que sí cumple |
|---|---|---|---|
| "de Chapultepec" (header) | `#6b7a8c` | 4.39:1 | `#6a788a` — imperceptible |
| "Institución… Adventista" (pie) | `#7e8a99` | 3.51:1 | `#6b7887` |
| Copyright y aviso de privacidad | `#8e99a7` | 2.72:1 | `#677384` |
| Texto y nombre del testimonio | `#7e8a99` / `#8e99a7` | 3.42 / 2.81:1 | `#697685` / `#697687` |

Importa para papás de 45+ leyendo en el celular con sol. El primero es un cambio de
un punto que nadie notaría; los otros tres sí se ven un poco más oscuros. Tú decides.

**El título del hero pasa por debajo de la foto** (se pisan 186 px en escritorio, tapa
el final de "…para la vida"). Puede ser intencional —la foto sangra sobre el texto—
así que **no lo toqué**, tal como acordamos. Se ve en la captura de escritorio.

## Nota sobre la sección de Admisiones

El pie de página tiene un enlace "Proceso de admisión" que lleva a la sección
Admisiones, pero esa sección **no describe ningún proceso**: solo invita a mandar
WhatsApp. No es un error ni un dato falso, pero es probable que el director pregunte
"¿y dónde dice cómo inscribir a mi hijo?". Es decisión de contenido tuya y del cliente.
