/**
 * Configuración de Trader Survivor
 * Este archivo controla si usas el servidor local o el de producción
 */

const CONFIG = {
    // ==================== CONFIGURACIÓN DE ENTORNO ====================

    // Cambiar a 'production' cuando subas a Vercel
    // Cambiar a 'development' para desarrollo local
    environment: 'development', // 'development' o 'production'

    // ==================== URLs DE API ====================

    // URL local (para desarrollo)
    localAPI: 'http://127.0.0.1:8003',

    // URL de producción (Vercel)
    // IMPORTANTE: Actualiza esta URL después de hacer deploy
    productionAPI: 'https://TU-DOMINIO.vercel.app/api',

    // ==================== OBTENER URL ACTUAL ====================

    getAPIURL() {
        if (this.environment === 'production') {
            return this.productionAPI;
        }
        return this.localAPI;
    },

    // ==================== MÉTODOS DE API ====================

    // BingX
    bingx: {
        endpoint(path) {
            const baseURL = CONFIG.getAPIURL();
            if (CONFIG.environment === 'production') {
                return `${baseURL}/bingx`;
            }
            return `${baseURL}/bingx${path}`;
        }
    },

    // MEXC
    mexc: {
        endpoint(path) {
            const baseURL = CONFIG.getAPIURL();
            if (CONFIG.environment === 'production') {
                return `${baseURL}/mexc`;
            }
            return `${baseURL}/mexc${path}`;
        }
    },

    // Bitget
    bitget: {
        endpoint(path) {
            const baseURL = CONFIG.getAPIURL();
            if (CONFIG.environment === 'production') {
                return `${baseURL}/bitget`;
            }
            return `${baseURL}/bitget${path}`;
        }
    },

    // Health check
    health: {
        endpoint() {
            const baseURL = CONFIG.getAPIURL();
            if (CONFIG.environment === 'production') {
                return `${baseURL}/health`;
            }
            return `${baseURL}/health`;
        }
    },

    // ==================== CONFIGURACIÓN ADICIONAL ====================

    // Timeout para peticiones (milisegundos)
    timeout: 30000,

    // Reintentos automáticos
    retries: 3,

    // Delay entre reintentos (milisegundos)
    retryDelay: 2000,

    // ==================== MÉTODOS HELPER ====================

    /**
     * Hacer request a la API
     */
    async request(url, options = {}) {
        const defaultOptions = {
            method: 'POST',
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
            console.log(`📡 Request: ${finalOptions.method} ${url}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...finalOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ Response:`, data);

            return data;

        } catch (error) {
            console.error(`❌ Error en ${url}:`, error.message);
            throw error;
        }
    },

    /**
     * Verificar si el servidor está disponible
     */
    async checkHealth() {
        try {
            const url = this.health.endpoint();
            const response = await fetch(url, {
                method: 'GET',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ API disponible:', data);
                return true;
            }
            return false;
        } catch (error) {
            console.warn('⚠️ API no disponible:', error.message);
            return false;
        }
    },

    /**
     * Auto-detectar entorno
     */
    autoDetectEnvironment() {
        // Si estamos en localhost, usar desarrollo
        if (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1') {
            this.environment = 'development';
            console.log('🏠 Entorno detectado: development');
        } else {
            this.environment = 'production';
            console.log('🌍 Entorno detectado: production');
        }
    },

    /**
     * Mostrar información de configuración
     */
    logConfig() {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║       🚀 TRADER SURVIVOR - CONFIGURACIÓN                  ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║  Entorno: ${this.environment.padEnd(47)} ║`);
        console.log(`║  API URL: ${this.getAPIURL().padEnd(47)} ║`);
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
    }
};

// Auto-detectar entorno al cargar
// Comenta esta línea si quieres control manual
// CONFIG.autoDetectEnvironment();

// Mostrar configuración en consola
CONFIG.logConfig();

// Hacer disponible globalmente
window.CONFIG = CONFIG;

// Exportar para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

/**
 * ==================== INSTRUCCIONES DE USO ====================
 *
 * 1. DESARROLLO LOCAL:
 *    - Deja environment = 'development'
 *    - Inicia el servidor local con: npm start
 *    - Usa la aplicación normalmente
 *
 * 2. PRODUCCIÓN (VERCEL):
 *    - Cambia environment = 'production'
 *    - Actualiza productionAPI con tu URL de Vercel
 *    - Sube a GitHub y Vercel desplegará automáticamente
 *
 * 3. AUTO-DETECCIÓN:
 *    - Descomenta: CONFIG.autoDetectEnvironment();
 *    - El sistema detectará automáticamente si estás en local o producción
 *
 * 4. USO EN TU CÓDIGO:
 *
 *    // Ejemplo BingX
 *    const url = CONFIG.bingx.endpoint('/openApi/swap/v2/user/balance');
 *    const response = await CONFIG.request(url, {
 *        method: 'POST',
 *        body: { apiKey, secretKey, endpoint, params }
 *    });
 *
 *    // Ejemplo MEXC
 *    const url = CONFIG.mexc.endpoint('/api/v1/private/account/assets');
 *    const response = await CONFIG.request(url, {
 *        method: 'POST',
 *        body: { apiKey, secretKey, endpoint, params }
 *    });
 *
 *    // Verificar salud del servidor
 *    const isHealthy = await CONFIG.checkHealth();
 *    if (!isHealthy) {
 *        console.error('API no disponible');
 *    }
 */
