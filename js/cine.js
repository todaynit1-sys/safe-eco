/*! 안전비서 — 모션그래픽 엔진 (위반사례 설명 애니메이션)
 *  1200×720 논리 좌표의 Canvas 그림 + 자막 + 합성 배경음·효과음. 음성 해설과 음원 파일은 쓰지 않습니다.
 *  - G: 그리기 도구(장면 파일 js/scenes.js가 사용)
 *  - AU: Web Audio로 만드는 배경음(bed)과 효과음(sfx) — 오프라인에서도 납니다
 *  - open(story): 전체 화면 재생기. story = { title, scenes: [{ name, cap, bed, sfx: [[초, 이름]], dur, draw(t, now) }] }
 *  장면 그림은 상태 없이 (t, now)만으로 그리므로 멈춤·되감기에서도 같은 화면이 나옵니다.
 */
(function () {
'use strict';
var W = 1200, H = 720, c = null;
var P = { bg0: '#05090f', bg1: '#0b1622', line: '#1d3448', text: '#eef3f6', muted: '#8fa3b1', dim: '#4d6577',
  amber: '#ffb547', orange: '#ff9a3d', red: '#ff5a5a', green: '#57e39a', cyan: '#3de0ff', violet: '#a58bff', white: '#ffffff',
  steel: '#2a4a60', skin: '#e8c4a0', vest: '#f08a2e', helmet: '#f5c542' };
var A = P.orange;
var SANS = '"Pretendard Variable",Pretendard,"Malgun Gothic","Apple SD Gothic Neo",sans-serif';

/* ---------- 수학 ---------- */
function clamp(v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function eio(t) { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function eout(t) { return 1 - Math.pow(1 - clamp(t), 3); }
function back(t) { t = clamp(t); var s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); }
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
function ap(t, t0, d) { return eout((t - t0) / (d || .4)); }          /* t0에 서서히 등장 */
function pop(t, t0) { return t < t0 ? 0 : back((t - t0) / .45); }      /* t0에 튀어 오르며 등장 */

/* ---------- 기본 도형 ---------- */
function rr(x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r == null ? 8 : r); else c.rect(x, y, w, h); }
function box(x, y, w, h, fill, r, stroke, lw) { rr(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } }
function line(x1, y1, x2, y2, col, w) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col || A; c.lineWidth = w || 2; c.lineCap = 'round'; c.stroke(); c.lineCap = 'butt'; }
function poly(pts, fill, stroke, lw) { c.beginPath(); for (var i = 0; i < pts.length; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } }
function circ(x, y, r, fill, stroke, lw) { c.beginPath(); c.arc(x, y, Math.max(0, r), 0, 6.2832); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 2; c.stroke(); } }
function ell(x, y, rx, ry, fill) { c.beginPath(); c.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, 6.2832); c.fillStyle = fill; c.fill(); }
function font(size, weight) { c.font = (weight || 500) + ' ' + size + 'px ' + SANS; }
function txt(s, x, y, size, col, al, weight) { font(size || 18, weight); c.fillStyle = col || P.text; c.textAlign = al || 'left'; c.fillText(s, x, y); }
function tw(s, size, weight) { font(size, weight); return c.measureText(s).width; }
function glow(col, blur, fn) { c.save(); c.shadowColor = col; c.shadowBlur = blur; fn(); c.restore(); }
function alpha(a, fn) { if (a <= 0) return; c.save(); c.globalAlpha *= clamp(a); fn(); c.restore(); }
function at(x, y, s, rot, fn) { c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s != null && s !== 1) c.scale(s, s); fn(); c.restore(); }
function grad(x1, y1, x2, y2, stops) { var g = c.createLinearGradient(x1, y1, x2, y2); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
/* 줄바꿈 글자: 낱말 단위로 끊고, maxLines를 넘으면 말줄임 */
function wrap(s, x, y, maxW, lh, size, col, weight, maxLines) {
  font(size, weight); c.fillStyle = col || P.text; c.textAlign = 'left';
  var words = String(s).split(' '), ln = '', n = 0, lines = [];
  for (var i = 0; i < words.length; i++) {
    var test = ln ? ln + ' ' + words[i] : words[i];
    if (c.measureText(test).width > maxW && ln) { lines.push(ln); ln = words[i]; } else ln = test;
  }
  if (ln) lines.push(ln);
  if (maxLines && lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,2}$/, '…'); }
  for (n = 0; n < lines.length; n++) c.fillText(lines[n], x, y + n * lh);
  return lines.length;
}
function chip(x, y, s, col, al, size) {
  size = size || 15; col = col || A; var w = tw(s, size, 700) + 20, X = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x, h = size + 12;
  alpha(.2, function () { box(X, y - h + 6, w, h, col, h / 2); }); box(X, y - h + 6, w, h, null, h / 2, col, 1.4);
  txt(s, X + 10, y, size, col, 'left', 700); return w;
}
function panel(x, y, w, h, title, col) {
  box(x, y, w, h, 'rgba(6,13,22,.9)', 14, 'rgba(255,255,255,.12)');
  line(x + 18, y + 1, x + 74, y + 1, col || A, 3);
  if (title) txt(title, x + 20, y + 38, 20, P.text, 'left', 700);
}
function tick(x, y, k, col, s) { if (k <= 0) return; at(x, y, s || 1, 0, function () { c.beginPath(); c.moveTo(-9, 0); var a = clamp(k * 2), b = clamp(k * 2 - 1); c.lineTo(lerp(-9, -2, a), lerp(0, 8, a)); if (b > 0) c.lineTo(lerp(-2, 13, b), lerp(8, -10, b)); c.strokeStyle = col || P.green; c.lineWidth = 4.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); c.lineCap = 'butt'; }); }
function cross(x, y, k, col, d0) { if (k <= 0) return; var d = (d0 || 9) * clamp(k); line(x - d, y - d, x + d, y + d, col || P.red, 4.5); line(x + d, y - d, x - d, y + d, col || P.red, 4.5); }
function arrow(x1, y1, x2, y2, col, w, k) { k = k == null ? 1 : clamp(k); if (k <= 0) return; var x = lerp(x1, x2, k), y = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1), hd = 13; line(x1, y1, x, y, col, w || 3); poly([[x, y], [x - hd * Math.cos(a - .45), y - hd * Math.sin(a - .45)], [x - hd * Math.cos(a + .45), y - hd * Math.sin(a + .45)]], col || A); }
function dashed(x1, y1, x2, y2, col, w, now, speed) { c.save(); c.setLineDash([9, 9]); c.lineDashOffset = -(now || 0) * (speed == null ? 30 : speed); line(x1, y1, x2, y2, col, w); c.restore(); }
function rings(x, y, now, col, r0, r1, n, speed) { n = n || 3; for (var k = 0; k < n; k++) { var ph = ((now * (speed || .9)) + k / n) % 1; (function (ph) { alpha(1 - ph, function () { circ(x, y, lerp(r0 || 10, r1 || 70, ph), null, col || A, 2.5); }); })(ph); } }
function plume(x, y, now, o) { o = o || {}; var n = o.n || 14, len = o.len || 120, dx = o.dx == null ? 30 : o.dx, col = o.col || 'rgba(190,200,210,', sp = o.speed || .35, r0 = o.r0 || 4, r1 = o.r1 || 16, a0 = o.a == null ? .5 : o.a;
  for (var i = 0; i < n; i++) { var ph = (now * sp + i / n) % 1, wob = Math.sin(ph * 6 + i * 2.1) * (o.wob == null ? 8 : o.wob); circ(x + dx * ph + wob, y - len * ph, lerp(r0, r1, ph), col + (a0 * (1 - ph)).toFixed(3) + ')'); } }
function sparks(x, y, now, o) { o = o || {}; var n = o.n || 18; for (var i = 0; i < n; i++) { var ph = (now * (o.speed || 1.6) + hash(i) * 3) % 1, ang = (o.ang == null ? -0.5 : o.ang) + (hash(i + 5) - .5) * (o.spread || 1.4), d = (o.dist || 150) * ph, gx = x + Math.cos(ang) * d, gy = y + Math.sin(ang) * d + 120 * ph * ph;
  (function (ph, gx, gy) { alpha(1 - ph, function () { circ(gx, gy, 2.6 * (1 - ph * .5), i % 3 ? '#ffd27a' : '#fff3cf'); }); })(ph, gx, gy); } }
function flash(k, col) { if (k <= 0) return; c.fillStyle = (col || 'rgba(255,60,60,') + (clamp(k) * .45).toFixed(3) + ')'; c.fillRect(0, 0, W, H); }

/* ---------- 배경 ---------- */
var STARS = [], SKY = [], i0, x0;
for (i0 = 0; i0 < 60; i0++) STARS.push({ x: hash(i0) * W, y: hash(i0 + 99) * 300, r: hash(i0 + 7) * 1.4 + .4, p: hash(i0 + 3) * 6 });
for (x0 = -20, i0 = 0; x0 < W + 60; i0++) { var bw0 = 34 + hash(i0 * 3.1) * 64, bh0 = 50 + hash(i0 * 1.7) * 150; SKY.push({ x: x0, w: bw0, h: bh0 }); x0 += bw0 + 4 + hash(i0 * 5.3) * 12; }
function night(now, o) { o = o || {}; var gy = o.ground == null ? 600 : o.ground;
  c.fillStyle = grad(0, 0, 0, gy, [[0, '#03070c'], [.72, '#0b1a28'], [1, o.haze || '#1d2436']]); c.fillRect(0, 0, W, gy);
  c.fillStyle = grad(0, gy - 150, 0, gy, [[0, 'rgba(255,154,61,0)'], [1, o.glow || 'rgba(255,154,61,.10)']]); c.fillRect(0, gy - 150, W, 150);
  STARS.forEach(function (s) { if (s.y > gy - 150) return; c.globalAlpha = .3 + .35 * Math.sin(now * 1.4 + s.p); c.fillStyle = '#cfe6f5'; c.fillRect(s.x, s.y, s.r, s.r); }); c.globalAlpha = 1;
  if (o.city !== 0) SKY.forEach(function (b) { c.fillStyle = '#08131e'; c.fillRect(b.x, gy - b.h * (o.city || .8), b.w, b.h * (o.city || .8)); });
  c.fillStyle = o.floor || '#0a121b'; c.fillRect(0, gy, W, H - gy); c.fillStyle = '#1b2d3f'; c.fillRect(0, gy, W, 2);
  c.fillStyle = grad(0, gy, 0, H, [[0, 'rgba(255,154,61,.06)'], [1, 'rgba(255,154,61,0)']]); c.fillRect(0, gy, W, H - gy);
}
function plant(now, o) { o = o || {}; var gy = o.ground == null ? 600 : o.ground;   /* 공장 실내 */
  c.fillStyle = grad(0, 0, 0, gy, [[0, '#0a141f'], [1, '#13273a']]); c.fillRect(0, 0, W, gy);
  for (var x = 0; x <= W; x += 150) { line(x, 0, x, gy, 'rgba(255,255,255,.035)', 2); }
  line(0, 150, W, 150, 'rgba(255,255,255,.05)', 6);
  [220, 600, 980].forEach(function (lx) { c.fillStyle = '#dfeaf2'; c.fillRect(lx - 50, 150, 100, 6); poly([[lx - 50, 156], [lx + 50, 156], [lx + 170, gy], [lx - 170, gy]], grad(0, 156, 0, gy, [[0, 'rgba(223,234,242,.10)'], [1, 'rgba(223,234,242,0)']])); });
  c.fillStyle = '#0b141d'; c.fillRect(0, gy, W, H - gy); c.fillStyle = '#22384b'; c.fillRect(0, gy, W, 3);
  for (var k = 0; k < 9; k++) poly([[k * 150 + 20, gy + 70], [k * 150 + 60, gy + 70], [k * 150 + 30, gy + 96], [k * 150 - 10, gy + 96]], k % 2 ? 'rgba(255,181,71,.16)' : 'rgba(255,255,255,.04)');
}
function blueprint() { c.fillStyle = P.bg0; c.fillRect(0, 0, W, H);
  for (var x = 0; x <= W; x += 40) line(x, 0, x, H, 'rgba(120,170,210,.05)', 1); for (var y = 0; y <= H; y += 40) line(0, y, W, y, 'rgba(120,170,210,.05)', 1);
  c.fillStyle = grad(0, 0, 0, H, [[0, 'rgba(255,154,61,.05)'], [1, 'rgba(61,224,255,.03)']]); c.fillRect(0, 0, W, H); }
function daysky(now, o) { o = o || {}; var gy = o.ground == null ? 600 : o.ground;   /* 폭염 낮 */
  c.fillStyle = grad(0, 0, 0, gy, [[0, '#3b1d12'], [.6, '#a3481f'], [1, '#e08a3a']]); c.fillRect(0, 0, W, gy);
  SKY.forEach(function (b) { c.fillStyle = 'rgba(60,24,10,.55)'; c.fillRect(b.x, gy - b.h * .6, b.w, b.h * .6); });
  c.fillStyle = '#2a1a12'; c.fillRect(0, gy, W, H - gy); c.fillStyle = '#5a3520'; c.fillRect(0, gy, W, 3);
  for (var i = 0; i < 5; i++) { var yy = gy - 20 - i * 26, off = Math.sin(now * 2 + i) * 14; alpha(.10, function () { box(60 + off + i * 30, yy, W - 120, 5, '#fff3cf', 3); }); }   /* 아지랑이 */
}

/* ---------- 사람 ----------
 * pose: stand | walk | reach(앞으로 손 뻗음) | point | tablet | dig | sit | lie(누움)
 * o: helmet(false면 모자 없음), vest(색), suit(true면 정장), flip, rot(라디안), now */
function person(x, y, s, o) { o = o || {}; var now = o.now || 0, pose = o.pose || 'stand', vest = o.suit ? '#27384b' : (o.vest || P.vest), leg = o.suit ? '#1a2633' : '#27415a';
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); c.scale(o.flip ? -(s || 1) : (s || 1), s || 1);
  var sw = pose === 'walk' ? Math.sin(now * 9) * 7 : 0;
  if (!o.rot && pose !== 'lie') ell(0, 2, 18, 4, 'rgba(0,0,0,.35)');
  if (pose === 'lie') { c.rotate(-Math.PI / 2); c.translate(12, 40); }
  if (pose === 'sit') { line(-4, -32, 14, -30, leg, 7); line(14, -30, 14, -2, leg, 7); line(4, -32, 20, -30, leg, 7); line(20, -30, 20, -2, leg, 7); }
  else { line(-4, -32, -4 + sw, -2, leg, 7); line(4, -32, 4 - sw, -2, leg, 7); }
  box(-11, -64, 22, 34, vest, 6);
  if (!o.suit) { c.fillStyle = '#f3f0d8'; c.fillRect(-11, -52, 22, 3); c.fillRect(-11, -43, 22, 3); } else { poly([[-3, -64], [3, -64], [0, -48]], '#dfe8ee'); }
  if (pose === 'point') { line(-8, -58, -12, -36, vest, 6); line(8, -58, 32, -72, vest, 6); }
  else if (pose === 'reach') { line(-8, -58, 20, -50, vest, 6); line(8, -58, 34, -54, vest, 6); circ(36, -54, 3.5, P.skin); }
  else if (pose === 'tablet') { line(-8, -58, 14, -44, vest, 6); line(8, -58, 18, -46, vest, 6); box(10, -56, 20, 15, '#0d1b28', 3, A, 1.5); }
  else if (pose === 'dig') { var d = Math.sin(now * 5) * 6; line(-8, -58, 16, -40 + d, vest, 6); line(8, -58, 22, -44 + d, vest, 6); line(10, -62 + d, 34, -6 + d, '#8a6a4a', 4); poly([[30, -8 + d], [42, -8 + d], [38, 6 + d], [30, 4 + d]], '#9fb0bb'); }
  else if (pose === 'up') { line(-8, -58, -16, -84, vest, 6); line(8, -58, 16, -84, vest, 6); }
  else { line(-8, -58, -10 - sw * .6, -36, vest, 6); line(8, -58, 10 + sw * .6, -36, vest, 6); }
  circ(0, -73, 8, P.skin);
  if (o.helmet !== false && !o.suit) { c.fillStyle = o.hat || P.helmet; c.beginPath(); c.arc(0, -76, 10, Math.PI, 0); c.fill(); c.fillRect(-12, -77, 24, 3); }
  else { c.fillStyle = '#2a2320'; c.beginPath(); c.arc(0, -76, 9, Math.PI, 0); c.fill(); }
  c.restore();
}
function doc(x, y, w, h, o) { o = o || {}; box(x, y, w, h, o.fill || '#eef3f1', 6); if (o.head) { box(x, y, w, 36, o.head, 6); if (o.title) txt(o.title, x + 14, y + 24, 16, '#fff', 'left', 700); }
  var rows = o.rows == null ? 5 : o.rows; for (var i = 0; i < rows; i++) { c.fillStyle = '#c6d2d6'; c.fillRect(x + 14, y + (o.head ? 58 : 24) + i * 22, (w - 28) * (i % 3 === 2 ? .6 : .9), 6); } }
function cone(x, y, s) { at(x, y, s || 1, 0, function () { poly([[-14, 0], [14, 0], [5, -38], [-5, -38]], '#ff7a2e'); c.fillStyle = '#fff'; c.fillRect(-8, -22, 16, 6); box(-18, -3, 36, 6, '#c8501a', 2); }); }
function siren(x, y, now, on) { box(x - 16, y - 8, 32, 10, '#2a3644', 3); var k = on ? (Math.sin(now * 10) > 0 ? 1 : .35) : .15; glow('#ff3b3b', on ? 28 : 0, function () { c.beginPath(); c.arc(x, y - 8, 14, Math.PI, 0); c.fillStyle = 'rgba(255,70,70,' + k + ')'; c.fill(); }); if (on) rings(x, y - 12, now, 'rgba(255,90,90,.9)', 14, 80, 3, 1.2); }
/* 말풍선 꼬리표: kind = bad | good | warn | info */
function tag(x, y, s, kind, k, al) { if (k <= 0) return; var col = kind === 'good' ? P.green : kind === 'warn' ? P.amber : kind === 'info' ? P.cyan : P.red, size = 26, w = tw(s, size, 700) + 44, X = al === 'right' ? x - w : al === 'center' ? x - w / 2 : x;
  c.save(); c.translate(X + w / 2, y); c.scale(clamp(k, 0, 1.2), clamp(k, 0, 1.2)); c.translate(-(X + w / 2), -y);
  box(X, y - 26, w, 52, 'rgba(6,13,22,.94)', 12, col, 2.5); circ(X + 20, y, 7, col); txt(s, X + 36, y + 9, size, P.text, 'left', 700); c.restore(); }
function stamp(x, y, s, k, col) { if (k <= 0) return; col = col || P.red; var sc = lerp(2.2, 1, eout(k)); c.save(); c.translate(x, y); c.rotate(-.18); c.scale(sc, sc); c.globalAlpha = clamp(k * 1.5);
  var w = tw(s, 34, 800) + 36; box(-w / 2, -30, w, 60, 'rgba(255,90,90,.08)', 8, col, 4); txt(s, 0, 12, 34, col, 'center', 800); c.restore(); }

/* ---------- 머리글·후처리 ---------- */
function header(name, i, n, t) {
  c.fillStyle = grad(0, 0, 0, 150, [[0, 'rgba(3,7,12,.78)'], [1, 'rgba(3,7,12,0)']]); c.fillRect(0, 0, W, 150);
  txt('안전비서 · 위반사례', 44, 46, 14, A, 'left', 700);
  txt((i + 1) + ' / ' + n, W - 44, 46, 14, P.muted, 'right', 700);
  font(46, 800); c.textAlign = 'left'; var cx = 42;
  for (var k = 0; k < name.length; k++) { var ch = name[k], w = c.measureText(ch).width, a = eout((t - .15 - k * .03) / .42); if (a > 0) { c.globalAlpha = a; c.fillStyle = P.text; c.fillText(ch, cx, 104 + (1 - a) * 20); } cx += w; }
  c.globalAlpha = 1; var lw = (cx - 42) * eout((t - .45) / .6); if (lw > 2) line(46, 122, 46 + lw, 122, A, 4);
}
function post() { var g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function wipe(t) { if (t > .5) return; var k = t / .5, x = lerp(-420, W + 420, eio(k)), g = c.createLinearGradient(x - 220, 0, x + 220, 0);
  g.addColorStop(0, 'rgba(255,154,61,0)'); g.addColorStop(.5, 'rgba(255,154,61,.85)'); g.addColorStop(1, 'rgba(255,90,90,0)');
  poly([[x - 170, 0], [x + 270, 0], [x + 170, H], [x - 270, H]], g); c.fillStyle = 'rgba(255,255,255,' + (.18 * (1 - k)).toFixed(3) + ')'; c.fillRect(0, 0, W, H); }

/* ============================================================
   소리 — Web Audio 합성 (배경음 bed + 효과음 sfx). 음성은 없습니다.
   ============================================================ */
var AU = (function () {
  var ctx = null, master = null, nbuf = null, bedNode = null, bedName = null, on = true;
  try { on = localStorage.getItem('safe.sound') !== '0'; } catch (e) {}
  function ensure() {
    if (ctx) return ctx; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = on ? .9 : 0;
    var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    var len = ctx.sampleRate * 2; nbuf = ctx.createBuffer(1, len, ctx.sampleRate); var d = nbuf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + .04 * w) / 1.04; d[i] = w * .55 + last * 6; }   /* 흰+갈색 섞은 잡음 */
    return ctx;
  }
  function tone(type, f0, f1, dur, peak, delay, dest) { if (!ctx) return; var t0 = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(.02, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + .05); }
  function noise(dur, peak, ftype, f0, f1, q, delay) { if (!ctx) return; var t0 = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = nbuf; s.loop = true; f.type = ftype || 'bandpass'; f.Q.value = q || 1; f.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(.03, dur / 3)); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t0, Math.random()); s.stop(t0 + dur + .05); }
  var SFX = {
    whoosh: function () { noise(.5, .16, 'bandpass', 300, 3200, .7); },                                           /* 장면 전환 */
    thud: function () { tone('sine', 120, 38, .45, .7); noise(.22, .35, 'lowpass', 500, 120, .5); },            /* 떨어짐·충돌 */
    crash: function () { noise(.7, .4, 'lowpass', 2400, 200, .4); tone('sine', 90, 34, .6, .6); [523, 1240, 1890].forEach(function (f, i) { tone('square', f, f * .96, .25, .04, i * .03); }); },
    rumble: function () { noise(1.6, .5, 'lowpass', 160, 60, .6); tone('sine', 52, 30, 1.4, .5); },             /* 무너짐 */
    alarm: function () { for (var i = 0; i < 4; i++) { tone('square', 880, 880, .16, .09, i * .36); tone('square', 660, 660, .16, .09, i * .36 + .18); } },
    beep: function () { for (var i = 0; i < 3; i++) tone('square', 1320, 1320, .14, .07, i * .32); },           /* 후진 경보 */
    zap: function () { noise(.35, .32, 'highpass', 1800, 5000, .5); tone('sawtooth', 110, 60, .35, .22); tone('square', 2100, 900, .12, .06); },
    spark: function () { for (var i = 0; i < 6; i++) noise(.05, .14, 'highpass', 3500 + Math.random() * 2500, 0, 1, i * .07 + Math.random() * .03); },
    hiss: function () { noise(1.1, .12, 'highpass', 4200, 2600, .4); },                                         /* 가스 */
    fire: function () { noise(1.4, .22, 'bandpass', 520, 900, .5); for (var i = 0; i < 8; i++) noise(.04, .1, 'highpass', 3000, 0, 1, i * .16 + Math.random() * .05); },
    clank: function () { [440, 1173, 1820, 2640].forEach(function (f, i) { tone('sine', f, f * .99, .5 - i * .08, .1 - i * .015); }); noise(.05, .16, 'highpass', 2500); },
    motor: function () { tone('sawtooth', 70, 96, 1.1, .1); noise(1.1, .06, 'bandpass', 420, 640, 1.2); },
    stop: function () { tone('sawtooth', 96, 40, .9, .12); },                                                   /* 기계 정지 */
    tick: function () { tone('sine', 1560, 1560, .08, .1); tone('sine', 2340, 2340, .07, .05, .03); },          /* 체크 표시 */
    ding: function () { tone('sine', 784, 784, .5, .12); tone('sine', 1175, 1175, .7, .1, .12); },              /* 올바른 상태 */
    pop: function () { tone('sine', 520, 760, .09, .12); },                                                     /* 꼬리표 등장 */
    stamp: function () { tone('sine', 150, 60, .2, .5); noise(.1, .3, 'lowpass', 900, 300, .7); },              /* 도장 */
    gavel: function () { noise(.07, .45, 'bandpass', 1100, 700, 2.5); tone('sine', 210, 130, .22, .4); },       /* 판결 */
    ring: function () { for (var i = 0; i < 2; i++) { tone('sine', 1400, 1400, .22, .08, i * .5); tone('sine', 1750, 1750, .22, .06, i * .5); } },
    paper: function () { noise(.22, .1, 'highpass', 2600, 5200, .5); },
    heart: function () { tone('sine', 62, 44, .16, .5); tone('sine', 58, 40, .16, .38, .22); },
    siren: function () { if (!ctx) return; var t0 = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(620, t0); o.frequency.linearRampToValueAtTime(940, t0 + .7); o.frequency.linearRampToValueAtTime(620, t0 + 1.4);
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.09, t0 + .1); g.gain.exponentialRampToValueAtTime(.0001, t0 + 1.5); o.connect(f); f.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 1.6); }
  };
  /* 배경음: 화음 패드 + 환경 잡음 + (선택) 맥박 */
  var BEDS = {
    site:   { notes: [146.8, 220, 293.7], type: 'sine', g: .02, noise: ['lowpass', 420, .5, .05, .13] },
    plant:  { notes: [55, 110, 164.8], type: 'sawtooth', lp: 210, g: .024, noise: ['bandpass', 900, .8, .016, 2.2] },
    office: { notes: [196, 246.9, 293.7], type: 'sine', g: .016, noise: ['highpass', 3200, .4, .004, .1] },
    hot:    { notes: [185, 277.2, 370], type: 'sine', g: .016, noise: ['highpass', 5200, 1.2, .012, 7] },
    under:  { notes: [61.7, 92.5, 185], type: 'sine', g: .03, noise: ['lowpass', 260, .7, .06, .2] },
    tense:  { notes: [73.4, 77.8, 146.8], type: 'sawtooth', lp: 240, g: .028, pulse: 1.05 },
    calm:   { notes: [174.6, 220, 261.6, 349.2], type: 'triangle', lp: 1300, g: .018 },
    court:  { notes: [65.4, 98, 130.8, 155.6], type: 'sine', g: .03, pulse: .5 }
  };
  function stopBed() { if (!bedNode || !ctx) return; var b = bedNode, t = ctx.currentTime; bedNode = null; bedName = null;
    try { b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value, t); b.g.gain.linearRampToValueAtTime(0, t + .5); } catch (e) {}
    setTimeout(function () { b.nodes.forEach(function (n) { try { n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} }); try { b.g.disconnect(); } catch (e) {} }, 700); }
  function bed(name) { if (!ctx || name === bedName) return; stopBed(); var d = BEDS[name]; if (!d) return;
    var t = ctx.currentTime, g = ctx.createGain(), nodes = []; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .9); g.connect(master);
    var dest = g; if (d.lp) { var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = d.lp; f.connect(g); dest = f; }
    d.notes.forEach(function (fr, i) { var o = ctx.createOscillator(), og = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain();
      o.type = d.type; o.frequency.value = fr; o.detune.value = (i % 2 ? 6 : -6); og.gain.value = d.g;
      l.frequency.value = .07 + i * .05; lg.gain.value = d.g * .5; l.connect(lg); lg.connect(og.gain);   /* 느린 숨결 */
      o.connect(og); og.connect(dest); o.start(t); l.start(t); nodes.push(o, l); });
    if (d.noise) { var s = ctx.createBufferSource(), nf = ctx.createBiquadFilter(), ng = ctx.createGain(), nl = ctx.createOscillator(), nlg = ctx.createGain();
      s.buffer = nbuf; s.loop = true; nf.type = d.noise[0]; nf.frequency.value = d.noise[1]; nf.Q.value = d.noise[2]; ng.gain.value = d.noise[3];
      nl.frequency.value = d.noise[4]; nlg.gain.value = d.noise[3] * .6; nl.connect(nlg); nlg.connect(ng.gain);
      s.connect(nf); nf.connect(ng); ng.connect(g); s.start(t); nl.start(t); nodes.push(s, nl); }
    if (d.pulse) { var po = ctx.createOscillator(), pg = ctx.createGain(), pl = ctx.createOscillator(), plg = ctx.createGain();
      po.type = 'sine'; po.frequency.value = 49; pg.gain.value = .0; pl.type = 'sine'; pl.frequency.value = d.pulse; plg.gain.value = .07; pl.connect(plg); plg.connect(pg.gain);
      po.connect(pg); pg.connect(g); po.start(t); pl.start(t); nodes.push(po, pl); }
    bedNode = { g: g, nodes: nodes }; bedName = name; }
  return {
    ok: function () { return !!(window.AudioContext || window.webkitAudioContext); },
    start: function () { if (!ensure()) return; if (ctx.state === 'suspended') ctx.resume(); },
    pause: function () { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume: function () { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    end: function () { stopBed(); },
    bed: bed,
    sfx: function (name) { if (!ctx || !on || ctx.state !== 'running') return; var f = SFX[name]; if (f) try { f(); } catch (e) {} },
    isOn: function () { return on; },
    setOn: function (v) { on = !!v; try { localStorage.setItem('safe.sound', on ? '1' : '0'); } catch (e) {} if (ctx) { var t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(on ? .9 : 0, t + .2); } }
  };
})();

/* ============================================================
   재생기
   ============================================================ */
var ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
  prev: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  son: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  soff: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'
};
var cur = null;   /* 열려 있는 재생기 */
function escH(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
function sceneDur(s) { return s.dur || clamp(4.2 + String(s.cap || '').length * .07, 5, 9.5); }

function drawFrame(story, i, t, now) {
  var s = story.scenes[i]; c.clearRect(0, 0, W, H);
  c.save(); try { s.draw(t, now); } catch (e) { if (window.console) console.error(e); } c.restore();
  header(s.name, i, story.scenes.length, t); post(); wipe(t);
}

function open(story) {
  if (cur) close(true);
  var opener = document.activeElement, n = story.scenes.length, durs = story.scenes.map(sceneDur);
  var total = durs.reduce(function (a, b) { return a + b; }, 0);
  var el = document.createElement('div'); el.className = 'cine'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', '모션그래픽: ' + story.title);
  el.innerHTML = '<div class="cine-top"><span class="cine-kicker">모션그래픽</span><span class="cine-title">' + escH(story.title) + '</span>' +
    '<button class="cine-btn cine-x" data-c="close" aria-label="닫기">' + ICON.x + '</button></div>' +
    '<div class="cine-stage"><canvas width="1200" height="720" aria-hidden="true"></canvas>' +
    '<button class="cine-tap cine-tap-l" data-c="prev" aria-label="이전 장면" tabindex="-1"></button><button class="cine-tap cine-tap-r" data-c="next" aria-label="다음 장면" tabindex="-1"></button></div>' +
    '<div class="cine-cap"><span class="cine-step"></span><p class="cine-text" aria-live="polite"></p></div>' +
    '<div class="cine-bar" role="group" aria-label="장면">' + story.scenes.map(function (s, i) { return '<button data-c="seek" data-i="' + i + '" aria-label="' + (i + 1) + '번 장면: ' + escH(s.name) + '"><i></i><span>' + escH(s.name) + '</span></button>'; }).join('') + '</div>' +
    '<div class="cine-ctl"><button class="cine-btn" data-c="prev" aria-label="이전 장면">' + ICON.prev + '</button>' +
    '<button class="cine-btn cine-play" data-c="play" aria-label="일시정지">' + ICON.pause + '</button>' +
    '<button class="cine-btn" data-c="next" aria-label="다음 장면">' + ICON.next + '</button>' +
    '<span class="cine-clock"></span>' +
    (AU.ok() ? '<button class="cine-btn cine-snd" data-c="sound" aria-pressed="' + AU.isOn() + '">' + (AU.isOn() ? ICON.son : ICON.soff) + '<span>' + (AU.isOn() ? '소리 켜짐' : '소리 꺼짐') + '</span></button>' : '') + '</div>' +
    '<p class="cine-note">음성 해설 없이 자막과 배경음·효과음으로 설명합니다. 화면의 수치·상황은 이해를 돕기 위한 예시입니다.</p>';
  document.body.appendChild(el); document.body.style.overflow = 'hidden';
  var cv = el.querySelector('canvas'), stepEl = el.querySelector('.cine-step'), textEl = el.querySelector('.cine-text'), playBtn = el.querySelector('.cine-play'), clockEl = el.querySelector('.cine-clock'), segs = el.querySelectorAll('.cine-bar button');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var st = { el: el, i: 0, t: 0, playing: !reduce, ended: false, last: performance.now(), fired: {}, raf: 0, shown: -1, opener: opener };
  cur = st; c = cv.getContext('2d');
  if (reduce) st.t = 3.2;

  function resize() { var w = cv.clientWidth || 800, dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(w * dpr); cv.height = Math.round(cv.width * H / W); render(performance.now()); }
  function enter(i, t) { st.i = clamp(i, 0, n - 1); st.t = t || 0; st.fired = {}; st.ended = false; if (st.playing) { AU.bed(story.scenes[st.i].bed); if (!t) AU.sfx('whoosh'); } }
  function setPlaying(p) { st.playing = p; st.last = performance.now();
    playBtn.innerHTML = st.ended ? ICON.replay : (p ? ICON.pause : ICON.play); playBtn.setAttribute('aria-label', st.ended ? '다시 보기' : (p ? '일시정지' : '재생'));
    if (p) { AU.start(); AU.resume(); AU.bed(story.scenes[st.i].bed); } else AU.pause(); }
  function render(ts) {
    var s = story.scenes[st.i], sc = cv.width / W; c = cv.getContext('2d'); c.setTransform(sc, 0, 0, sc, 0, 0);
    drawFrame(story, st.i, st.t, ts / 1000);
    if (st.shown !== st.i) { st.shown = st.i; stepEl.textContent = (st.i + 1) + '/' + n + ' ' + s.name; textEl.textContent = s.cap;
      for (var k = 0; k < segs.length; k++) { if (k === st.i) segs[k].setAttribute('aria-current', 'step'); else segs[k].removeAttribute('aria-current'); } }
    for (var j = 0; j < segs.length; j++) segs[j].firstChild.style.width = (j < st.i ? 100 : j > st.i ? 0 : clamp(st.t / durs[st.i]) * 100) + '%';
    var el0 = 0; for (var q = 0; q < st.i; q++) el0 += durs[q]; el0 += Math.min(st.t, durs[st.i]);
    clockEl.textContent = Math.floor(el0) + '초 / ' + Math.round(total) + '초';
  }
  function frame(ts) {
    if (cur !== st) return;
    var dt = Math.max(0, Math.min(.1, (ts - st.last) / 1000)); st.last = ts;
    if (st.playing && !document.hidden) {
      st.t += dt; var s = story.scenes[st.i];
      (s.sfx || []).forEach(function (q, k) { if (!st.fired[k] && st.t >= q[0]) { st.fired[k] = 1; AU.sfx(q[1]); } });
      if (st.t >= durs[st.i]) { if (st.i < n - 1) enter(st.i + 1, 0); else { st.t = durs[st.i]; st.ended = true; setPlaying(false); AU.end(); } }
    }
    render(ts); st.raf = requestAnimationFrame(frame);
  }
  function act(a, btn) {
    if (a === 'close') { close(); return; }
    if (a === 'play') { if (st.ended) { enter(0, 0); st.ended = false; setPlaying(true); } else setPlaying(!st.playing); return; }
    if (a === 'prev') { enter(st.t > 1.2 || st.i === 0 ? st.i : st.i - 1, 0); if (!st.playing) st.t = reduce ? 3.2 : 0; setPlaying(st.playing); return; }
    if (a === 'next') { if (st.i < n - 1) { enter(st.i + 1, 0); if (!st.playing && reduce) st.t = 3.2; setPlaying(st.playing); } return; }
    if (a === 'seek') { enter(+btn.getAttribute('data-i'), 0); if (!st.playing && reduce) st.t = 3.2; setPlaying(st.playing); return; }
    if (a === 'sound') { AU.start(); AU.setOn(!AU.isOn()); btn.setAttribute('aria-pressed', AU.isOn()); btn.innerHTML = (AU.isOn() ? ICON.son : ICON.soff) + '<span>' + (AU.isOn() ? '소리 켜짐' : '소리 꺼짐') + '</span>'; if (AU.isOn() && st.playing) AU.bed(story.scenes[st.i].bed); }
  }
  el.addEventListener('click', function (e) { var b = e.target.closest('[data-c]'); if (b) { e.stopPropagation(); act(b.getAttribute('data-c'), b); } });
  st.onKey = function (e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === ' ' && !(e.target && e.target.closest && e.target.closest('button'))) { e.preventDefault(); act('play'); }
    else if (e.key === 'ArrowRight') act('next'); else if (e.key === 'ArrowLeft') act('prev');
    else if (e.key === 'Tab') { var f = el.querySelectorAll('button:not([tabindex="-1"])'), first = f[0], lastB = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastB.focus(); } else if (!e.shiftKey && document.activeElement === lastB) { e.preventDefault(); first.focus(); } }
  };
  document.addEventListener('keydown', st.onKey, true);
  st.onPop = function () { if (cur !== st) return;
    /* 직전에 닫은 재생기의 '뒤로'가 늦게 도착한 경우: 방금 넣은 기록이 소모됐으니 다시 넣고 계속 재생 */
    if (window.SAFE_CINE.skipPop) { window.SAFE_CINE.skipPop = false; try { history.pushState({ cine: 1 }, ''); } catch (e) {} return; }
    close(true); };
  try { history.pushState({ cine: 1 }, ''); st.pushed = true; } catch (e) {}
  window.addEventListener('popstate', st.onPop);
  st.ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if (st.ro) st.ro.observe(cv); else window.addEventListener('resize', resize);
  AU.start(); enter(0, st.t); setPlaying(st.playing); resize(); playBtn.focus();
  st.raf = requestAnimationFrame(frame);
}
function close(fromPop) {
  var st = cur; if (!st) return; cur = null;
  cancelAnimationFrame(st.raf); document.removeEventListener('keydown', st.onKey, true); window.removeEventListener('popstate', st.onPop);
  if (st.ro) st.ro.disconnect(); AU.end(); AU.pause();
  st.el.remove(); document.body.style.overflow = '';
  if (st.pushed && !fromPop) { window.SAFE_CINE.skipPop = true; try { history.back(); } catch (e) { window.SAFE_CINE.skipPop = false; } }
  if (st.opener && document.body.contains(st.opener)) st.opener.focus();
}
/* 검수용: 특정 장면·시각의 그림을 data URL로 */
function snap(story, i, t, width) { var cv = document.createElement('canvas'); cv.width = width || 600; cv.height = Math.round(cv.width * H / W); c = cv.getContext('2d'); var sc = cv.width / W; c.setTransform(sc, 0, 0, sc, 0, 0); drawFrame(story, i, t, t * 1.37); return cv; }

window.SAFE_CINE = {
  open: open, close: close, snap: snap, isOpen: function () { return !!cur; }, sceneDur: sceneDur, AU: AU,
  G: { W: W, H: H, P: P, A: A, ctx: function () { return c; }, clamp: clamp, lerp: lerp, eio: eio, eout: eout, back: back, hash: hash, ap: ap, pop: pop,
    rr: rr, box: box, line: line, poly: poly, circ: circ, ell: ell, txt: txt, tw: tw, wrap: wrap, glow: glow, alpha: alpha, at: at, grad: grad,
    chip: chip, panel: panel, tick: tick, cross: cross, arrow: arrow, dashed: dashed, rings: rings, plume: plume, sparks: sparks, flash: flash,
    night: night, plant: plant, blueprint: blueprint, daysky: daysky, person: person, doc: doc, cone: cone, siren: siren, tag: tag, stamp: stamp }
};
})();
