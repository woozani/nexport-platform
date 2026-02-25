export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const requestOrigin = req.headers.origin || '';
  const origin = allowedOrigin && requestOrigin === allowedOrigin ? allowedOrigin : allowedOrigin;
  res.setHeader('Access-Control-Allow-Origin', origin || requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
  if (!HUNTER_API_KEY) return res.status(500).json({ error: 'Hunter.io API key not configured' });

  const { action, domain, first_name, last_name, company, email } = req.query;

  try {
    let url;
    switch (action) {
      case 'domain-search':
        if (!domain) return res.status(400).json({ error: 'domain is required' });
        url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${HUNTER_API_KEY}&limit=10`;
        break;
      case 'email-finder':
        if (!domain || !first_name || !last_name) return res.status(400).json({ error: 'domain, first_name, last_name required' });
        url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(first_name)}&last_name=${encodeURIComponent(last_name)}&api_key=${HUNTER_API_KEY}`;
        break;
      case 'email-verify':
        if (!email) return res.status(400).json({ error: 'email is required' });
        url = `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${HUNTER_API_KEY}`;
        break;
      case 'company-search':
        if (!company) return res.status(400).json({ error: 'company is required' });
        url = `https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(company)}&api_key=${HUNTER_API_KEY}&limit=10`;
        break;
      case 'account':
        url = `https://api.hunter.io/v2/account?api_key=${HUNTER_API_KEY}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Hunter API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
