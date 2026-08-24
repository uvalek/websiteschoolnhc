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
