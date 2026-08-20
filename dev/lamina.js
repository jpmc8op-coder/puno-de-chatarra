/* ---------- LAMINA DE DISEÑOS ----------
   Con "?lamina" en la URL, el juego no arranca: dibuja hojas de contacto con
   TODO lo que se ha diseñado —los aparatos sector a sector, los ocho jefes a
   tamaño grande y el personaje con sus relevos, su mecanizacion y sus guantes—
   y las manda al servidor de desarrollo para dejarlas como PNG en "_lamina/".

   Reutiliza las funciones de dibujo del juego, no copias: si mañana cambia un
   diseño, la lamina cambia con el.                                            */
(() => {
  const FONDO = "#150f33", TINTA = "#efe9ff", TENUE = "#9d92c7";
  const TIPO  = '"Trebuchet MS", "Segoe UI", sans-serif';

  function hoja(w, h){
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.fillStyle = FONDO; g.fillRect(0,0,w,h);
    // trama sutil: un fondo plano se lee como un error de exportacion
    g.globalAlpha = .05; g.fillStyle = "#ffffff";
    for(let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    g.globalAlpha = 1;
    return { c, g };
  }

  function titulo(g, x, y, t, sub, col){
    g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillStyle = col || TINTA;
    g.font = "900 34px " + TIPO;
    g.fillText(t, x, y);
    const an = g.measureText(t).width;        // medir ANTES de cambiar de tipo
    if(sub){
      g.fillStyle = TENUE; g.font = "italic 17px " + TIPO;
      g.fillText(sub, x + an + 20, y - 1);
    }
  }

  function pie(g, x, y, w, t, col){
    g.textAlign = "center"; g.textBaseline = "top";
    g.fillStyle = col || TENUE;
    g.font = "600 13px " + TIPO;
    // Hasta dos lineas: cortar el nombre suele tirar justo la palabra que dice
    // que es la cosa ("Climatizador de bloq...").
    const pal = t.split(" "), lin = [];
    let ln = "";
    pal.forEach(p => {
      if(ln && g.measureText(ln + " " + p).width > w){ lin.push(ln); ln = p; }
      else ln = ln ? ln + " " + p : p;
    });
    lin.push(ln);
    lin.slice(0, 2).forEach((l, i) => g.fillText(l, x + w/2, y + i*16));
  }

  // ---- un aparato, tal cual lo pinta el juego ----
  const L = 220*SS;
  function aparato(d, P, jefe, lvl){
    if(jefe){ S.lvl = lvl; S.hp = maxHp(lvl); nuevaAmenaza(); }
    og.setTransform(SS,0,0,SS,0,0);
    og.clearRect(0,0,220,220);
    try{ (DIB[d] || DIB.tostadora)(og, P); }catch(e){ console.warn(d, e); }
    patina(og);
    if(jefe) amenaza(og, P);
    return OFF;
  }

  function marco(g, x, y, s, col){
    g.save();
    g.globalAlpha = .30; g.fillStyle = col;
    g.beginPath(); g.arc(x + s/2, y + s/2, s*0.44, 0, 6.2832); g.fill();
    g.globalAlpha = .12; g.fillStyle = "#000";
    g.beginPath(); g.ellipse(x + s/2, y + s*0.93, s*0.30, s*0.055, 0,0,6.2832); g.fill();
    g.restore();
  }

  /* ============ HOJA 1 · LOS APARATOS, SECTOR A SECTOR ============ */
  function hojaObjetos(){
    const COLS = ZONAS.reduce((a,z) => Math.max(a, z.aps.length), 0);
    const CEL = 132, GAP = 8, MX = 46, SANG = 16;    // sangria dentro de la banda
    const W = MX*2 + SANG*2 + COLS*(CEL+GAP) - GAP;
    const ALTO_Z = 52 + CEL + 40 + 26;
    const H = 132 + ZONAS.length*ALTO_Z + 40;
    const { c, g } = hoja(W, H);

    titulo(g, MX, 62, "PUÑO DE CHATARRA", "todo lo que hay que romper");
    g.fillStyle = TENUE; g.font = "15px " + TIPO; g.textAlign = "left";
    g.fillText(ZONAS.length + " sectores · " + ZONAS.reduce((a,z) => a + z.aps.length, 0) +
               " aparatos · " + ZONAS.length + " jefes", MX, 90);

    let y = 132;
    ZONAS.forEach((z, zi) => {
      // banda del sector, con su propio cielo
      const gr = g.createLinearGradient(MX, y, W - MX, y);
      gr.addColorStop(0, z.cielo[1]); gr.addColorStop(1, z.cielo[2]);
      g.fillStyle = gr; g.globalAlpha = .30;
      g.fillRect(MX, y, W - MX*2, ALTO_Z - 18);
      g.globalAlpha = 1;
      g.fillStyle = z.luz; g.fillRect(MX, y, 5, ALTO_Z - 18);

      g.textAlign = "left"; g.textBaseline = "alphabetic";
      const cab = "SECTOR " + (zi+1) + " · " + z.t;
      g.fillStyle = TINTA; g.font = "900 21px " + TIPO;
      g.fillText(cab, MX + 18, y + 32);
      const anc = g.measureText(cab).width;
      g.fillStyle = z.luz; g.font = "italic 14px " + TIPO;
      g.fillText(z.sub, MX + 18 + anc + 18, y + 32);

      z.aps.forEach((a, i) => {
        const x = MX + SANG + i*(CEL+GAP), yy = y + 52;
        marco(g, x, yy, CEL, z.luz);
        g.drawImage(aparato(a.d, z.c, false), 0,0,L,L, x, yy, CEL, CEL);
        pie(g, x, yy + CEL + 4, CEL, a.n);
      });
      y += ALTO_Z;
    });
    return { c, nombre: "1-objetos.png" };
  }

  /* ============ HOJA 2 · LOS JEFES ============ */
  function hojaJefes(){
    const COLS = 4, CEL = 330, GAP = 26, MX = 50;
    const W = MX*2 + COLS*(CEL+GAP) - GAP;
    const filas = Math.ceil((ZONAS.length + 1) / COLS);
    const H = 140 + filas*(CEL + 62) + 40;
    const { c, g } = hoja(W, H);

    titulo(g, MX, 66, "LOS JEFES", "uno al final de cada sector");
    g.fillStyle = TENUE; g.font = "15px " + TIPO; g.textAlign = "left";
    g.fillText("aguantan siete veces más y vienen armados: púas por detrás, forja al rojo, " +
               "cicatrices y ojos que te siguen", MX, 96);

    const lista = ZONAS.map((z, zi) => ({ n: z.jefe.n, d: z.jefe.d, P: z.c,
                                          luz: z.luz, lvl: (zi+1)*ZLARGO,
                                          sec: "SECTOR " + (zi+1) + " · " + z.t }));
    const zu = ZONAS[ZONAS.length-1];
    lista.push({ n: "EL ASIMILADO", d: "jAsimilado", P: zu.c, luz: "#ff3040",
                 lvl: 50, sec: "el héroe anterior, ya sin humanidad" });

    lista.forEach((j, i) => {
      const x = MX + (i % COLS)*(CEL+GAP);
      const y = 140 + Math.floor(i / COLS)*(CEL + 62);
      marco(g, x, y, CEL, j.luz);
      g.drawImage(aparato(j.d, j.P, true, j.lvl), 0,0,L,L, x, y, CEL, CEL);
      g.textAlign = "center"; g.textBaseline = "top";
      g.fillStyle = TINTA; g.font = "900 19px " + TIPO;
      g.fillText(j.n.toUpperCase(), x + CEL/2, y + CEL + 2);
      g.fillStyle = j.luz; g.font = "12px " + TIPO;
      g.fillText(j.sec, x + CEL/2, y + CEL + 26);
    });
    return { c, nombre: "2-jefes.png" };
  }

  /* ============ HOJA 3 · EL PERSONAJE ============ */
  // Se recorta a la silueta real: cada pose ocupa una caja distinta y dibujar el
  // lienzo entero dejaria al personaje diminuto dentro de su marco.
  function caja(){
    const d = hg.getImageData(0,0,HRO_LADO,HRO_LADO).data;
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for(let y = 0; y < HRO_LADO; y++) for(let x = 0; x < HRO_LADO; x++){
      if(d[(y*HRO_LADO + x)*4 + 3] > 12){
        if(x < x0) x0 = x;  if(x > x1) x1 = x;
        if(y < y0) y0 = y;  if(y > y1) y1 = y;
      }
    }
    return x1 < 0 ? null : { x0, y0, w: x1-x0+1, h: y1-y0+1 };
  }

  function pintaHeroe(g, x, y, alto, pose){
    hg.setTransform(1,0,0,1,0,0);
    hg.clearRect(0,0,HRO_LADO,HRO_LADO);
    hg.save(); hg.translate(HRO_OX, HRO_OY);
    heroe(hg, 0, 0, pose || POSES[0]);
    hg.restore();
    const b = caja(); if(!b) return 0;
    // contorno, como en el juego: es lo que lo separa del fondo
    hs.setTransform(1,0,0,1,0,0);
    hs.clearRect(0,0,HRO_LADO,HRO_LADO);
    hs.drawImage(HRO,0,0);
    hs.globalCompositeOperation = "source-in";
    hs.fillStyle = "#0d0925"; hs.fillRect(0,0,HRO_LADO,HRO_LADO);
    hs.globalCompositeOperation = "source-over";
    const e = alto / b.h, w = b.w*e;
    const dx = Math.round(x - w/2), dy = Math.round(y - alto);
    g.globalAlpha = .35; g.fillStyle = "#000";
    g.beginPath(); g.ellipse(x, y + 5, w*0.42, 9, 0,0,6.2832); g.fill();
    g.globalAlpha = 1;
    [[-2,0],[2,0],[0,-2],[0,2]].forEach(o =>
      g.drawImage(HSIL, b.x0,b.y0,b.w,b.h, dx+o[0], dy+o[1], w, alto));
    g.drawImage(HRO, b.x0,b.y0,b.w,b.h, dx, dy, w, alto);
    return w;
  }

  function vestir(niveles, implantes){
    FIST.forEach((f, i) => S.fist[f.id] = niveles[i]);
    S.crew = CREW.map((_, i) => i < implantes ? 1 : 0);
  }

  function parrafo(g, t, x, y, ancho, alto){
    const pal = t.split(" ");
    let ln = "", li = 0;
    pal.forEach(p => {
      if(g.measureText(ln + " " + p).width > ancho){ g.fillText(ln, x, y + li*alto); ln = p; li++; }
      else ln = ln ? ln + " " + p : p;
    });
    g.fillText(ln, x, y + li*alto);
  }

  function hojaPersonaje(){
    const MX = 50, W = 1520;
    const H = 150 + 430 + 470 + 300 + 40;
    const { c, g } = hoja(W, H);

    titulo(g, MX, 62, "EL PERSONAJE", "de espaldas, contra la chatarra");
    g.fillStyle = TENUE; g.font = "15px " + TIPO; g.textAlign = "left";
    g.fillText("cinco héroes se relevan; cada implante que compras te come un pedazo de humanidad",
               MX, 90);

    // --- 1. los cinco relevos ---
    let y = 150;
    g.fillStyle = TINTA; g.font = "900 20px " + TIPO; g.textAlign = "left";
    g.fillText("LOS RELEVOS", MX, y + 6);
    g.fillStyle = TENUE; g.font = "13px " + TIPO;
    g.fillText("cuando uno cae, el siguiente entra al vertedero", MX + 176, y + 6);

    const paso = (W - MX*2) / HEROES.length;
    HEROES.forEach((h, i) => {
      vestir([9, 4, 3, 3, 2], 0);            // equipado, pero entero
      S.heroe = i;
      const x = MX + paso*(i + 0.5), base = y + 320;
      pintaHeroe(g, x, base, 268);
      g.textAlign = "center"; g.textBaseline = "top";
      g.fillStyle = h.trajeL; g.font = "900 20px " + TIPO;
      g.fillText(h.n, x, base + 14);
      g.fillStyle = TENUE; g.font = "italic 12px " + TIPO;
      parrafo(g, h.ep, x, base + 40, paso - 40, 15);
    });

    // --- 2. la mecanizacion ---
    y += 430;
    g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillStyle = TINTA; g.font = "900 20px " + TIPO;
    g.fillText("LO QUE CUESTA LA FUERZA", MX, y + 6);
    g.fillStyle = TENUE; g.font = "13px " + TIPO;
    g.fillText("mismo héroe, un implante más cada vez: la carne se apaga y el acero gana",
               MX + 274, y + 6);

    S.heroe = 0;
    const TR = [0, 2, 4, 6, 9];
    const pasoM = (W - MX*2) / TR.length;
    TR.forEach((n, i) => {
      vestir([9 + n*2, 4, 3, 3, 2], n);
      const x = MX + pasoM*(i + 0.5), base = y + 350;
      pintaHeroe(g, x, base, 296);
      const hum = humanidad();
      g.textAlign = "center"; g.textBaseline = "top";
      g.fillStyle = hum > 60 ? "#a6ff4d" : hum > 25 ? "#ffd166" : "#ff3040";
      g.font = "900 26px " + TIPO;
      g.fillText(hum + "%", x, base + 12);
      g.fillStyle = TENUE; g.font = "12px " + TIPO;
      g.fillText(n === 0 ? "sin implantes" : n + " implante" + (n > 1 ? "s" : ""), x, base + 44);
    });

    // --- 3. los guantes ---
    y += 470;
    g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillStyle = TINTA; g.font = "900 20px " + TIPO;
    g.fillText("EL PUÑO, TRAMO A TRAMO", MX, y + 6);
    g.fillStyle = TENUE; g.font = "13px " + TIPO;
    g.fillText("se empieza con las manos desnudas", MX + 266, y + 6);

    const tramos = FIST[0].tramos, pasoG = (W - MX*2) / tramos.length;
    tramos.forEach((t, i) => {
      const x = MX + pasoG*(i + 0.5), cy = y + 130, r = 66;
      g.save();
      g.globalAlpha = .22; g.fillStyle = GUANTE_L[i];
      g.beginPath(); g.arc(x, cy, r*1.15, 0, 6.2832); g.fill();
      g.restore();
      guante(g, x, cy, r, i, 1, 0, 0, 1, undefined, 0, 3.2);
      g.textAlign = "center"; g.textBaseline = "top";
      g.fillStyle = TINTA; g.font = "700 14px " + TIPO;
      g.fillText(t[1], x, cy + r + 22);
      g.fillStyle = TENUE; g.font = "12px " + TIPO;
      g.fillText(i === 0 ? "de salida" : "nivel " + t[0], x, cy + r + 42);
    });

    return { c, nombre: "3-personaje.png" };
  }

  /* ---------- salida ---------- */
  function guardar(h){
    return new Promise(res => h.c.toBlob(b => {
      fetch("guardar/" + h.nombre, { method: "POST", body: b })
        .then(r => r.text()).then(t => res(h.nombre + ": " + t))
        .catch(e => res(h.nombre + ": SIN SERVIDOR (" + e.message + ")"));
    }, "image/png"));
  }

  const hojas = [hojaObjetos(), hojaJefes(), hojaPersonaje()];

  /* Se ven tambien en pantalla, por si el guardado no llega. Se OCULTA la
     interfaz del juego en vez de borrarla: al vaciar el body, el ResizeObserver
     que vigila #arena se despertaba con el elemento ya muerto y reventaba. */
  const caja0 = document.createElement("div");
  Array.from(document.body.children).forEach(el => { el.style.display = "none"; });
  document.body.appendChild(caja0);
  document.body.style.cssText = "background:#0d0925;margin:0;padding:24px;overflow:auto";
  hojas.forEach(h => {
    h.c.style.cssText = "display:block;width:100%;max-width:1520px;margin:0 auto 28px;" +
                        "border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.6)";
    caja0.appendChild(h.c);
  });

  window.LAMINAS = hojas;
  window.laminaLista = Promise.all(hojas.map(guardar));
  window.laminaLista.then(r => { window.LAMINA_RES = r; console.log(r.join("\n")); });
})();
