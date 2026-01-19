# setup-mkcert.ps1
# PowerShell helper to create local HTTPS certs using mkcert (Windows)
# Usage: Open PowerShell as Administrator, then: .\scripts\setup-mkcert.ps1

$certDir = "${PWD}\ .certs" -replace ' ', ''
if (-not (Test-Path $certDir)) { New-Item -ItemType Directory -Path $certDir | Out-Null }

Write-Host "[mkcert] Target cert dir: $certDir"

# Check for mkcert
$mkcert = Get-Command mkcert -ErrorAction SilentlyContinue
if (-not $mkcert) {
  Write-Host "mkcert no está instalado. Instala mkcert desde: https://github.com/FiloSottile/mkcert#installation" -ForegroundColor Yellow
  Write-Host "En Windows puedes usar Chocolatey: choco install mkcert" -ForegroundColor Yellow
  Exit 1
}

# Install local CA if needed
Write-Host "[mkcert] Instalando CA local (si no existe)..."
mkcert -install

# Detect local IPv4 addresses (excluding loopback)
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.AddressState -eq 'Preferred' } | Select-Object -ExpandProperty IPAddress
$hosts = @('localhost','127.0.0.1') + $ips
$hostsUnique = $hosts | Sort-Object -Unique
$hostsArg = $hostsUnique -join ' '

Write-Host "[mkcert] Generating cert for: $hostsArg"
$certFile = Join-Path $certDir 'dev-cert.pem'
$keyFile = Join-Path $certDir 'dev-key.pem'

mkcert -cert-file $certFile -key-file $keyFile $hostsArg

if (Test-Path $certFile -and Test-Path $keyFile) {
  Write-Host "[mkcert] Certificates generated:"
  Write-Host "  Cert: $certFile"
  Write-Host "  Key : $keyFile"
  Write-Host "
Next steps:
  1) Set environment variables (create .env file in project root):
     VITE_USE_HTTPS=true
     VITE_HTTPS_CERT=./.certs/dev-cert.pem
     VITE_HTTPS_KEY=./.certs/dev-key.pem
  2) Restart dev server with: npm run dev
  3) Access via: https://<your-ip>:5173 (Chrome may warn but mkcert CA should be trusted)
"
} else {
  Write-Host "[mkcert] No se pudieron generar los certificados." -ForegroundColor Red
  Exit 1
}