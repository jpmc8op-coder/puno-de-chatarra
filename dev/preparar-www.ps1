# Copia la app web a `www/`, que es la carpeta que empaqueta Capacitor.
#
# Por que esta copia y no se apunta Capacitor a la raiz: en la raiz estan el
# repo, la documentacion y `node_modules`. Capacitor mete en el APK TODO lo que
# haya en su `webDir`.
#
# `sw.js` NO se copia a proposito. Dentro de una app nativa los archivos ya son
# locales, asi que la cache no aporta nada, y si puede dejar servida una version
# vieja despues de actualizar. El registro del service worker en `index.html`
# falla en silencio si el archivo no esta, que es justo lo que queremos.
#
# Correr esto cada vez que se toque el juego, y despues `npx cap copy`.
# (`npm run sync` hace las dos cosas.)

$base = Split-Path $PSScriptRoot -Parent
$www  = Join-Path $base 'www'

New-Item -ItemType Directory -Force $www | Out-Null
Get-ChildItem $www -File -ErrorAction SilentlyContinue | Remove-Item -Force

$archivos = @(
  'index.html',
  'intro.mp4',
  'manifest.webmanifest',
  'privacidad.html',
  'icono-192.png',
  'icono-512.png',
  'icono-maskable.png',
  'icono-1024.png'
)
foreach ($a in $archivos) {
  Copy-Item (Join-Path $base $a) (Join-Path $www $a) -Force
}

# `assets/` es lo que lee @capacitor/assets para generar los iconos y la
# pantalla de arranque nativos. Son copias de icono-1024.png, por eso se
# regeneran aqui en vez de versionarse.
$assets = Join-Path $base 'assets'
New-Item -ItemType Directory -Force $assets | Out-Null
Copy-Item (Join-Path $base 'icono-1024.png') (Join-Path $assets 'logo.png') -Force
Copy-Item (Join-Path $base 'icono-1024.png') (Join-Path $assets 'icon.png') -Force

Get-ChildItem $www -File | Select-Object Name, Length
