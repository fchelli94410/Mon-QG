// GET  /api/items  -> toutes les fiches de la base (projets, tâches, idées, agenda, à trier)
// POST /api/items  -> crée une nouvelle fiche
import { config, guard, send, readBody, notion, notionErrorMessage, toItem, toProperties } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  const { dataSource } = config();

  try {
    if (req.method === 'GET') {
      const items = [];
      let cursor;
      let guardLoops = 0;
      do {
        const page = await notion(`data_sources/${dataSource}/query`, 'POST', {
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {})
        });
        for (const r of page.results || []) {
          if (r.object === 'page' && !r.in_trash) items.push(toItem(r));
        }
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor && ++guardLoops < 50);
      return send(res, 200, { items, at: new Date().toISOString() });
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      const input = {
        title: body.title,
        type: body.type || 'À trier',
        ...(body.domain ? { domain: body.domain } : {}),
        ...(body.date ? { date: body.date } : {}),
        ...(body.parent ? { parent: body.parent } : {}),
        ...(body.type === 'Projet' ? { projState: body.projState || 'À lancer' } : {})
      };
      const created = await notion('pages', 'POST', {
        parent: { type: 'data_source_id', data_source_id: dataSource },
        properties: toProperties(input)
      });
      return send(res, 201, { item: toItem(created) });
    }

    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'method' });
  } catch (e) {
    if (e.status === 400 && !e.code) return send(res, 400, { error: 'input', message: e.message });
    return send(res, 502, { error: 'notion', message: notionErrorMessage(e) });
  }
}
