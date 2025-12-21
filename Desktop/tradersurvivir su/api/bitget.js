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
        const { apiKey, secretKey, passphrase, method = 'GET', endpoint, body = '' } = req.body;

        if (!apiKey || !secretKey || !passphrase) {
            return res.status(400).json({
                success: false,
                error: 'Faltan credenciales: apiKey, secretKey y passphrase son requeridos'
            });
        }

        const timestamp = Date.now().toString();
        const requestPath = endpoint;

        const prehash = `${timestamp}${method.toUpperCase()}${requestPath}${body}`;

        const signature = crypto
            .createHmac('sha256', secretKey)
            .update(prehash)
            .digest('base64');

        const url = `https://api.bitget.com${requestPath}`;

        const response = await fetch(url, {
            method: method.toUpperCase(),
            headers: {
                'ACCESS-KEY': apiKey,
                'ACCESS-SIGN': signature,
                'ACCESS-TIMESTAMP': timestamp,
                'ACCESS-PASSPHRASE': passphrase,
                'Content-Type': 'application/json'
            },
            body: body || undefined
        });

        const data = await response.json();

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('❌ Bitget Error:', error.message);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
