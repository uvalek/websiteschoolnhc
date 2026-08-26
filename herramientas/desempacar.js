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

// 2.8b Marca el titulo y el parrafo del hero para el efecto de contraste.
//      El texto es azul oscuro y las fotos que pasan por detras traen una
//      mancha del mismo azul: donde se encima, el texto desaparece. La clase
//      la usa script.js para pintar de blanco solo esos pixeles.
cuerpo = cuerpo
  .replace('<h1 style="font-size:clamp(38px,5.2vw,60px)',
           '<h1 class="contraste-hero" style="font-size:clamp(38px,5.2vw,60px)')
  .replace('<p style="font-size:clamp(17px,2vw,19px);line-height:1.65;color:#54606f',
           '<p class="contraste-hero" style="font-size:clamp(17px,2vw,19px);line-height:1.65;color:#54606f');

// 2.8c Marca la columna de la foto del hero. La composicion del hero esta
//      calculada con desplazamientos en pixeles fijos (left:-146px,
//      top:-170px, width:750px, left:-104px) pensados para escritorio; en un
//      celular empujan la foto fuera de la pantalla por la izquierda. La
//      clase permite anularlos solo en pantallas chicas.
cuerpo = cuerpo
  .replace(
    'style="justify-self:center;align-self:stretch;width:100%;max-width:560px;min-height:460px;position:relative"',
    'class="hero-media" style="justify-self:center;align-self:stretch;width:100%;max-width:560px;min-height:460px;position:relative"')
  .replace(
    'style="position:relative;z-index:1;max-width:560px;display:flex;flex-direction:column;justify-content:center;padding-bottom:72px"',
    'class="hero-texto" style="position:relative;z-index:1;max-width:560px;display:flex;flex-direction:column;justify-content:center;padding-bottom:72px"');

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


// ---------------------------------------------------- 2.11 SECCION DEL BLOG
// Las entradas viven en contenido/blog.json, que es tambien de donde
// generar-blog.js saca las paginas de cada articulo: un solo lugar que
// editar. Cuando exista el panel de administrador, esto se reemplaza por
// datos de la base.
const ICONOS = {
  libro: '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
  mochila: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M4 13h16"></path><path d="M9 20v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"></path>',
  reloj: '<circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M5 3 2 6"></path><path d="m22 6-3-3"></path><path d="M6.38 18.7 4 21"></path><path d="M17.64 18.67 20 21"></path>',
};

const entradas = JSON.parse(fs.readFileSync(path.join(RAIZ, 'contenido/blog.json'), 'utf8'));

const tarjetas = entradas.map((e, i) => `      <article class="tarjeta tarjeta-blog" data-anim="${i + 1}" style="background:#ffffff;border:1px solid #e7ebf1;border-radius:22px;padding:14px;box-shadow:0 12px 30px rgba(47,85,127,.10);display:flex;flex-direction:column">
        ${e.foto
          ? `<div style="height:190px;border-radius:14px;overflow:hidden"><img src="assets/img/blog/${e.slug}-tarjeta.webp" alt="${e.foto.alt}" width="760" height="425" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block"></div>`
          : `<div style="height:190px;border-radius:14px;background:linear-gradient(135deg,#eef3f9 0%,#dbe6f3 100%);display:flex;align-items:center;justify-content:center"><div style="width:104px;height:104px;border-radius:50%;background:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(47,85,127,.12)"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#2f557f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[e.icono] || ICONOS.libro}</svg></div></div>`}
        <div style="padding:20px 10px 6px;display:flex;flex-direction:column;flex:1">
          <span style="font-size:13px;font-weight:700;color:#8a2f43;letter-spacing:.06em;text-transform:uppercase">${e.categoria}</span>
          <time datetime="${e.fechaISO}" style="font-size:13px;color:#6b7887;margin-top:8px">${e.fecha}</time>
          <h3 style="font-size:20px;line-height:1.28;color:#2f557f;font-weight:700;margin-top:12px">${e.titulo}</h3>
          <p style="font-size:15px;line-height:1.65;color:#54606f;margin-top:12px;flex:1">${e.resumen}</p>
          <a href="blog/${e.slug}.html" style="display:inline-flex;align-items:center;gap:8px;margin-top:20px;color:#8a2f43;font-weight:600;font-size:15px;align-self:flex-start">
            Leer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </a>
        </div>
      </article>`).join('\n');

const seccionBlog = `
<section id="blog" data-screen-label="Blog" style="padding:88px 24px;background:#ffffff">
  <div style="max-width:1180px;margin:0 auto">
    <span data-anim="1" style="display:block;font-size:15px;font-weight:600;color:#8a2f43;letter-spacing:.04em">De nuestro blog</span>
    <h2 data-anim="1" style="font-size:clamp(28px,3.6vw,42px);color:#2f557f;font-weight:700;letter-spacing:-.015em;margin-top:12px">Noticias y consejos para las familias</h2>
    <p style="font-size:17px;line-height:1.75;color:#54606f;margin-top:16px;max-width:640px">Avisos del colegio, ideas para acompañar el estudio en casa y los temas que más nos preguntan los papás de primaria y secundaria.</p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:26px;margin-top:44px">
      <!-- BLOG:INICIO — lo de aquí adentro lo escribe herramientas/generar-blog.js. No lo edites a mano: edita contenido/blog.json. -->
${tarjetas}
      <!-- BLOG:FIN -->
    </div>

    <div style="display:flex;justify-content:center;margin-top:48px">
      <a href="blog/" data-hv="1" style="display:inline-flex;align-items:center;gap:10px;background:#2f557f;color:#ffffff;padding:16px 32px;border-radius:999px;font-weight:600;font-size:16px">
        Ver todas las entradas
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
      </a>
    </div>
  </div>
</section>
`;

cuerpo = cuerpo.replace('<section id="contacto"', seccionBlog + '\n<section id="contacto"');

// Enlace "Blog" en el menu de escritorio, en el de celular y en el pie.
cuerpo = cuerpo
  .replace('<a href="#contacto" style="color:#2f557f" data-hv="0">Contacto</a>',
           '<a href="#blog" style="color:#2f557f" data-hv="0">Blog</a>\n      <a href="#contacto" style="color:#2f557f" data-hv="0">Contacto</a>')
  .replace('<a href="#contacto" data-accion="cerrar-menu" style="padding:12px 4px;color:#3c4654">Contacto</a>',
           '<a href="#blog" data-accion="cerrar-menu" style="padding:12px 4px;color:#3c4654;border-bottom:1px solid #f0f3f7">Blog</a>\n      <a href="#contacto" data-accion="cerrar-menu" style="padding:12px 4px;color:#3c4654">Contacto</a>')
  .replace('<a href="#nuestro-colegio" style="font-size:15px;color:#66717f">Quiénes somos</a>',
           '<a href="#nuestro-colegio" style="font-size:15px;color:#66717f">Quiénes somos</a>\n        <a href="#blog" style="font-size:15px;color:#66717f">Blog</a>');



// ------------------------------------------- 2.12 MARCAS DE ANIMACION
// data-anim = este elemento aparece con un desvanecimiento al llegar a la
// pantalla. El numero es el turno, para que los grupos entren escalonados.
// El estado inicial (invisible) SOLO se aplica si el JavaScript pudo correr,
// asi que sin JavaScript la pagina se ve completa desde el primer momento.
function marcar(txt, ancla, turnos) {
  let i = 0;
  return txt.split(ancla).reduce((acc, parte, idx, arr) => {
    if (idx === 0) return parte;
    const t = turnos[i % turnos.length]; i++;
    return acc + ancla.replace('<div ', `<div data-anim="${t}" `)
                      .replace('<h2 ', `<h2 data-anim="${t}" `) + parte;
  });
}

// Niveles: el titulo y luego los dos circulos, uno tras otro
cuerpo = marcar(cuerpo, '<h2 style="font-size:clamp(30px,4vw,44px);color:#ffffff;font-weight:700;letter-spacing:-.015em;text-align:center">', ['1']);
cuerpo = marcar(cuerpo, '<div style="padding:20px 0;display:flex;flex-direction:column;align-items:center">', ['1', '2']);
// Quienes somos
cuerpo = marcar(cuerpo, '<div style="max-width:820px">', ['1']);
// Instalaciones: el encabezado y las dos tarjetas
cuerpo = marcar(cuerpo, '<div style="max-width:1180px;margin:0 auto;width:100%">', ['1']);
cuerpo = marcar(cuerpo, '<div style="background:#ffffff;border:1px solid #e7ebf1;border-radius:22px;padding:14px;box-shadow:0 12px 30px rgba(47,85,127,.10)">', ['1', '2']);
// Contacto: el mapa y la tarjeta de datos
cuerpo = marcar(cuerpo, '<div style="border-radius:24px;overflow:hidden;min-height:420px;border:1px solid #e2e8ef">', ['1']);
cuerpo = marcar(cuerpo, '<div style="background:#ffffff;border-radius:24px;padding:38px 34px;display:flex;flex-direction:column;gap:26px">', ['2']);

// Las dos tarjetas de Instalaciones tambien llevan el efecto de acercamiento
cuerpo = cuerpo.replace(/<div data-anim="([12])" style="background:#ffffff;border:1px solid #e7ebf1;border-radius:22px;padding:14px;box-shadow:0 12px 30px rgba\(47,85,127,\.10\)">/g,
  '<div class="tarjeta" data-anim="$1" style="background:#ffffff;border:1px solid #e7ebf1;border-radius:22px;padding:14px;box-shadow:0 12px 30px rgba(47,85,127,.10)">');


// ------------------------------------------------------------ 3. armar el HTML

// OJO: cuando tengas el dominio definitivo, cambialo aqui y en sitemap.xml.
const SITIO = 'https://websiteschoolnhc.vercel.app';

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

<script>
/* Enciende las animaciones solo si el JavaScript corre. La red de seguridad:
   si script.js no cargó en 3 segundos, se quita la clase y todo aparece. */
(function () {
  var h = document.documentElement;
  h.className += ' js-anim';
  setTimeout(function () {
    if (!window.__animacionesListas) h.className = h.className.replace(' js-anim', '');
  }, 3000);
})();
</script>

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

/* ---- Animaciones ----
   Dos cosas: los bloques aparecen con un desvanecimiento al llegar a la
   pantalla, y las tarjetas se levantan un poco con un acercamiento a la foto
   al pasar el mouse.

   El estado inicial invisible cuelga de html.js-anim, que lo pone un script
   diminuto en el <head>. Si el JavaScript está apagado o falla, esa clase
   nunca se pone (o se quita sola a los 3 segundos) y la página se ve completa,
   sin animación. Nunca puede quedarse en blanco esperando.

   Y todo esto se apaga si la persona pidió "menos animaciones" en su sistema
   operativo: hay gente a la que el movimiento le provoca mareo. */
@media (prefers-reduced-motion: no-preference) {
  html.js-anim [data-anim] {
    opacity: 0;
    transform: translateY(18px);
  }
  html.js-anim [data-anim].a-visible {
    opacity: 1;
    transform: none;
    transition: opacity .7s cubic-bezier(.22,.61,.36,1),
                transform .7s cubic-bezier(.22,.61,.36,1);
  }
  html.js-anim [data-anim="2"].a-visible { transition-delay: .10s }
  html.js-anim [data-anim="3"].a-visible { transition-delay: .20s }

  /* Las fotos de las tarjetas y los circulos de Niveles */
  .tarjeta { transition: transform .35s ease, box-shadow .35s ease }
  .tarjeta img,
  #nivel-primaria img, #nivel-secundaria img,
  #admisiones-foto img, #testimonios-foto img {
    transition: transform .6s cubic-bezier(.22,.61,.36,1);
  }
  @media (hover: hover) {
    .tarjeta:hover {
      /* Los dos !important son necesarios y por motivos distintos:
         - la sombra, porque viene en el style="" de la etiqueta;
         - el transform, porque la regla que revela el elemento
           (html.js-anim [data-anim].a-visible { transform: none }) es más
           específica que .tarjeta:hover y si no, gana ella y la tarjeta
           nunca se levantaría. */
      transform: translateY(-5px) !important;
      box-shadow: 0 20px 44px rgba(47,85,127,.18) !important;
    }
    .tarjeta:hover img,
    #nivel-primaria:hover img, #nivel-secundaria:hover img,
    #admisiones-foto:hover img, #testimonios-foto:hover img { transform: scale(1.06) }
    .tarjeta-blog:hover a svg { transform: translateX(4px) }
  }
  .tarjeta-blog a svg { transition: transform .3s ease }
}

/* ---- Menu de escritorio con 6 items ----
   Al agregar "Blog" el menu pasó de 5 a 6 enlaces. Entre 1025 y 1099 px eso
   ya no cabía: "Nuestro colegio" se partía en dos renglones y el logo se
   encogía. Se juntan un poco los enlaces SOLO en esa franja; de 1100 px para
   arriba queda la separación original de 26 px del diseño. */
header nav a { white-space: nowrap; }
@media (min-width: 1025px) and (max-width: 1099px) {
  header nav { gap: 16px !important; }
}

/* ---- ARREGLO C: encuadre de la foto del hero en celular ----
   La composicion del hero usa desplazamientos en pixeles fijos calculados
   para escritorio. En una pantalla de 375 px el envoltorio arranca en
   x = -122 y la primera foto en x = -219 con 900 px de ancho: las fotos
   quedaban cortadas por la izquierda.

   Aqui se anulan esos desplazamientos y la foto se acomoda al ancho real del
   telefono, sangrando de orilla a orilla. Arriba de 1035 px no aplica nada de
   esto: en escritorio el diseno queda exactamente igual. */
@media (max-width: 1035px) {
  .hero-media {
    min-height: 0 !important;
    max-width: none !important;
    align-self: start !important;
    justify-self: stretch !important;
    width: calc(100% + 48px) !important;
    margin: 0 -24px !important;
    aspect-ratio: 4 / 3;
  }
  .hero-media > div { left: 0 !important; top: 0 !important; }
  .hero-media [data-slide] { width: 100% !important; left: 0 !important; }
  .hero-media [data-slide] img {
    width: 100% !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
  }
  /* Los 72 px de abajo del texto y los 48 px de separacion de la rejilla
     existen para que en escritorio la foto se encime sobre el texto. En
     celular la foto va debajo, asi que solo dejaban un hueco vacio. */
  .hero-texto { padding-bottom: 0 !important; }
  /* Una sola columna, fija. Sin esto el numero de columnas depende de como
     cada navegador resuelva min(470px,100%) dentro de auto-fit, y hay
     anchos donde unos ponen una columna y otros dos. */
  #inicio > div {
    grid-template-columns: 1fr !important;
    gap: 28px !important;
  }
}

/* ---- Contraste del texto del hero sobre las fotos ----
   El titulo y el parrafo son azul oscuro, y las fotos que van pasando traen
   una mancha del MISMO azul: donde se encima, el texto se vuelve ilegible.

   Con background-clip:text el texto se pinta con dos capas de fondo en vez
   de con un color: abajo el color original, y encima una capa blanca
   recortada por la silueta de las zonas oscuras de la foto. El recorte es
   por pixel, asi que si el borde parte una letra a la mitad, esa letra queda
   mitad blanca y mitad azul.

   script.js es quien pone las imagenes y las alinea con la foto. Sin
   JavaScript esta regla no llega a aplicarse y el texto se ve como siempre. */
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  .contraste-hero.contraste-activo {
    -webkit-background-clip: text;
    background-clip: text;
    /* !important porque tiene que ganarle al color del style="" de la etiqueta */
    color: transparent !important;
    background-repeat: no-repeat;
  }
}

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
