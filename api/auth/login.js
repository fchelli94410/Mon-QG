import { getMsAuthUrl } from '../_ms.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method' });

  const url = await getMsAuthUrl();
  if (!url) return res.status(500).json({ error: 'Microsoft not configured' });

  res.status(200).json({ authUrl: url });
}
