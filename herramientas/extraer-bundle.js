#!/usr/bin/env node
/*
 * Extrae los archivos (imagenes, fuentes, plantilla) que vienen empaquetados
 * en base64 dentro del export de Claude Design, y los guarda como archivos
 * reales con nombres legibles en assets/originales/.
 *
 * NO sobrescribe nada: si un archivo ya existe, lo deja tal cual.
 *
 * Uso:  node herramientas/extraer-bundle.js
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const BUNDLE = path.join(RAIZ, 'Colegio Ninos Heroes.html');
const DEST_IMG = path.join(RAIZ, 'assets/originales/img');
const DEST_FONT = path.join(RAIZ, 'assets/originales/fonts');
const DEST_META = path.join(RAIZ, 'assets/originales');

// UUID del bundle -> nombre legible. Los 8 primeros caracteres bastan.
const NOMBRES = {
  'e974db8e': 'logo',              // PNG alfa  2994x3200  logo Educacion Adventista
  'dc560efc': 'hero-1',            // PNG alfa  1920x1080  tres alumnas
  '7033de25': 'hero-2',            // PNG alfa  1440x1080  alumnos uniforme deportivo
  '2d1d4c5d': 'hero-3',            // PNG alfa  1440x1080  alumno con microscopio
  '162e1954': 'nivel-primaria',    // WebP       480x480
  '60094370': 'nivel-secundaria',  // WebP       480x480
  'be31bc71': 'fachada',           // WebP      1200x445
  '89af97ff': 'inst-primaria',     // WebP      1048x590
  'fd14d79d': 'inst-secundaria',   // WebP      1048x590
  'd6f42ef8': 'admisiones',        // WebP      1090x613
  '38196d5c': 'testimonios',       // WebP      1090x818
};

const EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp',
  'image/svg+xml': 'svg', 'font/woff2': 'woff2',
};

function bloque(html, tipo) {
  const m = html.match(new RegExp('<script type="__bundler/' + tipo + '">([\\s\\S]*?)</script>'));
  return m ? m[1].trim() : null;
}

function main() {
  if (!fs.existsSync(BUNDLE)) {
    console.error('No encuentro el export:', BUNDLE);
    process.exit(1);
  }
  const html = fs.readFileSync(BUNDLE, 'utf8');
  const manifest = JSON.parse(bloque(html, 'manifest'));
  const plantilla = JSON.parse(bloque(html, 'template'));

  [DEST_IMG, DEST_FONT].forEach(d => fs.mkdirSync(d, { recursive: true }));

  // La plantilla es el HTML real de la pagina. La guardamos como referencia.
  const rutaPlantilla = path.join(DEST_META, 'plantilla-original.html');
  if (!fs.existsSync(rutaPlantilla)) fs.writeFileSync(rutaPlantilla, plantilla);

  // Averiguar que fuente es cada UUID leyendo las reglas @font-face.
  const fuentes = {};
  const re = /\/\* ([a-z-]+) \*\/\s*@font-face \{([^}]*)\}/g;
  let m;
  while ((m = re.exec(plantilla))) {
    const subconjunto = m[1], cuerpo = m[2];
    const fam = (cuerpo.match(/font-family: '([^']+)'/) || [])[1];
    const uuid = (cuerpo.match(/url\("([^"]+)"\)/) || [])[1];
    if (uuid && fam) fuentes[uuid.slice(0, 8)] = (fam + '-' + subconjunto).toLowerCase();
  }

  const mapa = {};   // uuid completo -> nombre de archivo final
  const filas = [];

  for (const [uuid, v] of Object.entries(manifest)) {
    const corto = uuid.slice(0, 8);
    const ext = EXT[v.mime];
    if (!ext) continue;                    // saltamos los .js del motor de Claude Design

    const esFuente = v.mime === 'font/woff2';
    const nombre = esFuente ? fuentes[corto] : NOMBRES[corto];
    if (!nombre) { console.warn('  (aviso) sin nombre asignado:', corto, v.mime); continue; }

    const archivo = nombre + '.' + ext;
    const destino = path.join(esFuente ? DEST_FONT : DEST_IMG, archivo);
    const bytes = Buffer.from(v.data, 'base64');

    if (fs.existsSync(destino)) {
      filas.push({ archivo, bytes: fs.statSync(destino).size, estado: 'ya existia' });
    } else {
      fs.writeFileSync(destino, bytes);
      filas.push({ archivo, bytes: bytes.length, estado: 'extraido' });
    }
    mapa[uuid] = (esFuente ? 'fonts/' : 'img/') + archivo;
  }

  fs.writeFileSync(path.join(DEST_META, 'mapa-uuid.json'), JSON.stringify(mapa, null, 2));

  filas.sort((a, b) => b.bytes - a.bytes);
  console.log('\n  Originales en assets/originales/\n');
  for (const f of filas) {
    console.log('  ' + String((f.bytes / 1024).toFixed(0)).padStart(7) + ' KB  ' +
                f.archivo.padEnd(26) + f.estado);
  }
  const total = filas.reduce((s, f) => s + f.bytes, 0);
  console.log('\n  ' + filas.length + ' archivos, ' + (total / 1048576).toFixed(2) + ' MB en total\n');
}

main();
