#!/usr/bin/env node
/*
 * Convierte la plantilla del export de Claude Design en HTML estatico normal.
 *
 * NO cambia el diseno. Todos los estilos del export estan escritos "inline"
 * (pegados a cada etiqueta) y se copian tal cual. Lo unico que se traduce son
 * las construcciones inventadas que el navegador no entiende por si solo.
 *
 * Se corrio UNA VEZ para generar index.html. A partir de ahi, index.html es
 * el archivo bueno y se edita a mano. Este script queda como registro de
 * como se hizo la conversion.
 *
 * Uso:  node herramientas/desempacar.js  > index.html
 */
const fs = require('fs');
const path = require('path');
const RAIZ = path.resolve(__dirname, '..');

const plantilla = fs.readFileSync(path.join(RAIZ, 'assets/originales/plantilla-original.html'), 'utf8');

// ----------------------------------------------------------- datos del sitio
const WA_NUM  = '522212018998';
const WA_MSG  = 'Hola, vi su página y quiero información sobre inscripciones.';
const WA_HREF = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(WA_MSG);
const TEL_HREF = 'tel:+522222019898';

// uuid (8 primeros) -> { archivo, alt, ancho, alto, srcset, sizes }
const IMG = {
  'e974db8e': { f: 'logo.webp', w: 300, h: 321,
    alt: 'Colegio Niños Héroes de Chapultepec — Educación Adventista' },
  'dc560efc': { f: 'hero-1.webp', w: 1800, h: 1012,
    alt: 'Tres alumnas del Colegio Niños Héroes de Chapultepec sonriendo',
    srcset: 'assets/img/hero-1-900.webp 900w, assets/img/hero-1.webp 1800w',
    sizes: '(max-width: 1024px) 100vw, 900px' },
  '7033de25': { f: 'hero-2.webp', w: 1440, h: 1080,
    alt: 'Dos alumnos de secundaria con el uniforme deportivo rojo del colegio',
    srcset: 'assets/img/hero-2-900.webp 900w, assets/img/hero-2.webp 1440w',
    sizes: '(max-width: 1024px) 100vw, 750px' },
  '2d1d4c5d': { f: 'hero-3.webp', w: 1440, h: 1080,
    alt: 'Alumno de primaria con bata blanca observando por un microscopio',
    srcset: 'assets/img/hero-3-900.webp 900w, assets/img/hero-3.webp 1440w',
    sizes: '(max-width: 1024px) 100vw, 750px' },
  '162e1954': { f: 'nivel-primaria.webp', w: 480, h: 480,
    alt: 'Alumno de primaria del colegio con el uniforme deportivo' },
  '60094370': { f: 'nivel-secundaria.webp', w: 480, h: 480,
    alt: 'Dos alumnas de secundaria del colegio' },
  'be31bc71': { f: 'fachada.webp', w: 1200, h: 445,
    alt: 'Fachada del Colegio Niños Héroes de Chapultepec en Apizaco, Tlaxcala' },
  '89af97ff': { f: 'inst-primaria.webp', w: 1048, h: 590,
    alt: 'Patio y salones del área de primaria del colegio' },
  'fd14d79d': { f: 'inst-secundaria.webp', w: 1048, h: 590,
    alt: 'Laboratorio de ciencias del área de secundaria del colegio' },
  'd6f42ef8': { f: 'admisiones.webp', w: 1090, h: 613,
    alt: 'Tres alumnos del colegio con el uniforme escolar' },
  '38196d5c': { f: 'testimonios.webp', w: 1090, h: 818,
    alt: 'Una familia del Colegio Niños Héroes de Chapultepec' },
};

// uuid (8 primeros) -> archivo de fuente
const FUENTES = {
  'e5cb8d51': 'mulish-cyrillic-ext', '3138a3d9': 'mulish-cyrillic',
  '04601492': 'mulish-vietnamese',   '54357205': 'mulish-latin-ext',
  'e0f3cb2e': 'mulish-latin',        '51d26eb5': 'outfit-latin-ext',
  'e6be5336': 'outfit-latin',
};

// ------------------------------------------------------- 1. partir plantilla
const cssFuentes = plantilla
  .slice(plantilla.indexOf('<style>'), plantilla.indexOf('</style>'))
  .replace('<style>', '')
  .replace(/url\("([0-9a-f]{8})[^"]*"\)/g,
           (m, u) => 'url("assets/fonts/' + FUENTES[u] + '.woff2")')
  .trim();

const iHelmetFin = plantilla.indexOf('</helmet>');
const cssBase = plantilla
  .slice(plantilla.lastIndexOf('<style>', iHelmetFin), iHelmetFin)
  .replace('<style>', '').replace('</style>', '').trim();

let cuerpo = plantilla
  .slice(iHelmetFin + '</helmet>'.length, plantilla.indexOf('</x-dc>'))
  .trim();

// -------------------------------------------------------- 2. transformaciones

// 2.1 sc-camel-view-box -> viewBox (era un error de mayusculas del exportador)
cuerpo = cuerpo.replace(/sc-camel-view-box=/g, 'viewBox=');

// 2.2 <image-slot> -> <div> con overflow oculto + <img> con object-fit
cuerpo = cuerpo.replace(/<image-slot\b([^>]*)><\/image-slot>/g, (m, attrs) => {
  const at = n => (attrs.match(new RegExp(n + '="([^"]*)"')) || [])[1];
  const id = at('id'), forma = at('shape') || 'rounded', ajuste = at('fit') || 'cover';
  const estilo = at('style') || '', uuid = (at('src') || '').slice(0, 8);
  const im = IMG[uuid];
  let radio = '0';
  if (forma === 'circle') radio = '50%';
  else if (forma === 'pill') radio = '9999px';
  else if (forma === 'rounded') radio = (at('radius') || '12') + 'px';
  // El <image-slot> de testimonios es hijo directo de una rejilla y en el
  // original se estiraba a la altura de la columna de al lado (4:3 como
  // minimo, mas alto si el texto lo exige). Sin esto se veria mas chico en
  // tablet que en el diseno aprobado.
  const estirar = id === 'testimonios-foto' ? ';align-self:stretch' : '';
  return '<div id="' + id + '" style="' + estilo + estirar + ';overflow:hidden;border-radius:' + radio + '">' +
         '<img src="assets/img/' + im.f + '" alt="' + im.alt + '"' +
         ' width="' + im.w + '" height="' + im.h + '" loading="lazy" decoding="async"' +
         ' style="width:100%;height:100%;object-fit:' + ajuste + ';object-position:center;display:block"></div>';
});

// 2.3 <img src="uuid"> -> ruta real + srcset + medidas
let nLogo = 0;
cuerpo = cuerpo.replace(/<img src="([0-9a-f]{8})[^"]*"([^>]*)>/g, (m, u, resto) => {
  const im = IMG[u];
  const esHero = /^hero-/.test(im.f);
  // Solo la PRIMERA foto del hero se ve al abrir la pagina; las otras dos
  // aparecen a los 5 y 10 segundos. Las tres se descargan de inmediato (no
  // llevan lazy, porque estan en pantalla), pero solo la primera va con
  // prioridad alta: asi el celular pinta la portada con 84 KB en vez de 250.
  const esPrioritaria = im.f === 'hero-1.webp';
  // El logo del header esta arriba del pliegue -> carga inmediata.
  // El del footer esta hasta abajo -> carga diferida.
  const esLogoHeader = im.f === 'logo.webp' && (nLogo++ === 0);
  resto = resto.replace(/\s*alt="[^"]*"/, '');
  return '<img src="assets/img/' + im.f + '"' +
    (im.srcset ? ' srcset="' + im.srcset + '" sizes="' + im.sizes + '"' : '') +
    ' alt="' + im.alt + '" width="' + im.w + '" height="' + im.h + '"' +
    (esHero || esLogoHeader
      ? (esPrioritaria || esLogoHeader ? ' fetchpriority="high"' : '') + ' decoding="async"'
      : ' loading="lazy" decoding="async"') +
    resto + '>';
});

// 2.4 style-hover="..." -> regla CSS :hover de verdad.
//     Lleva !important porque tiene que ganarle al style="" de la etiqueta.
const hovers = [];
cuerpo = cuerpo.replace(/ style-hover="([^"]*)"/g, (m, v) => {
  let i = hovers.indexOf(v);
  if (i === -1) { hovers.push(v); i = hovers.length - 1; }
  return ' data-hv="' + i + '"';
});
const cssHover = hovers.map((v, i) =>
  '[data-hv="' + i + '"]:hover{' + v.split(';').map(d => d.trim()).filter(Boolean)
    .map(d => d + ' !important').join(';') + '}'
).join('\n');

// 2.5 <sc-if> -> se queda el contenido, se va la etiqueta.
//     Las dos banderas (barra lateral y testimonios) venian en true.
//     El menu movil se vuelve un div oculto que abre y cierra el JS.
cuerpo = cuerpo
  .replace(/<sc-if value="\{\{ menuOpen \}\}"[^>]*>\s*<div /, '<div id="menu-movil" hidden ')
  .replace(/<sc-if[^>]*>/g, '')
  .replace(/<\/sc-if>/g, '');

// 2.6 manejadores de eventos -> data-accion, que lee script.js
cuerpo = cuerpo
  .replace(/sc-camel-on-click="\{\{ (\w+) \}\}"/g, 'data-accion="$1"')
  .replace(/sc-camel-on-mouse-enter="\{\{ (\w+) \}\}"/g, 'data-entra="$1"')
  .replace(/sc-camel-on-mouse-leave="\{\{ (\w+) \}\}"/g, 'data-sale="$1"');

// 2.7 valores {{ }} -> el valor real con el que arranca la pagina
const INICIO = {
  waHref: WA_HREF, telHref: TEL_HREF,
  op0: '1', op1: '0', op2: '0',
  pe0: 'auto', pe1: 'none', pe2: 'none',
  dot0: '#2f557f', dot1: '#c4cfdc', dot2: '#c4cfdc',
  testContador: '1 / 3',
};
cuerpo = cuerpo.replace(/\{\{ (\w+) \}\}/g, (m, k) =>
  (k in INICIO) ? INICIO[k] : (console.error('  sin valor inicial: ' + k), m));

// 2.8 marcas para que script.js encuentre las piezas
cuerpo = cuerpo
  .replace(/data-accion="irFoto(\d)"/g, 'data-punto="$1"')
  .replace(/(<div style="position: absolute; inset: 0; transition: opacity \.8s ease;)/g,
           (m, s, off) => s)  // (se numeran abajo)
  .replace(/data-accion="toggleMenu"/, 'data-accion="menu"')
  .replace(/data-accion="closeMenu"/g, 'data-accion="cerrar-menu"')
  .replace(/data-accion="testAnterior"/, 'data-accion="test-anterior"')
  .replace(/data-accion="testSiguiente"/, 'data-accion="test-siguiente"')
  .replace(/data-entra="pausar"/g, 'data-carrusel-pausa')
  .replace(/data-sale="reanudar"/g, 'data-carrusel-sigue');

// numerar las 3 diapositivas del hero
let nSlide = 0;
cuerpo = cuerpo.replace(/<div style="position: absolute; inset: 0; transition: opacity \.8s ease;/g,
  m => '<div data-slide="' + (nSlide++) + '" style="position: absolute; inset: 0; transition: opacity .8s ease;');

// marcar el texto y el nombre del testimonio, y el contador
cuerpo = cuerpo
  .replace('>[Testimonio de padre de familia — pendiente]<', ' data-test-texto>[Testimonio de padre de familia — pendiente]<')
  .replace('>[Nombre — pendiente]<', ' data-test-nombre>[Nombre — pendiente]<')
  .replace('>1 / 3<', ' data-test-contador>1 / 3<');

// 2.9 ARREGLO A — en un celular de 375 px el boton del menu quedaba en el
//     pixel 398, fuera de la pantalla, y el hero se cortaba por la derecha.
//     Dos cambios que no alteran nada arriba de 470 px de ancho.
cuerpo = cuerpo
  .replace('flex: 0 0 auto; width: 312px; height: 71px',
           'flex: 0 1 auto; width: 312px; min-width: 0; height: 71px; position: relative')
  .replace('grid-template-columns:repeat(auto-fit,minmax(470px,1fr))',
           'grid-template-columns:repeat(auto-fit,minmax(min(470px,100%),1fr))');
// 2.10 ARREGLO B — el nombre del colegio se encimaba 58 px sobre el logo porque
//      estaba posicionado respecto a toda la pagina en vez de respecto al logo.
//      El "position: relative" del arreglo anterior ya lo resuelve; aqui solo
//      se ajusta el left para que quede pegado al logo como manda el diseno.
cuerpo = cuerpo.replace('width: 182px; height: 36px; position: absolute; left: 108px',
                        'width: 182px; height: 36px; position: absolute; left: 84px');

// ------------------------------------------------------------ 3. armar el HTML

// OJO: cuando tengas el dominio definitivo, cambialo aqui y en sitemap.xml.
const SITIO = 'https://colegio-ninos-heroes.vercel.app';

const TITULO = 'Colegio Niños Héroes de Chapultepec | Primaria y Secundaria en Apizaco';
const DESC = 'Colegio privado de primaria y secundaria en Apizaco, Tlaxcala. ' +
  'Institución de la Iglesia Adventista del Séptimo Día, con maestros atentos y ' +
  'formación en valores. Lunes a viernes de 8:00 a 14:00. Pide informes por WhatsApp.';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'School',
  name: 'Colegio Niños Héroes de Chapultepec',
  description: DESC,
  url: SITIO,
  logo: SITIO + '/assets/img/logo.webp',
  image: SITIO + '/assets/img/og.jpg',
  telephone: '+52-222-201-9898',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'C. Barberán y Collar 1116, San Martín de Porres',
    addressLocality: 'Apizaco',
    addressRegion: 'Tlaxcala',
    postalCode: '90300',
    addressCountry: 'MX',
  },
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '08:00', closes: '14:00',
  }],
  areaServed: { '@type': 'City', name: 'Apizaco, Tlaxcala' },
  parentOrganization: { '@type': 'Organization', name: 'Iglesia Adventista del Séptimo Día' },
  // Sin aggregateRating: no tenemos ese dato y no se inventa.
  // Falta "geo" (latitud/longitud) y "sameAs" (Facebook/Instagram) — ver README.
};

const html = `<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${TITULO}</title>
<meta name="description" content="${DESC}">
<link rel="canonical" href="${SITIO}/">
<meta name="theme-color" content="#2f557f">

<!-- Para que al compartir el link por WhatsApp o Facebook salga foto y titulo -->
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="Colegio Niños Héroes de Chapultepec">
<meta property="og:title" content="${TITULO}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITIO}/">
<meta property="og:image" content="${SITIO}/assets/img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Colegio Niños Héroes de Chapultepec — Primaria y Secundaria en Apizaco, Tlaxcala">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${TITULO}">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${SITIO}/assets/img/og.jpg">

<link rel="icon" href="assets/icons/favicon.ico" sizes="any">
<link rel="icon" href="assets/icons/icono-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
<link rel="manifest" href="assets/icons/manifest.webmanifest">

<link rel="preload" href="assets/fonts/outfit-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/mulish-latin.woff2" as="font" type="font/woff2" crossorigin>

<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>

<style>
/* ---- Fuentes (Mulish y Outfit), servidas desde este mismo sitio ---- */
${cssFuentes}
</style>

<style>
/* ---- Estilos base: vienen tal cual del diseño aprobado ---- */
${cssBase}
[hidden]{display:none !important}

/* ---- Efectos al pasar el mouse ----
   En el diseño venían como atributo style-hover="..."; aquí son CSS normal.
   Llevan !important porque tienen que ganarle al style="" de cada etiqueta. */
${cssHover}
</style>
</head>
<body>

${cuerpo}

<script src="script.js" defer></script>
</body>
</html>
`;

fs.writeFileSync(path.join(RAIZ, 'index.html'), html);
console.error('  index.html escrito: ' + (html.length / 1024).toFixed(0) + ' KB');
