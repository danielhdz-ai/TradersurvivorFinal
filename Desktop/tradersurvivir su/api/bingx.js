import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-KEY, X-SECRET-KEY, X-ACCOUNT-ID');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { apiKey, secretKey, endpoint, params = {} } = req.body;

        if (!apiKey || !secretKey) {
            return res.status(400).json({
                success: false,
                error: 'Faltan credenciales: apiKey y secretKey son requeridos'
            });
        }

        const timestamp = Date.now();
        const allParams = {
            ...params,
            timestamp,
            recvWindow: 60000
        };

        const sortedKeys = Object.keys(allParams).sort();
        const queryString = sortedKeys.map(key => `${key}=${allParams[key]}`).join('&');

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(queryString)
            .digest('hex');

        allParams.signature = signature;

        const urlParams = new URLSearchParams(allParams);
        const url = `https://open-api.bingx.com${endpoint}?${urlParams.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-BX-APIKEY': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('❌ BingX Error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
