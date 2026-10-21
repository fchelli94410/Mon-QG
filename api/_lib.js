// Outils partagés du serveur « Mon QG ».
// Règle d'or : on LIT, on CRÉE et on MODIFIE des fiches Notion. On ne SUPPRIME jamais rien.

import crypto from 'node:crypto';

const NOTION_VERSION = '2026-03-11';
const DEFAULT_DATA_SOURCE = '53bab60e-ece1-4f9e-b5fd-c5f0b4957d0f'; // base « Planning par date »

// Noms exacts des colonnes Notion (ne pas renommer dans Notion, ou les changer ici).
export const P = {
  title: 'Élément',
  type: 'Type',
  domain: 'Domaine',
  date: 'Date',
  archived: 'Archivé',
  projState: 'État projet',
  parent: 'Projet parent',
  linked: 'Éléments liés',
  order: 'Ordre', // position dans les listes de l'appli (nombre)
  duration: 'Durée (min)' // durée estimée en minutes
};

export const TYPES = ['Tâche', 'À trier', 'Agenda', 'Projet', 'Idée business', 'Idée'];
export const DOMAINS = ['Personnel', 'Immobilier', 'Professionnel', 'Formation'];
export const PROJ_STATES = ['À lancer', 'En cours', 'En attente'];

export function config() {
  return {
    token: process.env.NOTION_TOKEN || '',
    dataSource: (process.env.NOTION_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE).trim(),
    password: process.env.APP_PASSWORD || ''
  };
}

// ---------- Accès protégé par mot de passe ----------
const COOKIE = 'qg_session';

function sessionValue(password) {
  return crypto.createHmac('sha256', password).update('mon-qg-session-v1').digest('hex');
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

export function isLoggedIn(req) {
  const { password } = config();
  if (!password) return false;
  const got = Buffer.from(readCookie(req, COOKIE));
  const want = Buffer.from(sessionValue(password));
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

export function checkPassword(candidate) {
  const { password } = config();
  if (!password || typeof candidate !== 'string') return false;
  const a = crypto.createHash('sha256').update(candidate).digest();
  const b = crypto.createHash('sha256').update(password).digest();
  return crypto.timingSafeEqual(a, b);
}

export function setSessionCookie(res) {
  const { password } = config();
  const oneYear = 60 * 60 * 24 * 365;
  res.setHeader('Set-Cookie', `${COOKIE}=${sessionValue(password)}; Path=/; Max-Age=${oneYear}; HttpOnly; Secure; SameSite=Lax`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

// ---------- Réponses ----------
export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function guard(req, res) {
  const { token, password } = config();
  if (!password || !token) {
    send(res, 500, { error: 'config', message: 'Réglages manquants sur Vercel : NOTION_TOKEN et APP_PASSWORD.' });
    return false;
  }
  if (!isLoggedIn(req)) {
    send(res, 401, { error: 'login' });
    return false;
  }
  return true;
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

// ---------- Appels à l'API Notion ----------
export async function notion(path, method = 'GET', body) {
  const { token } = config();
  const r = await fetch('https://api.notion.com/v1/' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const err = new Error(data.message || ('Notion ' + r.status));
    err.status = r.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export function notionErrorMessage(e) {
  if (e.status === 401) return 'La clé Notion (NOTION_TOKEN) est refusée. Vérifie-la sur Vercel.';
  if (e.status === 404 || e.code === 'object_not_found') return 'Notion ne trouve pas la base. As-tu bien ajouté la connexion « Mon QG » à la base Notion ?';
  if (e.status === 429) return 'Notion demande de ralentir. Réessaie dans quelques secondes.';
  return 'Erreur Notion : ' + e.message;
}

// ---------- Traduction fiche Notion <-> objet simple ----------
const plain = (rich) => (rich || []).map((t) => t.plain_text || '').join('');

export function toItem(page) {
  const p = page.properties || {};
  const date = p[P.date] && p[P.date].date;
  const rel = (prop) => ((p[prop] && p[prop].relation) || []).map((r) => r.id);
  return {
    id: page.id,
    url: page.url,
    title: plain(p[P.title] && p[P.title].title) || 'Sans titre',
    type: (p[P.type] && p[P.type].select && p[P.type].select.name) || '',
    domain: (p[P.domain] && p[P.domain].select && p[P.domain].select.name) || '',
    date: date ? { start: date.start, end: date.end || null } : null,
    archived: !!(p[P.archived] && p[P.archived].checkbox),
    projState: (p[P.projState] && p[P.projState].select && p[P.projState].select.name) || '',
    parent: rel(P.parent)[0] || null,
    linked: rel(P.linked),
    order: (p[P.order] && typeof p[P.order].number === 'number') ? p[P.order].number : null,
    duration: (p[P.duration] && typeof p[P.duration].number === 'number') ? p[P.duration].number : null,
    created: page.created_time,
    edited: page.last_edited_time
  };
}

// Transforme une demande de l'appli en propriétés Notion.
// Seules les clés présentes sont modifiées ; le reste de la fiche ne bouge pas.
export function toProperties(input) {
  const props = {};
  if ('title' in input) {
    const t = String(input.title || '').trim().slice(0, 1900);
    if (!t) throw Object.assign(new Error('Le titre est vide.'), { status: 400 });
    props[P.title] = { title: [{ type: 'text', text: { content: t } }] };
  }
  if ('type' in input) {
    if (!TYPES.includes(input.type)) throw Object.assign(new Error('Type inconnu.'), { status: 400 });
    props[P.type] = { select: { name: input.type } }; // « Idée » est ajouté automatiquement à la liste Notion la 1re fois
  }
  if ('domain' in input) {
    if (input.domain && !DOMAINS.includes(input.domain)) throw Object.assign(new Error('Domaine inconnu.'), { status: 400 });
    props[P.domain] = { select: input.domain ? { name: input.domain } : null };
  }
  if ('date' in input) {
    const d = input.date;
    if (d && !/^\d{4}-\d{2}-\d{2}/.test(String(d.start || ''))) throw Object.assign(new Error('Date invalide.'), { status: 400 });
    props[P.date] = { date: d ? { start: d.start, end: d.end || null } : null };
  }
  if ('archived' in input) props[P.archived] = { checkbox: !!input.archived };
  if ('projState' in input) {
    if (input.projState && !PROJ_STATES.includes(input.projState)) throw Object.assign(new Error('État inconnu.'), { status: 400 });
    props[P.projState] = { select: input.projState ? { name: input.projState } : null };
  }
  if ('order' in input) {
    const n = input.order;
    if (n !== null && !Number.isFinite(n)) throw Object.assign(new Error('Ordre invalide.'), { status: 400 });
    props[P.order] = { number: n === null ? null : Math.round(n * 1000) / 1000 };
  }
  if ('parent' in input) {
    const id = input.parent;
    if (id && !/^[0-9a-f-]{32,36}$/i.test(id)) throw Object.assign(new Error('Projet invalide.'), { status: 400 });
    props[P.parent] = { relation: id ? [{ id }] : [] };
  }
  if ('duration' in input) {
    const n = input.duration;
    if (n !== null && (!Number.isFinite(n) || n < 0)) throw Object.assign(new Error('Durée invalide.'), { status: 400 });
    props[P.duration] = { number: n === null ? null : n };
  }
  return props;
}

// ---------- Modifier une fiche (avec contrôle : uniquement la base du QG) ----------
export const EDITABLE = ['title', 'type', 'domain', 'date', 'archived', 'projState', 'parent', 'order', 'duration'];
const cleanId = (id) => String(id || '').replace(/-/g, '').toLowerCase();

export async function patchItem(id, body) {
  if (!/^[0-9a-f-]{32,36}$/i.test(String(id))) throw Object.assign(new Error('Identifiant invalide.'), { status: 400 });
  const input = {};
  for (const k of EDITABLE) if (body && k in body) input[k] = body[k];
  if (!Object.keys(input).length) throw Object.assign(new Error('Rien à modifier.'), { status: 400 });
  const properties = toProperties(input);
  const { dataSource } = config();
  const current = await notion('pages/' + id);
  const parentDs = current.parent && (current.parent.data_source_id || '');
  if (cleanId(parentDs) !== cleanId(dataSource)) throw Object.assign(new Error('Cette fiche n’appartient pas à la base du QG.'), { status: 403, scope: true });
  const updated = await notion('pages/' + id, 'PATCH', { properties });
  return toItem(updated);
}

// Réessaie quand Notion demande de ralentir (429).
export async function withRetry(fn, tries = 4) {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) {
      if (e.status !== 429 || i >= tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
}
