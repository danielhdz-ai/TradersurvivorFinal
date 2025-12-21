@echo off
echo ============================================
echo   DESPLIEGUE RAPIDO A VERCEL
echo ============================================
echo.

REM Verificar si Git esta instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git no esta instalado. Descargalo de: https://git-scm.com
    pause
    exit /b 1
)

echo 📦 Preparando archivos...
git add .

echo.
set /p commit_msg="💬 Mensaje del commit (Enter para 'Update'): "
if "%commit_msg%"=="" set commit_msg=Update

echo.
echo 💾 Guardando cambios: "%commit_msg%"
git commit -m "%commit_msg%"

echo.
echo 🚀 Subiendo a GitHub...
git push

echo.
echo ============================================
echo ✅ CAMBIOS SUBIDOS EXITOSAMENTE
echo.
echo Vercel desplegara automaticamente en:
echo 30-60 segundos
echo.
echo Verifica en: https://vercel.com/dashboard
echo ============================================
echo.
pause
