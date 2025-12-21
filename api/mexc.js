import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

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

        const sortedKeys = Object.keys(params).sort();
        const baseQueryString = sortedKeys.length > 0
            ? sortedKeys.map(key => `${key}=${params[key]}`).join('&')
            : '';

        const signatureString = `${apiKey}${timestamp}${baseQueryString}`;

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(signatureString)
            .digest('hex')
            .toLowerCase();

        const fullQueryString = baseQueryString
            ? `${baseQueryString}&signature=${signature}`
            : `signature=${signature}`;

        const url = `https://contract.mexc.com${endpoint}${fullQueryString ? '?' + fullQueryString : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'ApiKey': apiKey,
                'Request-Time': timestamp.toString(),
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('❌ MEXC Error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
