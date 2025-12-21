@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 SUBIR TRADER SURVIVOR A VERCEL - AUTOMÁTICO       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Este script subirá tu aplicación a Vercel automáticamente.
echo.
echo ⚠️  IMPORTANTE: Necesitas tener instalado:
echo    - Git (https://git-scm.com/download/win)
echo    - Node.js (https://nodejs.org)
echo.
pause
echo.

REM Verificar si Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Git no está instalado
    echo.
    echo 📥 Descárgalo desde: https://git-scm.com/download/win
    echo.
    echo Después de instalarlo, ejecuta este script de nuevo.
    echo.
    start https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git detectado
echo.

REM Verificar si Node está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo 📥 Descárgalo desde: https://nodejs.org
    echo.
    echo Después de instalarlo, ejecuta este script de nuevo.
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: npm no está instalado (viene con Node.js)
    echo.
    echo Reinstala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ npm detectado
echo.

echo ════════════════════════════════════════════════════════════
echo  PASO 1: Instalando Vercel CLI
echo ════════════════════════════════════════════════════════════
echo.

call npm install -g vercel

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error instalando Vercel CLI
    echo.
    echo Intenta manualmente con: npm install -g vercel
    pause
    exit /b 1
)

echo.
echo ✅ Vercel CLI instalado
echo.

echo ════════════════════════════════════════════════════════════
echo  PASO 2: Configurando Git (si no está configurado)
echo ════════════════════════════════════════════════════════════
echo.

git config user.name >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 👤 Configurando Git...
    echo.
    set /p GIT_NAME="Ingresa tu nombre: "
    set /p GIT_EMAIL="Ingresa tu email: "
    git config --global user.name "!GIT_NAME!"
    git config --global user.email "!GIT_EMAIL!"
    echo.
    echo ✅ Git configurado
    echo.
) else (
    echo ✅ Git ya está configurado
    echo.
)

echo ════════════════════════════════════════════════════════════
echo  PASO 3: Inicializando repositorio Git
echo ════════════════════════════════════════════════════════════
echo.

if not exist ".git" (
    git init
    echo ✅ Repositorio Git creado
    echo.
) else (
    echo ⚠️  Repositorio Git ya existe
    echo.
)

REM Crear .gitignore
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo *.log >> .gitignore
echo .DS_Store >> .gitignore
echo .vercel >> .gitignore
echo Thumbs.db >> .gitignore
echo desktop.ini >> .gitignore

echo ✅ .gitignore creado
echo.

echo ════════════════════════════════════════════════════════════
echo  PASO 4: Preparando archivos para Vercel
echo ════════════════════════════════════════════════════════════
echo.

REM Verificar que existan los archivos necesarios
if not exist "api\bingx.js" (
    echo ❌ ERROR: No se encontró api\bingx.js
    echo.
    echo Verifica que la carpeta 'api' tenga los archivos necesarios
    pause
    exit /b 1
)

if not exist "vercel.json" (
    echo ❌ ERROR: No se encontró vercel.json
    echo.
    echo Ejecuta primero los scripts de preparación
    pause
    exit /b 1
)

echo ✅ Archivos verificados
echo.

echo ════════════════════════════════════════════════════════════
echo  PASO 5: Agregando archivos a Git
echo ════════════════════════════════════════════════════════════
echo.

git add .
git commit -m "Deploy inicial a Vercel - Trader Survivor" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Archivos agregados a Git
    echo.
) else (
    echo ⚠️  No hay cambios nuevos para commit
    echo.
)

echo ════════════════════════════════════════════════════════════
echo  PASO 6: Desplegando en Vercel
echo ════════════════════════════════════════════════════════════
echo.
echo 🔐 Vercel te pedirá que inicies sesión en tu navegador
echo.
echo Sigue estos pasos:
echo   1. Se abrirá tu navegador
echo   2. Inicia sesión con GitHub (o crea cuenta)
echo   3. Autoriza Vercel
echo   4. Vuelve a esta ventana
echo.
pause
echo.

REM Desplegar en Vercel
call vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error al desplegar en Vercel
    echo.
    echo 💡 Solución:
    echo    1. Verifica que hayas iniciado sesión
    echo    2. Intenta ejecutar manualmente: vercel --prod
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ ¡DESPLIEGUE COMPLETADO!
echo ════════════════════════════════════════════════════════════
echo.
echo Tu aplicación está en línea. Vercel te mostró la URL arriba.
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo   1. Copia la URL que Vercel te dio (ej: https://trader-survivor-abc.vercel.app)
echo.
echo   2. Abre el archivo: config.js
echo.
echo   3. Busca la línea que dice:
echo      productionAPI: 'https://TU-DOMINIO.vercel.app/api'
echo.
echo   4. Reemplaza TU-DOMINIO por tu URL real
echo.
echo   5. Cambia:
echo      environment: 'development'
echo      por:
echo      environment: 'production'
echo.
echo   6. Guarda el archivo
echo.
echo   7. Ejecuta este script de nuevo para actualizar
echo.
echo ════════════════════════════════════════════════════════════
echo.
echo 🎉 ¡Tu aplicación está lista para usar!
echo.
echo 📱 Para actualizar después de hacer cambios:
echo    Simplemente ejecuta este script de nuevo
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Preguntar si abrir la URL
set /p OPEN_URL="¿Quieres abrir tu aplicación en el navegador? (S/N): "
if /i "%OPEN_URL%"=="S" (
    echo.
    echo 🌐 Abriendo aplicación...
    echo.
    REM Obtener la URL del último deployment
    for /f "tokens=*" %%i in ('vercel ls --token=%VERCEL_TOKEN% 2^>nul ^| findstr /C:"https://"') do set VERCEL_URL=%%i
    if defined VERCEL_URL (
        start %VERCEL_URL%
    ) else (
        echo ⚠️  No se pudo obtener la URL automáticamente
        echo    Revisa la salida de Vercel arriba
    )
)

echo.
echo ════════════════════════════════════════════════════════════
echo.
pause
