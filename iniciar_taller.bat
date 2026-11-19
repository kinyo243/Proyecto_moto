@echo off
title TallerMoto Pro - Iniciador del Sistema

echo ======================================================================
echo           TALLERMOTO PRO - SISTEMA DE GESTION DE TALLER (MVP 1.0)
echo ======================================================================
echo.

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo [1/3] Verificando e inicializando base de datos local y usuarios...
cd /d "%ROOT_DIR%"
.\.venv\Scripts\python seed_users.py > nul 2>&1
echo       - Base de datos y usuarios listos.
echo.

echo [2/3] Levantando Backend (FastAPI en http://localhost:8000)...
start "TallerMoto - Backend API" cmd /k "cd /d "%ROOT_DIR%" && .\.venv\Scripts\python -m uvicorn app.main:app --port 8000 --host 0.0.0.0 --reload"

echo [3/3] Levantando Frontend (React + Vite en http://localhost:5173)...
start "TallerMoto - Frontend Web" cmd /k "cd /d "%ROOT_DIR%\frontend" && npm run dev -- --port 5173 --host"

echo.
echo Esperando 4 segundos a que los servidores inicialicen...
timeout /t 4 /nobreak > nul

echo Abriendo navegador en la aplicacion...
start http://localhost:5173

echo ======================================================================
echo   SISTEMA INICIADO EXITOSAMENTE
echo.
echo   - Frontend: http://localhost:5173
echo   - Backend Swagger Docs: http://localhost:8000/docs
echo.
echo   Credenciales de prueba:
echo     * Administrador: admin@taller.com / admin123
echo     * Recepcionista: recepcion@taller.com / recepcion123
echo     * Mecanico: mecanico@taller.com / mecanico123
echo ======================================================================
echo   (Puedes minimizar estas ventanas mientras usas el sistema)
echo.
pause