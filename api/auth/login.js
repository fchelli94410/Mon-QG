import { getMsAuthUrl } from '../_ms.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method' });

  const r = await getMsAuthUrl();
  if (r.error) return res.status(500).json({ error: r.error });

  res.status(200).json({ authUrl: r.url });
}
