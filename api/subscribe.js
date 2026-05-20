export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let email, audience;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    email    = body?.email;
    audience = body?.audience; // 'en' = internationale lijst, alles anders = NL lijst
  } catch {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres' });
  }

  const API_KEY  = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE = audience === 'en'
    ? process.env.MAILCHIMP_AUDIENCE_ID_EN
    : process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER   = process.env.MAILCHIMP_SERVER;

  if (!API_KEY || !AUDIENCE || !SERVER) {
    return res.status(500).json({ error: 'Mailchimp niet geconfigureerd' });
  }

  // btoa werkt in alle Vercel runtimes
  const auth = btoa(`anystring:${API_KEY}`);

  try {
    const mc = await fetch(
      `https://${SERVER}.api.mailchimp.com/3.0/lists/${AUDIENCE}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'pending',
        }),
      }
    );

    const data = await mc.json();

    if (mc.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: data.detail || data.title || 'Onbekende fout' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
