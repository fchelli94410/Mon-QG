// PATCH /api/item?id=...  -> modifie une fiche existante (titre, type, date, domaine, terminé, état, projet)
// Aucune suppression possible : « terminer » ou « archiver » coche simplement la case Archivé.
import { config, guard, send, readBody, notion, notionErrorMessage, toItem, toProperties } from './_lib.js';

const ALLOWED = ['title', 'type', 'domain', 'date', 'archived', 'projState', 'parent'];
const clean = (id) => String(id || '').replace(/-/g, '').toLowerCase();

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return send(res, 405, { error: 'method' });
  }
  const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '');
  if (!/^[0-9a-f-]{32,36}$/i.test(id)) return send(res, 400, { error: 'input', message: 'Identifiant invalide.' });

  try {
    const body = await readBody(req);
    const input = {};
    for (const k of ALLOWED) if (k in body) input[k] = body[k];
    if (!Object.keys(input).length) return send(res, 400, { error: 'input', message: 'Rien à modifier.' });

    // Sécurité : on ne touche qu'aux fiches de la base « Planning par date ».
    const { dataSource } = config();
    const current = await notion('pages/' + id);
    const parentDs = current.parent && (current.parent.data_source_id || '');
    if (clean(parentDs) !== clean(dataSource)) {
      return send(res, 403, { error: 'scope', message: 'Cette fiche n’appartient pas à la base du QG.' });
    }

    const updated = await notion('pages/' + id, 'PATCH', { properties: toProperties(input) });
    return send(res, 200, { item: toItem(updated) });
  } catch (e) {
    if (e.status === 400 && !e.code) return send(res, 400, { error: 'input', message: e.message });
    if (e.status === 404) return send(res, 404, { error: 'notfound', message: 'Fiche introuvable dans Notion. Actualise l’appli.' });
    return send(res, 502, { error: 'notion', message: notionErrorMessage(e) });
  }
}
