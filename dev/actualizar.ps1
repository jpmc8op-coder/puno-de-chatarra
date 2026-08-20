# Actualiza el juego sin tener que escribir comandos.
#
# Se lanza con doble clic en ACTUALIZAR.bat (que esta en la raiz del proyecto).
#
# Hace lo que haria a mano, pero sin que se pueda olvidar ningun paso. En
# concreto: al publicar en la web SUBE SOLO el numero de VERSION de sw.js. Ese
# olvido es el fallo clasico de las PWA — el movil sigue sirviendo la copia
# guardada y parece que los cambios no se aplicaron.

$ErrorActionPreference = 'Stop'
$base = Split-Path $PSScriptRoot -Parent
Set-Location $base

function Titulo($t) {
  Write-Host ""
  Write-Host "  $t" -ForegroundColor Cyan
  Write-Host "  $('-' * $t.Length)" -ForegroundColor DarkCyan
}

Write-Host ""
Write-Host "  PUNO DE CHATARRA - actualizar" -ForegroundColor Yellow
Write-Host ""
Write-Host "    1  Publicar en la web       (sube a GitHub Pages)"
Write-Host "    2  Compilar el APK          (deja _apk\PunoDeChatarra.apk)"
Write-Host "    3  Las dos cosas"
Write-Host "    0  Salir"
Write-Host ""
$op = Read-Host "  Que hago"

if ($op -eq '0' -or [string]::IsNullOrWhiteSpace($op)) { return }
if ($op -notin @('1','2','3')) { Write-Host "  Opcion no valida." -ForegroundColor Red; return }

$web = $op -in @('1','3')
$apk = $op -in @('2','3')

# ---------- WEB ----------
if ($web) {
  Titulo "Preparando la version web"

  # Sube el numero de version de la cache. Sin esto, el movil sirve la copia vieja.
  $swPath = Join-Path $base 'sw.js'
  $sw = Get-Content $swPath -Raw
  if ($sw -match 'const VERSION = "pdc-v(\d+)"') {
    $n = [int]$Matches[1] + 1
    $sw = $sw -replace 'const VERSION = "pdc-v\d+"', "const VERSION = `"pdc-v$n`""
    Set-Content $swPath $sw -NoNewline -Encoding UTF8
    Write-Host "  Cache de la web: pdc-v$($n-1) -> pdc-v$n" -ForegroundColor Green
  } else {
    Write-Host "  AVISO: no encontre VERSION en sw.js, no lo he tocado." -ForegroundColor Yellow
  }

  $cambios = git status --porcelain
  if ([string]::IsNullOrWhiteSpace($cambios)) {
    Write-Host "  No hay nada que publicar: ya esta todo subido." -ForegroundColor DarkGray
  } else {
    Write-Host ""
    $msg = Read-Host "  Que cambiaste (una linea)"
    if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Cambios del $(Get-Date -Format 'd MMM yyyy')" }

    git add -A
    git commit -q -m $msg
    Titulo "Subiendo a GitHub"
    git push -q origin main
    if ($LASTEXITCODE -ne 0) { throw "El push fallo. Revisa la conexion o las credenciales." }
    Write-Host "  Subido." -ForegroundColor Green
    Write-Host "  En 1-2 minutos estara en:" -ForegroundColor DarkGray
    Write-Host "  https://jpmc8op-coder.github.io/puno-de-chatarra/" -ForegroundColor Cyan
  }
}

# ---------- APK ----------
if ($apk) {
  Titulo "Compilando el APK"
  Write-Host "  (la primera vez tarda; despues son segundos)" -ForegroundColor DarkGray
  npm run apk
  if ($LASTEXITCODE -ne 0) { throw "La compilacion fallo." }
}

Write-Host ""
Write-Host "  Listo." -ForegroundColor Green
