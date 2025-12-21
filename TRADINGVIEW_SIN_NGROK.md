# 🚀 GUÍA RÁPIDA: TradingView Webhook (SIN NGROK)

## ✅ La plataforma TradingView ya está ACTIVADA en tu app

### 📋 PASOS PARA USAR:

## 1️⃣ INICIAR EL SERVIDOR
```bash
cd "C:\Users\Daniel HDZ\Desktop\tradersurvivir su"
node proxy-server.js
```

Verás:
```
🚀 Multi-Exchange Proxy Server iniciado en puerto 8003
📡 TradingView Webhook disponible en: http://localhost:8003/webhook/tradingview
```

---

## 2️⃣ CONFIGURAR EN LA APP

1. **Abrir la app** en el navegador: `http://localhost:8003`
2. **Ir a "Plataformas"** (menú lateral)
3. **Click en la tarjeta de TradingView** (ya está habilitada ✨)
4. **Seleccionar cuenta destino** donde se guardarán los trades
5. **Copiar el Account ID** que aparece (lo necesitarás para TradingView)
6. **Click en "Guardar Configuración"**
7. **Click en "Probar Webhook"** para verificar que funciona

---

## 3️⃣ CONFIGURAR EN TRADINGVIEW

### Opción A: Desde tu Estrategia Pine Script

Agrega en tus órdenes el parámetro `alert_message`:

```pinescript
//@version=5
strategy("Mi Estrategia", overlay=true)

// Tu lógica de trading aquí...
longCondition = ta.crossover(ta.sma(close, 9), ta.sma(close, 21))

if (longCondition)
    strategy.entry("Long", strategy.long, qty=1,
        alert_message='{"accountId": "TU_ACCOUNT_ID", "symbol": "{{ticker}}", "action": "buy", "contracts": 1, "price": {{close}}, "orderType": "market", "timestamp": "{{timenow}}", "orderId": "{{strategy.order.id}}"}')
```

**IMPORTANTE:** Reemplaza `TU_ACCOUNT_ID` con el Account ID que copiaste de la app.

### Opción B: Crear Alerta Manual

1. **Click derecho en el gráfico** → "Add alert"
2. **Configurar condición** (ej: "Price crosses above 50000")
3. **En "Webhook URL"** pega: `http://localhost:8003/webhook/tradingview`
4. **En "Message"** pega el JSON:

```json
{
  "accountId": "TU_ACCOUNT_ID",
  "symbol": "{{ticker}}",
  "action": "buy",
  "contracts": 1,
  "price": {{close}},
  "orderType": "market",
  "timestamp": "{{timenow}}",
  "orderId": "manual_{{time}}",
  "comment": "Alerta manual desde TradingView"
}
```

---

## 4️⃣ OPERAR Y VER TRADES AUTOMÁTICOS

1. **Cuando tu estrategia ejecute** un trade en TradingView (conectado a Tradovate)
2. **El webhook enviará** los datos automáticamente a tu servidor local
3. **El trade aparecerá** en la sección "Trades" de tu app
4. **Verás el log** en la sección de "Últimos Webhooks Recibidos" en TradingView

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### En la consola del servidor verás:
```
📩 TradingView Webhook Received: {
  "accountId": "123",
  "symbol": "MESM3",
  "action": "buy",
  "contracts": 1,
  "price": 4150.25
}
✅ Trade parsed: { accountId: 123, platform: "Tradovate", ... }
```

### En la app verás:
- ✅ Estado: "Webhook funcionando"
- 📥 Último webhook en el log con hora, símbolo, acción

---

## ⚠️ IMPORTANTE: LIMITACIONES SIN NGROK

### ❌ NO funcionará si:
- TradingView está en **otra red** (ej: celular con datos móviles)
- Tu computadora está **apagada**
- El servidor proxy **no está corriendo**

### ✅ SÍ funcionará si:
- TradingView web en el **mismo navegador/computadora**
- TradingView desktop en la **misma computadora**
- Todo está en **localhost**

---

## 🚨 SOLUCIÓN: Si quieres usar desde cualquier lugar

Si necesitas que el webhook funcione desde TradingView en otro dispositivo o red:

### Opción 1: Usar ngrok (5 minutos)
```bash
# Descargar: https://ngrok.com/download
ngrok http 8003

# Copiar la URL pública (ej: https://abc123.ngrok.io)
# Usar: https://abc123.ngrok.io/webhook/tradingview en TradingView
```

### Opción 2: Desplegar en un servidor cloud
- Railway.app (gratis)
- Render.com (gratis)
- Vercel (requiere ajustes)

---

## 🎯 EJEMPLO COMPLETO DE USO LOCAL

### Escenario: Operas Micro E-mini S&P 500 (MES)

1. **Servidor corriendo** en puerto 8003 ✅
2. **Cuenta configurada** en la app: "Funded 50k" → Account ID: `123` ✅
3. **Estrategia en TradingView** con `alert_message` configurado ✅
4. **Alerta creada** con webhook a `localhost:8003` ✅

### Cuando la estrategia compra 2 contratos de MESM3:

**TradingView envía:**
```json
{
  "accountId": "123",
  "symbol": "MESM3",
  "action": "buy",
  "contracts": 2,
  "price": 5125.50,
  "timestamp": "2024-12-08T15:30:00Z"
}
```

**Tu servidor recibe y procesa:**
- ✅ Parsea el JSON
- ✅ Valida los campos
- ✅ Retorna confirmación

**Aparece en tu app:**
- 📊 Nuevo trade en "Trades"
- 💰 Se calcula P&L automáticamente
- 📈 Se actualiza el equity

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **Variables de TradingView:** Ver archivo `CONFIGURAR_TRADINGVIEW_WEBHOOK.md`
- **Formato JSON completo:** En la sección "Instrucciones" dentro de la plataforma TradingView
- **Troubleshooting:** Si el webhook no llega, revisa la consola del servidor

---

## ✅ CHECKLIST FINAL

- [ ] Servidor corriendo en puerto 8003
- [ ] App abierta en navegador
- [ ] Cuenta seleccionada en TradingView (plataforma)
- [ ] Account ID copiado
- [ ] Configuración guardada
- [ ] Test de webhook exitoso (botón "Probar Webhook")
- [ ] Estrategia/alerta configurada en TradingView
- [ ] Account ID reemplazado en el JSON
- [ ] Operado un trade de prueba
- [ ] Trade aparece en la app ✨

---

**🎉 ¡Listo! Ahora tus trades de TradingView se importarán automáticamente**
