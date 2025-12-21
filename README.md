# 🎯 Trader Survivor - Multi-Exchange Trading Journal

Sistema completo de journal de trading con soporte para múltiples exchanges y análisis avanzado.

## 🌟 Características

- ✅ **Multi-Exchange**: BingX, Bitget, MEXC, Binance, NinjaTrader, Tradovate, MetaTrader 5, cTrader
- ✅ **Dashboard Avanzado**: Métricas detalladas, gráficos, análisis de rendimiento
- ✅ **Chartbook**: Visualización de operaciones en gráficos TradingView
- ✅ **Daily Journal**: Registro diario de trading
- ✅ **Playbook**: Estrategias y reglas de trading
- ✅ **Equity Graph**: Seguimiento de capital en tiempo real
- ✅ **Sincronización Automática**: Importa trades automáticamente desde exchanges
- ✅ **Base de Datos**: Supabase para almacenamiento en la nube
- ✅ **Proxy CORS**: Servidor proxy para evitar problemas de CORS con APIs

## 🚀 Inicio Rápido

### Opción 1: Uso Local

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el proxy**
   ```bash
   npm start
   ```

4. **Abrir la aplicación**
   - Abre `index.html` en tu navegador
   - O usa Live Server en VS Code

### Opción 2: Desplegar en Vercel (Recomendado para producción)

**Lee la guía completa**: [INICIO_RAPIDO_VERCEL.md](INICIO_RAPIDO_VERCEL.md)

**Resumen**:
```bash
# 1. Subir a GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/trader-survivor.git
git push -u origin main

# 2. Desplegar en Vercel
# Ve a vercel.com/new y selecciona tu repositorio
```

## 📁 Estructura del Proyecto

```
tradersurvivir su/
├── api/                    # Serverless functions para Vercel
│   ├── bingx.js           # Proxy BingX
│   ├── bitget.js          # Proxy Bitget
│   ├── mexc.js            # Proxy MEXC
│   └── health.js          # Health check
├── index.html             # Aplicación principal
├── proxy-server.js        # Servidor proxy local
├── package.json           # Dependencias
├── vercel.json            # Configuración Vercel
└── *.md                   # Documentación
```

## 🔧 Configuración

### 1. Supabase (Base de Datos)

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta los scripts SQL:
   - `setup_database.sql`
   - `setup_funded_table.sql`
   - `setup_playbook_table.sql`
4. Configura las credenciales en la aplicación

### 2. APIs de Exchanges

Configura tus API keys en la sección "Platforms" de la aplicación:

- **BingX**: API Key, Secret Key, Account ID
- **Bitget**: API Key, Secret Key, Passphrase
- **MEXC**: API Key, Secret Key

## 📊 Uso

1. **Login**: Inicia sesión con Supabase
2. **Configurar Cuenta**: Añade tus cuentas de trading
3. **Conectar Exchange**: Configura las API keys
4. **Sincronizar**: Importa tus trades automáticamente
5. **Analizar**: Usa el dashboard, chartbook y reportes

## 🌐 Proxy Server

El proxy server resuelve problemas de CORS al conectarse a las APIs de exchanges.

### Local (Desarrollo)
```bash
npm start
# Proxy disponible en: http://localhost:8003
```

### Vercel (Producción)
```bash
# Despliega en Vercel
# Proxy disponible en: https://tu-dominio.vercel.app/api
```

**La aplicación detecta automáticamente** si está en desarrollo (local) o producción (Vercel).

## 📖 Documentación

- [INICIO_RAPIDO_VERCEL.md](INICIO_RAPIDO_VERCEL.md) - Guía rápida de despliegue
- [DESPLEGAR_PROXY_VERCEL.md](DESPLEGAR_PROXY_VERCEL.md) - Guía completa de Vercel
- [README_SUPABASE.md](README_SUPABASE.md) - Configuración de Supabase
- [TRADINGVIEW_IMPLEMENTADO.md](TRADINGVIEW_IMPLEMENTADO.md) - TradingView Charts
- [CONFIGURAR_TRADINGVIEW_WEBHOOK.md](CONFIGURAR_TRADINGVIEW_WEBHOOK.md) - Webhooks

## 🔄 Actualizar Código (Vercel)

```bash
# Método 1: Script automático
DEPLOY_RAPIDO.bat

# Método 2: Manual
git add .
git commit -m "Update"
git push
```

Vercel despliega automáticamente en 30-60 segundos.

## 🆘 Solución de Problemas

### Proxy no disponible
```bash
# Verificar que el proxy esté corriendo
npm start

# O verificar health check
curl http://localhost:8003/health
```

### CORS Errors
- Asegúrate de que el proxy esté corriendo
- Verifica que las URLs estén correctamente configuradas
- En producción, usa Vercel

### API Errors
- Verifica tus API keys
- Revisa los permisos en el exchange
- Checa la consola del navegador (F12)

## 📝 Licencia

MIT License - Ver archivo LICENSE

## 👥 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Soporte

- **Issues**: Abre un issue en GitHub
- **Email**: [Tu email]
- **Documentación**: Lee los archivos .md en el proyecto

---

**¡Desarrollado para traders, por traders!** 📈
