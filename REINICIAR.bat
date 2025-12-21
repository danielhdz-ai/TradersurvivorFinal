@echo off
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          REINICIANDO TRADER SURVIVOR                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Cerrando procesos anteriores...
echo.

REM Cerrar todos los procesos de Node.js que puedan estar corriendo el proxy
taskkill /F /IM node.exe >nul 2>&1

REM Esperar un momento
timeout /t 2 /nobreak >nul

echo ✅ Procesos cerrados
echo.
echo 🚀 Iniciando servidor proxy...
echo.

REM Iniciar el proxy en segundo plano
start "Trader Survivor - Proxy Server" /MIN cmd /c "node proxy-server.js"

REM Esperar a que el proxy se inicie
timeout /t 3 /nobreak >nul

echo ✅ Proxy iniciado
echo.
echo 🌐 Abriendo aplicación en el navegador...
echo.

REM Abrir la aplicación
start http://127.0.0.1:8003

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ ¡LISTO! La aplicación se reinició correctamente
echo ════════════════════════════════════════════════════════════
echo.
echo  Ahora prueba las APIs de MEXC y Bitget
echo.
echo ════════════════════════════════════════════════════════════
echo.

timeout /t 3 /nobreak >nul
