@echo off
title TallerMoto Pro - Servidor Movil (Expo)

echo ======================================================================
echo           TALLERMOTO PRO - VERSION MOVIL (ESTILO FINA)
echo ======================================================================
echo.

set "ROOT_DIR=d:\Personal - Laptop\Proyecto_moto"
cd /d "%ROOT_DIR%\mobile"

if not exist node_modules (
    echo [1/2] Instalando dependencias de la app movil...
    call npm install
)

echo [2/2] Iniciando servidor Expo...
echo.
echo Escanea el codigo QR que aparecera abajo con la app Expo Go en tu celular.
echo O presiona la tecla 'w' para abrirlo en el navegador web.
echo ======================================================================
echo.

call npx expo start
pause
