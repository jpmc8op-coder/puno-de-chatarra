# Llevar el juego al móvil

Hay dos caminos, y los dos están montados. **El APK es el que necesitas** para
tenerlo en tu teléfono; la PWA es para compartirlo por link.

---

## A. APK (recomendado) — no necesita internet ni hosting

El APK ya está compilado en `_apk/PunoDeChatarra.apk` (5 MB).

### Instalarlo en tu Android

1. Pasa el archivo al móvil: cable USB, WhatsApp a ti mismo, Drive, lo que sea.
2. Ábrelo desde el móvil. Android pedirá permiso para instalar de "orígenes
   desconocidos" — es normal en apps que no vienen de la Play Store.
3. Listo. Queda con su icono, a pantalla completa y **bloqueado en vertical**.

### Recompilar después de tocar el juego

```bash
npm run apk
```

Eso copia el juego a `www/`, sincroniza Capacitor y compila. La primera vez tarda
(Gradle se descarga entero); después son **2 segundos**.

Si además quieres abrirlo en Android Studio: `npm run android`.

---

## B. PWA — para compartirlo por link

1. Entra a **https://app.netlify.com/drop**
2. Arrastra la carpeta entera. Te da una URL con HTTPS.
3. En el móvil: pestaña **NÚCLEOS** → **INSTALAR EN EL MÓVIL**.
   En iPhone tiene que ser desde **Safari** (Compartir → Añadir a pantalla de
   inicio); iOS no deja instalar PWAs desde Chrome.

**Al publicar una versión nueva, sube `VERSION` en `sw.js`** (`pdc-v1` →
`pdc-v2`). Si no, el móvil sirve la copia guardada y parece que no se aplicó
nada. Es el fallo más común de las PWA.

---

## Detalles que conviene no olvidar

**`sw.js` no entra en el APK, a propósito.** Dentro de una app nativa los
archivos ya son locales, así que la caché no aporta nada y sí puede dejar servida
una versión vieja tras actualizar. El registro del service worker en `index.html`
falla en silencio si el archivo no está, que es justo lo que queremos.

**El APK va firmado con la clave de depuración de Android.** Se instala sin
problema en tu móvil, pero **no sirve para subir a Google Play**: la tienda pide
un AAB firmado con clave propia. Ese es otro paso, y solo merece la pena si vas a
publicarla en serio (además de los 25 USD únicos de Google y la ficha de tienda).

**Datos de la app**

    paquete    com.jpmedina.chatarra
    versión    1.0 (versionCode 1)
    Android    mínimo 7.0 (API 24), objetivo API 36
    orientación vertical, fijada en AndroidManifest.xml

Para publicar una versión nueva en tienda habría que subir `versionCode` en
`android/app/build.gradle`.

---

## Comprobado

- APK compilado y verificado con `aapt2`: paquete, etiqueta "Puño de Chatarra",
  actividad de lanzamiento y orientación vertical correctas.
- Contenido del APK: `index.html` y los iconos dentro, **`sw.js` fuera**.
- La versión PWA, servida desde una **subcarpeta** (`/juegos/puno-de-chatarra/`):
  manifest, iconos y service worker responden bien. Importa porque GitHub Pages
  sirve en `/nombre-del-repo/`.
- **Con el servidor apagado**: el juego carga entero y se juega. El modo sin
  conexión funciona de verdad.
