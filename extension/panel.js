// 다락 확장 프로그램은 '틀'만 맡고, 화면과 기능은 모두 인터넷의 다락 앱에서 불러옴
// → 다락 앱이 바뀌면 확장 프로그램을 다시 설치하지 않아도 자동으로 새 버전이 보임
const APP = 'https://yjlee826-rgb.github.io';
const VER = chrome.runtime.getManifest().version;
const frame = document.getElementById('app');
// 앱에 확장 프로그램 버전을 알려 줌 (틀 자체를 바꿔야 할 드문 경우 앱이 안내하도록)
frame.addEventListener('load', () => frame.contentWindow.postMessage({ dl: 'ext', v: VER }, APP));
const hostOf = u => { try { return new URL(u).host; } catch { return ''; } };
addEventListener('message', async e => {
  if (e.origin !== APP || e.data?.dl !== 'open') return;
  const url = e.data.url, host = hostOf(url);
  if (host !== 'www.youtube.com' && host !== 'music.youtube.com') return;   // 유튜브 주소만 엶
  const win = await chrome.windows.getLastFocused();
  const tabs = await chrome.tabs.query({ windowId: win.id });
  const active = tabs.find(t => t.active);
  // 1) 지금 보고 있는 탭이 같은 유튜브(일반/뮤직)면 그 탭을 바꿈  2) 아니면 같은 창의 같은 유튜브 탭을 찾아 바꿈  3) 없으면 새 탭
  const same = t => t.url && hostOf(t.url) === host;
  const target = active && same(active) ? active : tabs.find(same);
  if (target) await chrome.tabs.update(target.id, { url, active: true });
  else await chrome.tabs.create({ url, windowId: win.id });
});
