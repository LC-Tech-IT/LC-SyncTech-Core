/* =====================================================================
   LC SYNCTECH · canvas-sync.js
   "Red de Sincronización Telemetría & Circuitos"

   - Nodos dispuestos en una rejilla con variación controlada, unidos por
     pistas de circuito ortogonales + 45° (estilo PCB).
   - Paquetes de datos que recorren las pistas y se encadenan de nodo en
     nodo, simulando flujos de telemetría.
   - Vida autónoma 24/7: las pistas mantienen una opacidad base permanente
     (0.18–0.28) que respira en ondas lentas, y los paquetes circulan sin
     depender del mouse. La red nunca se apaga ni queda en negro.
   - Escritorio: el cursor actúa como amplificador local (receptor GPS que
     triangula con los nodos cercanos). Si el cursor sale o no existe, un
     receptor en piloto automático sigue recorriendo la red.
   - Móvil: el desplazamiento (scroll) mueve un receptor virtual y aplica
     paralaje a la red.
   - Rendimiento: Vanilla JS, sin dependencias, trazos agrupados por
     intensidad, pausa automática fuera de pantalla y con la pestaña oculta.
   ===================================================================== */
(() => {
  'use strict';

  const lienzo = document.getElementById('lienzo-sync');
  if (!lienzo || !lienzo.getContext) return;

  const ctx = lienzo.getContext('2d', { alpha: false });
  const hero = lienzo.parentElement;
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const punteroFino = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Configuración ---------- */
  const CFG = {
    celdaEscritorio: 118,     // separación media entre nodos (px CSS)
    celdaMovil: 92,
    huecos: 0.28,             // proporción de celdas vacías
    vecinos: 2,               // conexiones por nodo
    radioCursor: 240,         // alcance de influencia del receptor
    paquetesMax: 34,
    velocidadPaquete: [70, 150], // px por segundo
    // Paleta Warm Titanium Gold: champán #C5A059 y luz #D4BC96
    oro: [197, 160, 89],
    oroClaro: [212, 188, 150],
    fondo: '#0D0F14',
    baseMin: 0.18,             // opacidad mínima permanente de las pistas
    baseMax: 0.28,             // techo de la respiración autónoma
    atenuacion: 1
  };

  /* ---------- Estado ---------- */
  let ancho = 0, alto = 0, dpr = 1;
  let nodos = [];
  let enlaces = [];
  let paquetes = [];
  let activo = false;
  let raf = 0;
  let tAnterior = 0;
  let tiempo = 0;
  let scrollY = window.scrollY;

  // manual = el cursor real está sobre el hero; si no, piloto automático
  const receptor = { x: -9999, y: -9999, ox: -9999, oy: -9999, manual: false, fuerza: 0 };

  // Exposición de métricas para la lectura del hero
  window.LCSync = { nodos: 0, enlaces: 0, paquetes: 0 };

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${(a * CFG.atenuacion).toFixed(3)})`;
  const azar = (min, max) => min + Math.random() * (max - min);

  /* ---------- Construcción de la red ---------- */
  function construir() {
    const rect = hero.getBoundingClientRect();
    ancho = Math.max(1, Math.round(rect.width));
    alto = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const celda = ancho < 720 ? CFG.celdaMovil : CFG.celdaEscritorio;
    const cols = Math.ceil(ancho / celda) + 1;
    const filas = Math.ceil((alto + 200) / celda) + 1; // margen extra para el paralaje

    nodos = [];
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < CFG.huecos) continue;
        // Posición base ajustada a una sub-rejilla de 6 px: aspecto de placa de circuito
        const bx = Math.round((c * celda + azar(-0.32, 0.32) * celda) / 6) * 6;
        const by = Math.round((f * celda + azar(-0.32, 0.32) * celda - 100) / 6) * 6;
        nodos.push({
          bx, by, x: bx, y: by,
          amp: azar(1.5, 5),             // amplitud de deriva
          fx: azar(0.12, 0.32),          // frecuencias de deriva (Hz)
          fy: azar(0.1, 0.28),
          fase: azar(0, Math.PI * 2),
          gps: Math.random() < 0.09,     // nodo de posicionamiento destacado
          pulso: 0,                      // destello al recibir un paquete
          influencia: 0,
          adj: []
        });
      }
    }

    // Enlaces: cada nodo con sus vecinos más cercanos (sin duplicados)
    enlaces = [];
    const maxDist = celda * 1.7;
    const vistos = new Set();
    for (let i = 0; i < nodos.length; i++) {
      const a = nodos[i];
      const candidatos = [];
      for (let j = 0; j < nodos.length; j++) {
        if (i === j) continue;
        const b = nodos[j];
        const d = Math.hypot(b.bx - a.bx, b.by - a.by);
        if (d < maxDist) candidatos.push([d, j]);
      }
      candidatos.sort((p, q) => p[0] - q[0]);
      for (let k = 0; k < Math.min(CFG.vecinos, candidatos.length); k++) {
        const j = candidatos[k][1];
        const clave = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        const idx = enlaces.length;
        enlaces.push({ a: i, b: j, cx: 0, cy: 0, l1: 0, l2: 0, brillo: 0, fase: azar(0, Math.PI * 2) });
        a.adj.push(idx);
        nodos[j].adj.push(idx);
      }
    }

    paquetes = [];
    window.LCSync.nodos = nodos.length;
    window.LCSync.enlaces = enlaces.length;
  }

  /* ---------- Geometría de pista: tramo recto + tramo a 45° ---------- */
  function geometria(e) {
    const A = nodos[e.a], B = nodos[e.b];
    const dx = B.x - A.x, dy = B.y - A.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx > ady) {
      e.cx = B.x - Math.sign(dx) * ady;
      e.cy = A.y;
    } else {
      e.cx = A.x;
      e.cy = B.y - Math.sign(dy) * adx;
    }
    e.l1 = Math.hypot(e.cx - A.x, e.cy - A.y);
    e.l2 = Math.hypot(B.x - e.cx, B.y - e.cy);
  }

  // Punto a una distancia s sobre la pista (sentido A→B o B→A)
  function puntoEn(e, s, inverso) {
    const A = nodos[e.a], B = nodos[e.b];
    const total = e.l1 + e.l2;
    let d = inverso ? total - s : s;
    d = Math.max(0, Math.min(total, d));
    if (d <= e.l1) {
      const t = e.l1 ? d / e.l1 : 0;
      return [A.x + (e.cx - A.x) * t, A.y + (e.cy - A.y) * t];
    }
    const t = e.l2 ? (d - e.l1) / e.l2 : 0;
    return [e.cx + (B.x - e.cx) * t, e.cy + (B.y - e.cy) * t];
  }

  /* ---------- Paquetes de datos ---------- */
  function lanzarPaquete(desdeEnlace, desdeNodo) {
    if (!enlaces.length) return;
    let idx = desdeEnlace;
    if (idx === undefined) {
      // Preferir enlaces cercanos al receptor para que la red "responda"
      idx = (Math.random() * enlaces.length) | 0;
      if (Math.random() < 0.55) {
        for (let n = 0; n < 6; n++) {
          const k = (Math.random() * enlaces.length) | 0;
          if (nodos[enlaces[k].a].influencia > 0.2) { idx = k; break; }
        }
      }
    }
    const e = enlaces[idx];
    const inverso = desdeNodo !== undefined ? e.b === desdeNodo : Math.random() < 0.5;
    paquetes.push({
      e: idx,
      s: 0,
      inverso,
      v: azar(CFG.velocidadPaquete[0], CFG.velocidadPaquete[1]),
      saltos: (Math.random() * 4) | 0 // encadenamientos restantes
    });
  }

  /* ---------- Actualización ---------- */
  function actualizar(dt) {
    tiempo += dt;

    // Receptor: cursor real cuando está sobre el hero; en cualquier otro caso
    // (móvil, cursor fuera o ausente) recorre una trayectoria de Lissajous
    // ligada al tiempo y al scroll. Nunca se desactiva.
    if (!receptor.manual) {
      const fase = scrollY * 0.0035;
      receptor.ox = ancho * (0.5 + 0.34 * Math.sin(tiempo * 0.23 + fase));
      receptor.oy = alto * (0.42 + 0.22 * Math.sin(tiempo * 0.31 + fase * 1.6));
    }
    // Suavizado exponencial independiente de la tasa de refresco
    const k = 1 - Math.pow(0.0015, dt);
    if (receptor.x < -9000) { receptor.x = receptor.ox; receptor.y = receptor.oy; }
    receptor.x += (receptor.ox - receptor.x) * k;
    receptor.y += (receptor.oy - receptor.y) * k;
    // Con cursor: amplificación plena; en piloto automático: presencia suave
    receptor.fuerza += ((receptor.manual ? 1 : 0.55) - receptor.fuerza) * k;

    const paralaje = punteroFino ? 0 : -Math.min(scrollY, alto) * 0.18;
    const R = CFG.radioCursor;

    for (let i = 0; i < nodos.length; i++) {
      const n = nodos[i];
      // Deriva sinusoidal: cadencia matemática suave
      let x = n.bx + Math.sin(tiempo * n.fx * 6.283 + n.fase) * n.amp;
      let y = n.by + Math.cos(tiempo * n.fy * 6.283 + n.fase) * n.amp + paralaje;

      const dx = receptor.x - x, dy = receptor.y - y;
      const d = Math.hypot(dx, dy);
      const inf = d < R ? (1 - d / R) * receptor.fuerza : 0;
      n.influencia = inf;
      // Atracción leve hacia el receptor
      if (inf > 0) {
        x += dx * inf * 0.07;
        y += dy * inf * 0.07;
      }
      n.x = x;
      n.y = y;
      if (n.pulso > 0) n.pulso = Math.max(0, n.pulso - dt * 1.6);
    }

    for (let i = 0; i < enlaces.length; i++) {
      const e = enlaces[i];
      geometria(e);
      if (e.brillo > 0) e.brillo = Math.max(0, e.brillo - dt * 1.2);
    }

    // Avance de paquetes
    for (let i = paquetes.length - 1; i >= 0; i--) {
      const p = paquetes[i];
      const e = enlaces[p.e];
      p.s += p.v * dt;
      e.brillo = Math.min(1, e.brillo + dt * 4);
      if (p.s >= e.l1 + e.l2) {
        const destino = p.inverso ? e.a : e.b;
        nodos[destino].pulso = 1;
        paquetes.splice(i, 1);
        // Encadenar hacia otro enlace del nodo destino
        if (p.saltos > 0) {
          const opciones = nodos[destino].adj.filter((x) => x !== p.e);
          if (opciones.length) {
            const sig = opciones[(Math.random() * opciones.length) | 0];
            lanzarPaquete(sig, destino);
            paquetes[paquetes.length - 1].saltos = p.saltos - 1;
          }
        }
      }
    }

    const objetivo = Math.round(CFG.paquetesMax * (ancho < 720 ? 0.55 : 1));
    // Flujo continuo: se repone el tráfico siempre, haya o no interacción
    if (paquetes.length < objetivo && Math.random() < dt * 18) lanzarPaquete();

    window.LCSync.paquetes = paquetes.length;
  }

  /* ---------- Dibujo ---------- */
  // Cubetas de intensidad: un solo stroke() por nivel en lugar de uno por pista
  // El primer nivel es el piso permanente: ninguna pista baja de 0.18
  const NIVELES = [0.18, 0.21, 0.24, 0.28, 0.34, 0.42, 0.52, 0.64];
  const cubetas = NIVELES.map(() => []);

  function dibujar() {
    ctx.fillStyle = CFG.fondo;
    ctx.fillRect(0, 0, ancho, alto);

    // 1. Pistas de circuito
    for (let c = 0; c < cubetas.length; c++) cubetas[c].length = 0;
    for (let i = 0; i < enlaces.length; i++) {
      const e = enlaces[i];
      const A = nodos[e.a], B = nodos[e.b];
      if ((A.y < -40 && B.y < -40) || (A.y > alto + 40 && B.y > alto + 40)) continue;
      const inf = (A.influencia + B.influencia) * 0.5;
      // Respiración autónoma: onda lenta que recorre la placa en diagonal
      const onda = 0.5 + 0.5 * Math.sin(tiempo * 0.7 + (A.bx + A.by) * 0.004 + e.fase * 0.35);
      const base = CFG.baseMin + (CFG.baseMax - CFG.baseMin) * onda;
      // El cursor y los paquetes solo suman brillo sobre la base
      const alfa = Math.min(NIVELES[NIVELES.length - 1], base + inf * 0.36 + e.brillo * 0.16);
      let nivel = 0;
      while (nivel < NIVELES.length - 1 && NIVELES[nivel + 1] <= alfa) nivel++;
      cubetas[nivel].push(e);
    }
    ctx.lineWidth = 1;
    ctx.lineJoin = 'miter';
    for (let c = 0; c < cubetas.length; c++) {
      const lista = cubetas[c];
      if (!lista.length) continue;
      ctx.beginPath();
      for (let i = 0; i < lista.length; i++) {
        const e = lista[i];
        const A = nodos[e.a], B = nodos[e.b];
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(e.cx, e.cy);
        ctx.lineTo(B.x, B.y);
      }
      ctx.strokeStyle = rgba(CFG.oro, NIVELES[c]);
      ctx.stroke();
    }

    // 2. Paquetes de datos con estela
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < paquetes.length; i++) {
      const p = paquetes[i];
      const e = enlaces[p.e];
      const [hx, hy] = puntoEn(e, p.s, p.inverso);
      const [tx, ty] = puntoEn(e, p.s - 22, p.inverso);
      const [mx, my] = puntoEn(e, p.s - 11, p.inverso);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(mx, my);
      ctx.strokeStyle = rgba(CFG.oro, 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = rgba(CFG.oroClaro, 0.75);
      ctx.stroke();
      ctx.fillStyle = rgba(CFG.oroClaro, 0.95);
      ctx.fillRect(hx - 1.25, hy - 1.25, 2.5, 2.5);
    }
    ctx.lineCap = 'butt';

    // 3. Nodos (pads de circuito)
    for (let i = 0; i < nodos.length; i++) {
      const n = nodos[i];
      if (n.y < -20 || n.y > alto + 20) continue;
      const brillo = Math.min(1, 0.4 + n.influencia * 0.6 + n.pulso * 0.8);
      const t = n.gps ? 3 : 2;
      ctx.fillStyle = rgba(n.pulso > 0.4 ? CFG.oroClaro : CFG.oro, brillo);
      ctx.fillRect(n.x - t / 2, n.y - t / 2, t, t);

      if (n.gps) {
        // Anillo de posicionamiento con latido periódico
        const ciclo = (tiempo * 0.5 + n.fase) % 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 5 + ciclo * 14, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(CFG.oro, (1 - ciclo) * 0.28 * (0.5 + brillo));
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (n.pulso > 0) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3 + (1 - n.pulso) * 9, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(CFG.oroClaro, n.pulso * 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 4. Receptor GPS: triangulación con los tres nodos más cercanos + retícula
    if (receptor.fuerza > 0.02) {
      const cercanos = [];
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i];
        if (n.influencia > 0.35) cercanos.push(n);
      }
      cercanos.sort((a, b) => b.influencia - a.influencia);
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      for (let i = 0; i < Math.min(3, cercanos.length); i++) {
        const n = cercanos[i];
        ctx.beginPath();
        ctx.moveTo(receptor.x, receptor.y);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = rgba(CFG.oro, 0.35 * n.influencia * receptor.fuerza);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const a = 0.55 * receptor.fuerza;
      const r = 10;
      ctx.strokeStyle = rgba(CFG.oro, a);
      ctx.beginPath();
      // Escuadras de la retícula
      ctx.moveTo(receptor.x - r, receptor.y - r + 4); ctx.lineTo(receptor.x - r, receptor.y - r); ctx.lineTo(receptor.x - r + 4, receptor.y - r);
      ctx.moveTo(receptor.x + r - 4, receptor.y - r); ctx.lineTo(receptor.x + r, receptor.y - r); ctx.lineTo(receptor.x + r, receptor.y - r + 4);
      ctx.moveTo(receptor.x + r, receptor.y + r - 4); ctx.lineTo(receptor.x + r, receptor.y + r); ctx.lineTo(receptor.x + r - 4, receptor.y + r);
      ctx.moveTo(receptor.x - r + 4, receptor.y + r); ctx.lineTo(receptor.x - r, receptor.y + r); ctx.lineTo(receptor.x - r, receptor.y + r - 4);
      ctx.stroke();
      ctx.fillStyle = rgba(CFG.oroClaro, a);
      ctx.fillRect(receptor.x - 1, receptor.y - 1, 2, 2);

      // Etiqueta de enlace junto a la retícula (solo escritorio)
      if (punteroFino && receptor.manual) {
        ctx.font = '500 10px Inter, Arial, sans-serif';
        ctx.fillStyle = rgba(CFG.oro, 0.6 * receptor.fuerza);
        ctx.fillText(`SYNC · ${Math.min(3, cercanos.length)} NODOS ENLAZADOS`, receptor.x + 16, receptor.y + 4);
      }
    }
  }

  /* ---------- Bucle principal ---------- */
  function cuadro(ahora) {
    const dt = Math.min(0.05, (ahora - tAnterior) / 1000 || 0.016);
    tAnterior = ahora;
    actualizar(dt);
    dibujar();
    if (activo) raf = requestAnimationFrame(cuadro);
  }

  function iniciar() {
    if (activo || reducirMovimiento) return;
    activo = true;
    tAnterior = performance.now();
    raf = requestAnimationFrame(cuadro);
  }

  function detener() {
    activo = false;
    cancelAnimationFrame(raf);
  }

  /* ---------- Eventos ---------- */
  if (punteroFino) {
    hero.addEventListener('pointermove', (e) => {
      const r = lienzo.getBoundingClientRect();
      receptor.ox = e.clientX - r.left;
      receptor.oy = e.clientY - r.top;
      receptor.manual = true;
    }, { passive: true });
    // Al salir el cursor la red NO se apaga: el receptor vuelve al piloto automático
    hero.addEventListener('pointerleave', () => { receptor.manual = false; });
  }

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // Reconstrucción con antirrebote; se ignoran los cambios mínimos de alto
  // que provoca la barra de direcciones de los navegadores móviles.
  let temporizador = 0;
  let anchoPrevio = 0, altoPrevio = 0;
  window.addEventListener('resize', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      const r = hero.getBoundingClientRect();
      if (Math.abs(r.width - anchoPrevio) < 1 && Math.abs(r.height - altoPrevio) < 120) return;
      anchoPrevio = r.width; altoPrevio = r.height;
      construir();
      if (!activo) { actualizar(0.016); dibujar(); }
    }, 160);
  });

  // Pausar cuando el hero sale de pantalla o la pestaña se oculta
  let heroVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      heroVisible = en.isIntersecting;
      if (heroVisible && !document.hidden) iniciar(); else detener();
    }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) detener(); else if (heroVisible) iniciar();
  });

  /* ---------- Arranque ---------- */
  construir();
  const r0 = hero.getBoundingClientRect();
  anchoPrevio = r0.width; altoPrevio = r0.height;

  if (reducirMovimiento) {
    // Cuadro estático: la red se muestra sin animación
    for (let i = 0; i < 40; i++) actualizar(0.016);
    dibujar();
  } else {
    iniciar();
  }
})();
