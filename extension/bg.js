// 다락 확장 프로그램은 '틀'만 맡음. 화면과 기능은 모두 인터넷의 다락 앱에서 불러와 자동으로 새 버전이 됨
const APP_URL = 'https://yjlee826-rgb.github.io/youtube-groups/app/';
const APP_ORIGIN = 'https://yjlee826-rgb.github.io';
const hostOf = u => { try { return new URL(u).host; } catch { return ''; } };

// 툴바의 다락 아이콘: 이미 열린 다락 탭이 있으면 그리로, 없으면 새 탭으로 엶
chrome.action.onClicked.addListener(async () => {
  const [t] = await chrome.tabs.query({ url: APP_URL + '*' });
  if (t) { await chrome.tabs.update(t.id, { active: true }); await chrome.windows.update(t.windowId, { focused: true }); }
  else await chrome.tabs.create({ url: APP_URL });
});

// 다락 탭에서 채널·영상·곡을 누르면: 열려 있는 같은 유튜브 탭(일반/뮤직)을 재사용하고, 없을 때만 새 탭
chrome.runtime.onMessageExternal.addListener((m, sender, reply) => {
  if (sender.origin !== APP_ORIGIN) return;
  if (m?.dl === 'ver') return reply({ v: chrome.runtime.getManifest().version });
  if (m?.dl !== 'open') return;
  const url = m.url, host = hostOf(url);
  if (host !== 'www.youtube.com' && host !== 'music.youtube.com') return reply({ ok: false });   // 유튜브 주소만 엶
  (async () => {
    const tabs = await chrome.tabs.query({ windowId: sender.tab.windowId });
    const target = tabs.find(t => t.url && hostOf(t.url) === host);
    if (target) await chrome.tabs.update(target.id, { url, active: true });
    else await chrome.tabs.create({ url, windowId: sender.tab.windowId, index: sender.tab.index + 1 });
    reply({ ok: true });
  })();
  return true;
});
