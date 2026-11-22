// 구독 그룹 앱의 로그인 유지용 서버 (Cloudflare Workers)
// 하는 일: 구글 로그인 코드를 '오래가는 열쇠(refresh token)'로 바꿔 주고, 그 열쇠로 1시간짜리 출입증을 새로 받아 줌
// 저장하는 것: 없음. 구글 앱 비밀 키(CLIENT_SECRET)는 Cloudflare의 비밀 값으로만 들어 있음
const ORIGIN = 'https://yjlee826-rgb.github.io';
const CLIENT_ID = '123904132689-al5msm3lu9itk3hp3q0dap43vka6ejr8.apps.googleusercontent.com';

export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST' || req.headers.get('Origin') !== ORIGIN) return new Response('forbidden', { status: 403, headers: cors });

    const path = new URL(req.url).pathname;
    const b = await req.json().catch(() => ({}));
    const p = new URLSearchParams({ client_id: CLIENT_ID, client_secret: env.CLIENT_SECRET });
    if (path === '/token' && b.code) { p.set('grant_type', 'authorization_code'); p.set('code', b.code); p.set('redirect_uri', 'postmessage'); }
    else if (path === '/refresh' && b.refresh_token) { p.set('grant_type', 'refresh_token'); p.set('refresh_token', b.refresh_token); }
    else return new Response('bad request', { status: 400, headers: cors });

    const g = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: p });
    const j = await g.json();
    const out = { access_token: j.access_token, expires_in: j.expires_in, refresh_token: j.refresh_token, scope: j.scope, error: j.error };
    return new Response(JSON.stringify(out), { status: g.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
};
