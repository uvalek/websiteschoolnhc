#!/usr/bin/env node
/*
 * Genera las paginas del blog a partir de contenido/blog.json.
 *
 *   blog/index.html          la lista de todas las entradas
 *   blog/<slug>.html         una pagina por entrada
 *
 * Es el mismo archivo del que la portada saca las tres tarjetas, asi que solo
 * hay un lugar que editar. Cuando exista el panel de administrador, esto se
 * reemplaza por datos de la base y este script se puede tirar.
 *
 * Uso:  node herramientas/generar-blog.js
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const SITIO = 'https://websiteschoolnhc.vercel.app';
const DEST = path.join(RAIZ, 'blog');

const entradas = JSON.parse(fs.readFileSync(path.join(RAIZ, 'contenido/blog.json'), 'utf8'));

// Las mismas reglas @font-face de la portada, con las rutas un nivel arriba.
const plantilla = fs.readFileSync(path.join(RAIZ, 'assets/originales/plantilla-original.html'), 'utf8');
const FUENTES = {
  'e5cb8d51': 'mulish-cyrillic-ext', '3138a3d9': 'mulish-cyrillic',
  '04601492': 'mulish-vietnamese',   '54357205': 'mulish-latin-ext',
  'e0f3cb2e': 'mulish-latin',        '51d26eb5': 'outfit-latin-ext',
  'e6be5336': 'outfit-latin',
};
const cssFuentes = plantilla
  .slice(plantilla.indexOf('<style>'), plantilla.indexOf('</style>'))
  .replace('<style>', '')
  .replace(/url\("([0-9a-f]{8})[^"]*"\)/g, (m, u) => 'url("../assets/fonts/' + FUENTES[u] + '.woff2")')
  .trim();

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'Mulish',system-ui,sans-serif;color:#3c4654;background:#ffffff;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:'Outfit',system-ui,sans-serif;margin:0;text-wrap:balance}
p{text-wrap:pretty;margin:0}
a{color:#8a2f43;text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto}

.barra{position:sticky;top:0;z-index:20;background:#ffffff;border-bottom:1px solid #e7ebf1}
.barra-int{max-width:1180px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;gap:20px}
.marca{display:flex;align-items:center;gap:12px;flex:0 1 auto;min-width:0;position:relative}
.marca img{height:52px;width:auto;display:block}
.marca span{font-family:'Outfit',sans-serif;font-weight:600;font-size:15px;line-height:1.15;color:#2f557f}
.marca span small{display:block;font-weight:400;font-size:13px;color:#6b7a8c}
.barra .cta{margin-left:auto;flex:0 0 auto;display:inline-flex;align-items:center;gap:9px;background:#2f557f;color:#ffffff;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px}
.barra .cta:hover{background:#24425f;text-decoration:none}
.barra .cta .corto{display:none}

main{max-width:760px;margin:0 auto;padding:56px 24px 24px}
.volver{display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#2f557f}
.categoria{display:block;margin-top:34px;font-size:13px;font-weight:700;color:#8a2f43;letter-spacing:.06em;text-transform:uppercase}
time{display:block;margin-top:8px;font-size:14px;color:#6b7887}
h1{margin-top:14px;font-size:clamp(30px,4.6vw,44px);line-height:1.12;letter-spacing:-.02em;color:#2f557f;font-weight:700}
.entrada{margin-top:20px;font-size:19px;line-height:1.6;color:#54606f}
.portada{display:block;width:100%;height:auto;margin-top:30px;border-radius:18px}
.regla{width:64px;height:4px;background:#8a2f43;border-radius:2px;margin:32px 0}
article h2{margin-top:40px;font-size:26px;line-height:1.25;color:#2f557f;font-weight:700}
article h3{margin-top:30px;font-size:19px;line-height:1.3;color:#2f557f;font-weight:600}
article p{margin-top:16px;font-size:17px;line-height:1.75;color:#4a5563}
article ul{margin:18px 0 0;padding-left:22px}
article li{margin-top:10px;font-size:17px;line-height:1.7;color:#4a5563}
article li::marker{color:#8a2f43}

.cierre{margin:56px 0 0;background:#f6f8fb;border:1px solid #e2e8ef;border-radius:22px;padding:32px}
.cierre h2{margin:0;font-size:22px;color:#2f557f;font-weight:700}
.cierre p{margin-top:10px;font-size:16px;line-height:1.65;color:#54606f}
.cierre a{display:inline-flex;align-items:center;gap:10px;margin-top:20px;background:#2f557f;color:#ffffff;padding:14px 26px;border-radius:999px;font-weight:600;font-size:16px}
.cierre a:hover{background:#24425f;text-decoration:none}

.lista{max-width:1180px;margin:0 auto;padding:0 24px 24px}
.rejilla{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:26px;margin-top:40px}
.tarjeta{background:#ffffff;border:1px solid #e7ebf1;border-radius:22px;padding:14px;box-shadow:0 12px 30px rgba(47,85,127,.10);display:flex;flex-direction:column}
.tapa{height:190px;border-radius:14px;background:linear-gradient(135deg,#eef3f9 0%,#dbe6f3 100%);display:flex;align-items:center;justify-content:center}
.tapa div{width:104px;height:104px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(47,85,127,.12)}
.cuerpo-t{padding:20px 10px 6px;display:flex;flex-direction:column;flex:1}
.cuerpo-t h2{font-size:20px;line-height:1.28;color:#2f557f;font-weight:700;margin-top:12px}
.cuerpo-t p{font-size:15px;line-height:1.65;color:#54606f;margin-top:12px;flex:1}
.leer{display:inline-flex;align-items:center;gap:8px;margin-top:20px;color:#8a2f43;font-weight:600;font-size:15px;align-self:flex-start}

footer{margin-top:72px;background:#f6f8fb;border-top:1px solid #e7ebf1;padding:44px 24px}
.pie{max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;font-size:15px;color:#66717f}
.pie a{color:#66717f}
/* En celular el encabezado se aprieta y el nombre del colegio se partia en
   tres renglones. Se achica todo un poco para que quepa en dos. */
@media (max-width:620px){
  .barra-int{gap:12px;padding:10px 20px}
  .marca{gap:10px}
  .marca img{height:42px}
  .marca span{font-size:14px}
  .marca span small{font-size:12px}
  .barra .cta{padding:10px 18px;font-size:14px}
  .barra .cta .largo{display:none}
  .barra .cta .corto{display:inline}
  main{padding-top:36px}
  .cierre{padding:24px}
}
`;

const ICONOS = {
  libro: '<path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path>',
  mochila: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M4 13h16"></path><path d="M9 20v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5"></path>',
  reloj: '<circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2 2"></path><path d="M5 3 2 6"></path><path d="m22 6-3-3"></path><path d="M6.38 18.7 4 21"></path><path d="M17.64 18.67 20 21"></path>',
};
// La tapa de la tarjeta: la foto de la entrada. Si una entrada no trae foto
// (por ejemplo una que agregues de prisa), cae de vuelta al icono de trazo.
function tapa(e, prefijo) {
  if (e.foto) {
    return `<div class="tapa" style="overflow:hidden"><img src="${prefijo}assets/img/blog/${e.slug}-tarjeta.webp" alt="${esc(e.foto.alt)}" width="760" height="425" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block"></div>`;
  }
  return `<div class="tapa"><div><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#2f557f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[e.icono] || ICONOS.libro}</svg></div></div>`;
}

const FLECHA = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>';
const WA = 'https://wa.me/522212018998?text=' +
  encodeURIComponent('Hola, vi su página y quiero información sobre inscripciones.');

function cabeza(titulo, desc, url, extra, imgOG) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#2f557f">
<meta property="og:type" content="${extra ? 'article' : 'website'}">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="Colegio Niños Héroes de Chapultepec">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imgOG || SITIO + '/assets/img/og.jpg'}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${imgOG || SITIO + '/assets/img/og.jpg'}">
<link rel="icon" href="../assets/icons/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">
<link rel="preload" href="../assets/fonts/outfit-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/mulish-latin.woff2" as="font" type="font/woff2" crossorigin>
${extra || ''}
<style>
${cssFuentes}
</style>
<style>${CSS}</style>`;
}

const BARRA = `<header class="barra">
  <div class="barra-int">
    <a class="marca" href="../index.html">
      <img src="../assets/img/logo.webp" alt="Colegio Niños Héroes de Chapultepec — Educación Adventista" width="300" height="321">
      <span>Colegio Niños Héroes<small>de Chapultepec</small></span>
    </a>
    <a class="cta" href="${WA}" target="_blank" rel="noopener"><span class="largo">Solicita informes</span><span class="corto">Informes</span></a>
  </div>
</header>`;

const PIE = `<footer>
  <div class="pie">
    <span>© Colegio Niños Héroes de Chapultepec · Apizaco, Tlaxcala</span>
    <span><a href="../index.html">Inicio</a> · <a href="index.html">Blog</a> · <a href="../index.html#contacto">Contacto</a></span>
  </div>
</footer>`;

function cuerpoHTML(bloques) {
  return bloques.map(b => {
    if (b.t === 'p') return `      <p>${esc(b.x)}</p>`;
    if (b.t === 'h2') return `      <h2>${esc(b.x)}</h2>`;
    if (b.t === 'h3') return `      <h3>${esc(b.x)}</h3>`;
    if (b.t === 'ul') return '      <ul>\n' + b.x.map(i => `        <li>${esc(i)}</li>`).join('\n') + '\n      </ul>';
    return '';
  }).join('\n');
}

fs.mkdirSync(DEST, { recursive: true });

// ------------------------------------------------------- una pagina por entrada
for (const e of entradas) {
  const url = `${SITIO}/blog/${e.slug}.html`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: e.titulo,
    description: e.resumen,
    datePublished: e.fechaISO,
    dateModified: e.fechaISO,
    inLanguage: 'es-MX',
    mainEntityOfPage: url,
    image: e.foto ? `${SITIO}/assets/img/blog/${e.slug}-og.jpg` : `${SITIO}/assets/img/og.jpg`,
    author: { '@type': 'Organization', name: 'Colegio Niños Héroes de Chapultepec' },
    publisher: {
      '@type': 'Organization',
      name: 'Colegio Niños Héroes de Chapultepec',
      logo: { '@type': 'ImageObject', url: `${SITIO}/assets/img/logo.webp` },
    },
  };
  const html = `<!DOCTYPE html>
<html lang="es-MX">
<head>
${cabeza(e.titulo + ' | Colegio Niños Héroes de Chapultepec', e.resumen, url,
  '<script type="application/ld+json">\n' + JSON.stringify(schema, null, 2) + '\n</script>',
  e.foto ? `${SITIO}/assets/img/blog/${e.slug}-og.jpg` : null)}
</head>
<body>
${BARRA}
<main>
  <a class="volver" href="index.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg> Volver al blog</a>
  <span class="categoria">${esc(e.categoria)}</span>
  <time datetime="${e.fechaISO}">${esc(e.fecha)}</time>
  <h1>${esc(e.titulo)}</h1>
  <p class="entrada">${esc(e.resumen)}</p>
  ${e.foto ? `<img class="portada" src="../assets/img/blog/${e.slug}-portada.webp" alt="${esc(e.foto.alt)}" width="1520" height="690" fetchpriority="high" decoding="async">` : ''}
  <div class="regla"></div>
  <article>
${cuerpoHTML(e.cuerpo)}
  </article>
  <div class="cierre">
    <h2>¿Buscas colegio para tus hijos en Apizaco?</h2>
    <p>Somos una escuela de primaria y secundaria en Apizaco, Tlaxcala. Escríbenos y con gusto te damos informes.</p>
    <a href="${WA}" target="_blank" rel="noopener">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
      Pedir informes por WhatsApp
    </a>
  </div>
</main>
${PIE}
</body>
</html>
`;
  fs.writeFileSync(path.join(DEST, e.slug + '.html'), html);
}

// -------------------------------------------------------------- la lista
const tarjetas = entradas.map(e => `      <article class="tarjeta">
        ${tapa(e, '../')}
        <div class="cuerpo-t">
          <span class="categoria" style="margin-top:0">${esc(e.categoria)}</span>
          <time datetime="${e.fechaISO}">${esc(e.fecha)}</time>
          <h2>${esc(e.titulo)}</h2>
          <p>${esc(e.resumen)}</p>
          <a class="leer" href="${e.slug}.html">Leer ${FLECHA}</a>
        </div>
      </article>`).join('\n');

const descLista = 'Noticias del Colegio Niños Héroes de Chapultepec y consejos para acompañar ' +
  'el estudio en casa, dirigidos a familias de primaria y secundaria en Apizaco, Tlaxcala.';

fs.writeFileSync(path.join(DEST, 'index.html'), `<!DOCTYPE html>
<html lang="es-MX">
<head>
${cabeza('Blog | Colegio Niños Héroes de Chapultepec', descLista, SITIO + '/blog/', '')}
</head>
<body>
${BARRA}
<main style="max-width:1180px;padding-bottom:8px">
  <a class="volver" href="../index.html"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg> Volver al inicio</a>
  <span class="categoria">De nuestro blog</span>
  <h1>Noticias y consejos para las familias</h1>
  <p class="entrada">${esc(descLista)}</p>
</main>
<div class="lista">
  <div class="rejilla">
${tarjetas}
  </div>
</div>
${PIE}
</body>
</html>
`);

// ------------------------------- actualizar las tarjetas de la portada
// Solo se reemplaza lo que hay entre los marcadores: el resto de index.html
// (telefonos, horarios, textos) queda intacto aunque lo hayas editado a mano.
const rutaPortada = path.join(RAIZ, 'index.html');
const INI = '<!-- BLOG:INICIO';
const FIN = '<!-- BLOG:FIN -->';
let portada = fs.readFileSync(rutaPortada, 'utf8');
const a = portada.indexOf(INI);
const b = portada.indexOf(FIN);
if (a === -1 || b === -1) {
  console.error('  AVISO: no encontre los marcadores BLOG:INICIO / BLOG:FIN en index.html.');
  console.error('         Las paginas del blog si se generaron, pero las tarjetas de la');
  console.error('         portada hay que actualizarlas a mano.');
} else {
  const finLinea = portada.indexOf('-->', a) + 3;
  const tarjetasPortada = entradas.map(e => `      <article style="background:#ffffff;border:1px solid #e7ebf1;border-radius:22px;padding:14px;box-shadow:0 12px 30px rgba(47,85,127,.10);display:flex;flex-direction:column">
        ${e.foto
          ? `<div style="height:190px;border-radius:14px;overflow:hidden"><img src="assets/img/blog/${e.slug}-tarjeta.webp" alt="${esc(e.foto.alt)}" width="760" height="425" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block"></div>`
          : `<div style="height:190px;border-radius:14px;background:linear-gradient(135deg,#eef3f9 0%,#dbe6f3 100%);display:flex;align-items:center;justify-content:center"><div style="width:104px;height:104px;border-radius:50%;background:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(47,85,127,.12)"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#2f557f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[e.icono] || ICONOS.libro}</svg></div></div>`}
        <div style="padding:20px 10px 6px;display:flex;flex-direction:column;flex:1">
          <span style="font-size:13px;font-weight:700;color:#8a2f43;letter-spacing:.06em;text-transform:uppercase">${esc(e.categoria)}</span>
          <time datetime="${e.fechaISO}" style="font-size:13px;color:#6b7887;margin-top:8px">${esc(e.fecha)}</time>
          <h3 style="font-size:20px;line-height:1.28;color:#2f557f;font-weight:700;margin-top:12px">${esc(e.titulo)}</h3>
          <p style="font-size:15px;line-height:1.65;color:#54606f;margin-top:12px;flex:1">${esc(e.resumen)}</p>
          <a href="blog/${e.slug}.html" style="display:inline-flex;align-items:center;gap:8px;margin-top:20px;color:#8a2f43;font-weight:600;font-size:15px;align-self:flex-start">
            Leer
            ${FLECHA}
          </a>
        </div>
      </article>`).join('\n');
  portada = portada.slice(0, finLinea) + '\n' + tarjetasPortada + '\n      ' + portada.slice(b);
  fs.writeFileSync(rutaPortada, portada);
  console.log('  index.html: tarjetas de la portada actualizadas');
}

console.log(`  blog/index.html y ${entradas.length} paginas de entrada generadas`);
for (const e of entradas) {
  const b = fs.statSync(path.join(DEST, e.slug + '.html')).size;
  console.log(`    ${(b / 1024).toFixed(0).padStart(3)} KB  blog/${e.slug}.html`);
}
