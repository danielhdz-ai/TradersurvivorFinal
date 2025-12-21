/**
 * SCRIPT PARA ARREGLAR MEXC Y BITGET
 * Este script actualiza las clases de API en index.html
 *
 * INSTRUCCIONES:
 * 1. Abre index.html
 * 2. Busca la clase MEXCAPI (línea ~10686)
 * 3. Reemplaza todo el método makeAuthenticatedRequest con el código de abajo
 */

// ==================== MEXC FIX ====================

// REEMPLAZA el método makeAuthenticatedRequest de MEXCAPI con esto:

async makeAuthenticatedRequest(endpoint, params = {}) {
    try {
        console.log(`📡 Request a través de PROXY: ${endpoint}`);
        console.log(`📋 Parámetros originales:`, params);

        const timestamp = Date.now();

        // Crear query string ordenado alfabéticamente (SIN timestamp en el query)
        const sortedKeys = Object.keys(params).sort();
        const baseQueryString = sortedKeys.length > 0
            ? sortedKeys.map(key => `${key}=${params[key]}`).join('&')
            : '';

        console.log(`🔐 Query string (SIN timestamp): ${baseQueryString || '(vacío)'}`);
        console.log(`🔐 Timestamp: ${timestamp}`);

        // String para firmar: apiKey + timestamp + queryString
        const signatureString = `${this.apiKey}${timestamp}${baseQueryString}`;

        console.log(`🔐 String completo para firma: "${signatureString}"`);
        console.log(`🔐 API Key: ${this.apiKey.substring(0, 15)}...`);
        console.log(`🔐 Secret Key length: ${this.secretKey.length
