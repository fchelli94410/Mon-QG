// Microsoft Graph - authentification et calendrier

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lit et nettoie la config ; renvoie { error } si une valeur est mal saisie
export function msConfig() {
  const clientId = (process.env.MICROSOFT_CLIENT_ID || '').trim();
  const secret = (process.env.MICROSOFT_CLIENT_SECRET || '').trim();
  const tenant = (process.env.MICROSOFT_TENANT_ID || 'common').trim();
  if (!clientId) return { error: 'MICROSOFT_CLIENT_ID manquant' };
  if (!GUID.test(clientId)) return { error: `MICROSOFT_CLIENT_ID invalide (${clientId.length} caractères au lieu de 36)` };
  if (!['common', 'organizations', 'consumers'].includes(tenant) && !GUID.test(tenant)) return { error: 'MICROSOFT_TENANT_ID invalide' };
  return { clientId, secret, tenant };
}

export async function getMsToken(refreshToken) {
  const c = msConfig();
  if (c.error || !c.secret) return null;

  const tokenUrl = `https://login.microsoftonline.com/${c.tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: c.clientId,
    client_secret: c.secret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: 'Calendars.Read offline_access'
  });

  try {
    const r = await fetch(tokenUrl, { method: 'POST', body });
    const data = await r.json();
    if (!data.access_token) return null;
    return { accessToken: data.access_token, refreshToken: data.refresh_token || refreshToken };
  } catch { return null; }
}

// Graph renvoie l'heure en UTC sans « Z » : on l'ajoute pour un affichage à l'heure locale
const utc = (d) => (d.dateTime && d.timeZone === 'UTC' && !/[Z+]/.test(d.dateTime.slice(19)) ? d.dateTime.replace(/\.\d+$/, '') + 'Z' : d.dateTime || d.date);

export async function getMsEvents(accessToken, startDate, endDate) {
  if (!accessToken) return null;

  const start = typeof startDate === 'string' ? startDate : startDate.toISOString();
  const end = typeof endDate === 'string' ? endDate : endDate.toISOString();

  try {
    const r = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${start}&endDateTime=${end}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (r.status === 401) return null; // jeton expiré
    const data = await r.json();
    return (data.value || []).map(e => ({
      id: `ms_${e.id}`,
      title: e.subject || 'Sans titre',
      type: 'Agenda',
      domain: '',
      date: { start: utc(e.start), end: e.end ? utc(e.end) : null },
      archived: false,
      duration: e.isReminderOn && e.reminderMinutesBeforeStart ? e.reminderMinutesBeforeStart : null,
      source: 'outlook'
    }));
  } catch { return []; }
}

// Récupère les rendez-vous, en renouvelant le jeton si besoin
export async function getMsEventsAuto(accessToken, refreshToken, startDate, endDate) {
  let events = accessToken ? await getMsEvents(accessToken, startDate, endDate) : null;
  if (events) return { events };
  if (!refreshToken) return { events: [], expired: true };
  const t = await getMsToken(refreshToken);
  if (!t) return { events: [], expired: true };
  events = await getMsEvents(t.accessToken, startDate, endDate);
  return { events: events || [], tokens: t };
}

export async function getMsAuthUrl() {
  const c = msConfig();
  if (c.error) return { error: c.error };

  const params = new URLSearchParams({
    client_id: c.clientId,
    response_type: 'code',
    redirect_uri: 'https://mon-qg.vercel.app/api/auth/callback',
    scope: 'Calendars.Read offline_access',
    response_mode: 'query'
  });

  return { url: `https://login.microsoftonline.com/${c.tenant}/oauth2/v2.0/authorize?${params}` };
}

export async function exchangeCodeForToken(code) {
  const c = msConfig();
  if (c.error || !c.secret) return null;

  const tokenUrl = `https://login.microsoftonline.com/${c.tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: c.clientId,
    client_secret: c.secret,
    code,
    redirect_uri: 'https://mon-qg.vercel.app/api/auth/callback',
    grant_type: 'authorization_code',
    scope: 'Calendars.Read offline_access'
  });

  try {
    const r = await fetch(tokenUrl, { method: 'POST', body });
    const data = await r.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
  } catch { return null; }
}
