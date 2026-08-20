# Puño de Chatarra

Clicker de demolición. La guerra contra las máquinas ya se ganó; lo que queda es
desguazar lo que dejaron, a puñetazos. Funciona en el navegador, sin cuenta, sin
conexión y sin instalar nada.

**Probarlo:** _(pendiente de publicar)_

## Qué hace

- **Se golpea donde tocas.** El boquete sale en el punto del dedo, el objeto sale
  despedido al lado contrario y gira sobre sus dos ejes como si tuviera fondo.
- **78 aparatos en 7 sectores**, más 7 jefes, todos dibujados por código en clave
  Metal Slug: remaches, orugas, chapas soldadas y tripas a la vista.
- **Los jefes se destruyen por capas:** primero salta la chapa y asoman las
  tripas, y solo después se perfora de lado a lado.
- **La automatización son implantes tuyos**, no ayudantes. Cada uno te quita
  humanidad, y cada tramo perdido te deja una **reliquia** con efecto permanente.
- **La Sucesión:** al llegar a 0 % de humanidad te conviertes en una máquina más y
  el puesto lo hereda otra persona. El anterior vuelve, del otro lado, como jefe.
- **El Archivo:** 78 aparatos, 55 logros, 5 turnos y 7 reliquias. Lo que aún no
  has desbloqueado se ve **en silueta**.
- **La chispa:** cada pocos minutos cruza un dron de rescate. Si lo cazas, bono.
- **Parte de turno:** al volver tras un rato, un informe de lo que hicieron tus
  implantes sin ti y de cómo va el mundo ahí fuera.

## Cómo correrlo

Doble clic en `index.html` funciona para todo menos la instalación como app.
Para eso hace falta servirlo por HTTP:

```bash
python -m http.server 8790
```

y abrir `http://localhost:8790`.

## Cómo llevarlo al móvil

```bash
npm install     # solo la primera vez
npm run apk     # deja _apk/PunoDeChatarra.apk
```

Los dos caminos —APK y PWA— están explicados en [`PUBLICAR.md`](PUBLICAR.md).

## Cómo está hecho

Un solo archivo, `index.html`, con HTML + CSS + JavaScript y **cero
dependencias** en tiempo de ejecución. Todo el dibujo es Canvas 2D generado por
código: no hay una sola imagen en el juego. Las decisiones de diseño y las
trampas encontradas están en [`CLAUDE.md`](CLAUDE.md).

| Archivo | Qué es |
|---|---|
| `index.html` | El juego completo. |
| `sw.js` | Service worker: caché sin conexión. |
| `manifest.webmanifest`, `icono-*.png` | Instalación como app. |
| `capacitor.config.json`, `android/` | Empaquetado nativo (APK). |
| `dev/` | Scripts de compilación y materiales de tienda. |
| `PUBLICAR.md` | Cómo publicarlo y cómo instalarlo. |

## Licencia

Pendiente de definir.
