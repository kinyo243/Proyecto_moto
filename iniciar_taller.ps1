Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          TALLERMOTO PRO - SISTEMA DE GESTION DE TALLER (MVP 1.0)     " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
Set-Location $rootDir

Write-Host "[1/3] Verificando e inicializando base de datos local y usuarios..." -ForegroundColor Yellow
& ".\.venv\Scripts\python.exe" seed_users.py | Out-Null
Write-Host "      - Base de datos y usuarios listos." -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Levantando Backend (FastAPI en http://localhost:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload"

Write-Host "[3/3] Levantando Frontend (React + Vite en http://localhost:5173)..." -ForegroundColor Yellow
$frontendDir = Join-Path $rootDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev -- --port 5173 --host"

Write-Host ""
Write-Host "Esperando 4 segundos a que los servidores inicialicen..." -ForegroundColor Gray
Start-Sleep -Seconds 4

Write-Host "Abriendo navegador en la aplicacion..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  SISTEMA INICIADO EXITOSAMENTE" -ForegroundColor Green
Write-Host ""
Write-Host "  - Frontend: http://localhost:5173"
Write-Host "  - Backend Swagger Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "  Credenciales de prueba:" -ForegroundColor White
Write-Host "    * Administrador: admin@taller.com / admin123"
Write-Host "    * Recepcionista: recepcion@taller.com / recepcion123"
Write-Host "    * Mecanico: mecanico@taller.com / mecanico123"
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  (Puedes minimizar las ventanas secundarias mientras usas el sistema)"