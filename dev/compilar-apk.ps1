# Compila el APK de depuracion y lo deja en `_apk/` con nombre legible.
#
# APK de DEPURACION, no de tienda: va firmado con la clave de debug que genera
# Android, asi que se instala en el movil activando "origenes desconocidos" pero
# NO sirve para subir a Google Play. Para la tienda hace falta un AAB firmado
# con clave propia, y eso es otro paso.
#
# Uso:  npm run apk

$base = Split-Path $PSScriptRoot -Parent
$and  = Join-Path $base 'android'
$dest = Join-Path $base '_apk'

Push-Location $and
try {
  & .\gradlew.bat assembleDebug --console=plain
  if ($LASTEXITCODE -ne 0) { throw "Gradle fallo con codigo $LASTEXITCODE" }
} finally {
  Pop-Location
}

$apk = Join-Path $and 'app\build\outputs\apk\debug\app-debug.apk'
if (-not (Test-Path $apk)) { throw "No se genero el APK en $apk" }

New-Item -ItemType Directory -Force $dest | Out-Null
$final = Join-Path $dest 'PunoDeChatarra.apk'
Copy-Item $apk $final -Force

$mb = [math]::Round((Get-Item $final).Length / 1MB, 2)
Write-Output ""
Write-Output "APK listo: $final  ($mb MB)"
