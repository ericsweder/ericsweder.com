export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Ongeldig e-mailadres' });
  }

  const API_KEY    = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE   = process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER     = process.env.MAILCHIMP_SERVER;

  const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');

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
          status: 'pending', // double opt-in (GDPR)
        }),
      }
    );

    const data = await mc.json();

    // Al ingeschreven telt ook als succes
    if (mc.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: data.detail || 'Inschrijving mislukt' });
  } catch (err) {
    return res.status(500).json({ error: 'Serverfout' });
  }
}
