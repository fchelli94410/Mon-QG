// GET    /api/login -> suis-je connecté ?
// POST   /api/login -> vérifie le mot de passe et ouvre la session (cookie sécurisé, 1 an)
// DELETE /api/login -> se déconnecter
import { config, isLoggedIn, checkPassword, setSessionCookie, clearSessionCookie, send, readBody } from './_lib.js';

export default async function handler(req, res) {
  const { password, token } = config();
  if (req.method === 'GET') {
    return send(res, 200, { loggedIn: isLoggedIn(req), configured: !!(password && token) });
  }
  if (req.method === 'POST') {
    if (!password) return send(res, 500, { error: 'config', message: 'APP_PASSWORD manquant sur Vercel.' });
    const body = await readBody(req);
    if (!checkPassword(body.password)) {
      await new Promise((r) => setTimeout(r, 800)); // freine les essais au hasard
      return send(res, 401, { error: 'password', message: 'Mot de passe incorrect.' });
    }
    setSessionCookie(res);
    return send(res, 200, { loggedIn: true });
  }
  if (req.method === 'DELETE') {
    clearSessionCookie(res);
    return send(res, 200, { loggedIn: false });
  }
  res.setHeader('Allow', 'GET, POST, DELETE');
  return send(res, 405, { error: 'method' });
}
