// Mon QG — l'appli (affichage + actions). Les données viennent de Notion via /api.
'use strict';

/* =========================================================
   1. Réglages et petites aides
   ========================================================= */
const DOMAINS = ['Personnel', 'Immobilier', 'Professionnel', 'Formation'];
const DOM_COLOR = { Professionnel: 'var(--dot-pro)', Immobilier: 'var(--dot-immo)', Personnel: 'var(--dot-perso)', Formation: 'var(--dot-form)' };
const ADD_TYPES = ['Tâche', 'Agenda', 'Projet', 'Idée business', 'Idée', 'À trier'];
const PROJ_STATES = ['En cours', 'À lancer', 'En attente'];
const STATE_COLOR = { 'En cours': 'var(--dot-pro)', 'À lancer': 'var(--dot-none)', 'En attente': 'var(--dot-immo)' };
const VIEWS = ['jour', 'semaine', 'plustard', 'projets', 'idees', 'atrier'];
const CACHE_KEY = 'qg_cache_v1';

const ICON = {
  sun: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  week: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="14" rx="1.5"/></svg>',
  cal: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  flag: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>',
  bulb: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  inbox: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l2.5-7h13L21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/></svg>',
  plus: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  plusSm: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  report: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/><path d="M16 5l4 4-4 4"/></svg>',
  gear: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  left: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  sync: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/></svg>',
  ext: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  calSm: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/></svg>'
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const domColor = (d) => DOM_COLOR[d] || 'var(--dot-none)';
const pad = (n) => String(n).padStart(2, '0');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Dates (toujours en heure locale du téléphone) ---------- */
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const weekStart = (k) => { const d = parseKey(k); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return keyOf(d); };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
const isDateTime = (s) => typeof s === 'string' && s.length > 10;
function itemDay(it) {
  if (!it.date || !it.date.start) return null;
  const s = it.date.start;
  return isDateTime(s) ? keyOf(new Date(s)) : s.slice(0, 10);
}
function itemTime(it) {
  if (!it.date || !isDateTime(it.date.start)) return '';
  const d = new Date(it.date.start);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function itemEndTime(it) {
  if (!it.date || !isDateTime(it.date.end)) return '';
  const d = new Date(it.date.end);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toLocalISO(d) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return `${keyOf(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
// Déplace une date vers un autre jour en gardant l'heure et la durée.
function shiftDate(date, newDay) {
  const s = date.start;
  if (!isDateTime(s)) {
    const diff = daysBetween(s.slice(0, 10), newDay);
    return { start: newDay, end: date.end ? addDays(date.end.slice(0, 10), diff) : null };
  }
  const old = new Date(s);
  const nd = parseKey(newDay);
  nd.setHours(old.getHours(), old.getMinutes(), 0, 0);
  const ms = nd - old;
  return { start: toLocalISO(nd), end: date.end ? toLocalISO(new Date(new Date(date.end).getTime() + ms)) : null };
}
const fmt = (k, opts) => new Intl.DateTimeFormat('fr-FR', opts).format(parseKey(k));
const fmtShort = (k) => fmt(k, { day: 'numeric', month: 'short' });
function isoWeek(k) {
  const d = parseKey(k);
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - y0) / 86400000 + 1) / 7);
}
function lateText(it) {
  const n = daysBetween(itemDay(it), todayKey());
  return n <= 1 ? 'En retard depuis hier' : `En retard depuis ${n} jours`;
}
function fmtDuration(min) {
  if (!min || min <= 0) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m}`;
}

/* =========================================================
   2. État de l'appli
   ========================================================= */
const S = {
  items: [],
  view: VIEWS.includes(localStorage.getItem('qg_view')) ? localStorage.getItem('qg_view') : 'jour',
  weekOffset: 0, monthOffset: 0, selDay: null,
  projFilter: 'En cours', openIdea: null, openTri: null,
  loading: true, error: null, syncedAt: null, needLogin: false, syncing: false,
  sessionDone: new Set(), dragging: false, justDragged: 0, scrollWeek: true,
  sheet: null, toastTimer: null
};
const byId = (id) => S.items.find((i) => i.id === id);
// Rendez-vous Outlook masqués : retenus sur cet appareil seulement (rien n'est changé dans Outlook).
const HIDDEN_KEY = 'qg_hidden_ms';
const isMs = (it) => it && it.source === 'outlook';
function hiddenSet() {
  try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]')); } catch { return new Set(); }
}
function saveHidden(set) {
  try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([...set])); } catch { /* rien */ }
}
function applyHidden(items, prune) {
  const h = hiddenSet();
  if (prune) {
    const ids = new Set(items.filter(isMs).map((i) => i.id));
    let changed = false;
    h.forEach((id) => { if (!ids.has(id)) { h.delete(id); changed = true; } });
    if (changed) saveHidden(h);
  }
  items.forEach((i) => { if (isMs(i)) i.archived = h.has(i.id); });
  return items;
}
function hideMs(id, on) {
  const h = hiddenSet();
  if (on) h.add(id); else h.delete(id);
  saveHidden(h);
  const it = byId(id);
  if (it) it.archived = !!on;
  saveCache();
  render();
}
const active = (i) => !i.archived;
const projects = () => S.items.filter((i) => i.type === 'Projet');
function projectOf(it) {
  if (it.parent) return byId(it.parent) || null;
  return projects().find((p) => p.linked.includes(it.id)) || null;
}
function linkedOf(p) {
  const ids = new Set(p.linked);
  S.items.forEach((i) => { if (i.parent === p.id) ids.add(i.id); });
  ids.delete(p.id);
  return [...ids].map(byId).filter(Boolean);
}
const byDayThenTime = (a, b) => (itemDay(a) || '').localeCompare(itemDay(b) || '') || itemTime(a).localeCompare(itemTime(b));
const doneLast = (a, b) => (a.archived - b.archived) || itemTime(a).localeCompare(itemTime(b)) || (a.created || '').localeCompare(b.created || '');
// Ordre choisi à la main (colonne Notion « Ordre ») : les cartes déjà rangées passent d'abord, dans leur ordre ;
// les autres suivent avec le tri habituel.
const hasOrder = (i) => typeof i.order === 'number';
const byOrder = (fallback) => (a, b) => {
  const oa = hasOrder(a);
  const ob = hasOrder(b);
  if (oa && ob && a.order !== b.order) return a.order - b.order;
  if (oa !== ob) return oa ? -1 : 1;
  return fallback(a, b);
};
const newestFirst = (a, b) => (b.created || '').localeCompare(a.created || '');
const dayListSort = byOrder((a, b) => {
  const ta = itemTime(a) || (a.type === 'Agenda' ? '00:00' : '99:99');
  const tb = itemTime(b) || (b.type === 'Agenda' ? '00:00' : '99:99');
  return ta.localeCompare(tb) || (a.created || '').localeCompare(b.created || '');
});
const todayListSort = (a, b) => (a.archived - b.archived) || byOrder(doneLast)(a, b);

try {
  const c = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  if (c && Array.isArray(c.items)) { S.items = applyHidden(c.items); S.loading = false; }
} catch { /* rien */ }

/* =========================================================
   3. Échanges avec le serveur
   ========================================================= */
async function api(path, opts = {}) {
  const r = await fetch(path, {
    method: opts.method || 'GET',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin'
  });
  let data = {};
  try { data = await r.json(); } catch { /* rien */ }
  if (r.status === 401 && data.error === 'login') {
    S.needLogin = true;
    localStorage.removeItem(CACHE_KEY);
    render();
    throw new Error('login');
  }
  if (!r.ok) throw new Error(data.message || `Erreur ${r.status}`);
  return data;
}

async function load(silent) {
  if (S.syncing) return;
  S.syncing = true;
  if (!silent) render();
  try {
    const msToken = localStorage.getItem('ms_token');
    const msRef = localStorage.getItem('ms_refresh');
    const q = new URLSearchParams();
    if (msToken) q.set('ms_token', msToken);
    if (msRef) q.set('ms_refresh', msRef);
    const path = q.toString() ? `/api/items?${q}` : '/api/items';
    const d = await api(path);
    S.items = applyHidden(d.items, !!(msToken || msRef) && !d.ms_expired);
    try {
      if (d.ms_tokens) {
        localStorage.setItem('ms_token', d.ms_tokens.accessToken);
        if (d.ms_tokens.refreshToken) localStorage.setItem('ms_refresh', d.ms_tokens.refreshToken);
      }
      if (d.ms_expired) { localStorage.removeItem('ms_token'); localStorage.removeItem('ms_refresh'); toast('Outlook déconnecté, reconnecte-le dans Réglages', { err: true }); }
    } catch { /* rien */ }
    S.error = null;
    S.syncedAt = new Date();
    S.needLogin = false;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ items: d.items, at: d.at })); } catch { /* plein */ }
  } catch (e) {
    if (e.message !== 'login') S.error = navigator.onLine === false ? 'Pas de connexion internet.' : e.message;
  }
  S.loading = false;
  S.syncing = false;
  render();
}

function saveCache() {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ items: S.items, at: new Date().toISOString() })); } catch { /* plein */ }
}

function relinkLocally(id, oldParent, newParent) {
  if (oldParent === newParent) return;
  const o = oldParent && byId(oldParent);
  if (o) o.linked = o.linked.filter((x) => x !== id);
  const n = newParent && byId(newParent);
  if (n && !n.linked.includes(id)) n.linked = [...n.linked, id];
}

// Modifie une fiche : l'écran change tout de suite, Notion suit en arrière-plan.
async function update(id, patch) {
  const it = byId(id);
  if (!it) return;
  if (isMs(it)) { // rendez-vous Outlook : on ne touche ni à Notion ni à Outlook
    if ('archived' in patch) hideMs(id, patch.archived);
    return it;
  }
  const before = { ...it, linked: [...it.linked] };
  const oldParent = it.parent;
  Object.assign(it, patch);
  if ('parent' in patch) relinkLocally(id, oldParent, patch.parent || null);
  render();
  try {
    const d = await api('/api/item?id=' + encodeURIComponent(id), { method: 'PATCH', body: patch });
    Object.assign(it, d.item, { linked: d.item.linked.length ? d.item.linked : it.linked });
    saveCache();
    render();
    return it;
  } catch (e) {
    if (e.message === 'login') return;
    Object.assign(it, before);
    if ('parent' in patch) relinkLocally(id, patch.parent || null, oldParent);
    render();
    toast('Pas enregistré : ' + e.message, { err: true });
    throw e;
  }
}

// Plusieurs fiches d'un coup (nouvel ordre d'une liste) : écran tout de suite, Notion en arrière-plan.
async function updateMany(changes, okText) {
  const list = changes.filter((c) => byId(c.id) && c.patch && Object.keys(c.patch).length);
  if (!list.length) { render(); return; }
  const before = list.map((c) => { const it = byId(c.id); return [it, { ...it, linked: [...it.linked] }]; });
  list.forEach((c) => Object.assign(byId(c.id), c.patch));
  render();
  try {
    const d = list.length === 1
      ? { items: [(await api('/api/item?id=' + encodeURIComponent(list[0].id), { method: 'PATCH', body: list[0].patch })).item] }
      : await api('/api/batch', { method: 'POST', body: { updates: list } });
    (d.items || []).forEach((n) => { const it = byId(n.id); if (it) Object.assign(it, n, { linked: n.linked.length ? n.linked : it.linked }); });
    if (d.failed && d.failed.length) {
      const bad = new Set(d.failed.map((f) => f.id));
      before.forEach(([it, b]) => { if (bad.has(it.id)) Object.assign(it, b); });
      render();
      toast('Pas tout enregistré : ' + d.message, { err: true });
      return;
    }
    saveCache();
    render();
    if (okText) toast(okText);
  } catch (e) {
    if (e.message === 'login') return;
    before.forEach(([it, b]) => Object.assign(it, b));
    render();
    toast('Pas enregistré : ' + e.message, { err: true });
  }
}

// Calcule le nouvel ordre d'une liste après un déplacement (le moins de fiches possible à modifier).
function orderPatches(ids, movedId) {
  const items = ids.map(byId).filter(Boolean);
  const idx = items.findIndex((i) => i.id === movedId);
  const others = items.filter((_, i) => i !== idx);
  const sorted = others.every((it, i) => hasOrder(it) && (i === 0 || it.order > others[i - 1].order));
  if (idx > -1 && sorted) {
    const prev = items[idx - 1];
    const next = items[idx + 1];
    let v = 1000;
    if (prev && next) v = (prev.order + next.order) / 2;
    else if (prev) v = prev.order + 1000;
    else if (next) v = next.order - 1000;
    if (!(prev && next) || next.order - prev.order > 0.01) return [{ id: movedId, order: Math.round(v * 1000) / 1000 }];
  }
  return items.map((it, i) => ({ id: it.id, order: (i + 1) * 1000 })).filter((o) => byId(o.id).order !== o.order);
}

async function create(input) {
  const d = await api('/api/items', { method: 'POST', body: input });
  S.items.push(d.item);
  if (d.item.parent) relinkLocally(d.item.id, null, d.item.parent);
  saveCache();
  render();
  return d.item;
}

/* =========================================================
   4. Petits effets : célébration, messages
   ========================================================= */
const CHEERS = ['Bien joué !', 'Une de moins !', 'Bravo !', 'Bien envoyé !', 'Et hop !'];
function celebrate(x, y) {
  const cols = ['#5B9DFF', '#FF9F43', '#C084FC', '#34D399', '#FFD27A'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('i');
    const a = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
    const r = 70 + Math.random() * 70;
    p.className = 'confetti';
    p.style.left = x - 5 + 'px';
    p.style.top = y - 5 + 'px';
    p.style.background = cols[i % cols.length];
    p.style.borderRadius = i % 2 ? '50%' : '3px';
    p.style.setProperty('--dx', Math.round(Math.cos(a) * r) + 'px');
    p.style.setProperty('--dy', Math.round(Math.sin(a) * r) + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
  const c = document.createElement('div');
  c.className = 'cheer';
  c.textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 1700);
  if (navigator.vibrate) navigator.vibrate(15);
}

function toast(text, opts = {}) {
  const root = document.getElementById('toast-root');
  clearTimeout(S.toastTimer);
  root.innerHTML = `<div class="toast ${opts.err ? 'err' : ''}" role="status"><span>${esc(text)}</span>${opts.undo ? '<button type="button" data-a="undo">Annuler</button>' : ''}</div>`;
  S.undo = opts.undo || null;
  S.toastTimer = setTimeout(() => { root.innerHTML = ''; S.undo = null; }, opts.err ? 4500 : 3200);
}

/* =========================================================
   5. Morceaux d'affichage réutilisés
   ========================================================= */
// catégorie = petit point coloré + nom en gris
const cat = (label, c) => `<span class="cat" style="--c:${c}"><i aria-hidden="true"></i>${esc(label)}</span>`;

function inboxBtn() {
  const n = S.items.filter((i) => i.type === 'À trier' && active(i)).length;
  return `<button class="icon-btn" type="button" data-a="tab" data-v="atrier" aria-label="À trier (${n})">${ICON.inbox}${n ? `<span class="badge">${n}</span>` : ''}</button>`;
}
function syncBtn() {
  return `<button class="icon-btn sm" type="button" data-a="sync" aria-label="Actualiser">${S.syncing ? ICON.sync.replace('<svg', '<svg class="spin"') : ICON.sync}</button>`;
}
function settingsBtn() {
  return `<button class="icon-btn" type="button" data-a="settings" aria-label="Réglages">${ICON.gear}</button>`;
}
function header(eyebrow, title, right = '') {
  return `<header class="hdr"><div class="hdr-txt"><span class="eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1></div><div class="hdr-btns">${right}</div></header>`;
}
function banner() {
  if (!S.error) return '';
  return `<div class="banner"><span>${esc(S.error)}</span><button class="btn-sm" type="button" data-a="sync">Réessayer</button></div>`;
}

// durée prévue : celle choisie, sinon calculée depuis l'heure de fin
function durOf(it) {
  if (it.duration) return it.duration;
  const d = it.date;
  if (!d || !d.start || !d.end || d.start.length <= 10) return null;
  const m = Math.round((new Date(d.end) - new Date(d.start)) / 60000);
  return m > 0 && m < 24 * 60 ? m : null;
}
const durBadge = (it) => { const m = durOf(it); return m ? `<span class="dur">⏱ ${esc(fmtDuration(m))}</span>` : ''; };

function cardHTML(it, o = {}) {
  const meta = [cat(it.domain || 'Sans catégorie', domColor(it.domain))];
  if (o.late) meta.push(`<span class="late-txt">${lateText(it)}</span>`);
  if (o.showDay && itemDay(it)) meta.push(`<span>${esc(fmtShort(itemDay(it)))}</span>`);
  if (itemTime(it)) meta.push(`<span>${itemTime(it)}</span>`);
  if (durOf(it)) meta.push(durBadge(it));
  const p = o.showProj === false ? null : projectOf(it);
  if (p) meta.push(`<span>${esc(p.title)}</span>`);
  const check = it.type === 'Tâche' || o.forceCheck
    ? `<button class="chk" type="button" data-a="done" data-id="${it.id}" aria-label="${it.archived ? 'Rouvrir' : 'Terminer'} : ${esc(it.title)}">${ICON.check}</button>`
    : '';
  return `<div class="card ${o.late ? 'is-late' : ''} ${it.archived ? 'is-done' : ''} ${S.justDropped === it.id ? 'just-dropped' : ''}" data-id="${it.id}"${o.dragType ? ` data-dtype="${o.dragType}"` : ''}>
    ${check}
    <button class="card-body" type="button" data-a="edit" data-id="${it.id}"><span class="card-title">${esc(it.title)}</span><span class="card-meta">${meta.join('')}</span></button>
    ${o.extra || ''}</div>`;
}

function rdvHTML(it) {
  const t = itemTime(it);
  const e = itemEndTime(it);
  const p = projectOf(it);
  return `<div class="rdv"><div class="rdv-time">${t || 'Journée'}${e ? `<span>${e}</span>` : ''}</div>
    <button class="rdv-card" type="button" data-a="edit" data-id="${it.id}"><b>${esc(it.title)}</b><span class="card-meta">${cat(it.domain || 'Agenda', it.domain ? domColor(it.domain) : 'var(--dot-rdv)')}${durBadge(it)}${p ? `<span>${esc(p.title)}</span>` : ''}</span></button></div>`;
}

/* =========================================================
   6. Les écrans
   ========================================================= */
function viewJour() {
  const t = todayKey();
  const tasks = S.items.filter((i) => i.type === 'Tâche');
  const late = tasks.filter((i) => itemDay(i) && itemDay(i) < t && (active(i) || S.sessionDone.has(i.id))).sort(byDayThenTime);
  const today = tasks.filter((i) => itemDay(i) === t).sort(todayListSort);
  const rdv = S.items.filter((i) => i.type === 'Agenda' && active(i) && itemDay(i) === t).sort(byDayThenTime);
  const total = late.length + today.length;
  const done = late.filter((i) => i.archived).length + today.filter((i) => i.archived).length;
  const lateOpen = late.filter(active).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const totalDur = today.reduce((sum, i) => sum + (durOf(i) || 0), 0);
  const durStr = totalDur ? ` · ${fmtDuration(totalDur)} prévues` : '';

  return `<main class="screen">
    ${header(cap(fmt(t, { weekday: 'long', day: 'numeric', month: 'long' })), "Aujourd'hui", inboxBtn() + settingsBtn())}
    ${banner()}
    <section class="today-box" aria-label="Avancement du jour">
      <div class="today-top"><span>Ta journée</span><strong>${done} / ${total} faite${done > 1 ? 's' : ''}${durStr}</strong></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="today-stats"><span class="l">${lateOpen} en retard</span><span>${today.filter(active).length} tâche${today.filter(active).length > 1 ? 's' : ''}</span><span>${rdv.length} rendez-vous</span></div>
    </section>
    ${late.length ? `<section class="sec"><h2 class="late">En retard</h2>
      <div class="sortlist" data-sort="late" data-family="jour" data-lock="1">${late.map((i) => cardHTML(i, { late: !i.archived, extra: i.archived ? '' : `<button class="icon-mini" type="button" data-a="totoday" data-id="${i.id}" aria-label="Reporter à aujourd’hui : ${esc(i.title)}" title="Reporter à aujourd’hui">${ICON.report}</button>` })).join('')}</div></section>` : ''}
    <section class="sec"><h2>Rendez-vous</h2>
      ${rdv.length ? rdv.map(rdvHTML).join('') : '<div class="empty">Aucun rendez-vous aujourd’hui</div>'}</section>
    <section class="sec"><div class="sec-h"><h2>Tâches du jour</h2></div>
      <div class="sortlist" data-sort="today" data-family="jour" data-empty="Rien de prévu aujourd’hui">${today.map((i) => cardHTML(i)).join('')}</div></section>
  </main>`;
}

function weekCardHTML(it, t) {
  const late = it.type === 'Tâche' && itemDay(it) < t;
  const label = it.type === 'Agenda' ? 'RDV' + (itemTime(it) ? ' · ' + itemTime(it) : '')
    : it.type === 'Projet' ? 'Échéance projet' : (it.domain || 'Tâche');
  const c = it.type === 'Agenda' && !it.domain ? 'var(--dot-rdv)' : domColor(it.domain);
  const p = it.type !== 'Projet' ? projectOf(it) : null;
  const extra = [it.type === 'Tâche' && itemTime(it) ? itemTime(it) : '', p ? p.title : ''].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join('');
  const canCheck = (it.type === 'Tâche' || it.type === 'Agenda') && it.source !== 'outlook';
  const check = canCheck
    ? `<button class="chk" type="button" data-a="done" data-id="${it.id}" aria-label="Terminer : ${esc(it.title)}">${ICON.check}</button>`
    : '';
  return `<div class="wcard ${late ? 'is-late' : ''} ${S.justDropped === it.id ? 'just-dropped' : ''}" data-id="${it.id}" data-a="edit" role="button" tabindex="0" aria-label="${esc(it.title)}">
    ${check}<div class="wbody"><span class="card-title">${esc(it.title)}</span><span class="card-meta">${cat(label, c)}${late ? '<span class="late-txt">En retard</span>' : ''}${durBadge(it)}${extra}</span></div></div>`;
}

function viewSemaine() {
  const t = todayKey();
  const start = addDays(t, S.weekOffset * 7); // 7 jours glissants à partir d'aujourd'hui
  const days = [...Array(7)].map((_, i) => addDays(start, i));
  const shown = S.items.filter((i) => active(i) && ['Tâche', 'Agenda', 'Projet'].includes(i.type));
  const per = Object.fromEntries(days.map((d) => [d, shown.filter((i) => itemDay(i) === d).sort(dayListSort)]));
  const range = `${fmt(days[0], { day: 'numeric' })} – ${fmt(days[6], { day: 'numeric', month: 'long' })}`;

  const strip = days.map((d) => {
    const n = per[d].length;
    const hasLate = per[d].some((i) => i.type === 'Tâche' && d < t);
    return `<button type="button" class="${d === t ? 'today' : ''} ${n ? 'has' : ''} ${hasLate ? 'has-late' : ''}" data-a="gocol" data-day="${d}" aria-label="${esc(fmt(d, { weekday: 'long', day: 'numeric' }))}, ${n} élément${n > 1 ? 's' : ''}"><small>${fmt(d, { weekday: 'narrow' })}</small><b>${parseKey(d).getDate()}</b><i></i></button>`;
  }).join('');

  const cols = days.map((d) => `<section class="col ${d === t ? 'today' : ''}" id="col-${d}" data-drop aria-label="${esc(fmt(d, { weekday: 'long', day: 'numeric', month: 'long' }))}">
      <div class="col-h"><div><b>${d === t ? "Aujourd'hui" : fmt(d, { weekday: 'long' })}</b><span>${esc(fmt(d, { day: 'numeric', month: 'short' }))}</span></div><span class="count">${per[d].length}</span></div>
      <div class="col-list" data-day="${d}" data-sort="day:${d}" data-family="week">${per[d].map((i) => weekCardHTML(i, t)).join('')}</div>
      <button class="col-add" type="button" data-a="add" data-date="${d}">${ICON.plusSm} Ajouter</button>
    </section>`).join('');

  const nav = `<div class="week-nav">
      ${S.weekOffset ? '<button class="btn-sm" type="button" data-a="week" data-n="0">Aujourd’hui</button>' : ''}
      <button class="icon-btn sm" type="button" data-a="week" data-n="-1" aria-label="7 jours précédents">${ICON.left}</button>
      <button class="icon-btn sm" type="button" data-a="week" data-n="1" aria-label="7 jours suivants">${ICON.right}</button></div>`;

  return `<main class="screen wide">
    <div class="pad" style="display:flex;flex-direction:column;gap:14px">
      ${header(range, S.weekOffset ? 'Semaine' : '7 prochains jours', nav)}
      ${banner()}
      <div class="strip">${strip}</div>
    </div>
    <div class="week" id="week">${cols}</div>
  </main>`;
}

function viewPlusTard() {
  const t = todayKey();
  const base = parseKey(t);
  base.setDate(1);
  base.setMonth(base.getMonth() + S.monthOffset);
  const y = base.getFullYear();
  const m = base.getMonth();
  const first = keyOf(base);
  const nDays = new Date(y, m + 1, 0).getDate();
  const keys = [...Array(nDays)].map((_, i) => keyOf(new Date(y, m, i + 1)));
  const shown = S.items.filter((i) => active(i) && ['Tâche', 'Agenda', 'Projet'].includes(i.type));
  const inMonth = (k) => shown.filter((i) => itemDay(i) === k);
  if (!S.selDay || S.selDay.slice(0, 7) !== first.slice(0, 7)) {
    S.selDay = t.slice(0, 7) === first.slice(0, 7) ? t : (keys.find((k) => inMonth(k).length) || first);
  }
  const blanks = (parseKey(first).getDay() + 6) % 7;
  const cells = [...Array(blanks)].map(() => '<span class="mcell blank" aria-hidden="true"></span>').join('') + keys.map((k) => {
    const ev = inMonth(k);
    const dots = ev.slice(0, 3).map((i) => `<i style="--c:${i.type === 'Agenda' && !i.domain ? 'var(--dot-rdv)' : domColor(i.domain)}"></i>`).join('');
    return `<button type="button" class="mcell ${ev.length ? 'has' : ''} ${k === t ? 'is-today' : ''} ${k === S.selDay ? 'sel' : ''}" data-a="selday" data-day="${k}" aria-label="${esc(fmt(k, { weekday: 'long', day: 'numeric', month: 'long' }))}, ${ev.length} élément${ev.length > 1 ? 's' : ''}" aria-pressed="${k === S.selDay}">${parseKey(k).getDate()}<span class="dots">${dots}</span></button>`;
  }).join('');
  const sel = inMonth(S.selDay);
  const selRdv = sel.filter((i) => i.type === 'Agenda').sort(byDayThenTime);
  const selCards = sel.filter((i) => i.type !== 'Agenda').sort(dayListSort);
  const todo = S.items.filter((i) => i.type === 'Tâche' && active(i) && !i.date).sort(byOrder(newestFirst));

  return `<main class="screen">
    ${header('Vue mois', 'Plus tard', inboxBtn() + settingsBtn())}
    ${banner()}
    <section class="month" aria-label="Calendrier">
      <div class="month-h">
        <button class="icon-btn sm" type="button" data-a="month" data-n="-1" aria-label="Mois précédent">${ICON.left}</button>
        <b>${esc(fmt(first, { month: 'long', year: 'numeric' }))}</b>
        <button class="icon-btn sm" type="button" data-a="month" data-n="1" aria-label="Mois suivant">${ICON.right}</button>
      </div>
      <div class="month-days" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
      <div class="month-grid">${cells}</div>
    </section>
    <section class="sec"><div class="sec-h"><h2>${esc(fmt(S.selDay, { weekday: 'long', day: 'numeric', month: 'long' }))}</h2>
      <button class="btn-sm btn-ghost" type="button" data-a="add" data-date="${S.selDay}">${ICON.plusSm} Ajouter</button></div>
      ${selRdv.map(rdvHTML).join('')}
      <div class="sortlist" data-sort="day:${S.selDay}" data-family="later" data-accept="later,later-p" data-empty="${selRdv.length ? 'Pas d’autre tâche ce jour-là' : 'Rien ce jour-là'}">${selCards.map((i) => cardHTML(i, { late: i.type === 'Tâche' && S.selDay < t, dragType: i.type === 'Tâche' ? 'later' : 'later-p' })).join('')}</div>
    </section>
    <section class="sec"><div class="sec-h"><h2>À planifier · sans date</h2><span class="count">${todo.length}</span></div>
      <div class="sortlist" data-sort="todo" data-family="later" data-empty="Tout est planifié">${todo.map((i) => cardHTML(i, { extra: `<button class="btn-sm" type="button" data-a="plan" data-id="${i.id}">${ICON.calSm} Planifier</button>` })).join('')}</div>
    </section>
  </main>`;
}

function projectStats(p) {
  const linked = linkedOf(p);
  const tasks = linked.filter((i) => i.type === 'Tâche');
  const done = tasks.filter((i) => i.archived).length;
  const t = todayKey();
  const dated = tasks.filter((i) => i.date).sort(byDayThenTime);
  const next = dated.find((i) => active(i) && itemDay(i) >= t) || tasks.find((i) => active(i) && !i.date) || dated.find(active);
  let marks = [];
  const s = p.date && itemDay(p);
  const e = p.date && p.date.end ? p.date.end.slice(0, 10) : null;
  if (s && e && e > s) {
    const span = daysBetween(s, e);
    marks = dated.map((i) => ({ left: Math.max(0, Math.min(100, (daysBetween(s, itemDay(i)) / span) * 100)), done: i.archived, title: i.title }));
  }
  return { linked, tasks, done, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0, next, marks };
}
function projWhen(p) {
  if (!p.date) return '';
  const s = itemDay(p);
  return p.date.end ? `${fmtShort(s)} → ${fmtShort(p.date.end.slice(0, 10))}` : `échéance ${fmtShort(s)}`;
}

function viewProjets() {
  const all = projects().filter(active);
  const stateOf = (p) => p.projState || 'À lancer';
  const counts = { Tous: all.length };
  PROJ_STATES.forEach((s) => { counts[s] = all.filter((p) => stateOf(p) === s).length; });
  const f = S.projFilter;
  const order = (p) => PROJ_STATES.indexOf(stateOf(p));
  const list = all.filter((p) => f === 'Tous' || stateOf(p) === f).sort((a, b) =>
    order(a) - order(b) || byOrder((x, y) => (itemDay(x) || '9999').localeCompare(itemDay(y) || '9999') || x.title.localeCompare(y.title, 'fr'))(a, b));

  const cards = list.map((p) => {
    const st = projectStats(p);
    const c = domColor(p.domain);
    const s = stateOf(p);
    return `<button class="proj ${S.justDropped === p.id ? 'just-dropped' : ''}" type="button" style="--c:${c}" data-a="proj" data-id="${p.id}">
      <span class="proj-top">${cat(p.domain || 'Sans catégorie', c)}<span class="state" style="--s:${STATE_COLOR[s]}"><i aria-hidden="true"></i>${s}</span></span>
      <h3>${esc(p.title)}</h3>
      <span class="proj-info"><span>${st.tasks.length ? `${st.done} / ${st.tasks.length} tâches · ${st.pct} %` : 'Aucune tâche liée'}</span><span>${esc(projWhen(p))}</span></span>
      <span class="pbar"><i style="width:${Math.max(st.pct, 2)}%"></i>${st.marks.map((mk) => `<em class="${mk.done ? 'done' : ''}" style="left:${mk.left}%" title="${esc(mk.title)}"></em>`).join('')}</span>
      ${st.next ? `<span class="next-step">${esc(st.next.title)}${st.next.date ? ' · ' + esc(fmtShort(itemDay(st.next))) : ''}</span>` : ''}
    </button>`;
  }).join('');

  return `<main class="screen">
    ${header(`${all.length} projets · ${counts['En cours']} en cours`, 'Projets', inboxBtn() + settingsBtn())}
    ${banner()}
    <div class="filters" role="group" aria-label="Filtrer par état">
      ${['En cours', 'À lancer', 'En attente', 'Tous'].map((k) => `<button class="pill" type="button" data-a="pfilter" data-v="${k}" aria-pressed="${f === k}">${k}<small>${counts[k]}</small></button>`).join('')}
    </div>
    ${f === 'Tous'
      ? (cards || '<div class="empty">Aucun projet</div>')
      : `<div class="sortlist" data-sort="projects" data-family="projects" data-empty="Aucun projet « ${esc(f)} »">${cards}</div>`}
  </main>`;
}

function ideaHTML(it) {
  const c = domColor(it.domain);
  const open = S.openIdea === it.id;
  return `<article class="idea ${open ? 'open' : ''} ${S.justDropped === it.id ? 'just-dropped' : ''}" style="--c:${c}" data-id="${it.id}">
    <button class="idea-top" type="button" data-a="openidea" data-id="${it.id}" aria-expanded="${open}"><span class="card-title">${esc(it.title)}</span><span class="card-meta">${cat(it.domain || 'Sans catégorie', c)}</span></button>
    ${open ? `<div class="grid2">
      <button class="big light" type="button" data-a="totask" data-id="${it.id}">→ Tâche</button>
      <button class="big" type="button" data-a="toproj" data-id="${it.id}">→ Projet</button>
      <button class="big" type="button" data-a="edit" data-id="${it.id}">Modifier</button>
      <button class="big" type="button" data-a="archive" data-id="${it.id}">Archiver</button>
    </div>` : ''}
  </article>`;
}

function viewIdees() {
  const sort = byOrder(newestFirst);
  const biz = S.items.filter((i) => i.type === 'Idée business' && active(i)).sort(sort);
  const other = S.items.filter((i) => i.type === 'Idée' && active(i)).sort(sort);
  return `<main class="screen">
    ${header(`${biz.length + other.length} idées en réserve`, 'Idées', inboxBtn() + settingsBtn())}
    ${banner()}
    <section class="zone" data-drop aria-label="Idées business">
      <div class="zone-h"><h2>Idées business</h2><button class="btn-sm" type="button" data-a="add" data-type="Idée business">${ICON.plusSm} Idée</button></div>
      <div class="sortlist" data-sort="ideas:biz" data-family="ideas" data-empty="Aucune idée business">${biz.map(ideaHTML).join('')}</div>
    </section>
    <section class="zone" data-drop aria-label="Autres idées">
      <div class="zone-h"><h2>Autres idées</h2><button class="btn-sm" type="button" data-a="add" data-type="Idée">${ICON.plusSm} Idée</button></div>
      <div class="sortlist" data-sort="ideas:other" data-family="ideas" data-empty="Cadeaux, sorties, voyages, envies… Rien pour l’instant.">${other.map(ideaHTML).join('')}</div>
    </section>
  </main>`;
}

function viewATrier() {
  const list = S.items.filter((i) => i.type === 'À trier' && active(i)).sort(byOrder(newestFirst));
  if (!list.find((i) => i.id === S.openTri)) S.openTri = list[0] ? list[0].id : null;
  const ago = (iso) => {
    if (!iso) return '';
    const k = keyOf(new Date(iso));
    const n = daysBetween(k, todayKey());
    return n <= 0 ? "aujourd'hui" : n === 1 ? 'hier' : fmtShort(k);
  };
  const cards = list.map((i) => {
    const open = i.id === S.openTri;
    return `<article class="tri ${open ? 'open' : ''} ${S.justDropped === i.id ? 'just-dropped' : ''}" data-id="${i.id}">
      <button class="tri-top" type="button" data-a="opentri" data-id="${i.id}" aria-expanded="${open}"><b>${esc(i.title)}</b><span>${ago(i.created)}</span></button>
      ${open ? `<span class="tri-q">C’est quoi ?</span>
      <div class="grid2">
        <button class="big light" type="button" data-a="sort" data-to="Tâche" data-id="${i.id}">Tâche</button>
        <button class="big" type="button" data-a="sort" data-to="Projet" data-id="${i.id}">Projet</button>
        <button class="big" type="button" data-a="sort" data-to="Idée business" data-id="${i.id}">Idée business</button>
        <button class="big" type="button" data-a="sort" data-to="Idée" data-id="${i.id}">Autre idée</button>
        <button class="big full" type="button" data-a="sort" data-to="Agenda" data-id="${i.id}">Agenda (choisir date et heure)</button>
      </div>
      <div class="secondary-row"><button class="btn-sm btn-ghost" type="button" data-a="edit" data-id="${i.id}">Modifier</button><button class="btn-sm btn-ghost" type="button" data-a="archive" data-id="${i.id}">Archiver</button></div>` : ''}
    </article>`;
  }).join('');

  return `<main class="screen">
    <header class="hdr" style="justify-content:flex-start;align-items:center">
      <button class="icon-btn sm" type="button" data-a="tab" data-v="jour" aria-label="Retour">${ICON.left}</button>
      <div class="hdr-txt"><span class="eyebrow">${list.length} élément${list.length > 1 ? 's' : ''} à classer</span><h1>À trier</h1></div>
    </header>
    ${banner()}
    <form class="inbox-input" id="inbox-form" autocomplete="off">
      <label class="sr" for="inbox-text">Note en vrac</label>
      <input id="inbox-text" data-keep="inbox" type="text" placeholder="Note en vrac…" enterkeyhint="done" maxlength="500">
      <button type="submit" aria-label="Ajouter à trier">${ICON.plusSm}</button>
    </form>
    ${cards ? `<div class="sortlist" data-sort="inbox" data-family="inbox">${cards}</div>` : `<div class="empty" style="padding:36px 16px"><b style="display:block;font-size:18px;color:var(--text);margin-bottom:6px">Tout est rangé</b>Boîte vide, tête légère.</div>`}
  </main>`;
}

function tabbar() {
  const tab = (v, icon, label) => `<button class="tab" type="button" data-a="tab" data-v="${v}" ${S.view === v ? 'aria-current="page"' : ''}>${icon}${label}</button>`;
  return `<nav class="tabbar" aria-label="Navigation"><div class="tabbar-in">
    ${tab('jour', ICON.sun, 'Jour')}${tab('semaine', ICON.week, 'Semaine')}${tab('plustard', ICON.cal, 'Plus tard')}${tab('projets', ICON.flag, 'Projets')}${tab('idees', ICON.bulb, 'Idées')}
  </div></nav>
  <button class="fab" type="button" data-a="add" aria-label="Créer un élément">${ICON.plus}</button>`;
}

function viewLogin() {
  return `<main class="login"><form id="login-form" autocomplete="on">
    <img class="logo" src="/icons/icon-192.png" alt="">
    <h1>Mon QG</h1>
    <p>Entre ton mot de passe pour ouvrir ton tableau de bord.</p>
    <label class="sr" for="pw">Mot de passe</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" placeholder="Mot de passe" required>
    <span class="err" id="login-err"></span>
    <button class="primary" type="submit">Entrer</button>
  </form></main>`;
}

/* =========================================================
   7. Feuilles : création, modification, projet, planification
   ========================================================= */
function formFromItem(it) {
  const day = itemDay(it);
  return {
    title: it.title, type: it.type || 'Tâche', domain: it.domain || '',
    day: day || '', time: itemTime(it), parent: it.parent || (projectOf(it) || {}).id || '', projState: it.projState || 'À lancer', duration: it.duration || null
  };
}
function defaultsForAdd(extra = {}) {
  const t = todayKey();
  const v = S.view;
  const base = { title: '', type: 'Tâche', domain: '', day: t, time: '', parent: '', projState: 'À lancer', duration: null };
  if (v === 'plustard') base.day = S.selDay || t;
  if (v === 'projets') Object.assign(base, { type: 'Projet', day: '' });
  if (v === 'idees') Object.assign(base, { type: 'Idée business', day: '' });
  if (v === 'atrier') Object.assign(base, { type: 'À trier', day: '' });
  if (extra.date) base.day = extra.date;
  if (extra.type) { base.type = extra.type; if (extra.type.startsWith('Idée')) base.day = ''; }
  return base;
}

function openSheet(sheet) {
  S.sheet = sheet;
  document.body.classList.add('has-sheet');
  renderSheet();
  setTimeout(() => {
    const f = document.querySelector('#sheet-root [data-autofocus]');
    if (f && sheet.kind === 'add') f.focus();
  }, 60);
}
function closeSheet() {
  S.sheet = null;
  document.body.classList.remove('has-sheet');
  document.getElementById('sheet-root').innerHTML = '';
  bindDnd();
}

function formSheetHTML() {
  const sh = S.sheet;
  const f = sh.form;
  const it = sh.id ? byId(sh.id) : null;
  const t = todayKey();
  const pills = (list, key, cur) => list.map((v) => `<button class="pill" type="button" data-a="fset" data-k="${key}" data-v="${esc(v)}" aria-pressed="${cur === v}">${esc(v)}</button>`).join('');
  const projOptions = projects().filter((p) => active(p) || p.id === f.parent).sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    .map((p) => `<option value="${p.id}" ${p.id === f.parent ? 'selected' : ''}>${esc(p.title)}</option>`).join('');
  const quick = [['Aujourd’hui', t], ['Demain', addDays(t, 1)], ['Sans date', '']];
  return `<div class="backdrop" data-a="close"></div>
  <form class="sheet" id="sheet-form" role="dialog" aria-modal="true" aria-label="${sh.kind === 'add' ? 'Nouvel élément' : 'Modifier'}" autocomplete="off">
    <span class="grip" aria-hidden="true"></span><button class="icon-btn sm sheet-x" type="button" data-a="close" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${sh.kind === 'add' ? 'Nouvel élément' : sh.agendaPick ? 'Quand a lieu ce rendez-vous ?' : 'Modifier'}</h2>
    <div class="field"><label for="f-title">Titre</label>
      <input class="title" id="f-title" type="text" data-f="title" value="${esc(f.title)}" placeholder="Qu’est-ce qui te passe par la tête ?" maxlength="500" required data-autofocus enterkeyhint="done"></div>
    <div class="field"><span>Type</span><div class="pills">${pills(ADD_TYPES, 'type', f.type)}</div></div>
    <div class="field"><span>Domaine</span><div class="dom-grid">
      ${DOMAINS.map((d) => `<button class="dom" type="button" style="--c:${domColor(d)}" data-a="fset" data-k="domain" data-v="${d}" aria-pressed="${f.domain === d}"><i></i>${d}</button>`).join('')}
    </div></div>
    <div class="field"><span>Quand</span>
      <div class="pills">${quick.map(([l, v]) => `<button class="pill" type="button" data-a="fset" data-k="day" data-v="${v}" aria-pressed="${f.day === v}">${l}</button>`).join('')}</div>
      <div class="row2">
        <input type="date" data-f="day" value="${esc(f.day)}" aria-label="Date">
        <input type="time" data-f="time" value="${esc(f.time)}" aria-label="Heure (facultatif)" ${f.day ? '' : 'disabled'}>
      </div>
    </div>
    ${f.type === 'Tâche' || f.type === 'Agenda' ? `<div class="field"><span>Durée</span><div class="pills">${[30, 60, 90, 120, 150, 180, 240, 300, 480].map((v) => `<button class="pill" type="button" data-a="fset" data-k="duration" data-v="${v}" aria-pressed="${f.duration === v}">${fmtDuration(v)}</button>`).join('')}<button class="pill" type="button" data-a="fset" data-k="duration" data-v="" aria-pressed="${!f.duration}">Aucune</button></div></div>` : ''}
    ${f.type === 'Projet'
      ? `<div class="field"><span>État du projet</span><div class="pills">${pills(['À lancer', 'En cours', 'En attente'], 'projState', f.projState)}</div></div>`
      : `<div class="field"><label for="f-parent">Projet</label><select id="f-parent" data-f="parent"><option value="">Aucun projet</option>${projOptions}</select></div>`}
    <button class="primary" type="submit">${sh.kind === 'add' ? 'Ajouter' : 'Enregistrer'}</button>
    ${it ? `<div class="secondary-row">
      <button class="link-btn" type="button" data-a="done" data-id="${it.id}" data-close="1">${it.archived ? 'Rouvrir' : it.type === 'Tâche' ? 'Terminer' : 'Archiver'}</button>
      <a class="link-btn" href="${esc(it.url)}" target="_blank" rel="noopener">Ouvrir dans Notion ${ICON.ext}</a>
    </div>` : ''}
  </form>`;
}

function msSheetHTML() {
  const it = byId(S.sheet.id);
  if (!it) return '';
  const d = itemDay(it);
  const t = itemTime(it);
  const e = itemEndTime(it);
  const when = [d ? cap(fmt(d, { weekday: 'long', day: 'numeric', month: 'long' })) : '', t ? t + (e ? ' – ' + e : '') : 'Journée'].filter(Boolean).join(' · ');
  return `<div class="backdrop" data-a="close"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="Rendez-vous Outlook">
    <span class="grip" aria-hidden="true"></span><button class="icon-btn sm sheet-x" type="button" data-a="close" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>${esc(it.title)}</h2>
    <p class="note">${esc(when)}</p>
    <p class="note">Rendez-vous Outlook. Masquer le retire de Mon QG sur cet appareil ; il reste dans Outlook.</p>
    <button class="primary" type="button" data-a="done" data-id="${it.id}" data-close="1">${it.archived ? 'Réafficher' : 'Masquer de Mon QG'}</button>
  </div>`;
}

function projectSheetHTML() {
  const p = byId(S.sheet.id);
  if (!p) return '';
  const st = projectStats(p);
  const c = domColor(p.domain);
  const s = p.projState || 'À lancer';
  const tasks = st.linked.filter((i) => i.type === 'Tâche').sort((a, b) => (a.archived - b.archived) || byOrder(byDayThenTime)(a, b));
  const others = st.linked.filter((i) => i.type !== 'Tâche' && active(i));
  return `<div class="backdrop" data-a="close"></div>
  <section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(p.title)}">
    <span class="grip" aria-hidden="true"></span><button class="icon-btn sm sheet-x" type="button" data-a="close" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <div class="proj-top">${cat(p.domain || 'Sans catégorie', c)}<span>${esc(projWhen(p))}</span></div>
    <h2>${esc(p.title)}</h2>
    <div class="field"><span>État</span><div class="pills">
      ${PROJ_STATES.map((v) => `<button class="pill" type="button" data-a="pstate" data-id="${p.id}" data-v="${v}" aria-pressed="${s === v}">${v}</button>`).join('')}
    </div></div>
    <div class="field" style="--c:${c}"><span>${st.tasks.length ? `${st.done} / ${st.tasks.length} tâches · ${st.pct} %` : 'Aucune tâche liée'}</span>
      <span class="pbar" style="--c:${c}"><i style="width:${Math.max(st.pct, 2)}%"></i>${st.marks.map((mk) => `<em class="${mk.done ? 'done' : ''}" style="left:${mk.left}%"></em>`).join('')}</span></div>
    <div class="sortlist mini-list" data-sort="proj:${p.id}" data-family="projtasks" data-empty="Aucune tâche pour l’instant">${tasks.map((i) => cardHTML(i, { showProj: false, showDay: true })).join('')}</div>
    ${others.length ? `<div class="mini-list">${others.map((i) => cardHTML(i, { showProj: false, showDay: true })).join('')}</div>` : ''}
    <form class="inbox-input" id="proj-add-form" data-id="${p.id}" autocomplete="off">
      <label class="sr" for="proj-add">Nouvelle tâche du projet</label>
      <input id="proj-add" data-keep="projadd" type="text" placeholder="Ajouter une tâche au projet…" maxlength="500" enterkeyhint="done">
      <button type="submit" aria-label="Ajouter la tâche">${ICON.plusSm}</button>
    </form>
    <div class="secondary-row">
      <button class="link-btn" type="button" data-a="edit" data-id="${p.id}">Modifier</button>
      <a class="link-btn" href="${esc(p.url)}" target="_blank" rel="noopener">Notion ${ICON.ext}</a>
    </div>
  </section>`;
}

function planSheetHTML() {
  const it = byId(S.sheet.id);
  if (!it) return '';
  const t = todayKey();
  const opts = [['Aujourd’hui', t], ['Demain', addDays(t, 1)], ['Lundi prochain', addDays(weekStart(t), 7)], ['Dans 2 semaines', addDays(t, 14)]];
  return `<div class="backdrop" data-a="close"></div>
  <section class="sheet" role="dialog" aria-modal="true" aria-label="Planifier">
    <span class="grip" aria-hidden="true"></span><button class="icon-btn sm sheet-x" type="button" data-a="close" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>Planifier « ${esc(it.title)} »</h2>
    <div class="grid2">${opts.map(([l, v]) => `<button class="big" type="button" data-a="planto" data-id="${it.id}" data-day="${v}">${l}</button>`).join('')}</div>
    <div class="field"><label for="plan-date">Autre date</label><input id="plan-date" type="date" value="${t}"></div>
    <button class="primary" type="button" data-a="planpick" data-id="${it.id}">Valider cette date</button>
  </section>`;
}

/* ---------- Réglages : thème clair (par défaut) ou sombre ---------- */
const THEME_KEY = 'qg_theme';
const currentTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
function applyTheme(t) {
  const theme = t === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0E1014' : '#F3F2EF');
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* rien */ }
}
function settingsSheetHTML() {
  const t = currentTheme();
  const at = S.syncedAt ? `aujourd’hui à ${pad(S.syncedAt.getHours())}:${pad(S.syncedAt.getMinutes())}` : 'pas encore';
  return `<div class="backdrop" data-a="close"></div>
  <section class="sheet" role="dialog" aria-modal="true" aria-label="Réglages">
    <span class="grip" aria-hidden="true"></span><button class="icon-btn sm sheet-x" type="button" data-a="close" aria-label="Fermer"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    <h2>Réglages</h2>
    <div class="field"><span>Apparence</span>
      <div class="pills" role="group" aria-label="Thème">
        <button class="pill" type="button" data-a="theme" data-v="light" aria-pressed="${t === 'light'}">Clair</button>
        <button class="pill" type="button" data-a="theme" data-v="dark" aria-pressed="${t === 'dark'}">Sombre</button>
      </div>
    </div>
    <div class="field"><span>Notion</span>
      <p class="note">Dernière mise à jour : ${at}.</p>
      <button class="link-btn" type="button" data-a="sync">${S.syncing ? ICON.sync.replace('<svg', '<svg class="spin"') : ICON.sync} Actualiser maintenant</button>
    </div>
    <div class="field"><span>Outlook</span>
      <p class="note">${localStorage.getItem('ms_token') ? '✓ Connecté' : 'Non connecté'}.</p>
      <button class="link-btn" type="button" data-a="ms_login">Connecter Outlook</button>
      ${localStorage.getItem('ms_token') ? '<button class="link-btn" type="button" data-a="ms_logout">Déconnecter</button>' : ''}
    </div>
    <button class="link-btn" type="button" data-a="logout">Se déconnecter</button>
  </section>`;
}

function renderSheet() {
  const root = document.getElementById('sheet-root');
  if (!S.sheet) { root.innerHTML = ''; return; }
  const k = S.sheet.kind;
  keep(root, () => {
    root.innerHTML = k === 'project' ? projectSheetHTML() : k === 'plan' ? planSheetHTML() : k === 'settings' ? settingsSheetHTML() : k === 'ms' ? msSheetHTML() : formSheetHTML();
  });
  if (!root.innerHTML.trim()) closeSheet();
  bindDnd();
}

async function submitForm() {
  const sh = S.sheet;
  const f = sh.form;
  const title = (f.title || '').trim();
  if (!title) { toast('Donne un titre', { err: true }); return; }
  if (f.type === 'Agenda' && !f.day) { toast('Choisis une date pour le rendez-vous', { err: true }); return; }
  let date = null;
  if (f.day) {
    if (f.time) { const [h, mi] = f.time.split(':').map(Number); const d = parseKey(f.day); d.setHours(h, mi, 0, 0); date = { start: toLocalISO(d), end: null }; }
    else date = { start: f.day, end: null };
  }
  const btn = document.querySelector('#sheet-form .primary');
  if (btn) btn.disabled = true;

  if (sh.kind === 'add') {
    const input = { title, type: f.type, domain: f.domain || undefined, date: date || undefined };
    if (f.type === 'Projet') input.projState = f.projState;
    else if (f.parent) input.parent = f.parent;
    if (f.duration) input.duration = f.duration;
    try {
      await create(input);
      closeSheet();
      toast(f.type === 'À trier' ? 'Ajouté à trier' : 'Ajouté');
    } catch (e) {
      if (btn) btn.disabled = false;
      if (e.message !== 'login') toast('Pas enregistré : ' + e.message, { err: true });
    }
    return;
  }

  const it = byId(sh.id);
  const o = sh.orig;
  const patch = {};
  if (title !== o.title) patch.title = title;
  if (f.type !== o.type) patch.type = f.type;
  if (f.domain !== o.domain) patch.domain = f.domain || null;
  if (f.day !== o.day || f.time !== o.time) {
    // garde une éventuelle date de fin (période) si elle reste après le début
    if (date && it.date && it.date.end && f.day !== o.day && !f.time && !isDateTime(it.date.end)) {
      const end = addDays(it.date.end.slice(0, 10), daysBetween(o.day || f.day, f.day));
      date.end = end > date.start ? end : null;
    } else if (date && it.date && it.date.end && f.day === o.day) {
      date.end = it.date.end;
    }
    patch.date = date;
  }
  if (f.type === 'Projet' && f.projState !== o.projState) patch.projState = f.projState;
  if (f.type !== 'Projet' && f.parent !== o.parent) patch.parent = f.parent || null;
  if (f.duration !== o.duration) patch.duration = f.duration || null;
  if (!Object.keys(patch).length) { closeSheet(); return; }
  closeSheet();
  try { await update(it.id, patch); toast('Enregistré'); } catch { /* message déjà affiché */ }
}

/* =========================================================
   8. Affichage général
   ========================================================= */
// Garde ce qui est en cours de saisie quand l'écran se redessine.
function keep(root, fn) {
  const saved = {};
  let focusKey = null;
  root.querySelectorAll('[data-keep]').forEach((el) => {
    saved[el.dataset.keep] = el.value;
    if (document.activeElement === el) focusKey = el.dataset.keep;
  });
  fn();
  Object.entries(saved).forEach(([k, v]) => {
    const el = root.querySelector(`[data-keep="${k}"]`);
    if (el) { el.value = v; if (focusKey === k) el.focus(); }
  });
}

function render() {
  if (S.dragging || S.dropping) { S.renderLater = true; return; }
  const app = document.getElementById('app');
  if (S.needLogin) { app.innerHTML = viewLogin(); closeSheet(); return; }
  if (S.loading && !S.items.length) {
    app.innerHTML = `<div class="loading">${ICON.sync.replace('<svg', '<svg class="spin"')} Chargement de Notion…</div>`;
    return;
  }
  const v = { jour: viewJour, semaine: viewSemaine, plustard: viewPlusTard, projets: viewProjets, idees: viewIdees, atrier: viewATrier }[S.view] || viewJour;
  const weekScroll = document.getElementById('week');
  const keepScrollX = weekScroll && S.view === 'semaine' && !S.scrollWeek ? weekScroll.scrollLeft : null;
  const fresh = S.lastView !== S.view;
  S.lastView = S.view;
  app.classList.toggle('no-anim', !fresh);
  keep(app, () => { app.innerHTML = v() + tabbar(); });
  if (S.view === 'semaine') setupWeek(keepScrollX);
  if (S.sheet && ['project', 'plan', 'settings'].includes(S.sheet.kind)) renderSheet();
  bindDnd();
}

function setupWeek(scrollX) {
  const wk = document.getElementById('week');
  if (!wk) return;
  if (scrollX != null) wk.scrollLeft = scrollX;
  else if (S.scrollWeek) {
    const col = document.getElementById('col-' + todayKey());
    if (col && S.weekOffset === 0) wk.scrollLeft = col.offsetLeft - 20;
    else wk.scrollLeft = 0;
  }
  S.scrollWeek = false;
}

/* ---------- Glisser-déposer partout (dnd-kit) ----------
   Toute liste marquée data-sort="<liste>" se réordonne : au doigt, appui long de 200 ms pour attraper une carte
   (un geste plus rapide fait défiler la page) ; à la souris, dès 4 px de mouvement.
   Un aperçu de la carte suit le doigt ; les autres cartes s'écartent ; la liste visée s'éclaire.
   Au lâcher, le nouvel ordre (colonne Notion « Ordre ») et, si besoin, le changement de jour ou de section partent vers Notion.
   data-family : les listes d'une même famille échangent leurs cartes (ex. les 7 jours, les 2 sections d'idées).
   data-lock   : liste dont on peut sortir des cartes, mais où l'on ne dépose pas (ex. « En retard »).
   data-accept / data-dtype : restreindre ce qu'une liste accepte (ex. « À planifier » n'accepte que des tâches). */
const DND = { manager: null, feedback: null, overlay: null, entities: [], fromGroup: null, lit: [], pending: null };
if (location.hostname === 'localhost') window.__DND = DND; // aide aux tests locaux

const NO_DRAG = '.chk, .icon-mini, .btn-sm, .big, .link-btn, input, select, textarea, a, [data-nodrag]';

function dndManager() {
  if (DND.manager || !window.DndKit) return DND.manager;
  const K = window.DndKit;
  const C = K.PointerActivationConstraints;
  const titleOf = (src) => { const it = src && byId(src.data.id); return it ? it.title : 'la carte'; };
  const m = new K.DragDropManager({
    sensors: [K.PointerSensor.configure({
      activationConstraints(event) {
        if (event.pointerType === 'mouse') return [new C.Distance({ value: 4 })];
        return [new C.Delay({ value: 200, tolerance: 8 })];
      },
      // on n'attrape pas une carte par sa case à cocher ou ses petits boutons
      preventActivation(event) {
        return event.target instanceof Element && !!event.target.closest(NO_DRAG);
      }
    })],
    plugins: [
      K.Feedback,
      K.AutoScroller,
      K.Cursor,
      K.PreventSelection,
      K.Accessibility.configure({
        screenReaderInstructions: { draggable: 'Appui long puis glisser pour changer la place de la carte. Ou ouvrir la carte pour la modifier.' },
        announcements: {
          dragstart: (e) => `${titleOf(e.operation.source)} attrapée.`,
          dragover: () => undefined,
          dragend: (e) => (e.canceled ? 'Déplacement annulé.' : `${titleOf(e.operation.source)} déposée.`)
        }
      })
    ]
  });
  DND.feedback = m.plugins.find((pl) => pl instanceof K.Feedback) || null;
  const ov = document.createElement('div');
  ov.className = 'drag-overlay';
  ov.setAttribute('data-dnd-overlay', '');
  ov.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ov);
  DND.overlay = ov;
  m.monitor.addEventListener('beforedragstart', onDndBefore);
  m.monitor.addEventListener('dragstart', onDndStart);
  m.monitor.addEventListener('dragover', onDndOver);
  m.monitor.addEventListener('dragend', onDndEnd);
  DND.manager = m;
  return m;
}

function unbindDnd() {
  DND.entities.forEach((e) => e.destroy());
  DND.entities = [];
}

const listEl = (group) => [...document.querySelectorAll('[data-sort]')].find((el) => el.dataset.sort === group) || null;
const dropBox = (list) => (list && (list.closest('[data-drop]') || list)) || null;
const listIds = (list) => (list ? [...list.children].map((el) => el.dataset.id).filter(Boolean) : []);

function bindDnd() {
  if (S.dragging || S.dropping) return;
  unbindDnd();
  const m = dndManager();
  if (!m) return;
  const K = window.DndKit;
  document.querySelectorAll('#app [data-sort], #sheet-root [data-sort]').forEach((list) => {
    const group = list.dataset.sort;
    const family = list.dataset.family || group;
    const accept = (list.dataset.accept || family).split(',');
    const lock = list.dataset.lock === '1';
    const items = [...list.children].filter((el) => el.dataset.id);
    items.forEach((el, index) => {
      el.classList.add('drag-item');
      const type = el.dataset.dtype || family;
      DND.entities.push(new K.Sortable({
        id: group + '|' + el.dataset.id, index, group, element: el, type, accept,
        data: { id: el.dataset.id, group, family },
        disabled: lock ? { droppable: true } : false,
        transition: { duration: 200, easing: 'cubic-bezier(.2,.8,.2,1)' }
      }, m));
    });
    if (!lock) {
      // la liste entière accepte aussi un dépôt (liste vide, ou sous la dernière carte)
      DND.entities.push(new K.Droppable({
        id: 'list:' + group, element: dropBox(list), accept, collisionPriority: 1,
        data: { group, family, kind: 'list' }, collisionDetector: K.pointerIntersection
      }, m));
    }
  });
  // Semaine : les pastilles des jours acceptent aussi une carte (pour un jour hors de l'écran)
  document.querySelectorAll('#app .strip button[data-day]').forEach((el) => {
    DND.entities.push(new K.Droppable({
      id: 'pill:' + el.dataset.day, element: el, accept: ['week'], collisionPriority: 3,
      data: { group: 'day:' + el.dataset.day, family: 'week', kind: 'pill' }, collisionDetector: K.pointerIntersection
    }, m));
  });
}

function onDndBefore(e) {
  const el = e.operation.source && e.operation.source.element;
  if (!el || !DND.overlay) return;
  const card = el.cloneNode(true);
  ['data-a', 'data-id', 'tabindex', 'id', 'role', 'aria-label', 'aria-describedby', 'aria-roledescription', 'aria-pressed', 'aria-disabled', 'aria-expanded']
    .forEach((a) => card.removeAttribute(a));
  card.classList.remove('just-dropped', 'is-source');
  card.classList.add('lifted');
  DND.overlay.replaceChildren(card);
  if (DND.feedback) {
    DND.feedback.overlay = DND.overlay;
    DND.feedback.dropAnimation = { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' };
  }
}

function onDndStart(e) {
  const src = e.operation.source;
  S.dragging = true;
  DND.fromGroup = src && src.sortable ? src.sortable.initialGroup : null;
  document.body.classList.add('dragging');
  if (src && src.element) src.element.classList.add('is-source');
  if (navigator.vibrate) navigator.vibrate(12);
}

function lightUp(group) {
  DND.lit.forEach((el) => el.classList.remove('drop-target'));
  DND.lit = [];
  if (!group || group === DND.fromGroup) return;
  const box = dropBox(listEl(group));
  const pill = group.startsWith('day:') ? document.querySelector(`#app .strip button[data-day="${group.slice(4)}"]`) : null;
  [box, pill].forEach((el) => { if (el) { el.classList.add('drop-target'); DND.lit.push(el); } });
}

function onDndOver(e) {
  const K = window.DndKit;
  const src = e.operation.source;
  const tgt = e.operation.target;
  let group = null;
  if (tgt && K.isSortable(tgt)) group = tgt.sortable.group;
  else if (tgt) group = tgt.data.group;
  // Au-dessus d'une liste (vide ou sous sa dernière carte) d'une autre liste : la carte y prend place tout de suite.
  if (tgt && !K.isSortable(tgt) && tgt.data.kind === 'list' && src && K.isSortable(src) && src.sortable.group !== tgt.data.group) {
    const list = listEl(tgt.data.group);
    if (list && src.element) {
      const oldGroup = src.sortable.group;
      const oldIndex = src.sortable.index;
      const sorts = DND.entities.filter((x) => x instanceof K.Sortable);
      sorts.filter((x) => x.group === oldGroup && x.index > oldIndex).forEach((x) => { x.index -= 1; });
      const count = sorts.filter((x) => x.group === tgt.data.group && x !== src.sortable).length;
      list.appendChild(src.element);
      src.sortable.group = tgt.data.group;
      src.sortable.index = count;
    }
  }
  lightUp(group);
  if (DND.overlay) DND.overlay.classList.toggle('over-pill', !!(tgt && tgt.data && tgt.data.kind === 'pill'));
}

function onDndEnd(e) {
  const K = window.DndKit;
  const src = e.operation.source;
  const tgt = e.operation.target;
  lightUp(null);
  if (DND.overlay) DND.overlay.classList.remove('over-pill');
  document.body.classList.remove('dragging');
  S.dragging = false;
  S.justDragged = Date.now();
  DND.pending = null;

  if (!e.canceled && src && K.isSortable(src) && src.element) {
    const id = src.data.id;
    const fromG = src.sortable.initialGroup;
    let toG = src.sortable.group;
    const moved = toG !== fromG || src.sortable.index !== src.sortable.initialIndex;
    if (tgt && tgt.data && tgt.data.kind === 'pill' && tgt.data.group !== fromG) {
      // déposée sur une pastille de jour : la carte va à la fin de ce jour
      toG = tgt.data.group;
      const list = listEl(toG);
      const box = list && list.getBoundingClientRect();
      const visible = box && box.right > 0 && box.left < window.innerWidth;
      if (list) list.appendChild(src.element);
      if (DND.feedback && !visible) DND.feedback.dropAnimation = null;
      DND.pending = { id, fromG, toG, ids: listIds(list).concat(list ? [] : [id]) };
    } else if (moved) {
      DND.pending = { id, fromG, toG, ids: listIds(listEl(toG)) };
    } else {
      src.element.classList.remove('is-source');
    }
  } else if (src && src.element) {
    src.element.classList.remove('is-source');
  }
  S.dropping = true;
  setTimeout(finishDrop, 260); // laisse l'aperçu glisser jusqu'à sa place
}

// Ce que change un dépôt : jour, section, et toujours l'ordre de la liste d'arrivée.
function dropChanges(p) {
  const it = byId(p.id);
  if (!it) return { changes: [], text: '' };
  const map = new Map();
  const add = (id, patch) => map.set(id, { ...(map.get(id) || {}), ...patch });
  let text = 'Ordre enregistré';
  if (p.fromG !== p.toG) {
    const [kind, val] = p.toG.split(':');
    if (kind === 'day') {
      add(it.id, { date: it.date ? shiftDate(it.date, val) : { start: val, end: null } });
      text = 'Déplacé au ' + fmt(val, { weekday: 'long', day: 'numeric' });
    } else if (p.toG === 'today') {
      add(it.id, { date: it.date ? shiftDate(it.date, todayKey()) : { start: todayKey(), end: null } });
      text = 'Remis à aujourd’hui';
    } else if (p.toG === 'todo') {
      add(it.id, { date: null });
      text = 'Rangé dans « À planifier »';
    } else if (kind === 'ideas') {
      add(it.id, { type: val === 'biz' ? 'Idée business' : 'Idée' });
      text = val === 'biz' ? 'Rangée dans Idées business' : 'Rangée dans Autres idées';
    }
  }
  orderPatches(p.ids, p.id).forEach((o) => add(o.id, { order: o.order }));
  return { changes: [...map].map(([id, patch]) => ({ id, patch })), text };
}

function finishDrop() {
  S.dropping = false;
  const p = DND.pending;
  DND.pending = null;
  if (DND.overlay) DND.overlay.replaceChildren();
  if (p) {
    S.justDropped = p.id;
    const { changes, text } = dropChanges(p);
    updateMany(changes, text);
    setTimeout(() => { S.justDropped = null; }, 700);
  } else if (S.renderLater) render();
  S.renderLater = false;
}

/* =========================================================
   9. Actions (clics)
   ========================================================= */
function setView(v) {
  if (!VIEWS.includes(v)) return;
  S.view = v;
  localStorage.setItem('qg_view', v);
  if (v === 'semaine') S.scrollWeek = true;
  closeSheet();
  render();
  window.scrollTo(0, 0);
}

async function toggleDone(id, el) {
  const it = byId(id);
  if (!it) return;
  const now = !it.archived;
  if (now) {
    S.sessionDone.add(id);
    if (it.type === 'Tâche' && el) {
      const r = el.getBoundingClientRect();
      celebrate(r.left + r.width / 2, r.top + r.height / 2);
    }
  }
  try {
    await update(id, { archived: now });
    if (now) toast(isMs(it) ? 'Masqué de Mon QG' : it.type === 'Tâche' ? 'Terminé' : 'Archivé', { undo: () => update(id, { archived: false }).catch(() => {}) });
  } catch { /* déjà signalé */ }
}

async function sortItem(id, to) {
  const it = byId(id);
  if (!it) return;
  if (to === 'Agenda') {
    const f = formFromItem(it);
    f.type = 'Agenda';
    if (!f.day) f.day = todayKey();
    if (!f.time) f.time = '09:00';
    openSheet({ kind: 'edit', id, form: f, orig: formFromItem(it), agendaPick: true });
    return;
  }
  const patch = { type: to };
  if (to === 'Projet') patch.projState = it.projState || 'À lancer';
  try {
    await update(id, patch);
    const where = to === 'Tâche' ? (it.date ? 'tâche' : 'tâche (Plus tard › À planifier)') : to === 'Projet' ? 'projet' : to === 'Idée business' ? 'idée business' : 'idée';
    toast('Rangé en ' + where, { undo: () => update(id, { type: 'À trier' }).catch(() => {}) });
  } catch { /* déjà signalé */ }
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-a]');
  if (!el) return;
  if (Date.now() - S.justDragged < 450) return; // pas de clic juste après un glisser-déposer
  const a = el.dataset.a;
  const id = el.dataset.id;
  switch (a) {
    case 'tab': setView(el.dataset.v); break;
    case 'sync': load(); break;
    case 'settings': openSheet({ kind: 'settings' }); break;
    case 'theme': applyTheme(el.dataset.v); renderSheet(); break;
    case 'logout': {
      closeSheet();
      fetch('/api/login', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
      try { localStorage.removeItem(CACHE_KEY); } catch { /* rien */ }
      S.items = [];
      S.needLogin = true;
      render();
      break;
    }
    case 'ms_login': {
      fetch('/api/auth/login').then(r => r.json()).then(d => {
        if (d.authUrl) window.location.href = d.authUrl;
        else toast('Outlook : ' + (d.error || 'configuration manquante'), { err: true });
      }).catch(() => toast('Erreur connexion Outlook', { err: true }));
      break;
    }
    case 'ms_logout': {
      try { localStorage.removeItem('ms_token'); localStorage.removeItem('ms_refresh'); } catch { /* rien */ }
      renderSheet();
      toast('Outlook déconnecté');
      break;
    }
    case 'add': openSheet({ kind: 'add', form: defaultsForAdd({ date: el.dataset.date, type: el.dataset.type }) }); break;
    case 'edit': {
      if (Date.now() - S.justDragged < 450) return;
      const it = byId(id);
      if (it && isMs(it)) openSheet({ kind: 'ms', id });
      else if (it) openSheet({ kind: 'edit', id, form: formFromItem(it), orig: formFromItem(it) });
      break;
    }
    case 'close': closeSheet(); break;
    case 'done': {
      const close = el.dataset.close;
      if (close) closeSheet();
      toggleDone(id, close ? null : el);
      break;
    }
    case 'totoday': {
      const it = byId(id);
      if (it && it.date) update(id, { date: shiftDate(it.date, todayKey()) }).then(() => toast('Remis à aujourd’hui')).catch(() => {});
      break;
    }
    case 'week': {
      const n = Number(el.dataset.n);
      S.weekOffset = n === 0 ? 0 : S.weekOffset + n;
      S.scrollWeek = true;
      render();
      break;
    }
    case 'gocol': {
      const col = document.getElementById('col-' + el.dataset.day);
      const wk = document.getElementById('week');
      if (col && wk) wk.scrollTo({ left: col.offsetLeft - 20, behavior: 'smooth' });
      break;
    }
    case 'month': S.monthOffset += Number(el.dataset.n); S.selDay = null; render(); break;
    case 'selday': S.selDay = el.dataset.day; render(); break;
    case 'plan': openSheet({ kind: 'plan', id }); break;
    case 'planto': closeSheet(); update(id, { date: { start: el.dataset.day, end: null } }).then(() => toast('Planifié le ' + fmtShort(el.dataset.day))).catch(() => {}); break;
    case 'planpick': {
      const v = (document.getElementById('plan-date') || {}).value;
      if (!v) return;
      closeSheet();
      update(id, { date: { start: v, end: null } }).then(() => toast('Planifié le ' + fmtShort(v))).catch(() => {});
      break;
    }
    case 'pfilter': S.projFilter = el.dataset.v; render(); break;
    case 'proj': openSheet({ kind: 'project', id }); break;
    case 'pstate': update(id, { projState: el.dataset.v }).then(() => toast('Projet : ' + el.dataset.v)).catch(() => {}); break;
    case 'openidea': S.openIdea = S.openIdea === id ? null : id; render(); break;
    case 'totask': {
      const it = byId(id);
      if (!it) return;
      const prev = it.type;
      S.openIdea = null;
      update(id, { type: 'Tâche' }).then(() => toast(it.date ? 'Devenue une tâche' : 'Devenue une tâche (Plus tard › À planifier)', { undo: () => update(id, { type: prev }).catch(() => {}) })).catch(() => {});
      break;
    }
    case 'toproj': {
      const it = byId(id);
      if (!it) return;
      const prev = it.type;
      S.openIdea = null;
      update(id, { type: 'Projet', projState: 'À lancer' }).then(() => toast('Devenue un projet', { undo: () => update(id, { type: prev }).catch(() => {}) })).catch(() => {});
      break;
    }
    case 'archive': { const it = byId(id); update(id, { archived: true }).then(() => toast('Archivé', { undo: () => update(id, { archived: false }).catch(() => {}) })).catch(() => {}); if (it) S.openIdea = null; break; }
    case 'opentri': S.openTri = id; render(); break;
    case 'sort': sortItem(id, el.dataset.to); break;
    case 'undo': {
      const fn = S.undo;
      document.getElementById('toast-root').innerHTML = '';
      S.undo = null;
      if (fn) Promise.resolve(fn()).catch(() => {});
      break;
    }
    case 'fset': {
      const f = S.sheet && S.sheet.form;
      if (!f) return;
      const k = el.dataset.k;
      const v = el.dataset.v;
      if (k === 'duration') {
        f[k] = v ? Number(v) : null;
      } else {
        f[k] = k === 'domain' && f.domain === v ? '' : v;
      }
      if (k === 'day' && !v) f.time = '';
      if (k === 'type' && v === 'Agenda' && !f.day) f.day = todayKey(); // un rendez-vous a toujours une date
      const title = document.getElementById('f-title');
      if (title) f.title = title.value;
      renderSheet();
      break;
    }
    default: break;
  }
});

// Ouvrir une carte de la semaine au clavier
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('wcard')) {
    e.preventDefault();
    e.target.click();
  }
  if (e.key === 'Escape' && S.sheet) closeSheet();
});

document.addEventListener('input', (e) => {
  const k = e.target.dataset && e.target.dataset.f;
  if (!k || !S.sheet || !S.sheet.form) return;
  S.sheet.form[k] = e.target.value;
  if (k === 'day') {
    const time = document.querySelector('#sheet-root input[data-f="time"]');
    if (time) time.disabled = !e.target.value;
    document.querySelectorAll('#sheet-root [data-k="day"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === e.target.value)));
  }
});
document.addEventListener('change', (e) => {
  const k = e.target.dataset && e.target.dataset.f;
  if (k && S.sheet && S.sheet.form) S.sheet.form[k] = e.target.value;
});

document.addEventListener('submit', async (e) => {
  const form = e.target;
  e.preventDefault();
  if (form.id === 'login-form') {
    const pw = form.querySelector('#pw').value;
    const err = form.querySelector('#login-err');
    const btn = form.querySelector('button');
    btn.disabled = true;
    err.textContent = '';
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }), credentials: 'same-origin' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || 'Erreur');
      S.needLogin = false;
      S.loading = true;
      render();
      load();
    } catch (er) {
      err.textContent = er.message;
      btn.disabled = false;
    }
    return;
  }
  if (form.id === 'inbox-form') {
    const input = form.querySelector('input');
    const title = input.value.trim();
    if (!title) return;
    input.value = '';
    try { await create({ title, type: 'À trier' }); toast('Ajouté à trier'); } catch (er) { input.value = title; if (er.message !== 'login') toast('Pas enregistré : ' + er.message, { err: true }); }
    return;
  }
  if (form.id === 'proj-add-form') {
    const input = form.querySelector('input');
    const title = input.value.trim();
    if (!title) return;
    const p = byId(form.dataset.id);
    input.value = '';
    try { await create({ title, type: 'Tâche', parent: p.id, domain: p.domain || undefined }); toast('Tâche ajoutée au projet'); } catch (er) { input.value = title; if (er.message !== 'login') toast('Pas enregistré : ' + er.message, { err: true }); }
    return;
  }
  if (form.id === 'sheet-form') submitForm();
});

/* =========================================================
   10. Démarrage
   ========================================================= */
// Extraire le token Outlook de l'URL
const urlParams = new URLSearchParams(window.location.search);
const msToken = urlParams.get('ms_token');
const msRefresh = urlParams.get('ms_refresh');
if (msToken) {
  try { localStorage.setItem('ms_token', msToken); } catch { /* rien */ }
  if (msRefresh) {
    try { localStorage.setItem('ms_refresh', msRefresh); } catch { /* rien */ }
  }
  // Nettoyer l'URL
  window.history.replaceState({}, document.title, window.location.pathname);
  toast('✓ Outlook connecté');
}
const error = urlParams.get('error');
if (error) {
  toast('Erreur Outlook: ' + error, { err: true });
  window.history.replaceState({}, document.title, window.location.pathname);
}

try { applyTheme(localStorage.getItem(THEME_KEY) || 'light'); } catch { applyTheme('light'); }
render();
load(true);

// Se met à jour quand on revient sur l'appli, et toutes les 2 minutes.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && (!S.syncedAt || Date.now() - S.syncedAt > 20000)) load(true);
});
setInterval(() => {
  if (document.visibilityState === 'visible' && !S.sheet && !S.dragging) load(true);
}, 120000);
// Le jour change à minuit : on redessine.
let lastDay = todayKey();
setInterval(() => { if (todayKey() !== lastDay) { lastDay = todayKey(); render(); } }, 60000);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
