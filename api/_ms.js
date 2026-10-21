// Microsoft Graph - authentification et calendrier

export async function getMsToken(refreshToken) {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID } = process.env;
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_TENANT_ID) return null;

  const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    client_secret: MICROSOFT_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: 'Calendars.Read'
  });

  try {
    const r = await fetch(tokenUrl, { method: 'POST', body });
    const data = await r.json();
    return data.access_token || null;
  } catch { return null; }
}

export async function getMsEvents(accessToken, startDate, endDate) {
  if (!accessToken) return [];

  const start = typeof startDate === 'string' ? startDate : startDate.toISOString();
  const end = typeof endDate === 'string' ? endDate : endDate.toISOString();

  try {
    const r = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${start}&endDateTime=${end}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await r.json();
    return (data.value || []).map(e => ({
      id: `ms_${e.id}`,
      title: e.subject || 'Sans titre',
      type: 'Agenda',
      domain: '',
      date: { start: e.start.dateTime || e.start.date, end: e.end.dateTime || e.end.date || null },
      archived: false,
      duration: e.isReminderOn && e.reminderMinutesBeforeStart ? e.reminderMinutesBeforeStart : null,
      source: 'outlook'
    }));
  } catch { return []; }
}

export async function getMsAuthUrl() {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_TENANT_ID } = process.env;
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_TENANT_ID) return null;

  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    response_type: 'code',
    redirect_uri: 'https://mon-qg.vercel.app/api/auth/callback',
    scope: 'Calendars.Read offline_access',
    response_mode: 'query'
  });

  return `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeCodeForToken(code) {
  const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID } = process.env;
  if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_TENANT_ID) return null;

  const tokenUrl = `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    client_secret: MICROSOFT_CLIENT_SECRET,
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
