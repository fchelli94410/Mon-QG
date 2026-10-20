// POST /api/batch  { updates: [{ id, patch }] }  -> plusieurs modifications d'un coup (nouvel ordre d'une liste)
// Mêmes règles que /api/item : uniquement la base du QG, jamais de suppression.
import { guard, send, readBody, notionErrorMessage, patchItem, withRetry } from './_lib.js';

const MAX = 60;
const PARALLEL = 3; // Notion accepte environ 3 demandes par seconde

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'method' });
  }
  const body = await readBody(req);
  const updates = Array.isArray(body.updates) ? body.updates : [];
  if (!updates.length) return send(res, 400, { error: 'input', message: 'Rien à modifier.' });
  if (updates.length > MAX) return send(res, 400, { error: 'input', message: 'Trop de modifications d’un coup.' });

  const items = [];
  const failed = [];
  let next = 0;
  async function worker() {
    while (next < updates.length) {
      const u = updates[next++];
      try {
        items.push(await withRetry(() => patchItem(u && u.id, u && u.patch)));
      } catch (e) {
        failed.push({ id: u && u.id, message: e.scope || (e.status === 400 && !e.code) ? e.message : notionErrorMessage(e) });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLEL, updates.length) }, worker));
  if (failed.length) return send(res, items.length ? 207 : 502, { error: 'partial', message: failed[0].message, items, failed });
  return send(res, 200, { items });
}
