@echo off
title TallerMoto Pro - Sincronizador de GitHub
color 0A

echo ======================================================================
echo           TALLERMOTO PRO - SINCRONIZADOR DE GITHUB
echo ======================================================================
echo.

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
cd /d "%ROOT_DIR%"

echo [1/4] Verificando cambios locales en el proyecto...
echo.
git status -s
echo.

set "DEFAULT_MSG=Actualizacion TallerMoto Pro - %DATE% %TIME:~0,5%"
set /p USER_MSG="Ingresa una descripcion del cambio (o presiona Enter para usar '%DEFAULT_MSG%'): "

if "%USER_MSG%"=="" (
    set "COMMIT_MSG=%DEFAULT_MSG%"
) else (
    set "COMMIT_MSG=%USER_MSG%"
)

echo.
echo [2/4] Agregando archivos al control de versiones...
git add -A

echo.
echo [3/4] Creando commit: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%" > nul 2>&1

echo.
echo [4/4] Sincronizando con GitHub (rama main)...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   [EXITO] Proyecto sincronizado correctamente con GitHub!
    echo   Repositorio: https://github.com/kinyo243/Proyecto_moto
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo   [AVISO] Hubo un problema al subir a GitHub.
    echo   Verifica tu conexion a internet o tus credenciales en el navegador.
    echo ======================================================================
)

echo.
pause
