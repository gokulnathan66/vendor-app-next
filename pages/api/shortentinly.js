export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { longUrl } = req.body;

        if (!longUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            console.log('Attempting to shorten URL:', longUrl);
            const response = await fetch('https://api.tinyurl.com/create', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.TINYURL_TOKEN}`
                },
                body: JSON.stringify({
                    url: longUrl,
                    domain: "tinyurl.com"
                })
            });

            const responseData = await response.json();
            console.log('TinyURL API Response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to shorten URL');
            }

            if (!responseData.data || !responseData.data.tiny_url) {
                throw new Error('Invalid response from TinyURL API');
            }

            res.status(200).json({ shortUrl: responseData.data.tiny_url });
        } catch (error) {
            console.error('TinyURL API error:', error);
            res.status(500).json({ 
                error: error.message,
                details: 'Failed to shorten URL. Please check the server logs for more details.'
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
