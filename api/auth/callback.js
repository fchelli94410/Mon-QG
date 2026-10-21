import { exchangeCodeForToken } from '../_ms.js';

export default async function handler(req, res) {
  const code = req.query.code;
  const error = req.query.error;

  if (error) return res.redirect(302, `/?error=${encodeURIComponent(error)}`);
  if (!code) return res.redirect(302, '/?error=no_code');

  const tokens = await exchangeCodeForToken(code);
  if (!tokens) return res.redirect(302, '/?error=token_failed');

  // Rediriger vers la page d'accueil avec le token
  res.redirect(302, `/?ms_token=${encodeURIComponent(tokens.accessToken)}&ms_refresh=${encodeURIComponent(tokens.refreshToken)}`);
}
