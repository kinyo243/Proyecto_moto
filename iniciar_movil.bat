@echo off
title TallerMoto Pro - Servidor Movil (Expo)

echo ======================================================================
echo           TALLERMOTO PRO - VERSION MOVIL (ESTILO FINA)
echo ======================================================================
echo.

set "ROOT_DIR=d:\Personal - Laptop\Proyecto_moto"
cd /d "%ROOT_DIR%\mobile"

echo Selecciona como deseas abrir la aplicacion movil:
echo.
echo   [1] MODO TUNEL (RECOMENDADO para celular: funciona aunque tengas VPN o datos moviles)
echo   [2] MODO WEB (Abre la app movil directamente en el navegador de tu computadora)
echo   [3] MODO LAN (Red local Wi-Fi convencional)
echo.
set /p MODO="Elige una opcion (1, 2 o 3, por defecto 1): "

if "%MODO%"=="2" (
    echo.
    echo Iniciando Expo en modo Web...
    call npx expo start --web
) else if "%MODO%"=="3" (
    echo.
    echo Iniciando Expo en modo LAN...
    call npx expo start --lan
) else (
    echo.
    echo Iniciando Expo en modo TUNEL (ideal para Expo Go en cualquier telefono)...
    call npx expo start --tunnel
)

pause
