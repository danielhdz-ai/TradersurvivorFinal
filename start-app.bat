@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           TRADER SURVIVOR - Iniciando Aplicacion          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo ⚠️  Dependencias no encontradas. Instalando...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencias instaladas correctamente
    echo.
)

echo ════════════════════════════════════════════════════════════
echo  Iniciando servidor proxy en segundo plano...
echo ════════════════════════════════════════════════════════════
echo.

REM Iniciar el proxy en una nueva ventana minimizada
start "Trader Survivor - Proxy Server" /MIN cmd /c "node proxy-server.js"

REM Esperar 3 segundos para que el proxy se inicie
echo ⏳ Esperando que el proxy se inicie...
timeout /t 3 /nobreak >nul

echo.
echo ✅ Proxy iniciado en puerto 8003
echo.

REM Verificar si el proxy está respondiendo
echo 🔍 Verificando conexión al proxy...
curl -s http://127.0.0.1:8003/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Proxy funcionando correctamente
) else (
    echo ⚠️  El proxy puede tardar unos segundos más en iniciar
)

echo.
echo ════════════════════════════════════════════════════════════
echo  Abriendo aplicación en el navegador...
echo ════════════════════════════════════════════════════════════
echo.

REM Abrir la aplicación en el navegador predeterminado
start http://127.0.0.1:8003/

echo.
echo ✅ Aplicación iniciada correctamente
echo.
echo ════════════════════════════════════════════════════════════
echo  INSTRUCCIONES:
echo ════════════════════════════════════════════════════════════
echo.
echo  • La aplicación se ha abierto en tu navegador
echo  • El proxy está corriendo en segundo plano
echo  • NO cierres esta ventana mientras uses la app
echo.
echo  Para detener la aplicación:
echo  1. Cierra el navegador
echo  2. Presiona cualquier tecla en esta ventana
echo  3. El proxy se cerrará automáticamente
echo.
echo ════════════════════════════════════════════════════════════
echo.

pause

REM Cerrar el proxy cuando se presione una tecla
echo.
echo 🛑 Cerrando proxy server...
taskkill /FI "WindowTitle eq Trader Survivor - Proxy Server*" /T /F >nul 2>nul

echo.
echo ✅ Aplicación cerrada correctamente
echo.
timeout /t 2 /nobreak >nul
