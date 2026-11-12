/*! 안전비서 — 앱 로직
 *  외부 프레임워크 없이 동작합니다. 데이터는 js/data.js(window.SAFE_DATA)에서만 읽습니다.
 *  사용자 데이터(즐겨찾기·점검 결과·점검 기록)는 이 기기의 localStorage에만 저장됩니다.
 */
(function () {
'use strict';

var D = window.SAFE_DATA;
var LAWS = Object.keys(D.meta.laws);
var VIEWS = ['home', 'tips', 'checklist', 'violations', 'detail', 'search', 'refs', 'emergency', 'favorites'];
var LAW_VIEWS = ['home', 'tips', 'checklist', 'violations', 'refs'];
var $app = document.getElementById('app');

/* ---------- 저장소 ---------- */
var LS = (function () { try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; } catch (e) { return null; } })();
function lsGet(k, d) { if (!LS) return d; try { var v = LS.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { if (!LS) return; try { LS.setItem(k, JSON.stringify(v)); } catch (e) {} }
function rawGet(k) { if (!LS) return null; try { return LS.getItem(k); } catch (e) { return null; } }
function rawSet(k, v) { if (!LS) return; try { if (v == null) LS.removeItem(k); else LS.setItem(k, v); } catch (e) {} }

/* ---------- 상태 ---------- */
var S = { view: 'home', law: LAWS[0], id: null, q: '', group: '전체' };
var savedLaw = rawGet('safe.law');
if (savedLaw && LAWS.indexOf(savedLaw) >= 0) S.law = savedLaw;

/* ---------- 아이콘 ---------- */
function svg(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>'; }
var I = {
  hat: svg('<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/>'),
  home: svg('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
  search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
  book: svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  clipboard: svg('<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'),
  scale: svg('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>'),
  table: svg('<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>'),
  siren: svg('<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.9 4.9.7.7"/><path d="M12 12v6"/>'),
  star: svg('<path d="M11.5 2.3a.6.6 0 0 1 1 0l2.8 5.7 6.3.9a.6.6 0 0 1 .3 1l-4.5 4.4 1 6.2a.6.6 0 0 1-.8.6L12 18.2l-5.6 2.9a.6.6 0 0 1-.8-.6l1-6.2L2.1 9.9a.6.6 0 0 1 .3-1l6.3-.9z"/>'),
  sliders: svg('<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>'),
  alert: svg('<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
  external: svg('<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
  x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  right: svg('<path d="m9 18 6-6-6-6"/>'),
  play: svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
  down: svg('<path d="m6 9 6 6 6-6"/>'),
  back: svg('<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'),
  up: svg('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>'),
  copy: svg('<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'),
  print: svg('<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>'),
  save: svg('<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>'),
  trash: svg('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'),
  history: svg('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'),
  share: svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>'),
  gavel: svg('<path d="m14.5 12.5-8 8a2.1 2.1 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>'),
  coins: svg('<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18"/><path d="M7 6h1v4"/><path d="m16.7 13.9.7.7-2.8 2.8"/>'),
  building: svg('<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'),
  ban: svg('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'),
  file: svg('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>'),
  refresh: svg('<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  skull: svg('<path d="M12 2a8 8 0 0 0-8 8c0 2.8 1.4 5.2 3.5 6.6V20a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3.4A8 8 0 0 0 12 2z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 21v-3M14 21v-3"/>')
};

/* ---------- 유틸 ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function attr(s) { return esc(s); }
function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function todayStr() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }
function lawOf(law) { return D.meta.laws[law] || {}; }
function byId(id) { for (var i = 0; i < D.violations.length; i++) if (D.violations[i].id === id) return D.violations[i]; return null; }
function vOf(law) { return D.violations.filter(function (v) { return v.law === law; }); }
function manualOf(law) { return (D.manuals && D.manuals[law]) || { tips: [], checklist: [] }; }
function refsOf(law) { return (D.refs && D.refs[law]) || []; }
function lawBadge(law, short) { var m = lawOf(law); return '<span class="badge badge-' + attr(m.tone || 'muted') + '">' + esc(short ? m.short : law) + '</span>'; }
function stats(law) { var m = manualOf(law); return { t: m.tips.length, c: m.checklist.length, v: vOf(law).length, r: refsOf(law).length }; }

function announce(msg) { var el = document.getElementById('sr'); if (!el) return; el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 60); }
function toast(msg) {
  var old = document.querySelector('.toast'); if (old) old.remove();
  var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
}
function copyText(text, okMsg) {
  function fallback() {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(okMsg || '복사했습니다'); } catch (e) { toast('복사하지 못했습니다'); }
    ta.remove();
  }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast(okMsg || '복사했습니다'); }, fallback);
  else fallback();
}

/* 국가법령정보센터 링크 — 시행령·시행규칙·별표 조문은 본법 링크로 걸지 않습니다 */
function lawGoUrl(officialName, art) { return D.meta.lawgo.base + encodeURIComponent(officialName) + (art ? '/' + encodeURIComponent(art) : ''); }
function mainArticle(str) {
  var segs = String(str || '').split(/[·,]/);
  for (var i = 0; i < segs.length; i++) {
    if (/시행령|시행규칙|별표|고시/.test(segs[i])) continue;
    var m = segs[i].match(/제\d+조(의\d+)?/); if (m) return m[0];
  }
  return '';
}
function articleLinks(v) {
  var out = [];
  var m = lawOf(v.law);
  var a = mainArticle(v.article);
  out.push({ label: (m.linkLabel || v.law) + (a ? ' ' + a : '') + ' 원문', url: lawGoUrl(m.officialName, a) });
  if (v.basis) {
    var bm = v.basis.match(/^(.*?)\s*(제\d+조(의\d+)?)/);
    if (bm) { var bl = lawOf(bm[1].trim()); out.push({ label: bm[1].trim() + ' ' + bm[2] + ' 원문', url: lawGoUrl(bl.officialName || bm[1].trim(), bm[2]) }); }
  }
  return out;
}

/* ---------- 처벌 요약 ---------- */
function penTags(v) {
  var t = [];
  if (v.crimeDeath) t.push('<span class="badge badge-danger">사망 시 ' + esc(v.crimeDeathShort || '가중') + '</span>');
  if (v.crime) t.push('<span class="badge badge-danger">' + esc(v.crimeShort ? '형사처벌 ' + v.crimeShort : '형사처벌') + '</span>');
  if (v.fine) t.push('<span class="badge badge-warn">과태료 ' + esc(v.fineShort || '') + '</span>');
  if (v.penaltyNote && !v.crime && !v.fine) t.push('<span class="badge badge-info">' + esc(v.penaltyNote) + '</span>');
  else if (v.admin && !v.crime && !v.fine) t.push('<span class="badge badge-info">행정조치</span>');
  return t.join('');
}
function penOneLine(v) {
  var p = [];
  if (v.crime) p.push(v.crimeShort ? '형사처벌 ' + v.crimeShort : '형사처벌');
  if (v.crimeDeath) p.push('사망 시 ' + (v.crimeDeathShort || '가중'));
  if (v.fine) p.push('과태료 ' + (v.fineShort || ''));
  if (!p.length && v.penaltyNote) p.push(v.penaltyNote);
  return p.join(' · ');
}

/* ---------- 즐겨찾기·최근 ---------- */
function favs() { return lsGet('safe.favs', []); }
function isFav(id) { return favs().indexOf(id) >= 0; }
function toggleFav(id) {
  var f = favs(), i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1); else f.unshift(id);
  lsSet('safe.favs', f); return i < 0;
}
function pushRecent(id) {
  var r = lsGet('safe.recent', []).filter(function (x) { return x !== id; });
  r.unshift(id); lsSet('safe.recent', r.slice(0, 8));
}

/* ---------- 라우팅 ---------- */
function writeHash(replace) {
  var p = [];
  if (S.view !== 'detail' && S.view !== 'emergency' && S.view !== 'favorites' && S.view !== 'search') p.push('law=' + encodeURIComponent(S.law));
  if (S.view === 'detail' && S.id) p.push('id=' + encodeURIComponent(S.id));
  if (S.view === 'search' && S.q) p.push('q=' + encodeURIComponent(S.q));
  var h = '#/' + S.view + (p.length ? '?' + p.join('&') : '');
  if (location.hash === h) return;
  try { if (replace) history.replaceState(null, '', h); else history.pushState(null, '', h); } catch (e) { location.hash = h; }
}
function readHash() {
  var h = location.hash.replace(/^#\/?/, '');
  var parts = h.split('?'), view = parts[0] || 'home', params = {};
  (parts[1] || '').split('&').forEach(function (kv) {
    if (!kv) return; var i = kv.indexOf('=');
    try { params[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); } catch (e) {}
  });
  S.view = VIEWS.indexOf(view) >= 0 ? view : 'home';
  if (params.law && LAWS.indexOf(params.law) >= 0) S.law = params.law;
  S.id = params.id || null;
  if (S.view === 'search') S.q = params.q || S.q || '';
  if (S.view === 'detail') { var v = byId(S.id); if (v) S.law = v.law; else S.view = 'violations'; }
}
function go(view, o) {
  o = o || {};
  if (o.law) S.law = o.law;
  if (o.id !== undefined) S.id = o.id;
  if (o.q !== undefined) S.q = o.q;
  if (view !== 'violations' || o.law) S.group = o.group || '전체';
  S.view = view;
  if (view === 'detail') { var v = byId(S.id); if (v) { S.law = v.law; pushRecent(v.id); } }
  rawSet('safe.law', S.law);
  writeHash(o.replace);
  render(true);
}
window.addEventListener('popstate', function () {
  /* 모션그래픽 재생기가 뒤로가기로 닫히는 경우에는 화면을 다시 그리지 않습니다 */
  var C = window.SAFE_CINE; if (C && C.isOpen()) return; if (C && C.skipPop) { C.skipPop = false; return; }
  readHash(); render(true);
});

/* ---------- 셸 ---------- */
var NAV = [
  { view: 'home', label: '홈', icon: 'home' },
  { view: 'tips', label: '관리요령', icon: 'book' },
  { view: 'checklist', label: '자가점검', icon: 'clipboard' },
  { view: 'violations', label: '위반사례', icon: 'scale' },
  { view: 'refs', label: '참고자료', icon: 'table' }
];
function navCurrent(view) { return S.view === view || (view === 'violations' && S.view === 'detail'); }
function renderTopbar() {
  return '<header class="topbar no-print"><div class="wrap topbar-in">' +
    '<a class="brand" href="#/home" data-act="nav" data-view="home" aria-label="안전비서 홈"><span class="brand-mark">' + I.hat + '</span>안전비서 <small>산업안전·중대재해 업무지원</small></a>' +
    '<nav class="topnav" aria-label="주 메뉴">' + NAV.slice(1).map(function (n) {
      return '<button data-act="nav" data-view="' + n.view + '"' + (navCurrent(n.view) ? ' aria-current="page"' : '') + '>' + n.label + '</button>';
    }).join('') + '</nav>' +
    '<div class="top-actions">' +
      '<button class="icon-btn" data-act="nav" data-view="search" aria-label="검색">' + I.search + '</button>' +
      '<button class="icon-btn" data-act="nav" data-view="favorites" aria-label="즐겨찾기">' + I.star + '</button>' +
      '<button class="icon-btn" data-act="settings" aria-label="설정">' + I.sliders + '</button>' +
    '</div></div></header>';
}
function renderLawbar() {
  if (LAW_VIEWS.indexOf(S.view) < 0) return '';
  return '<div class="lawbar no-print"><div class="wrap lawbar-in" role="tablist" aria-label="법령 선택">' + LAWS.map(function (l) {
    return '<button class="lawtab" role="tab" data-act="law" data-law="' + attr(l) + '" aria-selected="' + (S.law === l) + '">' + esc(lawOf(l).tabLabel || l) + '</button>';
  }).join('') + '</div></div>';
}
function renderTabbar() {
  return '<nav class="tabbar no-print" aria-label="하단 메뉴">' + NAV.map(function (n) {
    return '<button class="tabbar-btn" data-act="nav" data-view="' + n.view + '"' + (navCurrent(n.view) ? ' aria-current="page"' : '') + '>' + I[n.icon] + '<span>' + n.label + '</span></button>';
  }).join('') + '</nav>';
}
function renderFooter() {
  return '<footer class="footer no-print"><p>자료 기준일 ' + esc(D.meta.basisDate) + ' · 데이터 ' + esc(D.meta.dataVersion) + '. ' +
    '이 앱은 업무 참고용이며 법적 효력이 없습니다. 처분·처벌 여부는 국가법령정보센터 원문과 관할 지방고용노동관서에서 확인하세요.</p>' +
    '<p><button data-act="about">자료 출처·저장 안내</button></p></footer>';
}
function pageHead(title, desc, back) {
  return '<div class="page-head">' + (back ? '<button class="back-btn no-print" data-act="back" aria-label="뒤로">' + I.back + '</button>' : '') +
    '<div class="grow"><h1>' + esc(title) + '</h1>' + (desc ? '<p>' + desc + '</p>' : '') + '</div></div>';
}
function viewTitle() {
  switch (S.view) {
    case 'home': return '홈';
    case 'tips': return '관리요령 · ' + S.law;
    case 'checklist': return '자가점검 · ' + S.law;
    case 'violations': return '위반사례 · ' + S.law;
    case 'detail': var v = byId(S.id); return v ? v.name : '위반사례';
    case 'search': return S.q ? '검색: ' + S.q : '검색';
    case 'refs': return '참고자료 · ' + S.law;
    case 'emergency': return '중대재해 발생 시 대응';
    case 'favorites': return '즐겨찾기';
  }
  return '';
}

function render(isNav) {
  var narrow = ['detail', 'tips', 'checklist', 'emergency', 'search'].indexOf(S.view) >= 0;
  $app.innerHTML = renderTopbar() + renderLawbar() +
    '<main id="main" tabindex="-1"><div class="wrap' + (narrow ? ' wrap-narrow' : '') + '">' + currentViewHTML() + renderFooter() + '</div></main>' +
    renderTabbar() + '<button class="totop no-print" data-act="totop" aria-label="맨 위로">' + I.up + '</button>';
  document.title = viewTitle() + ' — 안전비서';
  if (isNav) {
    window.scrollTo(0, 0);
    var m = document.getElementById('main'); if (m && document.activeElement && document.activeElement !== document.body) m.focus({ preventScroll: true });
    announce(viewTitle());
  }
  syncTotop();
}
function currentViewHTML() {
  switch (S.view) {
    case 'tips': return viewTips();
    case 'checklist': return viewChecklist();
    case 'violations': return viewViolations();
    case 'detail': return viewDetail();
    case 'search': return viewSearch();
    case 'refs': return viewRefs();
    case 'emergency': return viewEmergency();
    case 'favorites': return viewFavorites();
    default: return viewHome();
  }
}

/* ---------- 홈 ---------- */
function viewHome() {
  var m = lawOf(S.law), st = stats(S.law);
  var h = '<div class="stack-lg">';
  h += '<section class="hero"><span class="hero-badge">' + I.hat + '안전관리 업무지원 핸드북</span>' +
    '<h1>' + esc(m.title || S.law) + '</h1><p>' + esc(m.desc || '') + '</p>' +
    '<div class="hero-foot"><div class="hero-stats">' +
      (st.t ? '<div class="hero-stat"><b>' + st.t + '</b><span>관리요령</span></div>' : '') +
      (st.c ? '<div class="hero-stat"><b>' + st.c + '</b><span>점검항목</span></div>' : '') +
      (st.v ? '<div class="hero-stat"><b>' + st.v + '</b><span>위반사례</span></div>' : '') +
    '</div><a class="hero-link no-print" href="' + attr(lawGoUrl(m.officialName)) + '" target="_blank" rel="noopener">' + I.external + '법령 원문</a></div></section>';

  if (m.notice) h += '<div class="notice info">' + I.info + '<div>' + esc(m.notice) + '</div></div>';

  h += '<section><div class="searchbox">' + I.search.replace('<svg', '<svg class="lead"') +
    '<input id="q-home" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="단어나 겪은 상황을 문장으로 검색" aria-label="통합검색" />' +
    '</div><div class="quick no-print"><span class="quick-label">이렇게 물어보세요</span>' +
    (D.quickAsk || []).map(function (q) { return '<button class="chip" data-act="ask" data-q="' + attr(q) + '">' + esc(q) + '</button>'; }).join('') +
    '</div></section>';

  var cards = [
    { view: 'tips', ico: 'book', title: '관리요령', desc: '의무 사항과 현장 관리 방법', cnt: st.t },
    { view: 'checklist', ico: 'clipboard', title: '자가점검', desc: '체크리스트 작성 · 저장 · 출력', cnt: st.c },
    { view: 'violations', ico: 'scale', title: '위반사례', desc: '형사처벌 · 과태료 · 행정조치', cnt: st.v },
    { view: 'refs', ico: 'table', title: '참고자료', desc: m.refsDesc || '기준표와 목록', cnt: st.r },
    { view: 'emergency', ico: 'siren', title: '중대재해 발생 시', desc: '작업중지 · 보고 · 현장보존 순서', alert: true },
    { view: 'favorites', ico: 'star', title: '즐겨찾기', desc: '별표한 위반사례와 최근 본 항목', cnt: favs().length }
  ];
  h += '<section class="menu-grid" aria-label="메뉴">' + cards.map(function (c) {
    return '<button class="menu-card' + (c.alert ? ' is-alert' : '') + '" data-act="nav" data-view="' + c.view + '">' +
      '<span class="menu-ico">' + I[c.ico] + '</span>' +
      '<span class="menu-title">' + esc(c.title) + (c.cnt ? '<span class="badge">' + c.cnt + '</span>' : '') + '</span>' +
      '<span class="menu-desc">' + esc(c.desc) + '</span></button>';
  }).join('') + '</section>';

  var recent = lsGet('safe.recent', []).map(byId).filter(Boolean).slice(0, 5);
  if (recent.length) {
    h += '<section class="card card-pad"><h2 class="sec">최근 본 위반사례</h2><div class="mini-list" style="margin-top:8px">' +
      recent.map(function (v) {
        return '<button class="mini-item" data-act="open" data-id="' + attr(v.id) + '">' + lawBadge(v.law, true) + '<span class="mini-name grow">' + esc(v.name) + '</span>' + I.right + '</button>';
      }).join('') + '</div></section>';
  }
  return h + '</div>';
}

/* ---------- 관리요령 ---------- */
function viewTips() {
  var tips = manualOf(S.law).tips;
  var h = '<div class="stack-lg">' + pageHead('관리요령', esc(S.law) + ' — 지켜야 할 의무와 현장 관리 방법. 처벌 수위는 각 항목 아래 위반사례에서 확인하세요.');
  if (!tips.length) return h + emptyBox('관리요령이 없습니다.') + '</div>';
  h += '<div class="acc">' + tips.map(function (t, i) {
    var rel = (t.vids || []).map(byId).filter(Boolean);
    return '<details' + (i === 0 ? ' open' : '') + '><summary><span class="acc-no">' + (i + 1) + '</span><span class="grow">' + esc(t.title) + '</span><span class="chev">' + I.down + '</span></summary>' +
      '<div class="acc-body"><ul class="bullets">' + t.content.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
      (t.article ? '<p class="small subtle" style="margin-top:10px">근거: ' + esc(t.article) + '</p>' : '') +
      (rel.length ? '<div class="acc-links">' + rel.map(function (v) { return '<button class="chip" data-act="open" data-id="' + attr(v.id) + '">' + esc(v.name) + '</button>'; }).join('') + '</div>' : '') +
      '</div></details>';
  }).join('') + '</div>';
  return h + '</div>';
}

/* ---------- 자가점검 ---------- */
function checksOf(law) { return lsGet('safe.checks.' + law, {}); }
function checkMeta(law) { return lsGet('safe.checkMeta.' + law, { site: '', who: '', date: todayStr() }); }
function checkCounts(law) {
  var list = manualOf(law).checklist, a = checksOf(law), c = { y: 0, n: 0, na: 0, none: 0, total: list.length };
  list.forEach(function (q) { var v = a[q.id]; if (v === 'y') c.y++; else if (v === 'n') c.n++; else if (v === 'na') c.na++; else c.none++; });
  return c;
}
function riskHTML(q) {
  var rel = (q.vids || []).map(byId).filter(Boolean);
  if (!rel.length) return '<div class="citem-risk">미이행 — 관리요령을 확인해 보완하세요.</div>';
  return '<div class="citem-risk"><b>미이행 시 해당될 수 있는 위반사례</b>' + rel.map(function (v) {
    return '<a href="#/detail?id=' + attr(v.id) + '" data-act="open" data-id="' + attr(v.id) + '">' + esc(v.name) + (penOneLine(v) ? ' — ' + esc(penOneLine(v)) : '') + '</a>';
  }).join('') + '</div>';
}
function checkItemHTML(q, i, val) {
  return '<div class="citem" data-qid="' + attr(q.id) + '">' +
    '<div class="citem-q"><span class="citem-no">' + (i + 1) + '.</span><span>' + esc(q.q) + '</span></div>' +
    (q.article ? '<div class="citem-law">' + esc(q.article) + '</div>' : '') +
    '<div class="seg" role="group" aria-label="' + attr((i + 1) + '번 응답') + '">' +
      [['y', '예'], ['n', '아니오'], ['na', '해당없음']].map(function (o) {
        return '<button data-act="check" data-qid="' + attr(q.id) + '" data-v="' + o[0] + '" aria-pressed="' + (val === o[0]) + '">' + o[1] + '</button>';
      }).join('') +
    '</div><div class="risk-slot">' + (val === 'n' ? riskHTML(q) : '') + '</div></div>';
}
function checkSumHTML(c) {
  var done = c.total - c.none, pct = c.total ? Math.round(done / c.total * 100) : 0;
  return '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="응답 진행률"><i style="width:' + pct + '%"></i></div>' +
    '<div class="check-sum"><span>응답 <b>' + done + '/' + c.total + '</b></span><span>이행 <b>' + c.y + '</b></span><span>미이행 <b style="color:var(--danger)">' + c.n + '</b></span><span>해당없음 <b>' + c.na + '</b></span></div>';
}
function viewChecklist() {
  var list = manualOf(S.law).checklist, a = checksOf(S.law), meta = checkMeta(S.law);
  var h = '<div class="stack-lg">' + pageHead('자가점검 체크리스트', esc(S.law) + ' — 응답은 이 기기에 자동 저장됩니다. \'아니오\'를 고르면 해당될 수 있는 위반사례가 보입니다.');
  if (!list.length) return h + emptyBox('점검항목이 없습니다.') + '</div>';
  h += '<section class="card card-pad"><div class="kv">' +
    '<label for="cm-site" class="small subtle" style="align-self:center">사업장</label><input id="cm-site" class="txt" data-meta="site" value="' + attr(meta.site) + '" placeholder="사업장명" />' +
    '<label for="cm-who" class="small subtle" style="align-self:center">점검자</label><input id="cm-who" class="txt" data-meta="who" value="' + attr(meta.who) + '" placeholder="성명·직위" />' +
    '<label for="cm-date" class="small subtle" style="align-self:center">점검일</label><input id="cm-date" class="txt" type="date" data-meta="date" value="' + attr(meta.date || todayStr()) + '" />' +
    '</div></section>';
  h += '<section class="card card-pad" id="check-sum">' + checkSumHTML(checkCounts(S.law)) + '</section>';
  h += '<section class="list">' + list.map(function (q, i) { return checkItemHTML(q, i, a[q.id]); }).join('') + '</section>';
  h += '<div class="btn-row no-print">' +
    '<button class="btn btn-primary" data-act="checksave">' + I.save + '점검 결과 저장</button>' +
    '<button class="btn" data-act="checkcopy">' + I.copy + '요약 복사</button>' +
    '<button class="btn" data-act="print">' + I.print + '인쇄</button>' +
    '<button class="btn" data-act="checklog">' + I.history + '지난 점검 기록</button>' +
    '<button class="btn btn-danger" data-act="checkreset">' + I.trash + '응답 지우기</button></div>';
  h += '<div class="print-sign"><div>점검자 (서명)</div><div>안전보건관리책임자 (서명)</div></div>';
  return h + '</div>';
}
function checkSummaryText(law) {
  var list = manualOf(law).checklist, a = checksOf(law), meta = checkMeta(law), c = checkCounts(law);
  var lines = ['[자가점검 결과] ' + law,
    '사업장: ' + (meta.site || '-') + ' / 점검자: ' + (meta.who || '-') + ' / 점검일: ' + (meta.date || todayStr()),
    '이행 ' + c.y + ' · 미이행 ' + c.n + ' · 해당없음 ' + c.na + ' · 미응답 ' + c.none + ' (전체 ' + c.total + ')'];
  var miss = list.filter(function (q) { return a[q.id] === 'n'; });
  if (miss.length) {
    lines.push('', '■ 미이행 항목');
    miss.forEach(function (q, i) {
      lines.push((i + 1) + '. ' + q.q + (q.article ? ' (' + q.article + ')' : ''));
      (q.vids || []).map(byId).filter(Boolean).forEach(function (v) { lines.push('   → ' + v.name + (penOneLine(v) ? ': ' + penOneLine(v) : '')); });
    });
  }
  var none = list.filter(function (q) { return !a[q.id]; });
  if (none.length) { lines.push('', '■ 미응답 항목'); none.forEach(function (q) { lines.push('- ' + q.q); }); }
  lines.push('', '※ 안전비서 자가점검 결과입니다. 위반 여부·처분은 관할 지방고용노동관서 판단에 따릅니다.');
  return lines.join('\n');
}
function addCheckLog(law) {
  var log = lsGet('safe.checkLog', {}), arr = log[law] || [], meta = checkMeta(law), c = checkCounts(law);
  var entry = { t: Date.now(), date: meta.date || todayStr(), site: meta.site || '', who: meta.who || '', counts: c, text: checkSummaryText(law) };
  arr = arr.filter(function (e) { return !(e.date === entry.date && e.site === entry.site); });
  arr.unshift(entry); log[law] = arr.slice(0, 30); lsSet('safe.checkLog', log);
}
function updateCheckDOM(qid) {
  var a = checksOf(S.law), val = a[qid];
  var item = document.querySelector('.citem[data-qid="' + CSS.escape(qid) + '"]'); if (!item) return;
  item.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === val)); });
  var q = manualOf(S.law).checklist.filter(function (x) { return x.id === qid; })[0];
  item.querySelector('.risk-slot').innerHTML = val === 'n' && q ? riskHTML(q) : '';
  var sum = document.getElementById('check-sum'); if (sum) sum.innerHTML = checkSumHTML(checkCounts(S.law));
}

/* ---------- 위반사례 ---------- */
function violationRow(v, terms) {
  var name = esc(v.name);
  if (terms && terms.length) name = highlight(v.name, terms);
  return '<button class="vrow" data-act="open" data-id="' + attr(v.id) + '"><span class="vrow-main">' +
    '<span class="vrow-name">' + name + '</span><span class="vrow-art">' + esc(v.article) + '</span>' +
    '<span class="vrow-tags">' + penTags(v) + '</span></span><span class="vrow-arrow">' + I.right + '</span></button>';
}
function groupsOf(law) {
  var order = lawOf(law).groups || [], seen = {};
  vOf(law).forEach(function (v) { seen[v.group] = (seen[v.group] || 0) + 1; });
  var gs = order.filter(function (g) { return seen[g]; });
  Object.keys(seen).forEach(function (g) { if (gs.indexOf(g) < 0) gs.push(g); });
  return gs.map(function (g) { return { name: g, n: seen[g] }; });
}
function viewViolations() {
  var list = vOf(S.law), groups = groupsOf(S.law);
  var h = '<div class="stack-lg">' + pageHead('위반사례', esc(S.law) + ' — 위반 유형별 형사처벌·과태료·행정조치. ' + esc(lawOf(S.law).vNote || ''));
  h += '<div class="chips no-print" role="group" aria-label="분류">' +
    '<button class="chip" data-act="group" data-group="전체" aria-pressed="' + (S.group === '전체') + '">전체<span class="n">' + list.length + '</span></button>' +
    groups.map(function (g) { return '<button class="chip" data-act="group" data-group="' + attr(g.name) + '" aria-pressed="' + (S.group === g.name) + '">' + esc(g.name) + '<span class="n">' + g.n + '</span></button>'; }).join('') + '</div>';
  var shown = groups.filter(function (g) { return S.group === '전체' || S.group === g.name; });
  h += '<div class="list">' + shown.map(function (g) {
    return '<div class="list-group-title">' + esc(g.name) + '</div>' + list.filter(function (v) { return v.group === g.name; }).map(function (v) { return violationRow(v); }).join('');
  }).join('') + '</div>';
  return h + '</div>';
}
/* 모션그래픽 예고 카드 — 장면이 준비된 위반사례에만 */
function cineCardHTML(id) {
  var S = window.SAFE_SCENES, C = window.SAFE_CINE; if (!S || !C) return '';
  var emg = id === 'emergency'; if (!emg && !S.has(id)) return '';
  var st = emg ? S.emergency(D.emergency) : S.build(byId(id)); if (!st) return '';
  var sec = Math.round(st.scenes.reduce(function (a, s) { return a + C.sceneDur(s); }, 0) / 5) * 5;
  return '<button class="cine-card no-print" data-act="cine" data-id="' + attr(id) + '"><span class="cine-card-ico">' + I.play + '</span>' +
    '<span class="grow"><b>모션그래픽으로 보기</b><span>' + st.scenes.length + '장면 · 약 ' + sec + '초 · 자막과 배경음·효과음</span></span>' + I.right + '</button>';
}
function fineTableHTML(ft) {
  if (!ft || !ft.rows || ft.rows.length < 2) return '';
  var head = ft.rows[0], body = ft.rows.slice(1);
  return '<div class="table-scroll"><table class="ftable"><thead><tr>' + head.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' +
    '<p class="ftable-note">' + esc([ft.basis, ft.unit].filter(Boolean).join(' · ')) + '</p>';
}
function reportHTML(t) { return esc(t).replace(/\[([^\]]+)\]/g, '<span class="slot">[$1]</span>'); }
var CONF = { verified: ['badge-ok', '원문 대조'], partial: ['badge-warn', '일부 확인'], unverified: ['badge-danger', '확인 필요'] };
function viewDetail() {
  var v = byId(S.id); if (!v) return emptyBox('위반사례를 찾을 수 없습니다.');
  var fav = isFav(v.id), conf = CONF[v.confidence] || CONF.partial;
  var h = '<div class="stack-lg"><div class="page-head detail-head"><button class="back-btn no-print" data-act="back" aria-label="뒤로">' + I.back + '</button>' +
    '<div class="grow"><div class="badge-row">' + lawBadge(v.law) + '<span class="badge">' + esc(v.group) + '</span></div>' +
    '<h1>' + esc(v.name) + '</h1><p class="art">' + esc(v.article) + (v.basis ? ' · ' + esc(v.basis) : '') + '</p></div>' +
    '<button class="star-btn no-print" data-act="fav" data-id="' + attr(v.id) + '" aria-pressed="' + fav + '" aria-label="즐겨찾기">' + I.star + '</button></div>';

  /* 모션그래픽 */
  h += cineCardHTML(v.id);

  /* 처벌 요약 */
  var pens = [];
  if (v.crime) pens.push('<div class="pen is-crime"><div class="pen-k">' + I.gavel + '형사처벌</div><div class="pen-v">' + esc(v.crime) + '</div></div>');
  if (v.crimeDeath) pens.push('<div class="pen is-death"><div class="pen-k">' + I.alert + '근로자 사망 시</div><div class="pen-v">' + esc(v.crimeDeath) + '</div></div>');
  if (v.fine) pens.push('<div class="pen is-fine' + (v.fineTable ? ' is-wide' : '') + '"><div class="pen-k">' + I.coins + '과태료</div><div class="pen-v">' + esc(v.fine) + '</div>' + fineTableHTML(v.fineTable) + '</div>');
  if (v.admin) pens.push('<div class="pen"><div class="pen-k">' + I.ban + '행정조치</div><div class="pen-v">' + esc(v.admin) + '</div></div>');
  if (v.corp) pens.push('<div class="pen"><div class="pen-k">' + I.building + '법인(양벌)</div><div class="pen-v">' + esc(v.corp) + '</div></div>');
  if (!pens.length && v.penaltyNote) pens.push('<div class="pen is-wide"><div class="pen-k">' + I.info + '처벌</div><div class="pen-v">' + esc(v.penaltyNote) + '</div></div>');
  h += '<section class="stack"><h2 class="sec">처벌 요약</h2><div class="pen-grid">' + pens.join('') + '</div>' +
    (v.extra && v.extra.length ? '<ul class="bullets small muted" style="margin-top:12px">' + v.extra.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') + '</section>';

  /* 지켜야 할 기준 */
  if (v.points && v.points.length) {
    h += '<section class="card card-pad stack"><h2 class="sec">지켜야 할 기준</h2><ul class="bullets">' +
      v.points.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
  }

  /* 근거 조문 */
  h += '<section class="card card-pad stack"><h2 class="sec">근거 조문</h2><p class="small muted">' + esc(v.article) + '</p>' +
    (v.text ? '<div class="lawtext">' + esc(v.text) + '</div>' : '') +
    '<div class="btn-row no-print">' + articleLinks(v).map(function (l) { return '<a class="btn btn-sm" href="' + attr(l.url) + '" target="_blank" rel="noopener">' + I.external + esc(l.label) + '</a>'; }).join('') + '</div></section>';

  /* 관리요령 · 예방 */
  var prevent = manualOf(v.law).checklist.filter(function (q) { return (q.vids || []).indexOf(v.id) >= 0; });
  if (v.tip || prevent.length) {
    h += '<section class="card card-pad stack"><h2 class="sec">예방하려면</h2>' + (v.tip ? '<p>' + esc(v.tip) + '</p>' : '') +
      (prevent.length ? '<div><p class="small subtle">자가점검 항목</p><ul class="bullets small" style="margin-top:6px">' + prevent.map(function (q) { return '<li>' + esc(q.q) + '</li>'; }).join('') + '</ul>' +
        '<button class="btn btn-sm no-print" style="margin-top:10px" data-act="nav" data-view="checklist" data-law="' + attr(v.law) + '">' + I.clipboard + '자가점검으로 이동</button></div>' : '') + '</section>';
  }

  /* 점검 기록 문안 */
  if (v.report) {
    h += '<section class="card card-pad stack"><h2 class="sec">' + I.file.replace('<svg', '<svg style="width:18px;height:18px"') + '점검·지적 기록 문안</h2>' +
      '<p class="small muted">[ ] 안을 현장 내용으로 바꿔 쓰세요. 내부 점검 기록이나 지적서 초안용입니다.</p>' +
      '<div class="report-box">' + reportHTML(v.report) + '</div>' +
      '<div class="btn-row no-print"><button class="btn btn-sm" data-act="copyreport" data-id="' + attr(v.id) + '">' + I.copy + '문안 복사</button></div></section>';
  }

  /* 출처 */
  h += '<section class="stack"><div class="row" style="flex-wrap:wrap"><span class="badge ' + conf[0] + '">' + conf[1] + '</span>' +
    '<span class="small subtle">' + esc(lawOf(v.law).basisLine || '') + '</span></div>' +
    (v.note ? '<p class="small muted">' + esc(v.note) + '</p>' : '') +
    (v.sources && v.sources.length ? '<details class="src-list"><summary style="cursor:pointer;min-height:32px">자료 출처 ' + v.sources.length + '건</summary><ul class="bullets" style="margin-top:6px">' +
      v.sources.map(function (s) { return '<li><a href="' + attr(s) + '" target="_blank" rel="noopener">' + esc(s) + '</a></li>'; }).join('') + '</ul></details>' : '') +
    '<div class="btn-row no-print"><button class="btn btn-sm" data-act="sharev" data-id="' + attr(v.id) + '">' + I.share + '이 사례 주소 공유</button>' +
    '<button class="btn btn-sm" data-act="print">' + I.print + '인쇄</button></div></section>';

  /* 같은 분류 */
  var sib = vOf(v.law).filter(function (x) { return x.group === v.group && x.id !== v.id; });
  if (sib.length) h += '<section class="stack no-print"><h2 class="sec">같은 분류의 위반사례</h2><div class="list">' + sib.map(function (x) { return violationRow(x); }).join('') + '</div></section>';
  return h + '</div>';
}

/* ---------- 검색 ---------- */
var SEARCH = window.SAFE_SEARCH.create(D, window.SAFE_ASK);
function searchAny(q) { return SEARCH.search(q); }
function highlight(text, terms) {
  var out = esc(text);
  terms.filter(function (t) { return t && t.length >= 1; }).sort(function (a, b) { return b.length - a.length; }).slice(0, 12).forEach(function (t) {
    var e = esc(t); if (!e) return;
    out = out.replace(new RegExp('(' + reEsc(e) + ')(?![^<]*>)', 'gi'), '<mark>$1</mark>');
  });
  return out;
}
var TYPE_LABEL = { v: '위반사례', t: '관리요령', c: '자가점검 항목', r: '참고자료', e: '대응 절차' };
function hitRow(d, terms) {
  var act = d.type === 'v' ? 'data-act="open" data-id="' + attr(d.id) + '"' :
    d.type === 't' ? 'data-act="nav" data-view="tips" data-law="' + attr(d.law) + '"' :
    d.type === 'c' ? 'data-act="nav" data-view="checklist" data-law="' + attr(d.law) + '"' :
    d.type === 'r' ? 'data-act="nav" data-view="refs" data-law="' + attr(d.law) + '"' : 'data-act="nav" data-view="emergency"';
  var v = d.type === 'v' ? byId(d.id) : null;
  return '<button class="vrow" ' + act + '><span class="vrow-main"><span class="vrow-name">' + highlight(d.title, terms) + '</span>' +
    '<span class="vrow-art">' + esc(d.sub || '') + '</span>' +
    '<span class="vrow-tags">' + (d.law ? lawBadge(d.law, true) : '') + (v ? penTags(v) : '') + '</span></span><span class="vrow-arrow">' + I.right + '</span></button>';
}
function searchResultsHTML(q) {
  if (!q.trim()) {
    return '<div class="quick"><span class="quick-label">이렇게 물어보세요</span>' + (D.quickAsk || []).map(function (x) { return '<button class="chip" data-act="ask" data-q="' + attr(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>';
  }
  var r = searchAny(q);
  if (!r.items.length) return emptyBox('"' + esc(q) + '"에 맞는 항목이 없습니다. 다른 낱말이나 짧은 단어로 찾아보세요.');
  var h = '<p class="small muted" id="search-count">' + (r.mode === 'ask' ? '문장에서 찾은 주제: <b>' + esc((r.topics || []).join(', ') || '-') + '</b> · 관련도 순 ' : '') + r.items.length + '건</p>';
  ['v', 'c', 't', 'r', 'e'].forEach(function (type) {
    var hits = r.items.filter(function (d) { return d.type === type; }); if (!hits.length) return;
    h += '<section class="stack"><h2 class="sec">' + TYPE_LABEL[type] + '<span class="badge">' + hits.length + '</span></h2><div class="list">' + hits.slice(0, type === 'v' ? 30 : 12).map(function (d) { return hitRow(d, r.terms); }).join('') + '</div></section>';
  });
  return h;
}
function viewSearch() {
  return '<div class="stack-lg">' + pageHead('검색', '단어(예: 안전난간, 특별교육)나 겪은 상황(예: 지게차에 부딪힐 뻔했어요)으로 세 법령 전체를 찾습니다.') +
    '<div class="searchbox">' + I.search.replace('<svg', '<svg class="lead"') +
    '<input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="단어나 문장으로 검색" value="' + attr(S.q) + '" aria-label="통합검색" aria-describedby="search-count" />' +
    (S.q ? '<button class="clear" data-act="clearq" aria-label="검색어 지우기">' + I.x + '</button>' : '') + '</div>' +
    '<div id="results" class="stack-lg">' + searchResultsHTML(S.q) + '</div></div>';
}

/* ---------- 참고자료 ---------- */
function refHTML(r) {
  var h = '<section class="card card-pad stack" id="ref-' + attr(r.id) + '"><div><h2 class="sec">' + esc(r.title) + '</h2>' + (r.basis ? '<p class="small subtle" style="margin-top:2px">' + esc(r.basis) + '</p>' : '') + '</div>';
  if (r.desc) h += '<p class="small muted">' + esc(r.desc) + '</p>';
  if (r.rows && r.rows.length) {
    h += '<div class="table-scroll"><table class="ref-table"><thead><tr>' + r.rows[0].map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      r.rows.slice(1).map(function (row) { return '<tr>' + row.map(function (c, i) { return '<td' + (i === row.length - 1 && r.numLast ? ' class="num"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  if (r.items && r.items.length) h += '<ol class="olist">' + r.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>';
  if (r.note) h += '<p class="small subtle">' + esc(r.note) + '</p>';
  if (r.vids && r.vids.length) h += '<div class="acc-links no-print">' + r.vids.map(byId).filter(Boolean).map(function (v) { return '<button class="chip" data-act="open" data-id="' + attr(v.id) + '">' + esc(v.name) + '</button>'; }).join('') + '</div>';
  return h + '</section>';
}
function viewRefs() {
  var refs = refsOf(S.law);
  var h = '<div class="stack-lg">' + pageHead('참고자료', esc(S.law) + ' — 현장에서 자주 찾는 기준표와 목록입니다.');
  if (!refs.length) return h + emptyBox('참고자료가 없습니다.') + '</div>';
  if (refs.length > 1) h += '<div class="chips no-print">' + refs.map(function (r) { return '<button class="chip" data-act="jump" data-target="ref-' + attr(r.id) + '">' + esc(r.short || r.title) + '</button>'; }).join('') + '</div>';
  return h + refs.map(refHTML).join('') + '</div>';
}

/* ---------- 중대재해 대응 ---------- */
function viewEmergency() {
  var E = D.emergency;
  var h = '<div class="stack-lg">' + pageHead('중대재해 발생 시 대응', esc(E.intro), true);
  h += '<div class="notice danger">' + I.alert + '<div>' + esc(E.alert) + '</div></div>';
  h += cineCardHTML('emergency');
  h += '<section class="card card-pad"><div class="timeline">' + E.steps.map(function (s, i) {
    return '<div class="tl-step"><span class="tl-dot">' + (i + 1) + '</span><div class="tl-when">' + esc(s.when) + '</div><div class="tl-title">' + esc(s.title) + '</div>' +
      '<ul class="bullets small" style="margin-top:6px">' + s.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      (s.basis ? '<div class="tl-basis">근거: ' + esc(s.basis) + '</div>' : '') +
      (s.vids && s.vids.length ? '<div class="acc-links no-print">' + s.vids.map(byId).filter(Boolean).map(function (v) { return '<button class="chip" data-act="open" data-id="' + attr(v.id) + '">' + esc(v.name) + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
  }).join('') + '</div></section>';
  if (E.defs) h += '<section class="card card-pad stack"><h2 class="sec">어떤 재해가 \'중대재해\'인가</h2>' + E.defs.map(function (d) {
    return '<div><h3>' + esc(d.title) + '</h3><p class="small subtle">' + esc(d.basis) + '</p><ul class="bullets small" style="margin-top:6px">' + d.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }).join('') + '</section>';
  h += '<div class="btn-row no-print"><button class="btn" data-act="print">' + I.print + '인쇄해서 현장에 비치</button></div>';
  return h + '</div>';
}

/* ---------- 즐겨찾기 ---------- */
function viewFavorites() {
  var f = favs().map(byId).filter(Boolean);
  var h = '<div class="stack-lg">' + pageHead('즐겨찾기', '위반사례 상세에서 별표를 누르면 여기에 모입니다. 이 기기에만 저장됩니다.');
  h += f.length ? '<div class="list">' + f.map(function (v) { return violationRow(v); }).join('') + '</div>' : emptyBox('아직 즐겨찾기한 위반사례가 없습니다.');
  var recent = lsGet('safe.recent', []).map(byId).filter(Boolean);
  if (recent.length) h += '<section class="stack"><h2 class="sec">최근 본 위반사례</h2><div class="list">' + recent.map(function (v) { return violationRow(v); }).join('') + '</div></section>';
  return h + '</div>';
}
function emptyBox(msg) { return '<div class="empty">' + I.search + '<p>' + msg + '</p></div>'; }

/* ---------- 시트(설정·안내·점검 기록) ---------- */
var sheetOpener = null;
function showSheet(title, body) {
  closeSheet(true);
  sheetOpener = document.activeElement;
  var back = document.createElement('div');
  back.className = 'sheet-back'; back.setAttribute('data-act', 'sheetback');
  back.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="sheet-head"><h2 id="sheet-title">' + esc(title) + '</h2>' +
    '<button class="icon-btn" data-act="closesheet" aria-label="닫기">' + I.x + '</button></div><div class="sheet-body">' + body + '</div></div>';
  document.body.appendChild(back);
  document.body.style.overflow = 'hidden';
  var f = back.querySelector('.sheet button, .sheet a, .sheet input'); if (f) f.focus();
}
function closeSheet(silent) {
  var b = document.querySelector('.sheet-back'); if (!b) return;
  b.remove(); document.body.style.overflow = '';
  if (!silent && sheetOpener && document.body.contains(sheetOpener)) sheetOpener.focus();
}
function trapTab(e) {
  var s = document.querySelector('.sheet'); if (!s || e.key !== 'Tab') return;
  var f = s.querySelectorAll('button, a[href], input, select, textarea, summary'); if (!f.length) return;
  var first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function segSm(act, cur, opts) {
  return '<div class="seg seg-sm" role="group">' + opts.map(function (o) { return '<button data-act="' + act + '" data-v="' + o[0] + '" aria-pressed="' + (cur === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>';
}
function openSettings() {
  var theme = rawGet('safe.theme') || 'auto', fs = rawGet('safe.fontscale') || '0';
  showSheet('설정',
    '<div class="set-row"><span>화면 밝기</span>' + segSm('theme', theme, [['auto', '자동'], ['light', '밝게'], ['dark', '어둡게']]) + '</div>' +
    '<div class="set-row"><span>글자 크기</span>' + segSm('font', fs, [['0', '보통'], ['1', '크게'], ['2', '더 크게']]) + '</div>' +
    '<button class="set-row" data-act="checklog"><span>지난 점검 기록<small>법령별 최근 30건</small></span>' + I.right + '</button>' +
    '<button class="set-row" data-act="about"><span>자료 출처·저장 안내<small>법령 기준일, 기기에 저장되는 것</small></span>' + I.right + '</button>' +
    '<button class="set-row" data-act="changelog"><span>자료 개정 이력</span>' + I.right + '</button>' +
    '<button class="set-row" data-act="shareapp"><span>앱 공유<small>주소를 보내거나 복사</small></span>' + I.share + '</button>' +
    '<button class="set-row" data-act="refreshdata"><span>최신 자료 받기<small>오프라인 저장본을 비우고 다시 받습니다</small></span>' + I.refresh + '</button>' +
    '<button class="set-row" data-act="cleardata"><span style="color:var(--danger)">저장 데이터 삭제<small>즐겨찾기·점검 응답·점검 기록·설정</small></span>' + I.trash + '</button>');
}
function openAbout() {
  var laws = LAWS.map(function (l) {
    var m = lawOf(l);
    return '<div style="padding:12px 0;border-top:1px solid var(--border)"><h3>' + esc(l) + '</h3>' +
      '<ul class="bullets small muted" style="margin-top:6px">' + (m.sources || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
      '<li>최종 검토: ' + esc(m.lastReviewed || '-') + '</li></ul></div>';
  }).join('');
  showSheet('자료 출처·저장 안내',
    '<p class="small">법령 내용은 아래 기준으로 정리했습니다. 위반사례마다 <span class="badge badge-ok">원문 대조</span> <span class="badge badge-warn">일부 확인</span> <span class="badge badge-danger">확인 필요</span> 표시로 확인 수준을 밝혔습니다.</p>' +
    laws +
    '<div style="padding:12px 0;border-top:1px solid var(--border)"><h3>이 기기에만 저장되는 것</h3><ul class="bullets small muted" style="margin-top:6px">' +
      '<li>즐겨찾기, 최근 본 위반사례, 자가점검 응답과 점검 기록, 화면 설정</li><li>서버로 보내지 않습니다. 설정의 \'저장 데이터 삭제\'로 모두 지울 수 있습니다.</li></ul></div>' +
    '<div style="padding:12px 0;border-top:1px solid var(--border)"><h3>밖으로 나가는 요청</h3><ul class="bullets small muted" style="margin-top:6px">' +
      '<li>한글 글꼴(Pretendard) 파일 요청 — 실패해도 기기 글꼴로 보입니다.</li><li>\'법령 원문\' 링크를 누를 때 국가법령정보센터로 이동합니다.</li><li>이용 통계·AI 분석 요청은 없습니다.</li><li>모션그래픽의 소리는 기기 안에서 만들어 내며 음원 파일이나 음성 서비스를 쓰지 않습니다.</li></ul></div>' +
    '<p class="small subtle" style="padding-top:12px;border-top:1px solid var(--border)">이 앱은 업무 참고용이며 법적 효력이 없습니다. 처분·처벌 판단은 국가법령정보센터 원문과 관할 지방고용노동관서에 확인하세요.</p>');
}
function openChangelog() {
  showSheet('자료 개정 이력', '<ul class="mini-list">' + (D.meta.changelog || []).map(function (c) {
    return '<li class="mini-item" style="align-items:flex-start"><span class="badge num">' + esc(c.date) + '</span><span class="grow small"><b>' + esc(c.law) + '</b> · ' + esc(c.type) + '<br><span class="muted">' + esc(c.summary) + '</span></span></li>';
  }).join('') + '</ul>');
}
function openCheckLog() {
  var log = lsGet('safe.checkLog', {}), any = false;
  var body = LAWS.map(function (l) {
    var arr = log[l] || []; if (!arr.length) return ''; any = true;
    return '<h3 style="margin-top:12px">' + esc(l) + '</h3><div class="mini-list">' + arr.map(function (e, i) {
      return '<button class="mini-item" data-act="logopen" data-law="' + attr(l) + '" data-i="' + i + '"><span class="badge num">' + esc(e.date) + '</span><span class="grow small">' + esc(e.site || '사업장 미입력') +
        ' · 미이행 <b style="color:var(--danger)">' + e.counts.n + '</b> / ' + e.counts.total + '</span>' + I.right + '</button>';
    }).join('') + '</div>';
  }).join('');
  showSheet('지난 점검 기록', any ? '<p class="small muted">\'점검 결과 저장\'을 누를 때마다 남습니다. 같은 날·같은 사업장은 마지막 저장만 남깁니다.</p>' + body : emptyBox('저장된 점검 기록이 없습니다. 자가점검에서 \'점검 결과 저장\'을 누르세요.'));
}
function openLogEntry(law, i) {
  var e = (lsGet('safe.checkLog', {})[law] || [])[i]; if (!e) return;
  showSheet(e.date + ' 점검 기록', '<div class="report-box" style="font-size:.875rem">' + esc(e.text) + '</div>' +
    '<div class="btn-row" style="margin-top:12px"><button class="btn btn-sm" data-act="logcopy" data-law="' + attr(law) + '" data-i="' + i + '">' + I.copy + '복사</button>' +
    '<button class="btn btn-sm btn-danger" data-act="logdel" data-law="' + attr(law) + '" data-i="' + i + '">' + I.trash + '삭제</button>' +
    '<button class="btn btn-sm" data-act="checklog">' + I.back + '목록</button></div>');
}

/* ---------- 이벤트 ---------- */
function applyTheme(t) {
  var d = document.documentElement;
  if (t === 'light' || t === 'dark') { d.setAttribute('data-theme', t); rawSet('safe.theme', t); }
  else { d.removeAttribute('data-theme'); rawSet('safe.theme', null); }
}
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]'); if (!el) return;
  var act = el.getAttribute('data-act');
  if (act === 'sheetback' && e.target !== el) return;
  if (el.tagName === 'A' && act !== 'open' && act !== 'nav') return;
  switch (act) {
    case 'nav': e.preventDefault(); closeSheet(true); go(el.getAttribute('data-view'), { law: el.getAttribute('data-law') || undefined }); break;
    case 'law': S.law = el.getAttribute('data-law'); S.group = '전체'; rawSet('safe.law', S.law); writeHash(true); render(false); var t = document.querySelector('.lawtab[aria-selected="true"]'); if (t) t.focus(); announce(S.law); break;
    case 'open': e.preventDefault(); closeSheet(true); go('detail', { id: el.getAttribute('data-id') }); break;
    case 'back': if (history.length > 1) history.back(); else go('violations'); break;
    case 'group': S.group = el.getAttribute('data-group'); render(false); var g = document.querySelector('.chip[data-group="' + CSS.escape(S.group) + '"]'); if (g) g.focus(); break;
    case 'ask': go('search', { q: el.getAttribute('data-q') }); break;
    case 'clearq': S.q = ''; writeHash(true); render(false); var qi = document.getElementById('q'); if (qi) qi.focus(); break;
    case 'fav': var on = toggleFav(el.getAttribute('data-id')); el.setAttribute('aria-pressed', String(on)); toast(on ? '즐겨찾기에 넣었습니다' : '즐겨찾기에서 뺐습니다'); break;
    case 'check':
      var qid = el.getAttribute('data-qid'), val = el.getAttribute('data-v'), c = checksOf(S.law);
      if (c[qid] === val) delete c[qid]; else c[qid] = val;
      lsSet('safe.checks.' + S.law, c); updateCheckDOM(qid); break;
    case 'checksave': addCheckLog(S.law); toast('점검 결과를 저장했습니다 · 지난 점검 기록에서 다시 볼 수 있습니다'); break;
    case 'checkcopy': copyText(checkSummaryText(S.law), '점검 요약을 복사했습니다'); break;
    case 'checkreset':
      if (confirm(S.law + ' 자가점검 응답을 모두 지울까요? 저장한 점검 기록은 남습니다.')) { lsSet('safe.checks.' + S.law, {}); render(false); toast('응답을 지웠습니다'); }
      break;
    case 'checklog': openCheckLog(); break;
    case 'logopen': openLogEntry(el.getAttribute('data-law'), +el.getAttribute('data-i')); break;
    case 'logcopy': var le = (lsGet('safe.checkLog', {})[el.getAttribute('data-law')] || [])[+el.getAttribute('data-i')]; if (le) copyText(le.text); break;
    case 'logdel':
      var lg = lsGet('safe.checkLog', {}), ll = el.getAttribute('data-law'); (lg[ll] || []).splice(+el.getAttribute('data-i'), 1); lsSet('safe.checkLog', lg); toast('기록을 삭제했습니다'); openCheckLog(); break;
    case 'copyreport': var rv = byId(el.getAttribute('data-id')); if (rv) copyText(rv.report, '문안을 복사했습니다'); break;
    case 'sharev': shareUrl(location.href.split('#')[0] + '#/detail?id=' + encodeURIComponent(el.getAttribute('data-id')), byId(el.getAttribute('data-id')).name); break;
    case 'shareapp': shareUrl(location.href.split('#')[0], '안전비서 — 산업안전·중대재해 업무지원'); break;
    case 'print': window.print(); break;
    case 'cine':
      var cid = el.getAttribute('data-id'), cst = cid === 'emergency' ? window.SAFE_SCENES.emergency(D.emergency) : window.SAFE_SCENES.build(byId(cid));
      if (cst) window.SAFE_CINE.open(cst);
      break;
    case 'jump': var tg = document.getElementById(el.getAttribute('data-target')); if (tg) { tg.scrollIntoView({ behavior: 'smooth', block: 'start' }); tg.setAttribute('tabindex', '-1'); tg.focus({ preventScroll: true }); } break;
    case 'totop': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'settings': openSettings(); break;
    case 'about': openAbout(); break;
    case 'changelog': openChangelog(); break;
    case 'closesheet': case 'sheetback': closeSheet(); break;
    case 'theme': applyTheme(el.getAttribute('data-v')); openSettings(); break;
    case 'font': var fv = el.getAttribute('data-v'); document.documentElement.setAttribute('data-fontscale', fv); rawSet('safe.fontscale', fv === '0' ? null : fv); openSettings(); break;
    case 'refreshdata': refreshData(); break;
    case 'cleardata':
      if (confirm('이 기기에 저장된 즐겨찾기·점검 응답·점검 기록·설정을 모두 지울까요? 되돌릴 수 없습니다.')) {
        try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('safe.') === 0) localStorage.removeItem(k); }); } catch (x) {}
        applyTheme('auto'); document.documentElement.setAttribute('data-fontscale', '0'); closeSheet(true); render(false); toast('저장 데이터를 지웠습니다');
      }
      break;
  }
});
function shareUrl(url, title) {
  if (navigator.share) navigator.share({ title: title, url: url }).catch(function () {});
  else copyText(url, '주소를 복사했습니다');
}
function refreshData() {
  var p = window.caches ? caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }) : Promise.resolve();
  p.then(function () { location.reload(); });
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && document.querySelector('.sheet-back')) { closeSheet(); return; }
  trapTab(e);
  if (e.key === 'Enter' && e.target.id === 'q-home') { var v = e.target.value.trim(); if (v) go('search', { q: v }); }
});
var onSearch = debounce(function (val) {
  S.q = val; writeHash(true);
  var r = document.getElementById('results'); if (r) r.innerHTML = searchResultsHTML(S.q);
  document.title = viewTitle() + ' — 안전비서';
}, 180);
document.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'q') onSearch(t.value);
  else if (t.id === 'q-home' && t.value.trim().length >= 2 && !t.dataset.composing) {
    /* 홈 검색창은 입력을 시작하면 검색 화면으로 넘어가 이어서 입력합니다 */
    var v = t.value; go('search', { q: v, replace: false });
    var qi = document.getElementById('q'); if (qi) { qi.focus(); qi.setSelectionRange(v.length, v.length); }
  } else if (t.hasAttribute('data-meta')) {
    var m = checkMeta(S.law); m[t.getAttribute('data-meta')] = t.value; lsSet('safe.checkMeta.' + S.law, m);
  }
});
document.addEventListener('compositionstart', function (e) { if (e.target.id === 'q-home') e.target.dataset.composing = '1'; });
document.addEventListener('compositionend', function (e) {
  if (e.target.id === 'q-home') { delete e.target.dataset.composing; e.target.dispatchEvent(new Event('input', { bubbles: true })); }
});
function syncTotop() { var b = document.querySelector('.totop'); if (b) b.classList.toggle('show', window.scrollY > 600); }
window.addEventListener('scroll', debounce(syncTotop, 80), { passive: true });

/* 새 버전 알림 */
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (document.querySelector('.update-bar')) return;
    var bar = document.createElement('div'); bar.className = 'update-bar no-print'; bar.setAttribute('role', 'status');
    bar.innerHTML = '<span class="grow">새 자료가 준비되었습니다</span><button class="btn btn-sm btn-primary">새로고침</button>';
    bar.querySelector('button').addEventListener('click', function () { location.reload(); });
    document.body.appendChild(bar);
  });
}

/* 시작 */
if (location.hash) readHash();
writeHash(true);
render(false);
window.SAFE_APP = { searchAny: searchAny, go: go, state: S };
})();
