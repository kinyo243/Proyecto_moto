@echo off
title TallerMoto Pro - Sincronizador de GitHub
color 0A

echo ======================================================================
echo           TALLERMOTO PRO - SINCRONIZADOR DE GITHUB
echo ======================================================================
echo.

set "ROOT_DIR=d:\Personal - Laptop\Proyecto_moto"
cd /d "%ROOT_DIR%"

echo [1/4] Verificando estado local del proyecto...
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
git commit -m "%COMMIT_MSG%"

echo.
echo [4/4] Subiendo cambios a GitHub (repositorio: Proyecto_moto)...
git push -u origin master

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo   [EXITO] Cambios subidos correctamente a GitHub!
    echo   Repositorio: https://github.com/kinyo243/Proyecto_moto
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo   [AVISO] Hubo un detalle al subir con 'master', intentando con 'main'...
    git branch -M main
    git push -u origin main
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo   [EXITO] Cambios subidos correctamente a la rama 'main'!
        echo   Repositorio: https://github.com/kinyo243/Proyecto_moto
    ) else (
        echo.
        echo   [ATENCION] No se pudo conectar con GitHub.
        echo   1. Asegurate de haber creado el repositorio 'Proyecto_moto' en:
        echo      https://github.com/new
        echo   2. Si te solicita iniciar sesion en el navegador, autoriza el acceso.
    )
    echo ======================================================================
)

echo.
pause
