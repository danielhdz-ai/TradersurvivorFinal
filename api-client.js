/**
 * API Client para Trader Survivor
 * Cliente JavaScript para conectar el frontend con el backend API
 *
 * Uso:
 * const client = new TraderSurvivorAPI('http://localhost:3000');
 * const balance = await client.bingx.getBalance(apiKey, secretKey);
 */

class TraderSurvivorAPI {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
        this.timeout = 30000; // 30 segundos
    }

    /**
     * Realizar request HTTP genérico
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
        };

        const finalOptions = { ...defaultOptions, ...options };

        // Agregar body si existe
        if (finalOptions.body && typeof finalOptions.body === 'object') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }

        try {
            console.log(`📡 Request: ${finalOptions.method} ${endpoint}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            console.log(`✅ Response: ${endpoint}`, data);
            return data;

        } catch (error) {
            console.error(`❌ Error en ${endpoint}:`, error.message);
            throw error;
        }
    }

    /**
     * Health check del servidor
     */
    async health() {
        return await this.request('/health');
    }

    /**
     * API BingX
     */
    bingx = {
        /**
         * Request genérico a BingX
         */
        request: async (apiKey, secretKey, endpoint, params = {}) => {
            return await this.request('/api/bingx/request', {
                method: 'POST',
                body: {
                    apiKey,
                    secretKey,
                    endpoint,
                    params
                }
            });
        },

        /**
         * Obtener balance de cuenta de futuros
         */
        getBalance: async (apiKey, secretKey) => {
            const response = await this.bingx.request(
                apiKey,
                secretKey,
                '/openApi/swap/v2/user/balance'
            );
            return response.data;
        },

        /**
         * Obtener historial de trades
         */
        getTradeHistory: async (apiKey, secretKey, symbol = '', limit = 100) => {
            const params = {
                pageSize: Math.min(limit, 100),
                pageIndex: 1
            };

            if (symbol) {
                params.symbol = symbol;
            }

            const response = await this.bingx.request(
                apiKey,
                secretKey,
                '/openApi/swap/v2/trade/allOrders',
                params
            );
            return response.data;
        },

        /**
         * Obtener posiciones abiertas
         */
        getPositions: async (apiKey, secretKey, symbol = '') => {
            const params = {};
            if (symbol) {
                params.symbol = symbol;
            }

            const response = await this.bingx.request(
                apiKey,
                secretKey,
                '/openApi/swap/v2/user/positions',
                params
            );
            return response.data;
        },

        /**
         * Test de conexión
         */
        test: async () => {
            return await this.request('/api/test/bingx');
        }
    };

    /**
     * API MEXC
     */
    mexc = {
        /**
         * Request genérico a MEXC
         */
        request: async (apiKey, secretKey, endpoint, params = {}) => {
            return await this.request('/api/mexc/request', {
                method: 'POST',
                body: {
                    apiKey,
                    secretKey,
                    endpoint,
                    params
                }
            });
        },

        /**
         * Obtener assets de cuenta
         */
        getAssets: async (apiKey, secretKey) => {
            const response = await this.mexc.request(
                apiKey,
                secretKey,
                '/api/v1/private/account/assets'
            );
            return response.data;
        },

        /**
         * Obtener historial de órdenes
         */
        getOrderHistory: async (apiKey, secretKey, symbol = '', startTime = null, endTime = null, limit = 100) => {
            const params = {
                page_num: 1,
                page_size: Math.min(limit, 100)
            };

            if (symbol) params.symbol = symbol;
            if (startTime) params.start_time = startTime;
            if (endTime) params.end_time = endTime;

            const response = await this.mexc.request(
                apiKey,
                secretKey,
                '/api/v1/private/order/list/history_orders',
                params
            );
            return response.data;
        },

        /**
         * Obtener órdenes activas
         */
        getActiveOrders: async (apiKey, secretKey, symbol = '') => {
            const params = {
                page_num: 1,
                page_size: 100
            };

            if (symbol) params.symbol = symbol;

            const response = await this.mexc.request(
                apiKey,
                secretKey,
                '/api/v1/private/order/list/open_orders',
                params
            );
            return response.data;
        },

        /**
         * Test de conexión
         */
        test: async () => {
            return await this.request('/api/test/mexc');
        }
    };

    /**
     * API Bitget
     */
    bitget = {
        /**
         * Request genérico a Bitget
         */
        request: async (apiKey, secretKey, passphrase, method, endpoint, body = '') => {
            return await this.request('/api/bitget/request', {
                method: 'POST',
                body: {
                    apiKey,
                    secretKey,
                    passphrase,
                    method,
                    endpoint,
                    body
                }
            });
        },

        /**
         * Obtener assets de cuenta
         */
        getAssets: async (apiKey, secretKey, passphrase) => {
            const response = await this.bitget.request(
                apiKey,
                secretKey,
                passphrase,
                'GET',
                '/api/mix/v1/account/assets'
            );
            return response.data;
        },

        /**
         * Obtener historial de trades
         */
        getTradeHistory: async (apiKey, secretKey, passphrase, symbol = '', startTime = null, endTime = null) => {
            let endpoint = '/api/mix/v1/trade/fills';

            const queryParams = [];
            if (symbol) queryParams.push(`symbol=${symbol}`);
            if (startTime) queryParams.push(`startTime=${startTime}`);
            if (endTime) queryParams.push(`endTime=${endTime}`);

            if (queryParams.length > 0) {
                endpoint += '?' + queryParams.join('&');
            }

            const response = await this.bitget.request(
                apiKey,
                secretKey,
                passphrase,
                'GET',
                endpoint
            );
            return response.data;
        },

        /**
         * Obtener posiciones actuales
         */
        getPositions: async (apiKey, secretKey, passphrase, productType = 'umcbl') => {
            const response = await this.bitget.request(
                apiKey,
                secretKey,
                passphrase,
                'GET',
                `/api/mix/v1/position/allPosition?productType=${productType}`
            );
            return response.data;
        },

        /**
         * Test de conexión
         */
        test: async () => {
            return await this.request('/api/test/bitget');
        }
    };

    /**
     * Probar todas las conexiones
     */
    async testAll() {
        const results = {
            server: null,
            bingx: null,
            mexc: null,
            bitget: null
        };

        try {
            results.server = await this.health();
            console.log('✅ Servidor backend: OK');
        } catch (error) {
            console.error('❌ Servidor backend: FAIL', error.message);
            results.server = { error: error.message };
        }

        try {
            results.bingx = await this.bingx.test();
            console.log('✅ BingX: OK');
        } catch (error) {
            console.error('❌ BingX: FAIL', error.message);
            results.bingx = { error: error.message };
        }

        try {
            results.mexc = await this.mexc.test();
            console.log('✅ MEXC: OK');
        } catch (error) {
            console.error('❌ MEXC: FAIL', error.message);
            results.mexc = { error: error.message };
        }

        try {
            results.bitget = await this.bitget.test();
            console.log('✅ Bitget: OK');
        } catch (error) {
            console.error('❌ Bitget: FAIL', error.message);
            results.bitget = { error: error.message };
        }

        return results;
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TraderSurvivorAPI;
}

// Hacer disponible globalmente en el navegador
if (typeof window !== 'undefined') {
    window.TraderSurvivorAPI = TraderSurvivorAPI;
}

/**
 * EJEMPLOS DE USO:
 *
 * // Inicializar cliente
 * const api = new TraderSurvivorAPI('https://tu-backend.railway.app');
 *
 * // Test de conexión
 * const health = await api.health();
 * console.log(health);
 *
 * // Test de todas las conexiones
 * const tests = await api.testAll();
 * console.log(tests);
 *
 * // BingX - Obtener balance
 * const balance = await api.bingx.getBalance('YOUR_API_KEY', 'YOUR_SECRET_KEY');
 * console.log(balance);
 *
 * // BingX - Obtener trades
 * const trades = await api.bingx.getTradeHistory('YOUR_API_KEY', 'YOUR_SECRET_KEY', 'BTC-USDT', 50);
 * console.log(trades);
 *
 * // MEXC - Obtener assets
 * const assets = await api.mexc.getAssets('YOUR_API_KEY', 'YOUR_SECRET_KEY');
 * console.log(assets);
 *
 * // Bitget - Obtener balance
 * const bitgetBalance = await api.bitget.getAssets('YOUR_API_KEY', 'YOUR_SECRET_KEY', 'YOUR_PASSPHRASE');
 * console.log(bitgetBalance);
 */
