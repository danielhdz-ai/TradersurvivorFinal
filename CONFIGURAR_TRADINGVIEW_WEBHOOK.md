# 🎯 CONFIGURACIÓN TRADINGVIEW WEBHOOKS PARA TRADOVATE

## 📋 RESUMEN
Como no tienes acceso a la API de pago de Tradovate, usaremos **TradingView Webhooks** para importar automáticamente tus trades ejecutados desde TradingView cuando operas en Tradovate.

---

## ⚙️ PASO 1: Iniciar el Servidor Local

### 1.1 Ejecutar proxy-server.js
```bash
cd "C:\Users\Daniel HDZ\Desktop\tradersurvivir su"
node proxy-server.js
```

**Verás:**
```
🚀 Multi-Exchange Proxy Server iniciado en puerto 8003
📡 TradingView Webhook disponible en: http://localhost:8003/webhook/tradingview
```

### 1.2 Exponer tu servidor local (IMPORTANTE)
Para que TradingView pueda enviar webhooks a tu computadora local, necesitas usar **ngrok** o **localtunnel**.

#### Opción A: ngrok (Recomendado)
1. Descarga ngrok: https://ngrok.com/download
2. Ejecuta:
```bash
ngrok http 8003
```
3. Copia la URL pública (ejemplo: `https://abc123.ngrok.io`)

#### Opción B: localtunnel
```bash
npm install -g localtunnel
lt --port 8003
```

**Tu webhook URL será:**
```
https://tu-url-publica.ngrok.io/webhook/tradingview
```

---

## 📝 PASO 2: Configurar Estrategia en TradingView

### 2.1 Código Pine Script con Alertas

Ejemplo básico de estrategia que envía datos al webhook:

```pinescript
//@version=5
strategy("Tradovate Auto-Import", overlay=true)

// Tu lógica de estrategia (ejemplo simple)
fastMA = ta.sma(close, 9)
slowMA = ta.sma(close, 21)

longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Ejecutar órdenes
if (longCondition)
    strategy.entry("Long", strategy.long, qty=1, 
        alert_message='{"accountId": "TU_ACCOUNT_ID", "symbol": "{{ticker}}", "action": "buy", "contracts": 1, "price": {{close}}, "orderType": "market", "timestamp": "{{timenow}}", "orderId": "{{strategy.order.id}}", "comment": "{{strategy.order.comment}}"}')

if (shortCondition)
    strategy.entry("Short", strategy.short, qty=1,
        alert_message='{"accountId": "TU_ACCOUNT_ID", "symbol": "{{ticker}}", "action": "sell", "contracts": 1, "price": {{close}}, "orderType": "market", "timestamp": "{{timenow}}", "orderId": "{{strategy.order.id}}", "comment": "{{strategy.order.comment}}"}')

// Plotear MAs
plot(fastMA, color=color.blue, title="Fast MA")
plot(slowMA, color=color.red, title="Slow MA")
```

**IMPORTANTE:** Reemplaza `TU_ACCOUNT_ID` con el ID de tu cuenta de Tradovate que usas en la app.

---

## 🚨 PASO 3: Crear Alerta en TradingView

### 3.1 Crear Alerta desde la Estrategia
1. Click derecho en tu estrategia en el chart
2. Selecciona **"Add alert on strategy..."**
3. Configura:
   - **Condition:** Elige la condición de tu estrategia
   - **Options:** Marca "Once Per Bar Close" (recomendado)

### 3.2 Configurar Webhook
En el panel de alerta:

**Tab "Settings":**
- **Webhook URL:** `https://tu-url-publica.ngrok.io/webhook/tradingview`

**Tab "Message":**
Usa el formato JSON con variables dinámicas:

```json
{
  "accountId": "TU_ACCOUNT_ID",
  "symbol": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "contracts": {{strategy.order.contracts}},
  "price": {{strategy.order.price}},
  "orderType": "market",
  "timestamp": "{{timenow}}",
  "orderId": "{{strategy.order.id}}",
  "comment": "{{strategy.order.comment}}"
}
```

**Variables dinámicas disponibles:**
- `{{ticker}}` - Símbolo (ej: MESM3)
- `{{strategy.order.action}}` - "buy" o "sell"
- `{{strategy.order.contracts}}` - Cantidad de contratos
- `{{strategy.order.price}}` - Precio de ejecución
- `{{strategy.order.id}}` - ID de la orden
- `{{timenow}}` - Timestamp UTC
- `{{close}}`, `{{open}}`, `{{high}}`, `{{low}}` - Precios del bar

---

## 🔍 PASO 4: Verificar Funcionamiento

### 4.1 Probar Webhook Manualmente
Usa Postman o curl para enviar un POST de prueba:

```bash
curl -X POST https://tu-url-publica.ngrok.io/webhook/tradingview \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "123",
    "symbol": "MESM3",
    "action": "buy",
    "contracts": 1,
    "price": 4150.25,
    "orderType": "market",
    "timestamp": "2024-01-15T10:30:00Z",
    "orderId": "test123",
    "comment": "Test trade"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Webhook received and trade parsed successfully",
  "trade": {
    "accountId": 123,
    "platform": "Tradovate",
    "symbol": "MESM3",
    "side": "BUY",
    "quantity": 1,
    "entryPrice": 4150.25,
    "leverage": 1,
    "entryTime": "2024-01-15T10:30:00Z",
    "status": "open",
    "orderType": "market",
    "exchangeOrderId": "test123",
    "notes": "Test trade"
  }
}
```

### 4.2 Ver Logs del Servidor
En la consola donde corre `proxy-server.js` verás:
```
📩 TradingView Webhook Received: { "accountId": "123", ... }
✅ Trade parsed: { accountId: 123, platform: "Tradovate", ... }
```

---

## 🔄 PASO 5: Integrar con la App

### 5.1 Guardar Trades en Supabase
Modifica el endpoint del webhook para guardar automáticamente en Supabase:

```javascript
// En proxy-server.js, dentro del endpoint /webhook/tradingview
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Después de parsear el trade:
const { data, error } = await supabase
  .from('trades')
  .insert([trade]);

if (error) {
  console.error('❌ Error saving to Supabase:', error);
  return res.status(500).json({ success: false, error: error.message });
}

res.json({
  success: true,
  message: 'Trade saved to database',
  tradeId: data[0].id
});
```

### 5.2 Actualizar Account ID en el Frontend
En `index.html`, asegúrate de que el `accountId` que guardas al crear la cuenta coincida con el que usas en TradingView.

---

## 🎯 EJEMPLO COMPLETO DE USO

### Escenario: Operas NQ (Nasdaq Futures) desde TradingView conectado a Tradovate

1. **Tienes tu estrategia en TradingView** operando NQM3 (Nasdaq Micro)
2. **Creas alerta con webhook** apuntando a `https://abc123.ngrok.io/webhook/tradingview`
3. **La estrategia ejecuta una compra:**
   - TradingView envía POST al webhook con:
   ```json
   {
     "accountId": "50k_fundingticks",
     "symbol": "NQM3",
     "action": "buy",
     "contracts": 2,
     "price": 17250.50,
     "timestamp": "2024-01-15T14:35:22Z",
     "orderId": "LONG_123"
   }
   ```
4. **Tu proxy-server recibe y procesa:**
   - Parsea el JSON
   - Convierte a formato de trade
   - Guarda en Supabase
5. **En tu app ves el trade automáticamente** en la sección de trades

---

## ⚠️ LIMITACIONES Y CONSIDERACIONES

### ✅ Ventajas:
- ✅ No necesitas API de pago de Tradovate
- ✅ Automático y en tiempo real
- ✅ Funciona con cualquier estrategia de TradingView
- ✅ Captura precio exacto de ejecución

### ⚠️ Limitaciones:
- ⚠️ Requiere ngrok/localtunnel corriendo (o servidor cloud)
- ⚠️ No captura comisiones/fees automáticamente (agregar manualmente)
- ⚠️ Necesitas mantener correspondencia entre accountId en TV y tu app
- ⚠️ Si la conexión se pierde, pierdes el webhook (considerar retry logic)

### 🔐 Seguridad:
Para producción, añade autenticación al webhook:
```javascript
app.post('/webhook/tradingview', async (req, res) => {
  const secret = 'TU_SECRET_TOKEN';
  const authHeader = req.headers['authorization'];
  
  if (authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... resto del código
});
```

Y en TradingView, en Headers de la alerta:
```
Authorization: Bearer TU_SECRET_TOKEN
```

---

## 📚 RECURSOS ADICIONALES

### Documentación TradingView:
- Webhooks: https://www.tradingview.com/support/solutions/43000529348-about-webhooks/
- Variables de estrategia: https://www.tradingview.com/support/solutions/43000531021-how-do-i-use-webhooks/
- Pine Script: https://www.tradingview.com/pine-script-docs/

### Herramientas:
- ngrok: https://ngrok.com/
- localtunnel: https://localtunnel.github.io/www/
- Postman: https://www.postman.com/ (para probar webhooks)

---

## 🆘 TROUBLESHOOTING

### El webhook no llega:
1. Verifica que ngrok esté corriendo
2. Confirma la URL en la alerta de TradingView
3. Revisa logs de ngrok: `http://localhost:4040` (panel web de ngrok)
4. Verifica que el proxy-server esté corriendo en puerto 8003

### Los datos no se guardan:
1. Revisa logs del servidor (console.log)
2. Verifica que el JSON del webhook sea válido
3. Confirma credenciales de Supabase
4. Usa Postman para probar el endpoint directamente

### Datos incorrectos:
1. Verifica que las variables de TradingView estén bien escritas
2. Confirma que el símbolo coincida (ej: `{{ticker}}`)
3. Revisa el formato de precio (puede venir como string)

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Instalar ngrok
- [ ] Ejecutar proxy-server.js
- [ ] Ejecutar ngrok en puerto 8003
- [ ] Copiar URL pública de ngrok
- [ ] Crear/modificar estrategia en TradingView
- [ ] Crear alerta con webhook URL
- [ ] Configurar mensaje JSON con variables
- [ ] Probar con curl/Postman
- [ ] Verificar logs del servidor
- [ ] Operar un trade de prueba
- [ ] Confirmar que el trade aparece en la app
- [ ] (Opcional) Integrar guardado en Supabase
- [ ] (Opcional) Añadir autenticación al webhook

---

**¿Necesitas ayuda con algún paso específico?**
