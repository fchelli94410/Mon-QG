import { exchangeCodeForToken } from '../_ms.js';

export default async function handler(req, res) {
  const code = req.query.code || req.query.error;
  if (!code) return res.status(400).json({ error: 'no code' });

  if (req.query.error) return res.status(400).json({ error: req.query.error });

  const tokens = await exchangeCodeForToken(code);
  if (!tokens) return res.status(400).json({ error: 'token exchange failed' });

  // TODO: stocker refreshToken en base (ou en env)
  // Pour l'instant, on renvoie les tokens au client
  res.status(200).json(tokens);
}
