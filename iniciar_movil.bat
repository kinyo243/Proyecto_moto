@echo off
title TallerMoto Pro - Servidor Movil (Expo)

echo ======================================================================
echo           TALLERMOTO PRO - VERSION MOVIL (ESTILO FINA)
echo ======================================================================
echo.

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
cd /d "%ROOT_DIR%\mobile"

echo Como deseas iniciar la version movil?
echo.
echo   [1] MODO CELULAR (Muestra codigo QR para escanear en Expo Go)
echo   [2] MODO NAVEGADOR WEB (Abre la app movil directamente en tu PC)
echo.
set /p MODO="Elige una opcion (1 o 2, por defecto 1): "

if "%MODO%"=="2" (
    echo.
    echo Iniciando app movil en navegador web...
    call npx expo start --web
) else (
    echo.
    echo Iniciando Metro Bundler y generando codigo QR para Expo Go...
    echo (Asegurate de que tu telefono este en la misma red Wi-Fi)
    echo.
    call npx expo start --lan
)

echo.
echo ======================================================================
echo Servidor detenido.
pause
