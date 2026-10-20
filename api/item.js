// PATCH /api/item?id=...  -> modifie une fiche existante (titre, type, date, domaine, terminé, état, projet, ordre)
// Aucune suppression possible : « terminer » ou « archiver » coche simplement la case Archivé.
import { guard, send, readBody, notionErrorMessage, patchItem, withRetry } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return send(res, 405, { error: 'method' });
  }
  const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '');
  try {
    const body = await readBody(req);
    const item = await withRetry(() => patchItem(id, body));
    return send(res, 200, { item });
  } catch (e) {
    if (e.scope) return send(res, 403, { error: 'scope', message: e.message });
    if (e.status === 400 && !e.code) return send(res, 400, { error: 'input', message: e.message });
    if (e.status === 404) return send(res, 404, { error: 'notfound', message: 'Fiche introuvable dans Notion. Actualise l’appli.' });
    return send(res, 502, { error: 'notion', message: notionErrorMessage(e) });
  }
}
