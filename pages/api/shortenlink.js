// var fetch = require('node-fetch');

// fetch('https://api-ssl.bitly.com/v4/shorten', {
//     method: 'POST',
//     headers: {
//         'Authorization': 'Bearer {TOKEN}',
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ "long_url": "https://dev.bitly.com", "domain": "bit.ly", "group_guid": "Ba1bc23dE4F" })
// });
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { longUrl } = req.body;

        try {
            const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.BITLY}`, // Ensure BITLY_ACCESS_TOKEN is set in your environment variables
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ long_url: longUrl })
            });

            if (!response.ok) {
                throw new Error('Failed to shorten URL');
            }

            const data = await response.json();
            res.status(200).json({ shortUrl: data.link });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
// This code is an API route for shortening URLs using Bitly.
// It listens for POST requests, extracts the long URL from the request body,
// and sends a request to the Bitly API to shorten the URL.
// If successful, it returns the shortened URL; otherwise, it returns an error message.
// The API key is expected to be stored in an environment variable named BITLY_ACCESS_TOKEN.
// The code also handles method restrictions, allowing only POST requests.
// The Bitly API is used to shorten URLs, and the response is returned in JSON format.  