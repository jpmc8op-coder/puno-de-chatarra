# Puño de Chatarra

Clicker / idle de demolición de basura electrónica, jugable en el navegador.

## Premisa

Guerra mundial contra la IA. La humanidad se mejoró genéticamente para ganarla y
quedó con una fuerza física brutal. Terminada la guerra, hay montañas de chatarra
electrónica y una profesión nueva: **reciclador de impacto**. Se destruye a puño
limpio. El jugador es uno de ellos.

El arco: para reciclar más rápido se implanta aumentos que le automatizan los
puños, y **cada implante le cuesta un pedazo de humanidad**. Ganó la guerra
contra las máquinas y ahora se está convirtiendo en una.

## Stack

- Un solo archivo: `index.html` (HTML + CSS + JavaScript vanilla).
- Render con Canvas 2D. **Todo se dibuja por código** con primitivas (`rr`, `ci`,
  `aro`, `ln`): aparatos, personaje, cuadrilla, horizonte. No hay imágenes.
- **Render a resolución completa** con `devicePixelRatio`. Se probó el pixel art
  por baja resolución y se descartó: no era pixel art, era un filtro — el dibujo
  vectorial se hacía en un lienzo diminuto que el CSS ampliaba, y al moverse los
  objetos cambiaban de muestreo cada fotograma (bordes que "hierven"), con la
  rotación del péndulo empeorándolo. Ver *Escala y nitidez*.
- Sonido sintetizado en tiempo real con WebAudio (ruido filtrado + osciladores).
- Persistencia en `localStorage`, clave `pdc_save`.
- Sin dependencias, sin build, sin servidor: se abre con doble clic.

## Cómo probarlo

Abrir `index.html` en cualquier navegador. Para el preview del agente hay un
`.claude/launch.json` que sirve la carpeta en el puerto 8790 con `python -m http.server`.

## Los 5 pilares del género y cómo se implementan aquí

| Pilar | Implementación |
|---|---|
| Acción manual | `golpear()` — click en el lienzo, daño + crítico + combo |
| Costos exponenciales | `costFist()` x1.16–3.0, `costCrew()` x1.15 (estándar del género) |
| Producción automática | `dps()` aplicado por frame en `frame()`, y en diferido con `offline()` |
| Muro + salto | Aparatos **jefe** cada 10 (`esJefe`): x7 vida, x12 recompensa, y presencia propia |
| Prestigio | `prestigio()` → núcleos de IA, +2% de daño y chatarra permanentes c/u |

## Curvas de balanceo

```
maxHp(n)  = ceil(10 * 1.155^(n-1)) * (jefe ? 7 : 1)
premio(n) = ceil(6  * 1.150^(n-1)) * (jefe ? 12 : 1)
```

La vida crece un poco más rápido que la recompensa (1.155 vs 1.150). Esa brecha
mínima es lo que obliga a comprar mejoras: sin ellas el avance se frena solo.

```
golpePuno = (1 + nivelPuño*2) * multGlobal
golpe     = golpePuno * comboMult * (crítico ? critMult : 1) * (demoledor ? 2.5 : 1)
            + apoyoCrew          <- SUMA PLANA, fuera de combo y crítico
apoyoCrew = dps * 0.05 * nivelSinergia
comboMult = 1 + min(combo, tope) * 0.04     tope = 25 + nivelRitmo*10
cores     = floor(12 * sqrt(chatarraDeLaCorrida / 1e7))
```

**Sinergia** existe para que el click no se vuelva irrelevante en late game. Ojo
con dónde entra: al principio se multiplicaba por combo y por crítico, y un solo
click llegaba a valer **33 segundos** de producción automática. Tiene que sumarse
al final, ya aplicados los multiplicadores.

### Ritmo activo frente a pasivo

La cifra que hay que vigilar es cuánto más rinde jugar clicando que dejar el
juego solo. Medido a 6 clicks/s con el combo al tope:

| Momento | activo / pasivo |
|---|---|
| inicio | 6.0x |
| temprano | 2.6x |
| medio | 2.0x |
| avanzado | 2.5x |

El rango sano del género es 2-6x: clicar acelera, pero no es obligatorio. Antes
de ajustar estaba en 50x / 12x / 6.5x / 34x, o sea que los implantes eran
decorativos mientras jugabas. Se corrigió con el cambio de la sinergia y
reforzando el daño de los primeros aumentos (x10 el primero, bajando hasta x1 en
los últimos), sin tocar los costos ni el ritmo general de la partida.

## Sectores

Cada 20 aparatos se cambia de sector. **Un sector no es un cambio de paleta: trae
sus propios aparatos, su propio jefe, su cielo y su horizonte**, y todo lo que
destruyes ahí corresponde al nombre del lugar.

| # | Sector | Qué se destruye | Jefe | Horizonte |
|---|---|---|---|---|
| 1 | Vertedero Norte | electrodomésticos futuristas de las torres residenciales | Compactadora centinela | montañas de chatarra y grúas |
| 2 | Cementerio de Drones | drones, rotores, cámaras, sabuesos, cabezas y núcleos de robot, alas, sensores ópticos | Dron nodriza | antenas con luces |
| 3 | Fosa de Servidores | racks, torres de datos, routers, discos, escudos, módulos de memoria, ventiladores | Servidor madre | bloques tipo rack |
| 4 | Acería Abandonada | exoesqueletos, prensas, motores, torsos, piernas, manos y mandíbulas | Titán de forja | chimeneas con humo |
| 5 | Chatarrero Orbital | **partes de nave**: fuselaje, motor iónico, cabina, ala, tren, escudo, parabólica, escotilla | Fragata desmembrada | restos clavados en el suelo |
| 6 | Arsenal Sellado | **partes de arma**: cañón de riel, torreta, lanzamisiles, batería, rifle gauss, munición, mira, escudo | Batería de asedio | torres de vigilancia |
| 7 | Cráter del Núcleo | satélites, reactores, androides, monolitos, ojos de vigilancia, columnas de datos | Núcleo primario | monolitos inclinados |

Son **59 dibujos de aparatos** (`DIB`) repartidos en `ZONAS[].aps` y `ZONAS[].jefe`, en
7 sectores: **140 niveles antes de que se repita un sector**.
Los del sector 1 son electrodomésticos **futuristas** (Sinte-tostador, Micro-fusor,
Holo-pantalla, Ciclo-lavadora, Cryo-nevera, Consola neural): formas limpias,
pantallas holográficas, franjas de neón y bases flotantes.

## La carga cuelga de un riel

Los aparatos **no flotan**: cuelgan de una cadena enganchada a un carro sobre un
riel de desguace, con gancho, eslabones alternados y sombra proyectada en el
suelo. Flotando se perdía la lectura de la escena y la coherencia de la ficción.

Va con física de péndulo real (`pend`, `pendV`): restauración proporcional al
ángulo, amortiguación, y **cada golpe la empuja** — más fuerte si es crítico o
demoledor, y el lado depende de con qué puño pegaste. Al aparecer una carga nueva
baja por la cadena (`spawn` reduce `largoCad`) con un empujón aleatorio.

Como la carga se mueve, `posObj()` da su posición real y **todo la usa**: el punto
al que llega el puño (`destPuno`), hacia dónde apuntan los brazos implantados, de
dónde salen las chispas y dónde aparecen los números.

## Cámara estilo Punch-Out

El aparato va centrado y de frente; el jugador se ve **de espaldas en primer plano
y translúcido** (`jugadorEspalda`), para no tapar al objetivo. Cada click alterna
de puño (`ladoPuno`) y el guante viaja hasta el aparato encogiéndose —la
perspectiva de alejarse de la cámara— y vuelve.

### Que se lea como visto desde atrás

Tres cosas hacían que los puños parecieran estar a la espalda en vez de delante:

- Estaban **a la altura de los hombros** y muy separados, lo que se lee como
  brazos abiertos en cruz. Ahora van **altos y juntos**, por delante de la cara,
  que es la guardia real de un boxeador.
- El antebrazo tenía **grosor constante**, así que parecía plano y paralelo al
  cuadro. Ahora se estrecha del hombro a la muñeca: un cilindro que se aleja de
  la cámara.
- No había nada que dijera "esto es una espalda". Se añadieron **omóplatos** y
  cuello marcados.
- **El cuerpo respiraba y los guantes no.** El torso usaba `hombY + bob` y los
  puños `hombY` a secas, así que oscilaban por separado y se leían como piezas
  sueltas flotando. Ahora los dos usan `bobJug()`.
- Los puños quedaban **flotando por encima del cuerpo**, sin tocarlo. Bajados
  hasta pisar los hombros: solapar es lo que los une visualmente.

### Por qué seguían pareciendo pegados encima

Mover posiciones no bastaba: el problema era de dibujo, y hacían falta cuatro
cosas de anatomía, no una.

- **Deltoides que sobresalen de la silueta.** Un brazo no nace del interior de un
  torso plano: nace de una articulación que rompe el contorno hacia fuera. Sin
  ese bulto, el brazo es una tira pegada sobre una caja.
- **El hombro se dibuja DESPUÉS del brazo**, así le tapa la unión y el brazo
  parece salir de debajo en vez de estar encima.
- **Contorno propio** en brazos y piernas (`BORDE_P`, `BORDE_T`). Sin él, todo
  son manchas del mismo tono pegadas y no se distingue qué está delante.
- **Sombra proyectada** de los puños sobre el torso, con `source-atop` para que
  solo manche el cuerpo. Es lo que dice "esto está delante de aquello".

Y la geometría acompaña: **hombros anchos y guantes juntos y altos**, para que el
antebrazo dibuje una diagonal visible. Con todo alineado en vertical el brazo
desaparecía y quedaban cuatro círculos del mismo tamaño apilados.

### Proporciones y orden

Cuatro reglas de dibujo que hacían falta para que el cuerpo se leyera como uno:

- **Jerarquía de grosor**: guante > hombro > brazo > muñeca. Si el brazo es tan
  ancho como el guante y más ancho que el hombro del que sale, las piezas se leen
  sueltas. Medido: 76 / 62 / 45 / 30 px en la vista de espaldas.
- **Espalda triangular**: ancha en los hombros y estrecha en la cintura, con dos
  cuñas de dorsales. Estaba al revés (más ancha abajo) y parecía un bloque.
- **Cuatro vistas del guante**: de frente (retrato) se ven los nudillos; **de
  canto** (la que usa el juego en guardia), con el lado del meñique y los dedos
  de perfil; con los dedos doblados en horizontal; y lanzado, solo su parte
  trasera. La recogida y la lanzada se alternan según `ext`.
### Jerarquía del encuadre: objeto > puños > personaje

Es un clicker: lo que importa es el objeto que se rompe y la mano con la que lo
rompes. El personaje es marco, no protagonista. En orden de peso:

| Pieza | Valor | Resultado |
|---|---|---|
| Objeto | `objS = min(CW*0.72, util*0.70)` | **72 % del ancho** en móvil |
| Hombros | `hombW = objS*0.24` (ancho = `2.48·hombW`) | 0.60·objS |
| Puño | `punoR = objS*0.142` | **1.17× el hombro** |
| Altura del cuerpo | `hombY = piso − util*0.03` | el torso se hunde fuera de cuadro |

Dos cosas que conviene no perder de vista:

- **El puño ya NO sigue la escala del cuerpo.** Es la pieza con la que se juega,
  así que va aparte y más grande: `0.651·W` del cuerpo, cuando antes era
  `0.42·W`. Que el puño sea **mayor que el hombro** (1.17×) es intencionado.
- **Cada vez que cambia `punoR`, hay que recalcular la separación de la guardia**
  con `solape = 0.47 − (sep − r/W)`, objetivo `0.11·W`. Con el puño actual sale
  `sep = 1.01·W`, y el puño llega a `1.66·W`, bastante más allá del hombro
  (`1.269·W`) — a estas alturas eso es lo deseable: los puños enmarcan el objeto.

### La espalda: es donde se ve que está modificado

En la historia son humanos modificados para ganar una guerra. Como se le ve de
espaldas, **la espalda es el único sitio donde eso se puede contar**, así que
lleva musculatura explícita, no insinuada:

- **Trapecio**, que sube del hombro al cuello (`trapecio()`, dos pasadas: una
  oscura de contorno y otra en tono de traje al 92 %).
- **Dorsales**: dos cuñas del hombro a la cintura, al 78 % de opacidad. Son las
  que dan la V.
- **Surco de la columna**, omóplatos y **redondos mayores** bajo la axila.

Tres trampas que costaron una iteración cada una:

1. **Las puntas del triángulo del torso asomaban por fuera del hombro.** Medido:
   con el tope en `1.34·W` y un deltoides que solo llega a `1.215·W` a esa
   altura, sobraban `0.125·W` de pincho al aire. Arreglado por los dos lados:
   torso a `1.24·W` y deltoides de `0.82·punoR` a `0.94·punoR` (que llega a
   `1.269·W`). **Si se toca uno de los dos, comprobar el otro.**
2. **La base del cuello quedaba a la vista**, como una pieza pegada encima. El
   cuello y el trapecio van **con el torso, antes de los brazos**, no en el
   bloque de la cabeza: la espalda está más cerca de la cámara que el cuello y
   tiene que taparle la base. Pintado después de los brazos, el trapecio se comía
   medio cuerpo.
3. **El trapecio dejaba un canto horizontal** cruzando la espalda, donde acababa
   su tono oscuro. Ahora baja hasta el pie del lienzo y el oscuro queda solo como
   reborde lateral — que es justo el contorno del músculo.

### La guardia: es perspectiva, no orden de dibujo

Esto costó muchas rondas porque "delante" significa dos cosas distintas y las
estábamos usando cruzadas. La buena es la espacial:

> **La espalda es lo más cercano a la cámara. Los puños van estirados hacia el
> aparato, o sea HACIA EL FONDO. Y lo que se aleja sube en el encuadre y mengua.**

Lo que hace falta es **solo el orden de planos**, y se consigue con dos cosas:

1. **Los puños asoman por encima del cráneo**: separación `0.78·W`, altura
   `-1.26·W`. Medido: 34 px de puño por encima del cráneo.

   La separación es un equilibrio, no un valor libre. Con `0.62·W` el puño le
   comía **0.27·W** de ancho a cada mitad del cráneo y la cabeza casi
   desaparecía; con `0.82·W` el solape baja a **0.11·W** y queda despejado el
   77 % de cada mitad. Abrir más rompería el solape, que es de donde sale la
   profundidad. El tope duro es el hombro: el puño llega a `1.282·W` y el
   deltoides a `1.269·W` — están a ras.

   **Separación y radio del guante van emparejados.** Al subir el guante a
   `1.10·punoR` hubo que abrir de `0.78·W` a `0.82·W` para mantener el solape en
   `0.11·W`. Si se toca uno, recalcular el otro con `solape = 0.47 − (sep − r/W)`.
2. **En planos quedan DETRÁS de él y la cabeza los tapa.** `brazo()`,
   `deltoide()`, `coser()` y `guante()` se pintan **antes** del bloque de la
   cabeza, que les come 63 px por abajo. **Ese solape es el dato que dice "esto
   está más lejos"**; sin él la pose se lee plana por muy correctas que sean las
   proporciones.

**Los tamaños NO se tocan para conseguir eso.** Hubo un intento de reforzar la
profundidad encogiendo el puño a `0.66·punoR` y afilando el antebrazo a
`0.24·punoR` en la muñeca. Resultado: el brazo dejó de leerse recogido y pasó a
leerse **estirado**, un cono largo de 1.71·W. Los valores buenos son los de
siempre — guante `1.00·punoR`, antebrazo `0.60 → 0.30·punoR` — que dan un brazo
de 1.39·W con razón largo/ancho 2.76: corto y grueso, o sea recogido.

**Nunca vuelva a haber un segundo pase de guantes.** Existió dos veces, para
darles peso, pintándose sobre el volcado final —es decir, por encima de la
cabeza— y deshaciendo justo el solape del punto 4.

*Nota de método*: antes de tocar nada, comprobar si el z-order es realmente el
problema **repintando los guantes de magenta puro** sobre el juego en marcha. Si
salen enteros, el orden ya está bien y lo que falla es la geometría. Esa prueba
habría ahorrado varias rondas.
- **El pulgar cruza hacia fuera**, no hacia el centro: al cerrar el puño la mano
  gira y el pulgar queda del lado externo. En el sprite va a la derecha del
  centro, y el espejo de la mano izquierda lo lleva a su lado externo.
- **El segundo pase de guantes tiene que ir sincronizado.** Sobre el volcado del
  cuerpo se repintan los guantes para darles peso. Sus parámetros —vista, radio,
  giro— **deben ser idénticos** a los del pase interior; si divergen aparece un
  guante fantasma desplazado.

### La cabeza

De espaldas era un círculo con un rectángulo encima y no se entendía. Ahora tiene
cuello, cráneo ovalado, orejas, pelo y sombra de nuca — y **lo que lleva puesto
cambia con el nivel de óptica**: rapado, pelo con arnés, casquete técnico y casco
integral con ranuras y luces.

**Lo que lleva en la cabeza se RECORTA contra el cráneo** (`clip()` sobre la misma
elipse) y se dibuja desbordándolo. Antes era una elipse oscura dibujada *dentro*
del cráneo: quedaba un anillo de piel alrededor y **se leía como un agujero**, y
nunca casaba con el tamaño de la cabeza porque su tamaño se elegía a ojo.
Recortado encaja por definición, sea cual sea el diseño.

El mismo defecto, peor, estaba en el retrato de EQUIPO: el pelo era un rectángulo
de **44 de ancho sobre un cráneo de 23 de radio**, con las esquinas sobresaliendo
por fuera de la silueta. Mismo arreglo, más una **línea de nacimiento** curva (sube
en el centro, baja en las sienes) en vez de un borde recto.

Las **orejas van después del pelo** — el pelo cae por detrás de ellas — y no se
dibujan con el casco integral puesto.

### La respiración

No es una senoidal: **se inhala rápido, se retiene un instante, se exhala más
despacio y hay una pausa** antes del siguiente ciclo (`respiracion()`, ~17 por
minuto). Además la caja torácica se ensancha al inhalar. Una onda simétrica se
lee como un flotador, no como alguien respirando.

### El giro del guante

Faltaba una cosa más, puramente geométrica: **la muñequera del sprite apuntaba
siempre hacia abajo** mientras el antebrazo llegaba en diagonal. Por eso la mano
no casaba con el brazo por muy pegados que estuvieran. Ahora el guante se rota
para alinearse con el eje hombro→mano (`giro` en `guante()`), en las dos vistas.

Ojo con el signo: la mano izquierda se dibuja con `scale(-1,1)`, y **el espejo ya
invierte la rotación**. Negar además el ángulo dentro de `guante()` lo invertía
dos veces y dejaba alineada solo la mano derecha. El ángulo llega ya resuelto por
lado desde quien llama. Comprobado con la matriz de transformación: el eje
muñeca→mano del sprite coincide con la dirección del brazo en ambos lados.

### Lo que finalmente lo resolvió

Nada de lo anterior bastaba, porque la causa era otra y estaba en el *material*,
no en la anatomía:

- **Los guantes se pintaban fuera de la silueta común.** En gameplay iban sueltos
  sobre el canvas, con su propia opacidad y su propio contorno, mientras cuerpo y
  brazos compartían lienzo (`JUG`), transparencia y contorno. Eran, literalmente,
  otro material pegado encima. Ahora los guantes se dibujan **dentro de `JUG`**:
  un único contorno envuelve hombros, brazos y puños. Después se repasan con un
  segundo pase tenue para que sigan pesando más que el resto, que son el foco.
- **El sprite del guante lleva un contorno cerrado a su alrededor**, así que por
  definición se lee como un objeto aparte por muy pegado que esté al brazo. Se
  añadió un **manguito** (`coser`) que cruza la muñeca por encima del guante y
  rompe esa línea. Va en las dos vistas.

**Cuerpo, brazos y hombros se pintan opacos en un lienzo aparte (`JUG`) y se
vuelcan de una vez con una sola transparencia.** Dibujarlos por capas con alfas
distintos los hacía leerse como piezas sueltas: cada capa se sumaba a la anterior
y las uniones quedaban más oscuras, con los brazos aparentemente despegados del
torso. Con una silueta única el problema desaparece de raíz.

El contorno sale de esa misma silueta (`JUGS`, teñida y dibujada en cuatro
desplazamientos), así la forma se entiende aunque el cuerpo sea translúcido. Los
hombros llevan un círculo en el punto de unión que sella brazo y torso.

Los guantes van encima y más sólidos (alfa ~0.82, y ~0.98 al impactar): son el
foco, el cuerpo es solo referencia.

## Escala y nitidez

El lienzo va a resolución completa (`dpr` hasta 2). Para que todo siga siendo
proporcional a cualquier tamaño de pantalla:

- **`U = CH/220`** es la unidad de escala. Toda constante en píxeles (sacudida,
  velocidad de partículas, gravedad, tamaños de número) se multiplica por `U`.
- Los sprites se siguen dibujando en coordenadas 0..220, pero sobre lienzos del
  **doble de resolución** (`SS = 2`) para que al mostrarlos grandes salgan
  nítidos. Igual el sprite del guante (96→192) y los iconos (32→96).
- Los números usan la **fuente del sistema** con contorno, no la bitmap: a
  resolución completa sale nítida y permite tamaños finos. La fuente bitmap
  sobrevive solo en el logo, como identidad.

Consecuencias que quedaron del diseño original:

- **`U = CH/220`** es la unidad de escala. Toda constante en píxeles (sacudida,
  velocidad de partículas, gravedad, separaciones) se multiplica por `U` para que
  el juego se vea igual a cualquier resolución.
- **Los sprites se pintan a 220x220 y se reducen** con `imageSmoothingEnabled=false`,
  o sea muestreo nearest-neighbor: colores planos y bordes duros. Por eso los
  detalles de los sprites son gruesos — cualquier cosa fina desaparece al pixelar.
- **Contorno oscuro** (`OUT`): la silueta del aparato se pinta en cuatro
  desplazamientos de 1px antes del sprite. Sin él, el aparato se confundía con el
  fondo ahora que el fondo también es de colores vivos.
- **Fuente bitmap 5x7 propia** (`FT`, `texto()`): los números flotantes son el
  elemento más visible del juego y con una fuente vectorial a 8px se veían
  borrosos al ampliar. Se pintan píxel a píxel, agrupando tramos horizontales.
- Las partículas se dibujan con `fillRect` en coordenadas enteras, y el alfa se
  corta de golpe en vez de desvanecerse: un degradado suave rompe el look.

## Botones, marcos y tipografía

Todo habla el mismo idioma que los sprites y el personaje: **formas redondeadas
con contorno grueso y sombra dura**. Radios generosos (18-26 px), borde de 3 px
del color del contorno de los sprites, luz interior arriba y una sombra sólida
debajo que desaparece al pulsar, así el botón se hunde.

Hubo dos iteraciones antes de acertar: primero bordes rectos de CSS, luego un
marco escalonado de cuatro sombras —correcto mientras el juego era pixel art—,
que dejó de encajar al retirar el pixelado y se veía demasiado cuadrado.

El **logo** ya no usa la fuente bitmap de bloques: son letras de la fuente del
sistema con `lineJoin: round` y un contorno de 17 px, que redondea las esquinas
y les da el mismo acabado que los sprites, con degradado ámbar → magenta, sombra
dura y un brillo recortado en la mitad superior.

## Hoja de variantes

Abrir el juego con **`?variantes`** en la URL (`index.html?variantes`) muestra la
guardia dibujada en nueve versiones numeradas, combinando tres diseños de puño
recogido (dedos en horizontal, de canto, liso) con tres posiciones respecto a la
cabeza (detrás, delante, abiertos). Reutiliza el mismo código de dibujo del
juego, así que lo que se ve es lo que saldría.

Existe porque describir con palabras qué falla en una pose es lento y ambiguo:
con la hoja, la respuesta es un número.

## Paleta

Post-apocalíptico **luminoso**, no sombrío. Cielos saturados de tres paradas, sol
con anillo, dos capas de horizonte de color (no negras), suelo con línea de luz de
neón, motas de colores flotando, estrellas que parpadean. La UI acompaña en
violeta con acentos neón y sombras duras tipo arcade.

El contraste es intencional: fondo vivo, primer plano todavía más vivo, y los
números por encima de todo.

## Iconos de la interfaz

Los emojis del sistema rompían el pixel art: cada plataforma los pinta distinto y
no combinaban con la paleta. Los **19 iconos** (`ICONOS`) se dibujan como sprites
de 32x32 con las mismas primitivas que todo lo demás, se sirven a las tarjetas
como data URL (`icono`, `imgIcono`) y se cachean por nombre. En CSS van con
`image-rendering: pixelated`, así que amplían nítidos.

`FIST[].ic` y `CREW[].ic` ya no guardan una entidad HTML sino el **nombre del
icono**.

## El panel es un cajón, no una columna

El juego ocupa **~87% de la pantalla**. El panel no tiene sitio reservado: es un
cajón que solo roba espacio mientras está abierto (`#side.abierto`), y las
pestañas viven en una barra fija abajo (`#barra`). Tocar una pestaña abre el
cajón; tocar la misma otra vez lo cierra, igual que el botón CERRAR. Antes el
panel se llevaba una columna de 320 px en escritorio y el 38-47% del alto en
móvil de forma permanente.

Efecto colateral bueno: el cajón es de ancho completo, así que las tarjetas caben
en varias columnas (`grid-template-columns: repeat(auto-fill, minmax(320px,1fr))`)
y hay sitio para que los textos respiren.

El **objetivo en curso es solo una barra fina** en el borde superior del arena.
La caja con nombre y descripción tapaba juego; el detalle de cada logro está en
la pestaña NÚCLEOS.

## El daño automático entra con cada golpe

Los implantes aplicaban su daño **cada fotograma** mientras los brazos golpeaban
cada dos segundos: la vida bajaba y el aparato se deterioraba sin que nada lo
tocara, lo que se leía como un fallo. Ahora el daño se acumula en `deudaAuto` y
**lo descarga entero `impactoBrazo()`** en cada golpe visible. Medido: 3 impactos
en 2,8 s y exactamente 3 bajadas de vida. Si no hay ningún brazo en pantalla que
pueda descargarlo, se aplica de forma continua.

## Progresión y enganche

Tres sistemas que el género necesita para que el jugador vuelva:

- **Logros** (`LOGROS`, 18): metas cortas y encadenadas — destruir 1, 10, 50, 250,
  1000; abatir 1, 5, 15 jefes; llegar al sector 2, 4, 7; niveles de puño;
  implantes instalados; reciclajes; asimilación. Cada uno da **+4% global**
  permanente (`multLogros`) y sobreviven al prestigio y a la asimilación. La
  regla del género: siempre hay un objetivo a la vista y otro justo detrás.
- **Objetivo en pantalla** (`#meta`): el siguiente logro pendiente con su barra de
  progreso, siempre visible durante el juego.
- **Sobrecarga** (`lanzarFrenesi`): cada 75-145 s salta un evento que multiplica
  **x6 el golpe manual durante 12 s**, con su propia barra y aviso. Es la
  recompensa por estar mirando.

La interfaz **también se sacude** en los críticos (`sacudirUI`): antes el golpe
solo ocurría dentro del lienzo y el resto de la pantalla quedaba inmóvil, como si
fueran dos cosas distintas.

## Los jefes se ven jefes

Un sprite distinto no bastaba para reconocerlos de un vistazo. Cada diez
aparatos, además de x7 vida y x12 recompensa:

- **26% más grandes** (`objVis`).
- **Contorno rojo y del doble de grosor** en vez del oscuro habitual.
- **Corona de púas** girando lentamente por detrás y **aura roja pulsante**.
- **Cuelgan de dos cadenas**, no de una: pesan.
- **Vibran** con una oscilación propia de alta frecuencia.
- Sueltan **brasas rojas** al aire mientras siguen vivos.
- Distintivo **JEFE** parpadeante junto al nombre en el HUD.
- **Respiran**: un pulso que se acelera y se marca más conforme baja su vida, en
  el cuerpo y en el aura. Se ve que siguen vivos y que están a punto de caer.

## Los aparatos: piezas compartidas y capa de desgaste

Eran siluetas limpias de tres o cuatro rectángulos planos. El detalle se
consigue por dos vías, y la primera importa más que la segunda:

**1. Una capa de desgaste sobre CUALQUIER aparato** (`patina()`, aplicada en
`pintarAparato` justo después del dibujo). Con `source-atop` añade volumen (luz
por arriba-izquierda, sombra por abajo-derecha), juntas de chapa, remaches
sueltos, arañazos y quemaduras. Un solo cambio y suben los 60 diseños a la vez.

> Se sortea **una vez por objeto** (`nuevoDesgaste()`, llamado desde
> `nuevasMordidas()`), nunca por fotograma. Sorteándolo en cada dibujado los
> arañazos hervirían.

**2. Piezas de detalle compartidas**, para que los diseños se parezcan entre sí:
`perno`, `pernos`, `rejilla`, `cinta` (franjas de peligro), `cable`, `tubo`,
`pantallita`, `etiqueta`, `reflejo` (brillo de cristal), `costura` (cordón de
soldadura) y `chapa` (panel con junta y remaches).

**3. El idioma Metal Slug.** La referencia del proyecto para los objetos es
Metal Slug: chatarra militar donde **nada parece fabricado de una pieza — todo
está atornillado a otra cosa**. Remaches por todas partes, orugas de eslabones,
chapas soldadas encima de otras chapas, tripas mecánicas a la vista (muelles,
engranajes, pistones) y estarcidos de armería. Sus piezas: `remaches`, `oruga`,
`parche`, `estarcido` (numeración con matriz de 3x5), `escarapela`, `muelle`,
`engranaje`, `escape` y `radiador`.

Estado: **71 aparatos + 7 jefes**, 77 funciones de dibujo, entre 8 y 12 objetos
por sector. Rehechos a fondo el sector 1 entero, el sector 2 entero y los siete
jefes; 16 objetos nuevos repartidos por los siete sectores.

Dos reglas de oficio que salieron de rehacerlos:

- **Nada simétrico y perfecto.** Al dron le falta un rotor, al rotor le falta un
  trozo de aspa, la fragata está partida en dos con la chapa desgarrada. Es un
  vertedero: lo que está entero no pega.
- **Ninguna pieza puede flotar.** Es el fallo que más se cuela cuando se dibuja
  por coordenadas: un detalle colocado a ojo que no llega a tocar el cuerpo. Se
  detecta contando **islas de la silueta** por inundación; más de tres casi
  siempre es una pieza suelta en el aire. Así aparecieron los altavoces del
  televisor, la escarapela de la hélice, las cuatro puntas de dedo de la mano de
  exoesqueleto (un hueco de 2 px) y dos varillas del yunque. Conviene repasar esa
  comprobación cada vez que se añadan diseños.
- **Los jefes se distinguen por acumulación**, no por tamaño: franjas de peligro,
  dientes, pistones, remaches gordos, varias luces de aviso y un ojo central. Un
  jefe con la silueta de un aparato normal, aunque sea más grande, no impone.

## El contorno del guante tiene que ser el del cuerpo

Tres defectos que venían de que el sprite del guante se dibujaba con reglas
propias, distintas a las del resto del personaje:

- **Grosor.** El contorno del cuerpo es `max(1.5, U*1.6)` —escala con la
  pantalla— y el del guante eran **4 unidades fijas** del sprite. Medido:
  4.94 px contra 3.29 px, un desajuste de **1.50x** que además cambiaba con el
  tamaño de la ventana. Ahora `guante()` recibe `bordePx` y calcula cuántas
  unidades de sprite equivalen (`bordePx*96/(2*r)`, redondeado a medias unidades
  para no reventar la caché). Comprobado: 4.94 contra 4.97, **0.992x**.
- **Color.** Era `#140f2e`, tinta pura, mientras que en el cuerpo el contorno es
  el propio material tirado hacia la tinta (`mezcla(PIEL_S, "#140f2e", 0.62)`).
  Con tinta pura el guante parecía recortado y pegado encima. Ahora sigue la
  misma regla: `mezcla(BASE, "#140f2e", 0.62)`.
- **El bulto del pulgar.** En `formaPuno` la elipse del pulgar iba centrada en
  x=20 y sobresalía **~6 unidades** por fuera de la masa de la mano (que a esa
  altura empieza en 17.8). Con el contorno encima se leía como una protuberancia
  pegada al canto. Recentrada en x=29 queda enrasada; el pulgar se sigue viendo
  porque las vistas 1 y 3 lo dibujan aparte, ya dentro de la silueta.

Tres cosas más del empalme guante-brazo, todas del mismo tipo: piezas que se
dibujaban a ras de otras y sobresalían.

- **La base del guante era redondeada y más ancha que el brazo.** Un `roundRect`
  de 42 con radio 8: sobresalía por los dos lados y, al ser curva, se leía como
  un bulto pegado encima en vez de como una muñeca que entra en el antebrazo.
  Ahora es un bloque **recto** de 36 → `0.825·punoR` en pantalla, contra
  `0.80·punoR` del antebrazo: el guante apoya justo, apenas más ancho.
- **Las “protuberancias” del brazo eran las esquinas del manguito.** `coser()`
  pintaba un rectángulo girado tan ancho como el brazo, pero **el brazo se
  estrecha hacia la mano**, así que las dos esquinas delanteras se salían — una a
  cada lado, simétricas, con toda la pinta de un defecto de diseño. Ahora el
  ancho se calcula del brazo *en ese punto* y se deja al 78 % por dentro.
- **El contorno seguía sin cuadrar, pero por el TONO, no por el grosor.** Medido
  en pantalla: banda oscura de 42 px en el guante contra 5 px en el brazo. El
  grosor ya estaba igualado; lo que pesaba era la sombra propia del guante pegada
  al borde. Se recogió esa sombra (alfa .55 → .38) y ahora `guante()` recibe
  también **el color de tinta**, al que se le pasa el `BORDE_P` exacto que usan
  brazos y hombros. Es literalmente la misma línea.

## Los guantes

Son lo que más se mira en pantalla, así que tienen su propio pipeline. Antes se
dibujaban con primitivas **directamente en el lienzo de baja resolución**, donde
un círculo de radio 2 es una mancha: no cabía ningún detalle.

Ahora `spriteGuante(gl)` los pinta a **96x96 y los cachea**, uno por tramo, y se
reducen con nearest igual que los aparatos. Eso permite:

- **Forma de puño real** (`formaPuno`): masa de la mano, cuatro nudillos, pulgar
  cruzado y muñeca. Un círculo no se lee como un puño.
- Contorno oscuro, sombra abajo-derecha, brillo especular arriba-izquierda,
  separación entre nudillos y remaches.
- **Una mano es el espejo de la otra**: el sprite tiene el pulgar de un solo
  lado, así que el guante izquierdo se dibuja con `scale(-1, 1)`. Sin eso se
  veían dos manos izquierdas.
- Detalle propio de cada tramo: tiras cruzadas en las vendas, costuras y hebilla
  en el cuero, placa con remaches en el acero, circuitos encendidos en el exo,
  núcleo con vetas en el de plasma.

Lo animado va fuera del sprite para no romper la caché: el resplandor pulsante,
las chispas en órbita, la deformación al impactar y la **estela** (una copia
tenue rezagada que vende la velocidad del puñetazo).

## El retrato y sus poses

El retrato de la pestaña EQUIPO se pinta a **420x420 y se reduce con nearest**,
con contorno oscuro en cuatro desplazamientos — el mismo tratamiento que los
aparatos. Dibujado directo en el lienzo pequeño salía con los bordes sucios.

El lienzo es de **700 con el origen en (350, 420)**, y ese número no es a ojo: se
midió el recuadro real de las **110 transiciones posibles**, 45 fotogramas cada
una. El muelle de las poses **rebota** — al llegar se pasa de largo — así que el
extremo no es ninguna pose en reposo sino el sobrepaso: x[-245, 220], y[-371, 229].
Con el lienzo anterior de 420 las piernas y los puños se salían **del propio
bitmap** en ese instante, donde ya no hay encuadre que valga.

**Encuadre adaptativo**: no se vuelca el lienzo entero, sino la caja que ocupa la
pose, ajustada al marco. El margen que necesitan las poses abiertas sobra en las
cerradas, y en un marco apaisado (móvil) el personaje quedaba diminuto con un mar
de espacio vacío alrededor.

El recorte va **centrado en el marco**, no anclado abajo: pegado al fondo el
personaje se salía por abajo en las poses agachadas.

Esa caja se **mide sobre el propio dibujo** (`medirCaja`, muestreo cada 3 px), no
se deduce de los parámetros de la pose: el aura de núcleos, la antena del enlace
y las púas de las hombreras quedan fuera de cualquier cálculo analítico y el
personaje salía recortado.

Dos detalles sin los cuales seguía cortándose durante el cambio de pose:

- Se **remide en cada fotograma mientras la pose se mueve** (`poseInquieta()`), no
  cada ocho. Midiendo cada ocho, el encuadre iba por detrás del muelle.
- El suavizado es **asimétrico**: si hay que ABRIR el encuadre se abre de golpe
  (o se corta algo), si hay que cerrarlo se cierra suave para que no dé tirones.

Comprobado sobre las 4950 combinaciones de fotograma × transición: **cero fugas**
de la caja y cero contactos con el borde del lienzo.

**Tocar el personaje lo cambia de pose** (`POSES`, `animarPose`). Son **once**:
EN GUARDIA, TITÁN, MARTILLO, CENTINELA, DEMOLEDOR, GARRA, ARAÑA, LÁTIGO,
TIJERA, TORNADO y RAYO.

### Que el personaje esté DE PIE, no flotando

Las poses antiguas volaban (METEORO, LEVITACIÓN, VERTICAL boca abajo) y el
personaje no se apoyaba en nada. Lo extremo se busca ahora en **brazos, torsión
y apertura de piernas**, nunca levantándolo del suelo. Cuatro reglas, cada una
sacada de un defecto concreto:

1. **Los dos pies a la misma cota** (`y = 0`) y `oy = 0` en todas. Para agacharse
   se usa `sy` (comprime el cuerpo), no `oy` (lo levanta entero).
2. **La suela se queda horizontal.** Iba girada con la pantorrilla, así que en
   cuanto la pierna se abría la bota quedaba de puntillas. Ahora la caña sigue al
   hueso solo al 40 % y la suela se dibuja en un marco sin rotar.
3. **Ningún guante por debajo de `y = -20`.** Los pies con bota y sombra llegan a
   `+21`; una mano más baja se convertía en el punto de apoyo del encuadre y
   dejaba al personaje colgado de ella, con los pies en el aire. Le pasaba a
   MARTILLO, GARRA, ARAÑA, LÁTIGO y RAYO.
4. **Los pies compensan la rotación** con `y = −x·tan(rot)`. Con el cuerpo
   girado, un pie sube y el otro baja: TORNADO (`rot 0.40`) caía 50 px por debajo
   de su línea de pie y se apoyaba en uno solo. Medido después: **desnivel máximo
   de 4 px** entre los dos pies en las once poses.

Además hay **sombra de contacto** bajo cada bota y una **plataforma** dibujada en
el panel, y el recorte se **ancla abajo** en vez de centrarse: sin algo debajo, los
pies no se apoyan en nada por muy bien colocados que estén.

Cada pose coloca **a mano los dos guantes y los dos pies**, y además puede rotar,
escalar, estirar (`sy`) y levantar (`oy`) todo el cuerpo, mover la cabeza y fijar
su propia amplitud de balanceo (`amp`). Con las piernas fijas no salían poses
raras de verdad: hacía falta que cada extremidad fuera libre.

Brazos y piernas se trazan con la misma función (`miembro`): dos tramos de línea
gruesa con codo o rodilla, en tres capas de color. Así conectan siempre, sea cual
sea la pose — con rectángulos rotados quedaban piezas sueltas que no se tocaban.

La transición es un **muelle**, no una interpolación lineal (`K = 620`, `D = 15`):
llega al destino en una décima y rebota un 29% antes de asentarse, con 2 a 5
oscilaciones. Al tocar, además, se le mete una sacudida aleatoria a la rotación y
la escala para que cada cambio entre con carácter. Con interpolación lineal
—y con el muelle sobreamortiguado que probé antes— el cambio se sentía blando.

Junto al retrato hay un **visor del guante actual** en grande, con su nombre,
nivel y qué desbloquea después.

## Tipografía del título

El logo usa `FT_LOGO`, una **fuente bitmap propia de 7x9** con letras gruesas
(solo las 11 que hacen falta), pintada en canvas con degradado ámbar → magenta,
contorno de un píxel en las ocho direcciones y sombra dura. La 5x7 del juego es
demasiado fina para un logo, y con tipografía del sistema se rompía el pixel art.

Va en **dos líneas**: en una sola medía 300 px y empujaba los indicadores del
HUD hasta cortarlos.

## El equipamiento cuenta que va perdiendo la humanidad

**La progresión no premia con oro.** El último escalón no tiene que dar envidia,
tiene que dar mal cuerpo: va de trapo y chatarra a **aleación quirúrgica**, y el
color de energía acaba en **rojo**, no en dorado. Cuanto más le puede la
tecnología, más frío y más rojo, porque cada mejora le quita un trozo de persona.

**El blindaje NO sigue el color del guante.** Cuando hombreras, botas y enlace
tomaban `MET` del guante, al máximo nivel el personaje entero se volvía dorado y
se perdía la silueta. Ahora hay una paleta de acero propia (`ARM_C` / `ARM_D`)
indexada por **el nivel de cada pieza**, así cada mejora se ve en su sitio; el
color del guante queda solo como energía (trim, luces, núcleos).

**Los injertos** (`injerto()`) son lo que hace que las piezas hablen. Hasta el
nivel 2 el equipo va **atado encima** con correas y se podría quitar. Del 3 en
adelante ya no: hay un **anillo atornillado al hueso, grapas quirúrgicas y carne
irritada** alrededor; en el 4, **cables entrando bajo la piel** y un puerto
encendido. Se aplica en hombro y rodilla, en las dos vistas, y hay además un
**puerto espinal** en la nuca con el enlace alto.

Las cinco piezas tienen cinco diseños de verdad, no un círculo que cambia de
color: hombreras (de una suelta con correa a yunques con púas y núcleo), piernas
(de trapos a rodilla de servo y puntera reforzada), enlace (de radio de cadera a
mochila, mástil con plato y núcleo de enjambre orbitando).

### Las poses no pueden ser débiles

Los pies juntos y simétricos se leen como "de pie esperando". Un luchador
**planta**: bases anchas, casi nunca a la misma distancia de un lado y del otro,
y el pie apoyando **hacia fuera** —la suela se desplaza y se ensancha hacia el
lado contrario al cuerpo, con puntera reforzada—. Centrada bajo el tobillo el
personaje se lee de puntillas aunque la suela esté horizontal.

Al ensanchar hay que **recalcular la compensación de rotación** de cada pie
(`y = −x·tan(rot)`) o se vuelve a desnivelar. Comprobado después: cero poses
desniveladas de las once.

## El personaje

Se dibuja por piezas en `heroe()` (de frente, para el retrato de la pestaña
EQUIPO) y en `jugadorEspalda()` (de espaldas, en la escena). **Cada mejora del
puño le cambia una pieza visible** en los dos sitios.

| Mejora | Pieza | Se transforma en los niveles |
|---|---|---|
| Nudillos reforzados | Guantes | 0 / 3 / 8 / 18 / 35 |
| Filo crítico | Óptica (visor) | 0 / 1 / 4 / 9 / 16 |
| Impacto crítico | Hombreras | 0 / 1 / 3 / 6 / 10 |
| Ritmo de demolición | Piernas y cinturón | 0 / 1 / 3 / 6 / 10 |
| Sinergia de cuadrilla | Mochila y antena | 0 / 1 / 2 / 4 / 7 |

Los umbrales viven en `FIST[].tramos` y `tramo(f)` decide qué tramo está activo.
Al cruzar un umbral salta un aviso "EQUIPADO: …" y chispas sobre el personaje.
Los núcleos de prestigio le añaden un aura violeta que crece con la cantidad.

## Los aumentos: automatización con precio

La producción automática **no son ayudantes que llegan de la nada, son implantes
del propio protagonista** (`CREW`, con nombres como Servo de muñeca, Reactor
lumbar, Núcleo sináptico). Se dibujan como **brazos mecánicos que salen de sus
hombros** y golpean solos (`dibujarBrazos`, `baseBrazo`, `TERMINAL`).

Dos problemas resueltos de una vez:

- Antes la vida bajaba sola sin que nada en pantalla lo explicara y se leía como
  un bug. Ahora se ve exactamente qué la baja.
- Unos obreros apareciendo de la nada no tenían justificación en la ficción. Un
  brazo implantado sí, y además cuenta la historia.

### Que no compitan con los puños

Los brazos son secundarios: el foco son los guantes del jugador. Para bajarles el
ruido visual, todo a la vez:

- **Máximo tres** (dos en pantallas estrechas), y siempre los más avanzados.
- **Siluetas oscuras con la punta encendida** en vez de metal brillante, y alfa
  reducido cuando están en reposo.
- **Ciclo con reposo**: golpean durante un tercio del tiempo y el resto quedan
  recogidos. En vaivén continuo saturaban la mitad inferior de la pantalla.

### El golpe tiene que sentirse

`ext` no es una senoidal: es un ciclo de puñetazo por tramos — se echa atrás
(anticipación), sale disparado en 0,10 de fase, **aguanta extendido** el impacto
y vuelve despacio. En el fotograma exacto en que llega, `impactoBrazo()` suelta
chispas, un anillo, sacudida y un empujón al péndulo, y el terminal se aplasta
contra el objetivo.

Ese impacto lo dispara la propia animación, comparando la fase con la del
fotograma anterior (`brazoFaseAnt`). Antes salía de un temporizador
independiente y se dibujaba como una **estela desde la base del brazo hasta el
objetivo, que se leía como un disparo láser**: tenía sentido cuando los
ayudantes estaban lejos y no tocaban nada, pero desde que el brazo llega
físicamente al aparato sobra. Eliminada.

**Humanidad** (`humanidad()`, `mecanizacion()`): empieza en 100% y cada *tipo*
nuevo de implante resta lo suyo (`CREW[].hum`, de 3 a 20, suman 100). Repetir el
mismo aumento no deshumaniza más; cruzar a uno nuevo sí. Al cruzar ciertos
umbrales salta una frase (`HITOS`), y el personaje **se mecaniza visualmente**:
la piel se mezcla hacia metal con `mezcla()`, aparecen placas en la espalda y el
cráneo, y cables por los antebrazos.

Es indicador narrativo, no penalización: no resta daño ni chatarra. El trade-off
mecánico (por ejemplo, que reduzca el tope del combo) queda como idea pendiente.

## El final del camino: Asimilación

Llegar a **0% de humanidad** no es un callejón sin salida. Dispara
`asimilacionCompleta()` (parón, cámara lenta, rótulo ASIMILACION, 130 partículas)
y desbloquea el **Protocolo de Asimilación** en la pestaña NÚCLEOS: te desmontas
pieza por pieza y reciclas tu propio cuerpo.

`asimilar()` reinicia como el prestigio pero da **el doble de núcleos** y suma
`S.asim`, que otorga **+50% permanente a daño y chatarra** por asimilación:

```
multGlobal = (1 + cores*0.02) * (1 + asim*0.5)
```

Cierra el bucle temático: el reciclador acaba reciclándose a sí mismo, y cada
vuelta lo deja más fuerte y más lejos de lo que era.

## Golpe crítico y demoledor

El crítico ya existía, pero no se notaba. Ahora, además del daño:

| | probabilidad | efecto |
|---|---|---|
| Crítico | 3% + 2% por nivel (tope 55%) | x7 base, sacudida 6U, parón 70 ms, destello ámbar, rótulo CRITICO |
| Demoledor | 10% de los críticos | x2.5 encima, sacudida 13U, parón 130 ms, destello blanco, rótulo DEMOLEDOR |

El **parón de impacto** (`hitStop`) es el truco prestado de los juegos de peleas:
congelar la imagen unas centésimas al conectar. Es lo que convierte un número
grande en un golpe que se siente.

Sube el daño manual esperado solo ~2%, así que no toca el balance.

## Cámara lenta al abatir un jefe

Impacto → congelación (`hitStop` 220 ms) → **cámara lenta** (`slow`, 1,15 s a
velocidad 0.26) → normal. Ese orden es el que hace que el golpe final se lea como
un logro y no como un aparato más. Va con rótulo "JEFE ABATIDO", destello blanco
y vibración del móvil.

**Nada de esto toca las mecánicas**, y esa fue la restricción de diseño:

- El bucle separa `dtR` (tiempo real) de `dt` (tiempo de animación). Combo y
  producción automática usan siempre `dtR`.
- Durante el parón, la cámara lenta y la muerte, el daño de los implantes se
  acumula como **deuda** (`deudaAuto`) y entra completo al reanudar. No se pierde
  ni un golpe.
- El HUD se refresca con `dtR`: si usa `dt` se congela junto con la imagen.

`gritar()` lleva prioridad porque el golpe final a un jefe suele ser un crítico, y
sin ella el rótulo "CRITICO" pisaba al de "JEFE ABATIDO".

## La sombra sigue a la cadena de transformaciones, no al revés

`posObj()` devolvía **el lado contrario** al que se dibuja el objeto. El dibujado
hace `translate(objX,ancY) → rotate(pend) → translate(0,L)`, y en esa cadena un
punto `(0,L)` acaba en `x = objX − L·sin(pend)`; `posObj()` **sumaba**. Medido con
`pend = 0.35`: devolvía x=666 con el objeto en x=514, 152 px al otro lado del
centro. De ahí que la sombra se moviera al revés.

Usaba además `largoCad` en vez de `L`, así que durante la caída de entrada
también quedaba descolgada. Corregidas las dos cosas, el error es **0 px en todo
el arco**. Ojo: `posObj()` la usan también `destPuno()` y los impactos, así que
el fallo desviaba el blanco de los puños, no solo la sombra.

## El dedo manda: nunca sustituir el punto del jugador

`golpear()` comprobaba si el toque caía dentro de la caja del sprite y, si no,
**lo tiraba y lo sustituía por un punto al azar cerca del centro**. Por eso al
pegarle abajo el golpe salía en el medio: no fallaba la conversión de
coordenadas, es que se descartaba el punto.

> El puño cae **exactamente** donde cae el dedo, sin excepción. Lo único que se
> encaja dentro del sprite es la **mordida**, porque un boquete fuera del dibujo
> no se vería. Medido en cinco posiciones, incluidas las esquinas: **0 px** de
> desvío.

## El fondo se mueve porque golpeas, no porque sí

La deriva continua la puse para que entre clic y clic hubiera algo que leer como
profundidad. Cansa y no se asocia a nada: un fondo que nunca para se vuelve
ruido. Ahora la cámara está atada a lo que haces —la carga oscilando y el
empujón de cada golpe— con solo un resto de deriva para que no parezca una foto
pegada.

Medido: **13 px de recorrido en 10 s en reposo** contra **158 px en los 6 s
siguientes a un golpe** — doce veces más. En ese golpe el primer plano recorre
182 px y el fondo lejano 8.

## `source-atop` se recorta al DESTINO, no al objeto

Trampa que costó dos rondas y un recuadro amarillo visible en pantalla.

La bruma de profundidad —lavar el objeto hacia el color del cielo al retroceder
en Z— se aplicaba con `source-atop` **sobre el lienzo principal**. Pero ahí el
destino es la escena entera: cielo y suelo lo cubren todo, así que el relleno no
se recortaba a nada y pintaba **el rectángulo completo** del sprite. En el
sector 1 el color de cielo es naranja: de ahí el recuadro amarillo al golpear.

> **La regla:** `source-atop` solo sirve de máscara si el lienzo contiene
> únicamente aquello a lo que quieres recortar. Sobre `og` (el sprite del
> aparato) funciona; sobre `ctx` (la pantalla) no enmascara nada.

Movida a `pintarAparato`, sobre `og`. Comprobado midiendo píxeles: dentro del
objeto el color se lava 94 unidades hacia el cielo, y **la esquina vacía del
sprite mantiene alfa 0**.

## Guardar de verdad en móvil

`beforeunload` **no se dispara en móviles** al cambiar de app ni al cerrarla —
está documentado, y es justo el momento en que hace falta. Con solo eso y un
`setInterval` de 5 s, en el teléfono se perdía lo último hecho.

Los fiables son **`visibilitychange`** (en cuanto la pantalla pasa a segundo
plano) y **`pagehide`**. Están puestos los cuatro, incluido `blur`, porque cada
plataforma cumple con uno distinto. Y además se guarda **justo después de cada
compra**, que es cuando más duele perderlo.

> El mecanismo de guardado en sí nunca estuvo roto: el ciclo completo
> guardar → borrar de memoria → cargar conserva los 12 campos. El fallo era
> **cuándo** se llamaba, no cómo.

## Nada puede pasar de 110 de radio

El sprite mide 220×220 con el centro en el medio, así que **cualquier cosa que
pase de 110 de radio se corta en recto contra el borde**. Los pinchos de los
jefes llegaban a 129 y dejaban un cuadrado visible alrededor, que parecía un
efecto mal hecho. Van limitados a 104.

Comprobado contando píxeles opacos en las cuatro filas del borde del sprite:
deben ser **0**.

## Tocar el juego cierra el panel

Con un panel abierto, el primer toque en la pantalla de juego lo cierra y **no
pega**; el segundo ya pega. Ir a buscar el botón CERRAR rompe el ritmo: en un
clicker la mano ya está sobre el objeto.

## Que un jefe dé miedo

Eran máquinas grandes, y una máquina grande es un aparato. Lo que la vuelve un
JEFE son cuatro cosas, aplicadas a los ocho a la vez con `amenaza()` — la misma
idea que `patina()`: una capa común en vez de retocar ocho diseños.

1. **Silueta armada.** Pinchos y cuchillas que **sobresalen del contorno**, en
   `destination-over` para que asomen por detrás sin tapar el cuerpo. Se leen
   antes que ningún detalle interior, porque el ojo procesa la silueta primero.
2. **Ojos que miran.** Es la señal de amenaza número uno del cerebro. Con pupila
   **vertical de depredador**, y **siguen al último golpe**: si te mira, te ha
   visto.
3. **Cicatrices.** Quemaduras y grietas: esta cosa ya ha matado antes.
4. **Luz de fragua.** El rojo sube desde abajo, y **sube más cuanto más herido
   está** — por dentro arde.

> **Dónde van los ojos es la mitad del significado.** Sueltos por el cuerpo caían
> en una pierna o en una oruga y se leían como pilotos. Van arriba y al centro, y
> cuando son dos van **emparejados a la misma altura**: dos luces a distinta
> altura no son una cara.

El jefe ocupa además más pantalla (1.24× frente a 1.14×; EL ASIMILADO, 1.34×).

## Los jefes se destruyen por capas

Un jefe no puede agujerearse de un golpe hasta el fondo. La mordida arranca
primero la chapa y deja ver **las tripas** (`interiorJefe`: costillar, haz de
cables, tuberías, engranajes y un núcleo al rojo), y solo cuando el daño avanza
esa misma mordida acaba perforando de lado a lado.

Se consigue rellenando por debajo con la capa interior —recortada a la silueta
original con `source-atop` sobre una copia de `OFF`— y volviendo a cortar con
`destination-out` solo las mordidas más antiguas (`k − 60 % del total`). Así las
mordidas viejas se van **profundizando** en vez de aparecer ya perforadas.

Dos ajustes que hicieron falta: las tripas casi negras convertían al jefe en una
mancha en cuanto perdía un tercio de vida (subidas de tono), y el anillo de
quemado se sumaba a ellas (bajado de `.9` a `.45` solo en jefes).

## Vuelan trozos del propio aparato

`trozos()` no es confeti: son pedazos con **el color real del aparato**,
muestreados de los píxeles opacos del sprite que se está dibujando
(`coloresDelObjeto`, cacheado por objeto e invalidado al cambiar de nivel). Salen
girando, con su canto oscuro, y caen con gravedad. En cada golpe (4 / 9 / 16
según sea normal, crítico o demoledor) y a puñados al reventar el objeto.

## Sistema de destrucción visual

1. El aparato se pinta en un lienzo oculto de 220x220 (`OFF`).
2. Al crearse se generan 64 "mordidas" en posiciones aleatorias (`nuevasMordidas`).
3. Según el daño se aplican las primeras `k = (1-vida)^1.55 * 64`: primero un
   círculo oscuro con `source-atop` (borde quemado) y luego un `destination-out`
   que arranca el material.
4. El exponente **1.55** hace que la destrucción se acelere al final. Con curva
   lineal el objeto se veía destruido con 60% de vida todavía.

El flash blanco de impacto usa un segundo lienzo (`FLS`) con `source-in`.

## Fondo: futurista y arrasado, sin apagar la paleta

Lo postapocalíptico está en **las formas rotas, no en bajar el color**. Capa
`dibujarRuinas`, entre el horizonte lejano y la bruma:

- **Torres partidas** en diagonal, con boquetes de impacto y ventanas encendidas
  que parpadean.
- Una **autopista elevada reventada** por la mitad, con el tramo caído colgando.
- **Cables** colgando entre torres y **carteles de neón** que aún parpadean.
- En el cielo, el astro va **partido por una grieta** y con un anillo de escombros
  en órbita.
- En el suelo, **charcos que devuelven el neón** y grietas en el asfalto.

Todo va **un punto por detrás** a propósito (alfa .62 en las torres, .38 en la
autopista): es fondo, y quien manda en la pantalla es el objeto.

## Fondo

- **Desguace en el suelo** (`dibujarDesguace`): cada sector amontona lo suyo —
  chapa doblada, bidones, ruedas y pilas de piezas, generados con PRNG propio y
  con opacidad según la profundidad. Sin ellos el suelo era una superficie vacía
  y el sitio no parecía un desguace.
- Cielo en degradado de tres paradas por sector + astro con anillo + bruma sobre
  el horizonte.
- Dos capas de silueta generadas con PRNG determinista (`silueta`, `prng`) para
  que no titilen entre frames, más estrellas y motas de colores (`dibujarMotas`).

## El personaje ya no está en pantalla (`PJ_VISIBLE`)

**Prueba en curso.** El protagonista no se pinta: la pantalla se queda con el
objeto y nada más, y el puño solo aparece en el instante del impacto. Para
volver a la vista anterior basta con poner `PJ_VISIBLE = true`.

Quitar al personaje obliga a mover el punto de impacto: si nadie pega desde
abajo, **el golpe tiene que caer donde cae el dedo**.

- `golpear(px, py)` recibe las coordenadas del `pointerdown`. Sin ellas (teclado,
  automático) usa un punto del objeto.
- `puntoEnObjeto()` deshace la cadena de transformaciones para pasar de píxel de
  pantalla a coordenada del sprite (0..220).
- `mordidaCercaDe()` **intercambia** dentro de la lista la mordida más cercana al
  dedo con la siguiente en salir. El boquete aparece donde has pegado y la curva
  de destrucción no cambia: solo cambia el orden en que se descubren. Medido:
  el boquete sale a **5-6 px del dedo**.
- El objeto **sale despedido al lado contrario** del golpe (`pendV += −offX·5.2`)
  y se inclina según dónde le des.

> **El cálculo del impacto va ANTES de `danar()`.** Calculado después, `k` ya ha
> avanzado y `mordidaCercaDe` ordena la mordida *siguiente*: el boquete salía un
> golpe tarde.

**El puñetazo** (`flashPuno` / `dibujarPunos`) entra volando desde fuera de
pantalla hacia el punto del dedo, aguanta el impacto y se va en 0.30 s, con
estela y anillo de contacto blanco. Va **grande** (`2.45·punoR`): es lo único que
representa al jugador, y pequeño se lee como una mancha.

Los brazos implantados **siguen calculando su fase** aunque no se dibujen — de
ella depende `impactoBrazo()` y con él el daño automático. Solo se salta el
pintado; ahora el impacto automático saca también un puñetazo, más pequeño.

## La animación del golpe

El puño tardaba 100 ms en llegar mientras el daño ya se había aplicado: el objeto
reaccionaba **antes** que el puño y el golpe se sentía desacoplado. Ahora el puño
**ya está puesto en el fotograma del clic** y el viaje se cuenta con la estela, no
con el tiempo — es como resuelve un juego de lucha un golpe rápido.

    0.00-0.12  ENTRADA    clavado, hundido en el objeto y aplastado en su eje
    0.12-0.46  ASENTADO   sale del hundimiento y recupera forma
    0.46-1.00  RETROCESO  se retira por donde vino y se apaga

Encima: **fotograma de impacto** (silueta blanca los primeros 70 ms — a 0.85 de
alfa tapaba el golpe entero, va a 0.42), anillo de contacto, esquirlas radiales y
**hit-stop en cada golpe** (22 ms normal, 50 crítico, 130 demoledor). El fotograma
congelado es la mitad de la sensación de impacto.

## Lotes de compra (x1 / x10 / MÁX)

Están en **PUÑO y en AUMENTOS**, y el modo es uno solo: al tocarlo en un panel se
marca en los dos.

`lote()` es común a las dos pestañas. **x1 y x10 dan el precio del lote entero**
aunque no llegue el dinero (así se ve cuánto falta); **MÁX da lo que alcanza
ahora mismo**. Respeta el tope de las mejoras con `mx` (la óptica para en 24).

> Antes las tarjetas mostraban siempre el precio de UNA sola aunque estuvieras en
> x10 o MÁX: los botones no cambiaban nada en pantalla y no sabías lo que ibas a
> pagar. Ahora el precio es el del lote y lleva un `×N` al lado.

## El botón de borrar no puede llevar el icono de reciclar

Llevaba el símbolo ♻ — el mismo que el RECICLAJE PROFUNDO, que es la mejora que
**quieres** hacer. Con el mismo icono para las dos cosas, tarde o temprano
alguien se borra la partida creyendo que sube de nivel. Ahora es una **✕ roja**,
y el aviso dice explícitamente que el reciclaje es otra cosa y está en NÚCLEOS.

## Los implantes tienen que verse

Al ocultar al personaje (`PJ_VISIBLE`) los brazos implantados se quedaron **sin
representación**: comprabas aumentos que no aparecían por ningún lado, y el texto
del panel seguía diciendo "los verás salir de tu espalda".

Solución sin devolver al personaje: `flashBrazo()` los hace **entrar en cuadro
desde fuera de pantalla**, pegar y retirarse. Van en metal oscuro con la punta
encendida en el color del sector, y **sin destello blanco, sin anillo y sin
estela** — esos tres son del puño del jugador.

**El implante lleva SU PROPIO puño**, un bloque de metal con nudillos y testigo.
Al principio se le pintaba encima el guante del jugador y el golpe automático
parecía darlo la persona: dos cosas distintas con la misma mano. El guante solo
se dibuja si `p.tipo !== "imp"`.

## El brazo que pega lo elige el dedo

`ladoPuno` se alternaba por turnos, así que tocabas a la izquierda y a veces
entraba el puño derecho cruzando toda la pantalla: el golpe no venía de donde
habías tocado. Ahora lo decide la posición (`px < CW*0.5`), y sin dedo —teclado—
se sigue alternando. Como `ladoPuno` también gobierna el panorama del sonido, el
golpe suena además por el oído correcto.

## Llevarla al móvil

Dos caminos montados, y **el APK es el bueno para su uso**: no necesita hosting
ni HTTPS, se instala pasando el archivo. La PWA queda para compartir por link.

### APK (Capacitor)

Misma estructura y mismos comandos que el proyecto **mandalas**, a propósito: si
los dos se manejan igual, no hay que recordar dos flujos.

    npm run apk        compila y deja _apk/PunoDeChatarra.apk
    npm run android    lo abre en Android Studio

- `dev/preparar-www.ps1` copia el juego a `www/`, que es lo que empaqueta
  Capacitor. **No copia `sw.js`**: dentro de una app nativa los archivos ya son
  locales, la caché no aporta nada y sí puede servir una versión vieja tras
  actualizar. El registro del SW falla en silencio si el archivo no está.
- `dev/compilar-apk.ps1` compila y renombra la salida.
- **Orientación vertical fijada** en `AndroidManifest.xml`: el juego está
  diseñado en vertical y Capacitor no lo bloquea por defecto.
- Paquete `com.jpmedina.chatarra`, mínimo Android 7.0 (API 24).

> La primera compilación se pasa de 10 minutos porque Gradle se descarga entero.
> Las siguientes son de **2 segundos**. No es que se haya colgado.

> El APK va firmado con la **clave de depuración**: se instala en el móvil pero
> no vale para Play Store, que pide un AAB con clave propia.

### PWA

    index.html · manifest.webmanifest · sw.js · los cuatro iconos

Los iconos se generan con `scratchpad/iconos.py` (Pillow) replicando la anatomía
del puño del juego, no un dibujo parecido. El *maskable* lleva más margen porque
Android le recorta las esquinas.

**Caché: red primero, caché de respaldo.** Con cobertura siempre se ve la última
versión; sin cobertura se sigue jugando. Al revés habría que desinstalar para ver
una actualización.

> **Al publicar hay que subir `VERSION` en `sw.js`.** Si no, el móvil sirve la
> copia vieja y parece que los cambios no se aplicaron. Fallo clásico de PWA.

El botón **INSTALAR EN EL MÓVIL** vive en NÚCLEOS y solo aparece cuando el
navegador ofrece el aviso (`beforeinstallprompt`): Chrome lo guarda y no lo
suelta salvo que se lo pidas.

Comprobado sirviendo desde **subcarpeta** (`/juegos/puno-de-chatarra/`) —importa
porque GitHub Pages sirve en `/nombre-del-repo/`— y **con el servidor apagado**,
donde el juego carga entero y se juega.

El proyecto ya no es un solo archivo. Ahora son cinco:

    index.html              el juego
    manifest.webmanifest    nombre, iconos, orientacion, colores
    sw.js                   service worker: caché y funcionamiento sin conexión
    icono-192.png  icono-512.png  icono-maskable.png

Los iconos se generan con `scratchpad/iconos.py` (Pillow) replicando la anatomía
del puño del juego, no un dibujo parecido. El *maskable* lleva más margen porque
Android le recorta las esquinas.

**Estrategia de caché: red primero, caché de respaldo.** Con cobertura siempre se
ve la última versión; sin cobertura se sigue jugando. Al revés (caché primero)
habría que desinstalar para ver una actualización.

> **Al publicar una versión nueva hay que subir `VERSION` en `sw.js`.** Si no, el
> móvil sirve la copia vieja y parece que los cambios no se aplicaron. Es el
> fallo clásico de las PWA.

El botón **INSTALAR EN EL MÓVIL** vive en NÚCLEOS y solo aparece cuando el
navegador ofrece el aviso (`beforeinstallprompt`): Chrome lo guarda y no lo
suelta salvo que se lo pidas, así que sin capturarlo el jugador tendría que
saber buscarlo en el menú.

**Requisito**: el service worker solo funciona por **HTTPS** o en `localhost`. En
local no estorba; en cuanto se publique, queda instalable y sin conexión.

## La anatomía del puño

Cuatro círculos iguales en fila y una elipse no leen como una mano: leen como una
fila de bultos. Un puño se entiende por tres cosas, y **ninguna estaba**:

1. **Los nudillos no son iguales ni van en línea recta.** El del índice es el más
   gordo y va más alto; el del meñique, el más pequeño y más bajo. Esa cuña
   (`NUD`) es lo que dice "mano" antes que ningún otro detalle.
2. **Debajo hay dedos.** Sin los cuatro segmentos doblados bajo los nudillos, no
   hay nada que explique por qué hay bultos ahí arriba.
3. **El pulgar cruza por encima.** Es la pieza que cierra el puño y tiene que
   verse *pisando* a los dedos: se repinta entero encima, con su sombra
   proyectada debajo.

Y para que no sea plano, la masa es un **trapecio** —ancha en los nudillos,
estrecha en la muñeca—. Eso es escorzo: el puño viene hacia ti.

**El volumen no sale de una mancha radial**, sale de la **oclusión** (lo que una
pieza le tapa a la de al lado: sombra de cada dedo sobre el siguiente, pliegue
donde entran en la palma) y de una **luz de canto** que solo toca el filo de
arriba, que es lo que lo separa del fondo.

> El pulgar como rectángulo redondeado se leía como una barra cruzada. Un pulgar
> real **sale gordo del canto de la mano y se adelgaza hacia la yema**: ese
> estrechamiento es lo que dice que envuelve. Lleva lomo iluminado a lo largo
> —el cilindro— y el pliegue de su nudillo.

## Seis formas de mano

El puño cerrado en todos los golpes acababa siendo un sello. Con seis formas de
artes marciales cada golpe se ve distinto **sin tocar nada de la mecánica**, y
además cuenta algo del personaje: quien pega así lleva años pegando.

    PUÑO · PALMA · CANTO (shuto) · LANZA (nukite) · GARRA · NUDILLO

`formaMano()` dibuja la silueta y el resto del sprite se adapta: los surcos entre
dedos van donde toca según la forma, y **la placa de nudillos pasa al dorso** en
las manos abiertas (en los nudillos no habría dónde ponerla).

- **En combate**: forma nueva en cada golpe, y **nunca repite la anterior** — dos
  seguidas iguales delatan el sorteo. Los golpes fuertes tiran de las formas más
  vistosas: comprobado con 300 tiradas, el golpe flojo saca PUÑO/PALMA/CANTO y el
  fuerte GARRA/LANZA.
- **En el retrato**: cada pose tiene **su** mano fija (`mano` en `POSES`), así
  GARRA va con zarpa y TIJERA con lanza.

Son 6 formas × 6 tramos × 4 vistas = **144 sprites**, todos cacheados por clave.

## El Archivo: la lista larga, y lo que falta EN SILUETA

Está en EQUIPO, debajo de las reliquias. Es lo que sostiene el juego a largo
plazo: **145 cosas** que desbloquear.

- **78 aparatos**, agrupados por sector. Se catalogan al romper uno de ese tipo.
  Los que faltan salen como **silueta oscura** con "· · ·" en vez del nombre.
- **5 turnos** (los héroes), los futuros en silueta.
- **55 logros** con barra de progreso; los no conseguidos ocultan el nombre pero
  enseñan la meta y por dónde vas ("322 / 1.00K").
- **7 reliquias**, en su propio bloque justo encima.

> La regla que lo hace funcionar: **una lista de lo que ya tienes no invita a
> volver; una lista de lo que te falta, sí.** Por eso lo bloqueado se enseña, no
> se esconde.

Las siluetas se generan del sprite real (`miniatura()`, cacheada por dato): el
mismo dibujo tintado de `#150f33` con `source-in`. Así la silueta ya insinúa la
forma y da curiosidad por saber qué es.

## Se empieza a puño limpio

El tramo 0 del guante era "Vendas raídas" — ya traía algo puesto, así que **no se
veía el escalón** entre no tener nada y tener la primera mejora. Ahora son
**Manos desnudas**: piel, pliegues de dedos, tendones y nudillos pelados, sin
muñequera. Seis tramos en vez de cinco:

    Manos desnudas → Vendas raídas → Guantes de cuero
    → Manoplas de acero → Exo-guantes de impacto → Puños de plasma

> Al insertar un tramo hay que **desplazar todas las condiciones de tramos
> altos** (`gl >= 3` de circuitos, resplandor, núcleo y chispas pasan a 4 y 5) o
> los efectos de gama alta se adelantan un escalón.

## El balanceo iba al lado del golpe

`pend` positivo mueve el objeto a la **izquierda** (`x = objX − sin(pend)·L`), así
que con el signo anterior pegarle por la izquierda lo empujaba también a la
izquierda: se iba **hacia** el puño en vez de huir de él.

> Mi comprobación de aquella ronda leía `pendV > 0` como "a la derecha" y era al
> revés, así que dio por bueno el comportamiento equivocado. Ahora la prueba mide
> la **x real de `posObj()` antes y después**, no el signo de la velocidad.

## Perder humanidad tiene que DAR algo

Antes era solo un número que bajaba: el jugador veía la barra caer y no entendía
qué estaba comprando con ella. Ahora cada tramo cruzado **arranca algo y deja
algo** — una `RELIQUIA` con efecto permanente y una línea que cuenta lo que
costó. Siete tramos, siete piezas, listadas en EQUIPO con las que faltan a media
opacidad para que se vea el camino.

| Tramo | Reliquia | Efecto |
|---|---|---|
| 85 % | Nudillos muertos | +6 % daño |
| 70 % | Servo anticipador | +8 al tope del combo |
| 55 % | Turno sin fin | +30 % producción sin conexión |
| 40 % | Manos prestadas | +10 % chatarra |
| 25 % | Firma de dron | la chispa aparece 30 % más seguido |
| 10 % | Pregunta sin respuesta | +15 % daño |
| 0 % | Vacante | desbloquea la Sucesión |

Medido con todas: daño ×1.22, combo 25 → 33, chatarra ×1.10.

## La Sucesión y EL ASIMILADO

Llegar a 0 % **no es Game Over ni un reinicio cualquiera**: el que estaba se
convierte en una máquina más y el puesto lo hereda otra persona. Cinco héroes
(`HEROES`) con **paleta propia de piel y traje** — si el siguiente fuera igual no
se notaría que ha muerto nadie. La pantalla de `releva()` nombra a quien cae y a
quien entra.

> Las **reliquias son del puesto, no de la persona**: las hereda quien venga
> detrás. Es lo que hace que la sucesión sea progreso y no castigo.

Y el anterior vuelve. `jAsimilado` es el único aparato del juego **con forma de
persona**: se dibuja con los colores del héroe caído —por eso se reconoce— pero
con la carne sustituida por placa, una sola ranura roja por ojo, injertos con
grapas y un brazo que acaba en muñón cableado. Aparece **cada 50 niveles** desde
la primera sucesión, con **3.7× la vida de un jefe normal** y un 24 % más grande.

## Tridimensionalidad al golpear

El aparato es plano, pero al recibir el golpe **gira sobre sus dos ejes** como si
tuviera fondo: si le pegas a la izquierda, ese lado se hunde hacia dentro. Se
finge con la matriz — coseno del giro para el escorzo y una cizalla proporcional
para la fuga — y vuelve con muelle, así que **rebota**. Es lo que hace la galleta
de Cookie Clicker, pero en dos ejes en vez de uno.

## La chispa: el bono que hay que CAZAR

La SOBRECARGA ya existía pero **saltaba sola**, y un premio que llega sin hacer
nada no se siente como un premio. Lo que hace funcionar a la galleta dorada de
Cookie Clicker no es el bono: es que **tienes que cazarlo**.

Cada 2-5 min cruza la pantalla un dron de rescate durante 9 s. Si lo tocas (radio
generoso, 2.2x el sprite) da uno de cuatro bonos por peso — comprobado con 600
capturas: 33 % SOBRECARGA x7 · 30 % BOTÍN · 27 % ENJAMBRE (implantes x5) · 10 %
NÚCLEO SUELTO. Tocarlo **no gasta el golpe**.

## El parte de turno

Al volver tras más de un minuto, en vez de un toast de una línea aparece un parte
con lo que hicieron los implantes sin ti **y dos bloques de narrativa**:

- **AFUERA** — cómo va el mundo, según `S.best`. La guerra ya se ganó; lo que
  queda es limpiarla, y cada sector recuperado tiene su línea (`MUNDO`, 10 tramos).
- **ADENTRO** — cómo va él, según `humanidad()`.

Es el otro reloj del juego: **el mundo se recompone mientras él se desmonta**, y
esa es la única razón narrativa para volver mañana.

## El sonido del golpe

Era **una sola capa y siempre idéntica**. Mil clics seguidos sonaban a
metralleta, y con un sonido que no cambia el cerebro deja de registrarlo como
algo que pasa: lo oye como un zumbido y la mano se cansa antes que el oído.

Un golpe son **tres capas que llegan juntas**:

1. **Chasquido** — 12-26 ms de ruido en paso alto. Es lo que dice "ha conectado".
2. **Cuerpo** — ráfaga filtrada que barre hacia abajo. Es lo que dice cuánto pesa.
3. **Sub** — seno que cae en picado de ~205 Hz a ~45. No se oye tanto como se nota.

Y **cada golpe cambia**: tono, corte del filtro, Q, duración, volumen, punto de
arranque dentro del buffer de ruido y **panorama según qué puño pega**. Medido:
ocho golpes seguidos dan ocho subgraves distintos.

**El combo sube el tono** hasta 11 semitonos (`208 Hz` con combo 1 → `400 Hz` con
combo 60). Encadenar se *nota en el oído*, no solo en el número.

El crítico no es "lo mismo más fuerte": lleva una **campana metálica** de tres
parciales inarmónicos encima. Un premio tiene que sonar **distinto**.

## Feedback (lo que hace que enganche)

Números flotantes en fuente bitmap con sombra y dispersión, críticos en amarillo
con `!`, el guante que viaja hasta el aparato, chispas y confeti de siete colores
con gravedad, anillos de choque, sacudida escalada por evento (1.4 golpe / 6
crítico / 11 jefe / 13 demoledor, en unidades `U`), parón de impacto, cámara
lenta, destello de pantalla completa, squash-and-stretch, el aparato nuevo cae
desde arriba, y el multiplicador de combo cambia de color (ámbar → naranja →
magenta).

Los guantes llevan contorno, sombra de volumen, brillo especular, pulgar,
muñequera y un detalle propio de cada tramo: tiras cruzadas en las vendas,
costuras y hebilla en el cuero, placa de nudillos con remaches en el acero,
circuitos encendidos en el exo y núcleo con chispas en órbita en el de plasma.

`navigator.vibrate` va detrás de dos guardas (que haya habido un toque real y que
el dispositivo sea táctil): sin ellas el navegador llena la consola de avisos.

## Layout

`redim()` fija la resolución del lienzo y calcula la escena entre el rótulo del
sector y la barra de vida, para que el HUD nunca tape al personaje. Un `ResizeObserver` sobre `#arena` la recalcula: el
panel lateral fija su alto después del primer layout y sin observarlo la escena
quedaba con una altura que ya no era la real.

## Controles

| Acción | Cómo |
|---|---|
| Golpear | Click / toque en cualquier parte de la escena, o barra espaciadora (alterna de puño solo) |
| Comprar | Click en la tarjeta |
| Comprar en lote | Botones x1 / x10 / MÁX en la pestaña Aumentos |
| Sonido | Botón ♫ |
| Borrar partida | Botón ♻ (pide confirmación) |

## Ideas pendientes

- Logros con recompensa (multiplicadores por hitos).
- Que la humanidad tenga precio mecánico además de narrativo: por ejemplo que
  baje el tope del combo, obligando a elegir entre automatizar o pegar más fuerte.
- Más terminales distintos para los brazos implantados según el sector.
- Más poses para el retrato, y que alguna se desbloquee al llegar a hitos.
- Que el jefe de cada sector suelte una pieza equipable única.
- Habilidad activa con enfriamiento (ej. "Furia": x10 al golpe por 15 s).
- Mejoras únicas de sector que solo aparecen al llegar a cierto punto.
- Que el aparato caiga con una animación distinta según el sector.
- Esquivar: que el aparato contraataque y haya que soltar el click, más Punch-Out.
- Empaquetar con Capacitor para Android, igual que `mandalas/`.
