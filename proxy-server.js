const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios'); // Volvemos a axios que es más compatible
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8003;

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Añadimos cabeceras que el frontend puede usar para pasar credenciales a la ruta proxy
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-KEY', 'X-SECRET-KEY', 'X-ACCOUNT-ID', 'ApiKey', 'Request-Time', 'Signature', 'X-PASSPHRASE', 'X-TIMESTAMP', 'ACCESS-KEY', 'ACCESS-SIGN', 'ACCESS-TIMESTAMP', 'ACCESS-PASSPHRASE', 'X-Tradovate-Mode']
}));

app.use(express.json());

// Sirve archivos estáticos desde el directorio actual
app.use(express.static(__dirname));

// Ruta para servir el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Function to create HMAC signature for BingX API
function createSignature(queryString, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(queryString)
        .digest('hex');
}

// Test endpoint for BingX
app.get('/api/bingx/test', async (req, res) => {
    try {
        const response = await axios.get('https://open-api.bingx.com/openApi/swap/v2/server/time');
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('❌ BingX Test Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test endpoint for MEXC
app.get('/api/mexc/test', async (req, res) => {
    try {
        const response = await axios.get('https://contract.mexc.com/api/v1/contract/ping');
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('❌ MEXC Test Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: obtener server Date de MEXC para verificar diferencia de reloj
app.get('/mexc/_server_time', async (req, res) => {
    try {
        const response = await axios.get('https://contract.mexc.com/api/v1/contract/ping');
        // Algunos endpoints devuelven 400 pero la cabecera Date existe
        const serverDate = response.headers && response.headers.date ? response.headers.date : null;
        return res.json({ success: true, status: response.status, serverDate, data: response.data });
    } catch (error) {
        console.error('❌ Error fetching MEXC server time:', error.message);
        if (error.response) {
            const serverDate = error.response.headers && error.response.headers.date ? error.response.headers.date : null;
            return res.status(error.response.status).json({ success: false, status: error.response.status, serverDate, data: error.response.data });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Proxy endpoint for MEXC Futures API
app.all('/mexc/*', async (req, res) => {
    try {
        const apiKey = req.headers['apikey'];
        const requestTime = req.headers['request-time'];
        const signature = req.headers['signature'];

        if (!apiKey || !requestTime || !signature) {
            return res.status(400).json({
                code: 400,
                msg: 'Faltan headers requeridos (ApiKey, Request-Time o Signature)',
                data: null
            });
        }

        // Path de MEXC
        const path = req.path.replace('/mexc', '');
        
        // Construir URL completa con parámetros si existen
        let url = `https://contract.mexc.com${path}`;
        const queryString = Object.keys(req.query).length > 0
            ? Object.keys(req.query).map(key => `${key}=${req.query[key]}`).join('&')
            : '';
        
        if (queryString) {
            url += `?${queryString}`;
        }
        
        console.log(`📡 MEXC Request: ${path}`);
        console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
        console.log(`⏰ Request-Time: ${requestTime}`);
        console.log(`🔐 Signature: ${signature.substring(0, 20)}...`);
        console.log(`🌍 Full URL: ${url}`);

        // Hacer request a MEXC con todos los headers necesarios
        const response = await axios({
            method: req.method,
            url: url,
            headers: {
                'ApiKey': apiKey,
                'Request-Time': requestTime,
                'Signature': signature,
                'Content-Type': 'application/json',
                'User-Agent': 'MEXC-Proxy/1.0'
            }
        });

        console.log(`📊 MEXC Response Status:`, response.status);
        console.log(`📊 MEXC Response Data:`, response.data);
        
        res.json(response.data);

    } catch (error) {
        console.error('❌ MEXC Proxy Error:', error.message);
        
        if (error.response) {
            console.error('📊 MEXC Error Response Status:', error.response.status);
            console.error('📊 MEXC Error Response Data:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error('🔌 Connection Error:', error.request);
            res.status(500).json({
                code: 500,
                msg: 'Error de conexión con MEXC',
                data: null
            });
        } else {
            res.status(500).json({
                code: 500,
                msg: error.message,
                data: null
            });
        }
    }
});

// Proxy endpoint for BingX API - VERSION SIMPLE
app.all('/bingx/*', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const secretKey = req.headers['x-secret-key'];

        if (!apiKey || !secretKey) {
            return res.status(400).json({
                code: 400,
                msg: 'Faltan credenciales',
                data: null
            });
        }

        // Path de BingX
        const path = req.path.replace('/bingx', '');
        
        // Crear parámetros con timestamp
        const timestamp = Date.now();
        const params = {
            ...req.query,
            timestamp: timestamp,
            recvWindow: 60000
        };

        // Crear query string para firma según documentación de BingX
        // Los parámetros deben estar ordenados alfabéticamente
        const sortedKeys = Object.keys(params).sort();
        const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
        
        console.log(`🔐 Parámetros ordenados: ${JSON.stringify(sortedKeys)}`);
        console.log(`🔐 Query string completo: ${queryString}`);
        
        // Crear firma HMAC SHA256
        const signature = createSignature(queryString, secretKey);
        params.signature = signature;

        // URL final con parámetros codificados
        const urlParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
            urlParams.append(key, params[key]);
        });
        
        const url = `https://open-api.bingx.com${path}?${urlParams.toString()}`;
        
        console.log(`📡 BingX Request: ${path}`);
        console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
        console.log(`🔐 Query: ${queryString}`);
        console.log(`✍️ Signature: ${signature}`);
        console.log(`🌍 Full URL: ${url}`);

        // Hacer request a BingX
        const response = await axios({
            method: req.method,
            url: url,
            headers: {
                'X-BX-APIKEY': apiKey,
                'Content-Type': 'application/json',
                'User-Agent': 'BingX-Proxy/1.0'
            }
        });

        console.log(`📊 BingX Response:`, response.data);
        
        res.json(response.data);

    } catch (error) {
        console.error('❌ Proxy Error:', error.message);
        
        if (error.response) {
            // BingX respondió con un error
            console.error('📊 BingX Error Response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            // Error de conexión
            console.error('🔌 Connection Error:', error.request);
            res.status(500).json({
                code: 500,
                msg: 'Error de conexión con BingX',
                data: null
            });
        } else {
            // Otro tipo de error
            res.status(500).json({
                code: 500,
                msg: error.message,
                data: null
            });
        }
    }
});

// ============================================
// === TRADINGVIEW WEBHOOK ENDPOINT ===
// ============================================
app.post('/webhook/tradingview', async (req, res) => {
    try {
        console.log('📩 TradingView Webhook Received:', JSON.stringify(req.body, null, 2));
        
        const data = req.body;
        
        // Validar que tenga los campos mínimos requeridos
        if (!data.accountId || !data.symbol) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: accountId and symbol are mandatory'
            });
        }
        
        // Estructura esperada del webhook (ejemplo con variables de TradingView):
        // {
        //   "accountId": "123",
        //   "symbol": "MESM3",
        //   "action": "buy",
        //   "orderType": "market",
        //   "contracts": 1,
        //   "price": 4150.25,
        //   "timestamp": "2024-01-15T10:30:00Z",
        //   "orderId": "abc123",
        //   "comment": "Strategy Entry"
        // }
        
        // Convertir a formato de trade para guardar en DB
        const trade = {
            accountId: parseInt(data.accountId),
            platform: 'Tradovate',
            symbol: data.symbol,
            side: (data.action || 'buy').toUpperCase(), // BUY o SELL
            quantity: parseFloat(data.contracts || data.qty || 1),
            entryPrice: parseFloat(data.price || data.executionPrice || 0),
            leverage: parseFloat(data.leverage || 1),
            entryTime: data.timestamp || new Date().toISOString(),
            status: 'open',
            orderType: data.orderType || 'market',
            exchangeOrderId: data.orderId || null,
            notes: data.comment || 'Auto-imported from TradingView webhook'
        };
        
        console.log('✅ Trade parsed:', trade);
        
        // Aquí podrías guardar directamente en Supabase o retornar para que el frontend lo procese
        // Por ahora retornamos el trade parseado
        res.json({
            success: true,
            message: 'Webhook received and trade parsed successfully',
            trade: trade
        });
        
    } catch (error) {
        console.error('❌ TradingView Webhook Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Multi-Exchange Proxy Server funcionando correctamente (BingX, MEXC, Bitget, Tradovate)'
    });
});

// Proxy endpoint for Bitget API
app.all('/bitget/*', async (req, res) => {
    try {
        // Leer credenciales desde headers (permitir varias variantes)
        const apiKey = req.headers['x-api-key'] || req.headers['access-key'] || req.headers['apikey'];
        const secretKey = req.headers['x-secret-key'] || req.headers['x-secret'] || req.headers['access-secret'] || req.headers['secretkey'];
        const passphrase = req.headers['x-passphrase'] || req.headers['access-passphrase'] || req.headers['passphrase'];
        const tsHeader = req.headers['x-timestamp'] || req.headers['access-timestamp'] || req.headers['request-time'];

        if (!apiKey || !secretKey || !passphrase) {
            return res.status(400).json({
                code: 400,
                msg: 'Faltan credenciales para Bitget (ApiKey, SecretKey o Passphrase) en headers',
                data: null
            });
        }

        const method = (req.method || 'GET').toUpperCase();
        const path = req.path.replace('/bitget', '') || '/';

        // Construir requestPath: incluir query string si existe
        const queryString = Object.keys(req.query).length > 0 ? Object.keys(req.query).map(k => `${k}=${req.query[k]}`).join('&') : '';
        const requestPath = queryString ? `${path}?${queryString}` : path;

        // Body para firma
        let body = '';
        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            // axios already parses JSON bodies; keep raw body if present
            body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : '';
        }

        // Timestamp para firma: usar el header si viene, sino generar uno nuevo (ms)
        const timestamp = tsHeader ? tsHeader.toString() : Date.now().toString();

        // Prehash: timestamp + method + requestPath + body
        const prehash = `${timestamp}${method}${requestPath}${body}`;

        // Firma HMAC-SHA256 -> base64
        const signature = crypto.createHmac('sha256', secretKey).update(prehash).digest('base64');

        const url = `https://api.bitget.com${requestPath}`;

        console.log(`📡 Bitget Proxy Request: ${method} ${requestPath}`);
        console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
        console.log(`⏰ Timestamp: ${timestamp}`);
        console.log(`✍️ Signature: ${signature}`);

        // Forward request to Bitget
        const response = await axios({
            method: method,
            url: url,
            headers: {
                'ACCESS-KEY': apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': passphrase,
                'Content-Type': 'application/json',
                'User-Agent': 'Bitget-Proxy/1.0'
            },
            data: body || undefined
        });

        console.log('📊 Bitget Response:', response.data);
        return res.json(response.data);

    } catch (error) {
        console.error('❌ Bitget Proxy Error:', error.message);
        if (error.response) {
            console.error('📊 Bitget Error Response:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            return res.status(500).json({ code: 500, msg: 'Error de conexión con Bitget', data: null });
        } else {
            return res.status(500).json({ code: 500, msg: error.message, data: null });
        }
    }
});

// Start server
app.listen(PORT, () => {
    const hostInfo = process.env.HOSTNAME || 'localhost';
    console.log(`🚀 Multi-Exchange Proxy Server iniciado en puerto ${PORT}`);
    console.log(`🏠 Interfaz web disponible en: http://${hostInfo}:${PORT}/`);
    console.log(`🌐 Health check disponible en: http://${hostInfo}:${PORT}/health`);
    console.log(`📡 Proxy BingX disponible en: http://${hostInfo}:${PORT}/bingx/*`);
    console.log(`📡 Proxy MEXC disponible en: http://${hostInfo}:${PORT}/mexc/*`);
    console.log(`📡 Proxy Bitget disponible en: http://${hostInfo}:${PORT}/bitget/*`);
    console.log(`📡 Proxy Tradovate disponible en: http://${hostInfo}:${PORT}/tradovate/*`);
    console.log(`📡 Test MEXC disponible en: http://${hostInfo}:${PORT}/api/mexc/test`);
});

// ============================================
// === PROXY TRADOVATE ===
// ============================================
app.use('/tradovate', async (req, res) => {
    try {
        const endpoint = req.url;
        const method = req.method;
        
        // Determinar el modo (demo o live) desde headers o query
        const mode = req.headers['x-tradovate-mode'] || req.query.mode || 'live';
        const apiUrl = mode === 'demo' 
            ? 'https://demo.tradovateapi.com/v1'
            : 'https://live.tradovateapi.com/v1';
        
        const fullUrl = `${apiUrl}${endpoint.split('?')[0]}`;
        
        console.log(`🔄 Proxying Tradovate ${method} request to: ${fullUrl}`);
        
        // Construir headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Si hay token de autorización, pasarlo
        if (req.headers['authorization']) {
            headers['Authorization'] = req.headers['authorization'];
        }
        
        // Configurar request
        const config = {
            method: method,
            url: fullUrl,
            headers: headers,
            params: req.query
        };
        
        // Si hay body, incluirlo
        if (req.body && Object.keys(req.body).length > 0) {
            config.data = req.body;
        }
        
        // Hacer la petición
        const response = await axios(config);
        
        console.log(`✅ Tradovate response: ${response.status}`);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Tradovate Proxy Error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
});

// ============================================
// NINJATRADER 8 API INTEGRATION
// ============================================

const net = require('net');

// Test NinjaTrader ATI connection
app.get('/api/ninjatrader/test', async (req, res) => {
    const port = parseInt(req.query.port) || 36973;
    const host = req.query.host || 'localhost';
    
    console.log(`🎯 Testing NinjaTrader ATI connection at ${host}:${port}`);
    
    const client = new net.Socket();
    let responseData = '';
    
    client.setTimeout(5000); // 5 second timeout
    
    client.connect(port, host, () => {
        console.log('✅ Connected to NinjaTrader ATI');
        // Send a simple command to test
        client.write('VERSION\r\n');
    });
    
    client.on('data', (data) => {
        responseData += data.toString();
        console.log('📥 Received from NinjaTrader:', responseData);
        
        client.destroy();
        res.json({
            success: true,
            connected: true,
            version: responseData.trim(),
            message: 'NinjaTrader ATI conectado correctamente'
        });
    });
    
    client.on('error', (error) => {
        console.error('❌ NinjaTrader connection error:', error.message);
        res.status(500).json({
            success: false,
            connected: false,
            error: error.message,
            message: 'No se pudo conectar a NinjaTrader. Verifica que esté ejecutándose y ATI habilitado.'
        });
    });
    
    client.on('timeout', () => {
        console.error('❌ NinjaTrader connection timeout');
        client.destroy();
        res.status(500).json({
            success: false,
            connected: false,
            error: 'Connection timeout',
            message: 'Tiempo de espera agotado. Verifica que NinjaTrader esté ejecutándose.'
        });
    });
});

// Get trades from NinjaTrader
app.get('/api/ninjatrader/trades', async (req, res) => {
    const port = parseInt(req.query.port) || 36973;
    const host = req.query.host || 'localhost';
    const accountName = req.query.account || 'Sim101';
    
    console.log(`📊 Fetching trades from NinjaTrader for account: ${accountName}`);
    
    const client = new net.Socket();
    let responseData = '';
    
    client.setTimeout(10000);
    
    client.connect(port, host, () => {
        console.log('✅ Connected to NinjaTrader ATI');
        // Try ALLORDERS command instead of EXECUTIONS
        const command = `ALLORDERS;${accountName};\r\n`;
        console.log('📤 Sending command:', command.trim());
        client.write(command);
    });
    
    client.on('data', (data) => {
        responseData += data.toString();
        console.log('📥 Raw response chunk:', data.toString());
        
        // Wait a bit more for complete data
        setTimeout(() => {
            if (responseData) {
                client.destroy();
                
                try {
                    console.log('📋 Full response:', responseData);
                    
                    // Parse NinjaTrader response
                    const trades = parseNinjaTraderExecutions(responseData);
                    
                    console.log(`✅ Parsed ${trades.length} trades from NinjaTrader`);
                    
                    res.json({
                        success: true,
                        trades: trades,
                        count: trades.length,
                        rawResponse: responseData
                    });
                } catch (parseError) {
                    console.error('❌ Error parsing NinjaTrader response:', parseError);
                    res.status(500).json({
                        success: false,
                        error: parseError.message,
                        rawData: responseData
                    });
                }
            }
        }, 500); // Wait 500ms for complete response
    });
    
    client.on('error', (error) => {
        console.error('❌ NinjaTrader error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    });
    
    client.on('timeout', () => {
        console.error('❌ NinjaTrader timeout');
        client.destroy();
        res.status(500).json({
            success: false,
            error: 'Connection timeout'
        });
    });
});

// Helper function to parse NinjaTrader executions
function parseNinjaTraderExecutions(data) {
    const trades = [];
    const lines = data.trim().split('\r\n');
    
    for (const line of lines) {
        if (!line || line.startsWith('EXECUTIONS')) continue;
        
        // NinjaTrader ATI format:
        // EXECUTION;<account>;<instrument>;<action>;<quantity>;<price>;<time>;<orderId>;<executionId>
        const parts = line.split(';');
        
        if (parts.length >= 8 && parts[0] === 'EXECUTION') {
            const trade = {
                account: parts[1],
                instrument: parts[2],
                action: parts[3], // BUY or SELL
                quantity: parseInt(parts[4]),
                price: parseFloat(parts[5]),
                time: parts[6],
                orderId: parts[7],
                executionId: parts[8] || '',
                platform: 'NinjaTrader',
                status: 'filled'
            };
            
            trades.push(trade);
        }
    }
    
    return trades;
}

// Webhook endpoint for real-time NinjaTrader executions
app.post('/api/ninjatrader/execution', (req, res) => {
    try {
        const execution = req.body;
        
        console.log('📥 NinjaTrader Execution Received:', {
            account: execution.account,
            symbol: execution.symbol,
            action: execution.action,
            quantity: execution.quantity,
            price: execution.price,
            time: execution.time
        });
        
        // Broadcast to connected clients (if using WebSocket in future)
        // For now, just acknowledge receipt
        
        res.json({
            success: true,
            message: 'Execution received',
            data: {
                account: execution.account,
                symbol: execution.symbol,
                action: execution.action,
                quantity: execution.quantity,
                price: execution.price,
                time: execution.time,
                orderId: execution.orderId
            }
        });
        
        console.log('✅ Execution acknowledged');
        
    } catch (error) {
        console.error('❌ Error processing execution:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Cerrando servidor proxy...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Cerrando servidor proxy...');
    process.exit(0);
});