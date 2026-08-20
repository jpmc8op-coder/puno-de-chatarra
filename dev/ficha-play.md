# Ficha de Google Play — borrador

Todo lo de esta página se copia y pega en Play Console. Los límites de
caracteres son los que impone la tienda; los textos ya están dentro.

---

## Nombre de la aplicación · máx. 30

```
Puño de Chatarra
```
*(16 caracteres)*

## Descripción corta · máx. 80

```
Rompe chatarra a puñetazos. Clicker sin conexión, sin anuncios y sin compras.
```
*(76 caracteres)*

## Descripción completa · máx. 4000

```
La guerra contra las máquinas ya se ganó. Lo que queda es desguazar lo que
dejaron, a puñetazos.

Puño de Chatarra es un clicker de demolición: tocas, rompes, mejoras y vuelves
a romper. Pero el golpe cae DONDE tocas: el boquete sale en el punto del dedo,
el objeto sale despedido al lado contrario y gira como si tuviera fondo.

QUÉ VAS A ROMPER
• 78 aparatos repartidos en 7 sectores, del vertedero doméstico al cráter donde
  se apagó la IA.
• 7 jefes que se destruyen por capas: primero salta la chapa y asoman las
  tripas, y solo después se perfora de lado a lado.
• Todo dibujado a mano por código. No hay una sola imagen en el juego.

EL PRECIO DE PEGAR MÁS FUERTE
• La producción automática no son ayudantes: son implantes tuyos.
• Cada implante te quita humanidad. Y cada tramo perdido te deja una reliquia
  con efecto permanente y una línea que cuenta lo que costó.
• Al llegar a 0 % te conviertes en una máquina más y el puesto lo hereda otra
  persona. El anterior vuelve. Del otro lado.

PARA VOLVER MAÑANA
• El Archivo: 78 aparatos, 55 logros, 5 turnos y 7 reliquias. Lo que aún no has
  desbloqueado se ve en silueta.
• Cada pocos minutos cruza un dron de rescate: si lo cazas, bono.
• Al volver tras un rato, un parte de lo que hicieron tus implantes sin ti — y
  de cómo va el mundo ahí fuera, que se recompone mientras tú te desmontas.

SIN LETRA PEQUEÑA
• Funciona sin conexión, en avión y sin cobertura.
• Sin anuncios, sin compras dentro de la app, sin cuentas y sin registro.
• No recoge ningún dato. La partida se queda en tu teléfono.
```

## Categoría

```
Juegos → Casual
```

## Etiquetas sugeridas

```
clicker · idle · incremental · sin conexión · pixel · post-apocalíptico
```

## Clasificación de contenido

Cuestionario de Play: violencia **fantástica y sin sangre** (se destruyen
máquinas y objetos, no personas). Sin lenguaje soez, sin contenido sexual, sin
apuestas, sin compras, sin interacción entre usuarios.

## Política de privacidad

URL pública de `privacidad.html`. Con GitHub Pages queda en:

```
https://<usuario>.github.io/puno-de-chatarra/privacidad.html
```

## Seguridad de los datos (Data safety)

Play lo pregunta aparte del cuestionario. Las respuestas son:

- ¿Recoge o comparte datos del usuario? **No.**
- ¿Los datos van cifrados en tránsito? **No aplica** (no hay envío de datos).
- ¿Se pueden solicitar la eliminación de los datos? **No aplica** (no hay datos
  en servidores; el propio juego incluye un botón de borrado total).

---

## Material gráfico que falta preparar

| Pieza | Requisito de Play |
|---|---|
| Icono | 512 × 512 PNG — usar `icono-512.png` |
| Gráfico destacado | 1024 × 500 PNG |
| Capturas de teléfono | mínimo 2, entre 320 y 3840 px de lado |

Para las capturas: abrir el juego en el navegador, poner la ventana en tamaño
móvil (375 × 812) y capturar la pantalla de juego, el Archivo, EQUIPO y el parte
de turno.

---

## Antes de subir nada

El APK de `_apk/` va firmado con la **clave de depuración** y Play lo rechaza.
Para la tienda hace falta:

1. Generar una clave propia (`keytool -genkey -v -keystore ...`) y **guardarla a
   buen recaudo**: si se pierde, no se puede volver a publicar la misma app.
2. Configurar la firma en `android/app/build.gradle`.
3. Compilar un **AAB**, no un APK: `.\gradlew.bat bundleRelease`.
4. Subir `versionCode` en `android/app/build.gradle` en cada versión nueva.
5. Pagar la cuota única de 25 USD de la cuenta de desarrollador.
