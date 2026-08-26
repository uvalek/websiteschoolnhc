# Colegio Niños Héroes de Chapultepec — sitio web

Landing page de una sola página. HTML, CSS y JavaScript normales: **sin frameworks,
sin instalar nada, sin "compilar"**. Se edita con cualquier editor de texto y se
publica subiendo los cambios a GitHub.

---

## Lo que necesitas saber en 30 segundos

| Quiero cambiar… | Abre… | Busca… |
|---|---|---|
| Un teléfono | `index.html` | `222 201 9898` o `wa.me` |
| El horario | `index.html` | `8:00 a 14:00` |
| Cualquier texto | `index.html` | el texto tal como se ve en la página |
| Los testimonios | `script.js` | `TESTIMONIOS` (hasta arriba) |
| Las entradas del blog | `contenido/blog.json` | ver *El blog* abajo |
| Facebook / Instagram | `index.html` | `facebook.com` / `instagram.com` |
| Una foto | `assets/originales/img/` | ver *Cambiar una foto* abajo |

Después de guardar, abre `index.html` con doble clic para ver el resultado antes de publicar.

---

## Cambiar los teléfonos

El número aparece en **varios lugares** y en dos formatos distintos. Hay que cambiar
los dos, si no el botón marca un número y la pantalla muestra otro.

**WhatsApp** — busca `wa.me` en `index.html`. Aparece 10 veces, todas iguales:

```
https://wa.me/522212018998?text=Hola%2C%20vi%20su%20p%C3%A1gina%20y%20quiero%20informaci%C3%B3n%20sobre%20inscripciones.
```

- El número va **pegado, con el 52 de México adelante y sin signos**: `522212018998`.
- Lo que sigue a `?text=` es el mensaje que se escribe solo en el chat. Los `%20`
  son espacios y los `%C3%A1` son letras con acento — **no los borres**. Si quieres
  otro mensaje, pídemelo y te lo genero bien escrito.
- Además busca `+52 221 201 8998`: ese es el número **que se ve** en pantalla.

**Llamadas** — busca `tel:+522222019898` (2 veces) y `222 201 9898` (2 veces).

> **Reemplaza siempre todas las apariciones**, no solo la primera.

---

## Cambiar el horario

Busca `8:00 a 14:00` en `index.html`. Está en tres lugares: el párrafo del inicio,
la tarjeta de Contacto y el pie de página. También revisa
`"opens": "08:00"` y `"closes": "14:00"` en el bloque de datos para Google
(ver *La ficha de Google* abajo).

---

## Cambiar los testimonios

Están en `script.js`, hasta arriba. Cambia el texto entre comillas:

```js
var TESTIMONIOS = [
  { texto: 'Aquí va lo que dijo el papá o la mamá.', nombre: 'María González' },
  { texto: 'Otro testimonio.',                       nombre: 'Juan Pérez' },
  { texto: 'Un tercero.',                            nombre: 'Ana Ramírez' }
];
```

- Puedes poner **más o menos de tres**: agrega o quita líneas y el contador
  (`1 / 3`) y las flechas se ajustan solos.
- Si el texto lleva apóstrofo, escríbelo así: `'Mi hija\'s...'` → mejor usa comillas
  dobles: `{ texto: "El apóstrofo ' no da problema aquí", nombre: "..." }`.

**Para esconder toda la sección** mientras consigues los testimonios reales, en el
mismo archivo cambia:

```js
var MOSTRAR_TESTIMONIOS = true;   →   var MOSTRAR_TESTIMONIOS = false;
```

---

## Cambiar una foto

1. Deja la foto nueva en `assets/originales/img/` **con el mismo nombre** que la
   que reemplaza (por ejemplo `fachada.webp` o `hero-2.png`).
2. En la Terminal, dentro de la carpeta del proyecto, corre:

   ```bash
   ./optimizar-imagenes.sh
   ```

   Eso vuelve a generar las versiones optimizadas en `assets/img/` y te imprime
   cuánto pesaba antes y después de cada una.
3. Si cambiaron las medidas de la foto, avísame: hay que ajustar los `width` y
   `height` que están en `index.html` para que la página no dé saltos al cargar.

> La primera vez necesitas las herramientas de imagen: `brew install webp pngquant`.

**Importante:** nunca borres ni sobrescribas nada dentro de `assets/originales/`
sin tener una copia. Esa carpeta es el respaldo de las fotos sin comprimir; si se
pierde, no se pueden regenerar con otra calidad.

---

## El blog

Todo el blog sale de **un solo archivo**: `contenido/blog.json`. De ahí se generan
las tres tarjetas de la portada, la lista completa en `blog/` y la página de cada
entrada.

### Para agregar o cambiar una entrada

1. Abre `contenido/blog.json` y edita (o copia y pega) un bloque:

```json
{
  "slug": "titulo-corto-sin-acentos-ni-espacios",
  "categoria": "Consejos para papás",
  "fechaISO": "2026-09-15",
  "fecha": "15 de septiembre de 2026",
  "titulo": "El título como se ve en la página",
  "resumen": "Dos renglones que aparecen en la tarjeta.",
  "icono": "libro",
  "cuerpo": [
    { "t": "p",  "x": "Un párrafo." },
    { "t": "h2", "x": "Un subtítulo grande" },
    { "t": "h3", "x": "Un subtítulo chico" },
    { "t": "ul", "x": ["Primer punto", "Segundo punto"] }
  ]
}
```

2. En la Terminal, dentro de la carpeta del proyecto:

```bash
./actualizar-blog.sh
```

3. Revisa `index.html` y `blog/index.html` y publica.

### Detalles

- **`slug`** es el nombre del archivo (`blog/<slug>.html`) y parte de la dirección.
  Sin acentos, sin espacios, sin mayúsculas. Una vez publicada una entrada, **no lo
  cambies**: quien la haya compartido se quedaría con un link roto.
- **`fechaISO`** es para Google (siempre `AAAA-MM-DD`); **`fecha`** es la que ve la
  gente. Cambia las dos.
- **`icono`** solo acepta `libro`, `mochila` o `reloj`. Si quieres otro, pídemelo.
- La portada muestra **las tres primeras** entradas del archivo. Si quieres que una
  aparezca ahí, ponla hasta arriba.
- El script **solo toca las tarjetas del blog** dentro de `index.html`, entre los
  comentarios `BLOG:INICIO` y `BLOG:FIN`. Tus teléfonos, horarios y textos quedan
  intactos aunque los hayas editado a mano. **No borres esos dos comentarios.**
- Si agregas o quitas entradas, avísame para actualizar `sitemap.xml`.

Cuando exista el panel de administrador, esto se reemplaza por la base de datos y
`contenido/blog.json` y `herramientas/generar-blog.js` se pueden tirar.

---

## El hero en celular

La composición del hero (la foto encimada sobre el texto) está armada con
desplazamientos en píxeles fijos —`left:-146px`, `top:-170px`, `width:750px`— que
funcionan en escritorio pero en un celular empujaban la foto fuera de la pantalla por
la izquierda: en 375 px la primera foto arrancaba en x = −219 con 900 px de ancho.

En `index.html`, dentro de `@media (max-width: 1035px)`, esos desplazamientos se anulan
y la foto se acomoda al ancho real del teléfono, de orilla a orilla y con proporción
4:3. También se fuerza una sola columna, porque si no el número de columnas depende de
cómo cada navegador interprete `min(470px,100%)` y hay anchos donde unos ponen una y
otros dos.

**Arriba de 1035 px no aplica nada de esto**: el diseño de escritorio queda exactamente
igual al aprobado.

---

## El texto del hero que cambia de color

El título y el párrafo del inicio son azul oscuro, y las fotos que van pasando por
detrás traen una mancha del **mismo** azul. Donde se encimaban, el texto desaparecía.

Ahora la página pinta de blanco **solo los pixeles del texto que quedan sobre una zona
oscura**. El corte sigue la silueta real de la foto: si el borde parte una letra a la
mitad, media letra queda blanca y media azul.

Funciona así:

1. `herramientas/generar-mascaras.py` mira cada foto del hero y calcula, pixel por
   pixel, si el fondo va a quedar oscuro o claro. Guarda el resultado en
   `assets/img/hero-N-mascara.webp`.
2. `script.js` mide dónde está la foto en pantalla y alinea esa máscara con el texto.
   Se recalcula al cambiar de foto y al cambiar el tamaño de la ventana.

**Si cambias una foto del hero, corre `./optimizar-imagenes.sh`**: las máscaras se
regeneran solas junto con las fotos. Si no lo haces, el texto se pintará de blanco en
los lugares de la foto vieja.

En celular no se activa (ahí la foto va debajo del texto, no detrás) y las máscaras ni
siquiera se descargan. Sin JavaScript el texto se ve como siempre.

El umbral —cuándo se considera que el fondo es "oscuro"— no es a ojo: sale de la
fórmula de contraste de la WCAG, en el punto exacto donde el blanco empieza a leerse
mejor que el azul del texto.

---

## Poner Facebook e Instagram

Busca `https://www.facebook.com/` (2 veces) y `https://www.instagram.com/` (2 veces)
en `index.html` y cambia cada una por la dirección real de la página del colegio.

Cuando las tengas, avísame: también hay que agregarlas al bloque de datos de Google
como `sameAs`, que es lo que le dice a Google que esas redes son del mismo colegio.

---

## La ficha de Google (JSON-LD)

Hasta arriba de `index.html`, dentro de
`<script type="application/ld+json">`, hay un bloque con los datos de la escuela en
el formato que Google entiende: nombre, dirección, teléfono, horario.

Si cambias la dirección, el teléfono o el horario **en la página, cámbialos también
aquí**. Se puede validar gratis en
[search.google.com/test/rich-results](https://search.google.com/test/rich-results).

Faltan dos datos que no inventé:

- **`geo`** (latitud y longitud). Para conseguirlas: abre Google Maps, clic derecho
  sobre el punto exacto del colegio, y copia los dos números que aparecen arriba.
- **`sameAs`** (Facebook e Instagram).

---

## El dominio

El sitio vive en **https://websiteschoolnhc.vercel.app** (subdominio gratuito de
Vercel). Si algún día el colegio compra su propio dominio, hay que cambiarlo en
**tres archivos**:

- `index.html` → busca `websiteschoolnhc.vercel.app` (aparece 7 veces: en
  `canonical`, en las etiquetas `og:`/`twitter:` y en el bloque de Google)
- `sitemap.xml`
- `robots.txt`

Y en Vercel, agregar el dominio en *Settings → Domains*.

Avísame y lo hago, es un minuto.

---

## Publicar un cambio

1. Guarda el archivo que editaste.
2. Ábrelo con doble clic y **revisa que se vea bien** antes de subirlo.
3. Sube el cambio a GitHub (commit + push).
4. Vercel lo publica solo en menos de un minuto.

Si algo se ve mal después de publicar, en Vercel puedes volver a la versión anterior
desde *Deployments → … → Promote to Production* en el despliegue que sí funcionaba.

---

## Qué NO tocar

- **`assets/originales/`** — el respaldo de las fotos sin comprimir.
- **`assets/fonts/`** — las tipografías. Si se borran, la página cambia de letra.
- **`herramientas/`** — los scripts con los que se armó el sitio.
- **`Colegio Ninos Heroes.html`** — el export original de Claude Design. Se conserva
  como referencia; **no es la página que se publica**.
- Los atributos `data-slide`, `data-punto`, `data-accion`, `data-hv` dentro de
  `index.html`. Se ven raros pero son los que conectan el HTML con `script.js` y con
  los efectos al pasar el mouse. Si borras uno, deja de funcionar el carrusel, el
  menú o los testimonios.

---

## Cómo está armado

```
index.html      La página completa. Todo el texto vive aquí.
blog/           Lista de entradas y una página por entrada (se generan)
contenido/
  blog.json     Las entradas del blog. Único lugar que editar.
script.js       Carrusel del hero, menú de celular y testimonios. Nada más.
assets/
  img/          Fotos optimizadas (las que usa la página)
                · hero-N-mascara.webp: ver "El texto del hero que cambia
                  de color" más arriba. NO las borres.
                · og.jpg es la imagen que sale al compartir por WhatsApp
                · logo.png es un respaldo del logo en PNG; la página usa
                  logo.webp. Solo haría falta en un dispositivo muy viejo.
  fonts/        Tipografías Mulish y Outfit
  icons/        Favicon y iconos
  originales/   Fotos sin comprimir (respaldo, no se publican)
herramientas/   Scripts con los que se generó todo esto
vercel.json     Configuración de caché.
                OJO: es JSON estricto, NO admite comentarios ni claves
                extra. Vercel rechaza el despliegue si le agregas algo
                que no esté en su esquema.
```

**Peso en celular:** 395 KB para ver la primera pantalla, 941 KB la página completa.
El resto de las fotos se cargan solas conforme la persona va bajando.

---

## Detalles técnicos, por si otro programador toma el proyecto

- No hay build step ni dependencias. Se sirve como archivos estáticos.
- Las fuentes son locales (no se piden a Google), en `woff2` con `unicode-range`:
  los subconjuntos cirílico y vietnamita están en el repo pero **el navegador nunca
  los descarga** en un sitio en español.
- Las fotos del hero usan `srcset` con dos anchos; el resto lleva `loading="lazy"`
  y `width`/`height` explícitos para evitar saltos de layout.
- El mapa de contacto usa `google.com/maps?q=...&output=embed`. Funciona, pero no es
  la vía oficial de Google y podría dejar de servir sin aviso; la alternativa oficial
  (Maps Embed API) requiere una llave de API.
- Los efectos `:hover` llevan `!important` porque tienen que ganarle a los estilos
  `style=""` que trae cada etiqueta desde el diseño original.
- Sin JavaScript la página se ve completa y los botones de WhatsApp y teléfono
  funcionan; lo único que no abre es el menú desplegable del celular.
