/*
 * Colegio Niños Héroes de Chapultepec
 * Comportamiento de la página: carrusel del hero, menú de celular y
 * testimonios. Nada más. Sin librerías ni dependencias.
 *
 * Lo único que normalmente vas a querer editar está aquí arriba.
 */

// ---------------------------------------------------------------------------
// TESTIMONIOS
// Cambia estos tres por los reales. Si quieres más o menos de tres, agrega o
// quita bloques: el contador y las flechas se ajustan solos.
// ---------------------------------------------------------------------------
var TESTIMONIOS = [
  { texto: '[Testimonio de padre de familia — pendiente]', nombre: '[Nombre — pendiente]' },
  { texto: '[Testimonio de padre de familia — pendiente]', nombre: '[Nombre — pendiente]' },
  { texto: '[Testimonio de padre de familia — pendiente]', nombre: '[Nombre — pendiente]' }
];

// Ponlo en false para esconder toda la sección de testimonios
// (por ejemplo mientras el colegio te pasa los textos reales).
var MOSTRAR_TESTIMONIOS = true;

// Cada cuántos segundos cambia la foto grande de arriba.
var SEGUNDOS_POR_FOTO = 5;

// ---------------------------------------------------------------------------
// De aquí para abajo normalmente no hace falta tocar nada.
// ---------------------------------------------------------------------------
(function () {
  'use strict';

  /* ---------------------------- Carrusel del hero ------------------------- */
  var diapositivas = document.querySelectorAll('[data-slide]');
  var puntos = document.querySelectorAll('[data-punto]');
  var actual = 0;
  var reloj = null;
  var alPintarFoto = null;   // lo define el módulo de contraste, más abajo

  function mostrarFoto(i) {
    actual = (i + diapositivas.length) % diapositivas.length;
    for (var d = 0; d < diapositivas.length; d++) {
      var activa = d === actual;
      diapositivas[d].style.opacity = activa ? '1' : '0';
      diapositivas[d].style.pointerEvents = activa ? 'auto' : 'none';
    }
    for (var p = 0; p < puntos.length; p++) {
      var seleccionado = p === actual;
      puntos[p].style.background = seleccionado ? '#2f557f' : '#c4cfdc';
      puntos[p].setAttribute('aria-current', seleccionado ? 'true' : 'false');
    }
    if (alPintarFoto) alPintarFoto();
  }

  function arrancar() {
    detener();
    if (diapositivas.length > 1) {
      reloj = setInterval(function () { mostrarFoto(actual + 1); }, SEGUNDOS_POR_FOTO * 1000);
    }
  }
  function detener() { if (reloj) { clearInterval(reloj); reloj = null; } }

  for (var i = 0; i < puntos.length; i++) {
    (function (indice, boton) {
      boton.addEventListener('click', function () { mostrarFoto(indice); arrancar(); });
    })(i, puntos[i]);
  }

  // Se pausa al pasar el mouse por encima, al navegar con teclado y cuando la
  // pestaña queda en segundo plano.
  var zonas = document.querySelectorAll('[data-carrusel-pausa]');
  for (var z = 0; z < zonas.length; z++) {
    zonas[z].addEventListener('mouseenter', detener);
    zonas[z].addEventListener('mouseleave', arrancar);
    zonas[z].addEventListener('focusin', detener);
    zonas[z].addEventListener('focusout', arrancar);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { detener(); } else { arrancar(); }
  });

  // Si la persona pidió en su sistema "menos animaciones", no se mueve solo.
  var quietud = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (diapositivas.length) {
    mostrarFoto(0);
    if (!(quietud && quietud.matches)) arrancar();
  }

  /* ------------------------------ Menú de celular ------------------------- */
  var botonMenu = document.querySelector('[data-accion="menu"]');
  var menu = document.getElementById('menu-movil');

  function abrirCerrarMenu(abrir) {
    if (!menu || !botonMenu) return;
    menu.hidden = !abrir;
    botonMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }

  if (botonMenu && menu) {
    botonMenu.setAttribute('aria-controls', 'menu-movil');
    abrirCerrarMenu(false);
    botonMenu.addEventListener('click', function () { abrirCerrarMenu(menu.hidden); });

    var enlaces = menu.querySelectorAll('[data-accion="cerrar-menu"], a');
    for (var e = 0; e < enlaces.length; e++) {
      enlaces[e].addEventListener('click', function () { abrirCerrarMenu(false); });
    }
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !menu.hidden) { abrirCerrarMenu(false); botonMenu.focus(); }
    });
  }

  /* --------------- Contraste del texto del hero sobre las fotos ------------
     El título y el párrafo son azul oscuro, y las fotos que van pasando traen
     una mancha del MISMO azul detrás: donde se encima, el texto no se lee.

     Aquí se pinta de blanco SOLO los pixeles del texto que quedan sobre una
     zona oscura. El recorte lo da una máscara generada de cada foto
     (assets/img/hero-N-mascara.webp), así que el borde sigue la silueta real:
     si parte una letra a la mitad, media letra queda blanca y media azul.

     La máscara se alinea con la foto midiéndola en pantalla, por eso funciona
     en cualquier ancho y se recalcula al cambiar el tamaño de la ventana. */
  var textos = [].slice.call(document.querySelectorAll('.contraste-hero'));
  var soportaRecorte = window.CSS && CSS.supports &&
    (CSS.supports('-webkit-background-clip', 'text') || CSS.supports('background-clip', 'text'));

  if (textos.length && diapositivas.length && soportaRecorte) {
    // Se guarda el color original de cada texto: es la capa de abajo.
    textos.forEach(function (el) {
      el.dataset.colorBase = getComputedStyle(el).color;
    });

    // Dónde queda pintada de verdad la foto dentro de su <img>.
    // Las fotos usan object-fit:contain y object-position:bottom center, así
    // que el dibujo no llena la caja: queda centrado y pegado abajo.
    function zonaPintada(img) {
      var r = img.getBoundingClientRect();
      // Las medidas salen de los atributos width/height del HTML, no de
      // naturalWidth: así el cálculo funciona aunque la foto todavía no se
      // haya terminado de descargar.
      var anN = parseFloat(img.getAttribute('width')) || img.naturalWidth;
      var alN = parseFloat(img.getAttribute('height')) || img.naturalHeight;
      if (!anN || !alN || !r.width || !r.height) return null;
      var escala = Math.min(r.width / anN, r.height / alN);   // object-fit: contain
      var an = anN * escala, al = alN * escala;
      // object-position: bottom center
      return { x: r.left + (r.width - an) / 2, y: r.top + (r.height - al), an: an, al: al };
    }

    function pintarContraste() {
      var img = diapositivas[actual] && diapositivas[actual].querySelector('img');
      var z = img ? zonaPintada(img) : null;
      var mascara = img ? img.currentSrc || img.src : '';
      mascara = mascara.replace(/hero-(\d)(-900)?\.webp.*$/, 'hero-$1-mascara.webp');

      textos.forEach(function (el) {
        var base = el.dataset.colorBase;
        var fondoLiso = 'linear-gradient(' + base + ',' + base + ')';
        var r = el.getBoundingClientRect();
        // ¿La foto llega a tocar este texto? En celular no lo toca, y así
        // además el navegador ni siquiera descarga la máscara.
        var toca = z && z.x < r.right && z.x + z.an > r.left &&
                        z.y < r.bottom && z.y + z.al > r.top;
        if (!toca) {
          el.classList.remove('contraste-activo');
          el.style.backgroundImage = '';
          return;
        }
        precargarMascaras();
        el.style.backgroundImage = 'url("' + mascara + '"), ' + fondoLiso;
        el.style.backgroundSize = z.an + 'px ' + z.al + 'px, auto';
        el.style.backgroundPosition = (z.x - r.left) + 'px ' + (z.y - r.top) + 'px, 0 0';
        el.classList.add('contraste-activo');
      });
    }

    // Se descargan las tres máscaras en cuanto se sabe que el efecto aplica.
    // Si no, al cambiar de foto el texto se vería un instante en azul sobre la
    // mancha azul, hasta que llegara la máscara nueva.
    var precargadas = false;
    function precargarMascaras() {
      if (precargadas) return;
      precargadas = true;
      diapositivas.forEach(function (d) {
        var im = d.querySelector('img');
        if (!im) return;
        var url = (im.currentSrc || im.src).replace(/hero-(\d)(-900)?\.webp.*$/, 'hero-$1-mascara.webp');
        if (url.indexOf('mascara') !== -1) new Image().src = url;
      });
    }

    alPintarFoto = pintarContraste;

    var reloj2 = null;
    addEventListener('resize', function () {
      clearTimeout(reloj2);
      reloj2 = setTimeout(pintarContraste, 120);
    });
    diapositivas.forEach(function (d) {
      var img = d.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', pintarContraste);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { requestAnimationFrame(pintarContraste); });
    }
    addEventListener('load', pintarContraste);
    pintarContraste();
  }

  /* ------------------------------- Testimonios ---------------------------- */
  var cajaTexto = document.querySelector('[data-test-texto]');
  var cajaNombre = document.querySelector('[data-test-nombre]');
  var contador = document.querySelector('[data-test-contador]');
  var seccionTest = cajaTexto && cajaTexto.closest('section');
  var testActual = 0;

  if (seccionTest && !MOSTRAR_TESTIMONIOS) {
    seccionTest.hidden = true;
  } else if (cajaTexto && TESTIMONIOS.length) {
    var pintarTestimonio = function (i) {
      testActual = (i + TESTIMONIOS.length) % TESTIMONIOS.length;
      cajaTexto.textContent = TESTIMONIOS[testActual].texto;
      if (cajaNombre) cajaNombre.textContent = TESTIMONIOS[testActual].nombre;
      if (contador) contador.textContent = (testActual + 1) + ' / ' + TESTIMONIOS.length;
    };
    var anterior = document.querySelector('[data-accion="test-anterior"]');
    var siguiente = document.querySelector('[data-accion="test-siguiente"]');
    if (anterior) anterior.addEventListener('click', function () { pintarTestimonio(testActual - 1); });
    if (siguiente) siguiente.addEventListener('click', function () { pintarTestimonio(testActual + 1); });
    pintarTestimonio(0);
  }
})();
