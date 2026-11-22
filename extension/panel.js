// 다락에서 채널·영상·곡을 누르면 새 탭을 만들지 않고 옆의 유튜브 탭을 그 주소로 바꿈
const APP = 'https://yjlee826-rgb.github.io';
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
