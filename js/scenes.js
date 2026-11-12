/*! 안전비서 — 위반사례 모션그래픽 장면
 *  한 편 = 4장면: ① 어떤 위반인가 → ② 무슨 일이 생기나 → ③ 이렇게 지킵니다 → ④ 처벌
 *  ①~③은 위험 유형별 틀(TPL)을 위반사례마다 변형(k)해 그리고, ④는 js/data.js의 처벌 정보를 그대로 읽어 그립니다.
 *  자막: ① MAP의 c1, ② MAP의 c2 또는 틀의 기본 문장, ③ 위반사례의 tip, ④ 처벌 정보에서 자동 생성.
 *  틀 함수 draw(m, t, now, vr): m = 0 위반 상태 · 1 사고/적발 · 2 올바른 상태, t = 장면 시작 뒤 초, now = 반복 움직임용 시계.
 *  그림 속 수치·상황은 예시입니다. 왼쪽 위(x<620, y<140)는 장면 제목 자리라 비워 둡니다. 바닥선 y=600.
 */
(function () {
'use strict';
var G = window.SAFE_CINE.G, P = G.P;
var clamp = G.clamp, lerp = G.lerp, eout = G.eout, ap = G.ap, pop = G.pop, hash = G.hash,
  box = G.box, line = G.line, poly = G.poly, circ = G.circ, ell = G.ell, txt = G.txt, tw = G.tw, wrap = G.wrap, glow = G.glow, alpha = G.alpha, at = G.at, grad = G.grad,
  chip = G.chip, panel = G.panel, tick = G.tick, cross = G.cross, arrow = G.arrow, dashed = G.dashed, rings = G.rings, plume = G.plume, sparks = G.sparks, flash = G.flash,
  night = G.night, plant = G.plant, blueprint = G.blueprint, daysky = G.daysky, person = G.person, doc = G.doc, cone = G.cone, siren = G.siren, tag = G.tag, stamp = G.stamp;
function cx() { return G.ctx(); }
function ext(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }

/* ---------- 공통 연출 ---------- */
function checks(items, t, t0, title) { t0 = t0 == null ? 1.2 : t0; items = items || []; var h = 72 + items.length * 58;
  alpha(ap(t, t0 - .4, .4), function () { panel(770, 168, 400, h, title || '이렇게 지킵니다', P.green); });
  items.forEach(function (s, i) { var k = ap(t, t0 + i * .5, .35); alpha(k, function () { txt(s, 842, 262 + i * 58, 25, P.text, 'left', 600); }); tick(812, 253 + i * 58, k, P.green, 1.15); }); }
function faller(t, t0, x0, y0, x1, y1, s, o) { var q = clamp((t - t0) / .7); o = o || {};
  if (q <= 0) { person(x0, y0, s, o); return 0; }
  if (q < 1) { person(lerp(x0, x1, q), lerp(y0, y1, q * q), s, ext(o, { rot: q * 1.7, pose: 'up' })); return q; }
  person(x1, y1, s, ext(o, { pose: 'lie', rot: 0 })); return 1; }
function impact(t, t0, x, y, now, label, lx, ly) { if (t < t0) return; flash(1 - (t - t0) / .55); rings(x, y - 12, now, 'rgba(255,90,90,.95)', 16, 96, 3, 1.1); if (label) tag(lx == null ? 660 : lx, ly == null ? 250 : ly, label, 'bad', pop(t, t0 + .15)); }
function tags(list, t, x, y, kind) { list.forEach(function (s, i) { tag(x == null ? 660 : x, (y == null ? 220 : y) + i * 64, s, kind || 'bad', pop(t, 1.3 + i * .6)); }); }
function padlock(x, y, s) { at(x, y, s || 1, 0, function () { cx().beginPath(); cx().arc(0, -12, 9, Math.PI, 0); cx().strokeStyle = '#c9d3da'; cx().lineWidth = 4; cx().stroke(); box(-13, -12, 26, 22, P.helmet, 4); circ(0, -2, 3, '#3a2a10'); }); }
function flame(x, y, s, now, seed) { at(x, y, s, 0, function () { var w = Math.sin(now * 9 + seed) * 5, w2 = Math.sin(now * 13 + seed * 2) * 4;
  glow('#ff7a2e', 24, function () { poly([[-22, 0], [-14, -30 + w2], [-4 + w, -62], [8, -34 + w], [16 + w2, -52], [22, -12], [16, 0]], '#ff6a2a'); });
  poly([[-12, 0], [-6, -24 + w], [2 + w2, -40], [10, -18], [8, 0]], '#ffc04a'); }); }
function inspector(x, y, now, walk) { person(x, y, 1.6, { pose: walk ? 'walk' : 'tablet', vest: '#2f5f9e', hat: '#ffffff', flip: true, now: now }); }
function gavel(x, y, t, t0) { var k = clamp((t - t0) / .22), k2 = clamp((t - t0 - .6) / .22), a = -0.9 + (k < 1 ? k : k2 < 1 && t > t0 + .45 ? lerp(.45, 1, k2) : 1) * 0.9; if (t > t0 + .25 && t < t0 + .6) a = lerp(0, -0.4, clamp((t - t0 - .25) / .2));
  box(x - 70, y + 8, 140, 18, '#6b4a2b', 6); box(x - 86, y + 24, 172, 12, '#4a321c', 5);
  at(x - 60, y - 6, 1, a, function () { line(0, 0, 150, 0, '#8a6a4a', 12); box(120, -36, 56, 72, '#6b4a2b', 10); box(120, -36, 56, 12, '#d9a441', 4); box(120, 24, 56, 12, '#d9a441', 4); }); }

/* ---------- 소품 ---------- */
function forklift(x, y, s, o) { o = o || {}; at(x, y, s, o.rot || 0, function () {
  ell(70, 3, 100, 7, 'rgba(0,0,0,.45)');
  if (o.lights) { cx().globalCompositeOperation = 'lighter'; poly([[150, -66], [470, -120], [470, 10], [150, -50]], grad(150, 0, 470, 0, [[0, 'rgba(255,240,200,.3)'], [1, 'rgba(255,240,200,0)']])); cx().globalCompositeOperation = 'source-over'; }
  box(124, -164, 10, 164, '#55697a', 2); box(138, -164, 8, 164, '#44596a', 2);
  var lift = o.lift || 0; line(146, -16 - lift, 204, -16 - lift, '#b8c4cc', 7);
  if (o.load) { box(150, -76 - lift, 56, 56, '#b9884f', 4, '#8a6a4a', 2); line(150, -48 - lift, 206, -48 - lift, '#8a6a4a', 2); if (o.load > 1) box(152, -130 - lift, 52, 52, '#a87a45', 4, '#8a6a4a', 2); }
  box(0, -76, 118, 56, o.col || '#f0a030', 12); box(4, -40, 30, 22, '#33414d', 5);
  if (o.guard !== false) { line(22, -76, 26, -150, '#44596a', 7); line(100, -76, 104, -150, '#44596a', 7); box(14, -158, 100, 10, '#44596a', 4); }
  circ(62, -112, 11, P.skin); box(48, -102, 28, 28, '#3d6fb0', 6);
  [26, 96].forEach(function (wx) { circ(wx, -18, 19, '#05080c'); circ(wx, -18, 8, '#8f9ea8'); });
  if (o.beacon) { var on = Math.sin((o.now || 0) * 12) > 0; glow(P.amber, on ? 26 : 4, function () { circ(64, -166, 8, on ? P.amber : '#6b4a1a'); }); }
}); }
function excavator(x, y, s, o) { o = o || {}; at(x, y, s, o.rot || 0, function () {
  ell(10, 3, 110, 8, 'rgba(0,0,0,.45)'); box(-80, -28, 180, 28, '#17222c', 14); for (var i = 0; i < 5; i++) circ(-60 + i * 35, -14, 9, '#3a4b59');
  box(-56, -86, 124, 58, '#f0a030', 8); box(6, -128, 60, 46, '#f0a030', 6); box(14, -120, 44, 28, '#10202c', 3);
  var a = o.a == null ? -1.0 : o.a, b = o.b == null ? 0.95 : o.b, bx = 56 + Math.cos(a) * 150, by = -86 + Math.sin(a) * 150, ex = bx + Math.cos(b) * 112, ey = by + Math.sin(b) * 112;
  line(56, -86, bx, by, '#d98c20', 16); line(bx, by, ex, ey, '#d98c20', 12); circ(bx, by, 9, '#44596a');
  poly([[ex - 6, ey - 8], [ex + 28, ey + 2], [ex + 22, ey + 34], [ex - 12, ey + 26]], '#55697a', '#8fa3b1', 2);
  o._end = [ex, ey];
}); }
function roller(x, y, r, a) { circ(x, y, r, '#33495c', '#6b8797', 3); for (var i = 0; i < 4; i++) { var an = a + i * Math.PI / 2; line(x, y, x + Math.cos(an) * (r - 7), y + Math.sin(an) * (r - 7), '#9fb0bb', 4); } circ(x, y, 7, '#0d1b28'); }
function drum(x, y, labeled, col) { box(x - 30, y - 92, 60, 92, col || '#3d5a70', 8); line(x - 30, y - 64, x + 30, y - 64, 'rgba(255,255,255,.18)', 3); line(x - 30, y - 30, x + 30, y - 30, 'rgba(255,255,255,.18)', 3); ell(x, y - 92, 30, 7, '#5a7a90');
  if (labeled) { at(x, y - 48, 1, Math.PI / 4, function () { box(-13, -13, 26, 26, '#fff', 2, '#e0312e', 3); }); txt('!', x, y - 41, 20, '#111', 'center', 800); } }
function building(x, y, w, h, label, col) { box(x, y - h, w, h, col || '#13273a', 6, '#27445c', 2); for (var i = 0; i < Math.floor(w / 44); i++) for (var j = 0; j < Math.floor((h - 50) / 40); j++) box(x + 16 + i * 44, y - h + 20 + j * 40, 22, 22, 'rgba(255,196,110,.45)', 3); if (label) txt(label, x + w / 2, y - h - 14, 22, P.text, 'center', 700); }
function gauge(x, y, v, label, col) { cx().lineCap = 'round'; cx().beginPath(); cx().arc(x, y, 46, Math.PI * .8, Math.PI * 2.2); cx().strokeStyle = '#16293a'; cx().lineWidth = 12; cx().stroke();
  cx().beginPath(); cx().arc(x, y, 46, Math.PI * .8, Math.PI * (.8 + 1.4 * clamp(v))); cx().strokeStyle = col; cx().stroke(); cx().lineCap = 'butt'; txt(label, x, y + 9, 24, P.text, 'center', 800); }

/* ============================================================
   틀 (위험 유형별)
   ============================================================ */
var TPL = {};

/* --- 추락: k = deck(작업발판) | rail(난간) | anchor(안전대 걸이) | hole(개구부) | ladder(사다리) --- */
TPL.fall = { bed: 'site', c2: '발을 헛디디는 순간 그대로 떨어집니다. 추락은 사망으로 이어지기 쉬운 사고입니다.', g: ['작업발판 설치', '추락방호망', '안전대 착용'],
  sfx1: [[1.6, 'thud'], [1.9, 'alarm']],
  draw: function (m, t, now, vr) { var k = vr.k || 'deck', S = 1.5, hat = vr.nohat && m < 2 ? false : undefined; night(now);
    if (k === 'hole') {
      box(140, 372, 620, 18, '#3a4d5d', 2); [180, 720].forEach(function (x) { box(x - 10, 390, 20, 210, '#2a3b49', 2); });
      var hx = 430, hw = 110;
      if (m < 2) { cx().fillStyle = '#0b1a28'; cx().fillRect(hx, 370, hw, 22); line(hx, 372, hx, 390, P.red, 3); line(hx + hw, 372, hx + hw, 390, P.red, 3); }
      else { box(hx - 10, 364, hw + 20, 12, '#d9a441', 3); [hx - 24, hx + hw + 24].forEach(function (x) { line(x, 372, x, 306, P.amber, 6); }); line(hx - 24, 310, hx + hw + 24, 310, P.amber, 6); line(hx - 24, 340, hx + hw + 24, 340, P.amber, 4); tag(hx + hw + 44, 300, '개구부', 'warn', pop(t, .9)); }
      if (m === 0) { person(lerp(230, 400, clamp(t / 3.2)), 372, S, { pose: 'walk', now: now }); tags(['덮개·난간 없는 개구부'], t, 600, 290); }
      if (m === 1) { faller(t, .9, 440, 372, 485, 600, S, {}); impact(t, 1.6, 485, 600, now, '개구부로 추락', 600, 290); }
      if (m === 2) person(lerp(220, 360, clamp(t / 3)), 372, S, { pose: 'walk', now: now });
    } else if (k === 'ladder') {
      var lx = 440, rot = m === 1 ? clamp((t - .9) / .7) * .5 : 0;
      at(lx, 600, 1, rot, function () { line(-62, 0, 0, -230, '#c9d3da', 7); line(62, 0, 0, -230, '#c9d3da', 7); for (var i = 1; i < 5; i++) { var yy = -230 + i * 46, w = 62 * i / 5; line(-w, yy, w, yy, '#9fb0bb', 5); } box(-24, -240, 48, 11, '#9fb0bb', 3); });
      if (m === 0) { person(lx, 362, S, { pose: 'up', helmet: false }); tags(['최상부 발판에 올라섬', '안전모·보조자 없음'], t, 600, 240); }
      if (m === 1) { faller(t, .9, lx, 362, 580, 600, S, { helmet: false }); impact(t, 1.6, 580, 600, now, '사다리에서 추락', 640, 260); }
      if (m === 2) { person(lx - 4, 508, S, { pose: 'up' }); person(330, 600, S, { pose: 'reach' }); line(640, 600, 640, 372, P.amber, 3); line(626, 372, 654, 372, P.amber, 3); line(626, 600, 654, 600, P.amber, 3); alpha(ap(t, .8), function () { txt('3.5m 이하', 654, 480, 24, P.amber, 'left', 700); }); }
    } else {
      [220, 360, 500, 640].forEach(function (x) { line(x, 600, x, 236, '#5d7385', 7); }); line(220, 480, 640, 480, '#5d7385', 5); line(220, 600, 360, 480, '#3d5262', 4); line(500, 600, 640, 480, '#3d5262', 4); line(360, 480, 500, 360, '#3d5262', 4);
      if (k !== 'deck' || m === 2) box(212, 352, 436, 13, '#b9884f', 3); else { box(212, 352, 196, 13, '#b9884f', 3); box(566, 352, 82, 13, '#b9884f', 3); }
      var rl = m === 2 && k !== 'anchor' ? 2 : (k === 'rail' && m < 2 ? 1 : 0);
      if (rl === 1) line(220, 326, 640, 326, P.amber, 5);
      if (rl === 2) { line(220, 282, 640, 282, P.amber, 6); line(220, 318, 640, 318, P.amber, 4); box(212, 338, 436, 14, '#d9a441', 2); }
      if (k === 'anchor' && m === 2) { line(220, 250, 640, 250, P.cyan, 4); circ(220, 250, 6, P.cyan); circ(640, 250, 6, P.cyan); }
      var edge = k === 'deck' ? 398 : 600, fx0 = k === 'deck' ? 430 : 660, fx1 = k === 'deck' ? 472 : 706;
      if (m === 0) { var px = lerp(280, edge, clamp(t / 3.2)); person(px, 352, S, { pose: 'walk', now: now, helmet: hat }); if (k === 'anchor') line(px - 6, 352 - 46 * S, px - 26, 352 - 8, '#c9d3da', 3);
        tags(k === 'deck' ? (vr.nohat ? ['안전모·안전대 없음', '작업발판·난간 없음'] : ['작업발판이 비어 있음', '안전난간 없음']) : k === 'rail' ? ['난간이 낮음', '발끝막이판 없음'] : ['안전대를 걸 곳이 없음'], t, 690, 230); }
      if (m === 1) { faller(t, .9, fx0, 352, fx1, 600, S, { helmet: hat }); impact(t, 1.6, fx1, 600, now, '추락', 760, 300); }
      if (m === 2) { person(430, 352, S, { pose: 'stand' }); line(424, 352 - 46 * S, 470, k === 'anchor' ? 250 : 282, P.cyan, 3); circ(470, k === 'anchor' ? 250 : 282, 5, P.cyan);
        if (k === 'rail') alpha(ap(t, .8), function () { line(196, 352, 196, 282, P.amber, 3); txt('90cm 이상', 184, 324, 24, P.amber, 'right', 700); }); }
    }
    if (m === 2) checks(vr.g, t);
  } };

/* --- 끼임·기계: k = lock | cover | guard | estop | roller | prot | cert | insp --- */
TPL.caught = { bed: 'plant', c2: '옷자락이나 손이 닿는 순간 회전부에 말려 들어갑니다.', g: ['운전 정지', '잠금장치·표지', '덮개·방호장치'],
  sfx0: [[.4, 'motor']], sfx1: [[.2, 'motor'], [1.2, 'crash'], [1.5, 'alarm']], sfx2: [[.5, 'stop'], [.9, 'clank']],
  T: { lock: ['전원을 끄지 않고 정비', '잠금장치·표지 없음'], cover: ['회전부에 덮개 없음'], guard: ['방호장치를 떼어냄'], estop: ['비상정지장치 없음'], roller: ['물림점에 울 없음'], prot: ['방호조치 없는 기계'], cert: ['안전인증 표시 없음'], insp: ['안전검사 기한 지남'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'lock'; plant(now);
    var run = m === 0 || (m === 1 && t < 1.2), a = run ? now * 5 : 1.1, hit = m === 1 && t >= 1.2;
    if (k === 'estop') { box(110, 512, 250, 20, '#2a3b49', 10); for (var i = 0; i < 5; i++) circ(130 + i * 52, 522, 9, '#55697a'); for (var j = 0; j < 4; j++) { var bxp = 120 + ((j * 62 + (run ? now * 60 : 30)) % 230); box(bxp, 484, 34, 28, '#b9884f', 4); } }
    box(330, 380, 360, 220, '#1c3040', 10, '#2f4a5e', 2); box(360, 326, 130, 60, '#1c3040', 8, '#2f4a5e', 2);
    roller(410, 470, 44, a); roller(496, 470, 44, -a); if (run) glow(P.red, 18, function () { circ(453, 470, 6, P.red); });
    box(730, 420, 76, 104, '#22384b', 8, '#3a556a', 2); circ(768, 452, 11, run ? P.green : '#3a4a57'); txt(run ? 'ON' : 'OFF', 768, 500, 20, run ? P.green : P.muted, 'center', 800);
    siren(640, 378, now, hit);
    if (m === 2) { alpha(ap(t, .5), function () { box(356, 414, 196, 112, 'rgba(61,224,255,.12)', 8, P.cyan, 3); }); alpha(ap(t, .9), function () { padlock(768, 476, 1.2); box(722, 536, 92, 36, P.red, 5); txt('정비 중', 768, 561, 21, '#fff', 'center', 800); });
      alpha(ap(t, 1.2), function () { circ(620, 436, 17, '#e0312e', '#ffd27a', 4); });
      if (k === 'cert' || k === 'insp' || k === 'prot') alpha(ap(t, 1.4), function () { box(570, 540, 108, 42, '#0b3b24', 6, P.green, 2.5); txt(k === 'cert' ? 'KCs 인증' : k === 'insp' ? '검사 합격' : '방호 OK', 624, 569, 21, P.green, 'center', 800); }); }
    person(hit ? 244 : 268 + Math.sin(now * 3) * (m === 2 ? 0 : 6), 600, 1.7, { pose: m === 2 ? 'tablet' : 'reach', now: now });
    if (m === 0) tags(this.T[k] || this.T.lock, t, 640, 220);
    if (m === 1) impact(t, 1.2, 440, 486, now, '끼임', 640, 240);
    if (m === 2) checks(vr.g, t);
  } };

/* --- 차량·하역: k = hit | tip | light | guard | swing | etip --- */
TPL.vehicle = { bed: 'plant', c2: '운전자 눈에 보이지 않는 순간 사람과 부딪힙니다.', g: ['출입 통제', '유도자 배치', '보행 통로 분리'],
  C2: { tip: '기계가 넘어지면 운전자와 주변 사람이 깔립니다.', etip: '기계가 넘어지면 운전자와 주변 사람이 깔립니다.', guard: '떨어지는 짐이 운전자를 덮칩니다.' },
  sfx0: [[.3, 'motor'], [1.8, 'motor']], sfx1: [[.2, 'motor'], [1.25, 'crash'], [1.6, 'alarm']], sfx2: [[.4, 'beep']],
  draw: function (m, t, now, vr) { var k = vr.k || 'hit', S = 1.6, site = k === 'swing' || k === 'etip' || k === 'light';
    if (site) night(now); else plant(now);
    if (k === 'hit') {
      if (m === 2) { box(660, 606, 520, 12, P.green, 4); box(628, 512, 22, 90, '#d9a441', 4); for (var i = 0; i < 3; i++) line(628, 530 + i * 26, 650, 518 + i * 26, '#3a2a10', 5); }
      if (m === 0) { forklift(lerp(40, 330, clamp(t / 3.2)), 600, 1.25, { load: 1 }); person(lerp(940, 650, clamp(t / 3.2)), 600, S, { pose: 'tablet', flip: true, now: now }); tags(['보행 통로 구분 없음', '유도자 없음'], t, 600, 230); }
      if (m === 1) { forklift(lerp(180, 390, clamp(t / 1.2)), 600, 1.25, { load: 1 }); if (t < 1.2) person(lerp(720, 650, clamp(t / 1.2)), 600, S, { pose: 'tablet', flip: true, now: now }); else person(700, 600, S, { pose: 'lie' }); impact(t, 1.2, 640, 600, now, '부딪힘', 640, 250); }
      if (m === 2) { forklift(lerp(30, 250, clamp(t / 4)), 600, 1.25, { load: 1, beacon: true, now: now }); person(540, 600, S, { pose: 'point', flip: true, vest: '#2fae6b' }); person(lerp(1120, 800, clamp(t / 4)), 600, S, { pose: 'walk', flip: true, now: now }); }
    } else if (k === 'tip') {
      if (m < 2) poly([[420, 600], [820, 600], [820, 530]], '#22384b', '#3a556a', 2); else dashed(120, 620, 760, 620, P.green, 5, now);
      var r = m === 0 ? -.17 + Math.sin(now * 3) * .02 : m === 1 ? lerp(-.17, .8, clamp((t - .9) / .7)) : 0;
      forklift(m === 2 ? lerp(60, 320, clamp(t / 4)) : 520, m === 2 ? 600 : 584, 1.25, { load: 2, rot: r, beacon: m === 2, now: now });
      if (m === 0) tags(['경사·무른 지반', '유도자 없음'], t, 690, 230);
      if (m === 1) impact(t, 1.6, 620, 600, now, '넘어짐', 700, 250);
      if (m === 2) person(600, 600, S, { pose: 'point', flip: true, vest: '#2fae6b' });
    } else if (k === 'light') {
      var fxl = m === 1 ? lerp(700, 470, clamp(t / 1.2)) : lerp(760, 520, clamp(t / 3.4));
      at(fxl + 150, 600, 1, 0, function () { cx().scale(-1, 1); forklift(0, 0, 1.25, { lights: m === 2, beacon: m === 2, now: now }); });
      if (m === 1 && t >= 1.2) person(300, 600, S, { pose: 'lie' }); else person(m === 2 ? 210 : lerp(200, 330, clamp(t / 3)), 600, S, { pose: m === 2 ? 'stand' : 'walk', now: now });
      if (m < 2) { cx().fillStyle = 'rgba(0,0,0,.42)'; cx().fillRect(0, 150, 1200, 570); }
      if (m === 0) tags(['전조등·후미등 없음', '후진경보기 없음'], t, 660, 220);
      if (m === 1) impact(t, 1.2, 380, 600, now, '부딪힘', 660, 240);
      if (m === 2) tag(520, 330, '삐- 삐- 후진 경보', 'good', pop(t, .9));
    } else if (k === 'guard') {
      var drop = m === 1 ? clamp((t - .9) / .5) : 0;
      forklift(330, 600, 1.35, { load: m === 1 && t > .9 ? 1 : 2, lift: 150, guard: m === 2 });
      if (m === 1 && t > .9) box(330 + 152 * 1.35 - lerp(0, 110, drop), 600 - (280 + 150) * 1.0 + lerp(0, 190, drop * drop), 70, 70, '#a87a45', 4, '#8a6a4a', 2);
      if (m === 0) tags(['헤드가드 없음', '높이 쌓은 짐'], t, 680, 230);
      if (m === 1) impact(t, 1.4, 420, 470, now, '짐이 운전석으로 낙하', 660, 250);
    } else {
      var o = { a: -1.0, b: k === 'swing' ? (m === 1 ? lerp(.5, 1.25, clamp(t / 1.2)) : .8 + Math.sin(now * 1.6) * .25) : .95 };
      if (k === 'etip') { poly([[560, 600], [1200, 600], [1200, 720], [470, 720]], '#101a24'); line(560, 600, 480, 720, '#3a4b59', 3); o.rot = m === 0 ? .1 + Math.sin(now * 2) * .015 : m === 1 ? lerp(.1, 1.0, clamp((t - .9) / .8)) : 0; }
      excavator(k === 'etip' ? (m === 2 ? 300 : 470) : 320, 600, 1.3, o);
      if (k === 'swing') { if (m < 2) dashed(120, 622, 760, 622, P.red, 4, now); else { [700, 740, 780].forEach(function (x) { cone(x, 610, 1); }); }
        if (m === 1 && t >= 1.2) person(690, 600, S, { pose: 'lie' }); else person(m === 2 ? 900 : 640, 600, S, { pose: m === 2 ? 'stand' : 'dig', now: now });
        if (m === 0) tags(['작업반경 안에 사람', '유도자 없음'], t, 700, 220);
        if (m === 1) impact(t, 1.2, 640, 560, now, '부딪힘', 720, 240);
        if (m === 2) person(830, 600, S, { pose: 'point', flip: true, vest: '#2fae6b' });
      } else { if (m === 0) tags(['무른 갓길 끝', '유도자 없음'], t, 700, 220); if (m === 1) impact(t, 1.7, 600, 620, now, '굴러떨어짐', 700, 240); if (m === 2) person(640, 600, S, { pose: 'point', flip: true, vest: '#2fae6b' }); }
    }
    if (m === 2) checks(vr.g, t);
  } };

/* --- 양중기: k = label | over | hook --- */
TPL.crane = { bed: 'site', c2: '매단 짐이 벗겨지거나 줄이 끊어지면 그대로 아래로 떨어집니다.', g: ['정격하중 표시', '방호장치 작동', '훅 해지장치'],
  sfx0: [[.5, 'motor']], sfx1: [[1.1, 'clank'], [1.6, 'crash'], [1.9, 'alarm']], sfx2: [[.6, 'clank']],
  draw: function (m, t, now, vr) { var k = vr.k || 'label'; night(now);
    box(150, 176, 800, 20, '#44596a', 4); for (var i = 0; i < 16; i++) line(160 + i * 50, 196, 185 + i * 50, 176, '#2f4353', 3); box(120, 196, 30, 404, '#33495c', 4);
    var sw = m === 0 ? Math.sin(now * 1.5) * 26 : 0, drop = m === 1 ? clamp((t - 1.1) / .5) : 0, hy = 356;
    box(500, 196, 50, 22, '#55697a', 4); line(525, 218, 525 + sw * .5, hy, '#c9d3da', 3);
    at(525 + sw * .5, hy, 1, 0, function () { cx().beginPath(); cx().arc(0, 12, 14, -.4, Math.PI + .6); cx().strokeStyle = '#f0a030'; cx().lineWidth = 7; cx().stroke(); if (m === 2) line(-12, 4, 10, -2, P.cyan, 4); });
    var lx = 525 + sw, ly = m === 1 ? lerp(430, 562, drop * drop) : 430;
    if (!(m === 1 && drop > 0)) { line(525 + sw * .5, hy + 26, lx - 60, ly, '#c9d3da', 2.5); line(525 + sw * .5, hy + 26, lx + 60, ly, '#c9d3da', 2.5); }
    at(lx, ly, 1, m === 1 ? drop * .25 : sw * .004, function () { box(-90, 0, 180, 38, '#5d7385', 4, '#8fa3b1', 2); for (var q = 0; q < 4; q++) line(-80 + q * 50, 6, -80 + q * 50, 32, '#3d5262', 3); });
    if (m === 0) { person(600, 600, 1.6, { pose: 'point', flip: true }); tags(k === 'over' ? ['과부하방지장치 고장'] : k === 'hook' ? ['훅에 해지장치 없음'] : ['정격하중 표시 없음'], t, 690, 250); if (k === 'over') gauge(1030, 400, 1, '120%', P.red); }
    if (m === 1) { person(lerp(600, 760, clamp((t - .9) / .5)), 600, 1.6, { pose: 'walk', now: now }); impact(t, 1.6, 525, 600, now, '짐 낙하', 700, 260); }
    if (m === 2) { person(860, 600, 1.6, { pose: 'point', flip: true }); [640, 700].forEach(function (x) { cone(x, 606, 1); }); alpha(ap(t, .7), function () { box(182, 214, 180, 44, '#0b3b24', 6, P.green, 2.5); txt('정격하중 2.0t', 272, 245, 23, P.green, 'center', 800); }); checks(vr.g, t); }
  } };

/* --- 화재·폭발: k = spark | watch --- */
TPL.fire = { bed: 'plant', c2: '불티 하나가 가연물에 옮겨붙어 순식간에 번집니다.', g: ['비산방지·방화포', '가연물 치우기', '소화기 비치'],
  sfx0: [[.4, 'spark'], [1.2, 'spark'], [2.2, 'spark']], sfx1: [[.3, 'spark'], [.9, 'fire'], [1.6, 'alarm'], [2.4, 'fire']], sfx2: [[.4, 'spark']],
  draw: function (m, t, now, vr) { plant(now);
    person(360, 600, 1.7, { pose: 'reach', now: now, hat: '#3a4b59' }); glow('#fff3cf', 30, function () { circ(424, 508, 7, '#fff3cf'); });
    sparks(424, 508, now, { dist: m === 2 ? 80 : 250, ang: -.25, spread: 1.0, n: 22 });
    [640, 706].forEach(function (x, i) { box(x - 30, 536 - i * 10, 60, 64 + i * 10, '#8a6a4a', 4, '#6b4a2b', 2); }); drum(772, 600, m === 2, '#7a3a2e');
    if (m < 2) { line(424, 628, 740, 628, P.amber, 3); line(424, 618, 424, 638, P.amber, 3); line(740, 618, 740, 638, P.amber, 3); txt('11m 이내 가연물', 582, 664, 23, P.amber, 'center', 700); }
    if (m === 0) tags(vr.k === 'watch' ? ['화재감시자 없음', '불티가 가연물로'] : ['불티 비산방지 없음', '가연물을 치우지 않음'], t, 660, 220);
    if (m === 1) { var f = clamp((t - .8) / 1.4); if (f > 0) { [640, 706, 772].forEach(function (x, i) { flame(x, 540 - i * 6, .8 + f * 1.3, now, i); }); plume(700, 480, now, { col: 'rgba(60,60,66,', a: .6 * f, len: 260, dx: 60, n: 18, r0: 12, r1: 44 }); } siren(960, 250, now, t > 1.5); impact(t, 1.5, 700, 540, now, '화재', 660, 330); }
    if (m === 2) { alpha(ap(t, .5), function () { box(520, 420, 16, 180, '#c9d3da', 4); poly([[536, 424], [560, 440], [560, 600], [536, 600]], 'rgba(217,164,65,.55)', P.amber, 2); });
      alpha(ap(t, .8), function () { box(238, 548, 22, 52, '#e0312e', 6); box(244, 536, 10, 14, '#2a2a2a', 3); });
      person(1070, 600, 1.6, { pose: 'point', flip: true, vest: '#e0312e' }); tag(810, 452, '화재감시자', 'good', pop(t, 1.1)); checks(vr.g, t); }
  } };

/* --- 전기: k = live | ground | elcb | lock --- */
TPL.elec = { bed: 'plant', c2: '전기가 몸을 타고 흐르면 한순간에 쓰러집니다.', g: ['충전부 방호', '접지', '누전차단기'],
  sfx0: [[1.0, 'spark']], sfx1: [[1.1, 'zap'], [1.5, 'alarm']], sfx2: [[.6, 'clank']],
  T: { live: ['충전부가 드러나 있음'], ground: ['외함을 접지하지 않음'], elcb: ['누전차단기 없음', '바닥에 물기'], lock: ['전원 차단·잠금 없음'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'live'; plant(now);
    box(320, 320, 160, 280, '#22384b', 8, '#3a556a', 3);
    if (m < 2) { box(336, 340, 128, 240, '#0b1622', 4); [372, 400, 428].forEach(function (x, i) { glow(P.red, 14, function () { box(x - 5, 360, 10, 180, i === 1 ? '#ffd27a' : '#ff7a5a', 3); }); }); poly([[480, 322], [556, 300], [556, 590], [480, 598]], '#1c3040', '#3a556a', 2); }
    else { box(336, 340, 128, 240, '#2a4458', 4, '#4a6a82', 2); padlock(400, 470, 1.6); box(352, 366, 96, 40, '#0b3b24', 5, P.green, 2); txt('30mA', 400, 395, 23, P.green, 'center', 800); alpha(ap(t, .8), function () { line(330, 600, 330, 640, P.green, 5); line(308, 640, 352, 640, P.green, 5); line(316, 652, 344, 652, P.green, 4); line(324, 664, 336, 664, P.green, 3); }); }
    if (k === 'elcb' && m < 2) ell(640, 606, 150, 10, 'rgba(61,224,255,.3)');
    txt('분전반', 400, 304, 22, P.muted, 'center', 700);
    var hit = m === 1 && t >= 1.1, jit = hit && t < 1.7 ? Math.sin(now * 60) * 5 : 0;
    if (hit && t >= 1.7) person(720, 600, 1.7, { pose: 'lie' }); else person(640 + jit, 600, 1.7, { pose: m === 2 ? 'tablet' : 'reach', flip: true, now: now });
    if (hit && t < 1.7) glow('#bfe9ff', 26, function () { poly([[470, 440], [520, 470], [500, 480], [560, 506], [540, 512], [584, 530], [548, 500], [566, 494], [508, 462], [524, 456]], '#eaf8ff'); });
    if (m === 0) tags(this.T[k], t, 760, 230);
    if (m === 1) impact(t, 1.1, 600, 520, now, '감전', 760, 250);
    if (m === 2) checks(vr.g, t);
  } };

/* --- 굴착·붕괴: k = slope | inspect | shore | monitor --- */
TPL.collapse = { bed: 'site', c2: '흙벽이 한꺼번에 무너져 안에 있던 사람을 덮칩니다.', g: ['기울기 기준', '흙막이 설치', '빗물 침투 방지'],
  sfx0: [[1.6, 'pop']], sfx1: [[.9, 'rumble'], [1.9, 'alarm']], sfx2: [[.6, 'clank']],
  T: { slope: ['굴착면이 수직에 가까움', '가장자리에 흙 적치'], inspect: ['균열·용수 점검 없음'], shore: ['흙막이 없음', '가장자리에 흙 적치'], monitor: ['지보공 점검·계측 없음'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'slope', gy = 400; night(now, { ground: gy, city: .5 });
    cx().fillStyle = grad(0, gy, 0, 720, [[0, '#4a3524'], [1, '#2a1c12']]); cx().fillRect(0, gy, 1200, 320);
    for (var i = 0; i < 40; i++) circ(hash(i) * 1200, gy + 20 + hash(i + 40) * 280, 3 + hash(i + 9) * 4, 'rgba(0,0,0,.18)');
    var sloped = m === 2 && (k === 'slope' || k === 'inspect'), shored = (m === 2 && !sloped) || (k === 'monitor' && m < 2);
    if (sloped) poly([[290, gy], [750, gy], [640, 620], [400, 620]], '#0b1a28'); else poly([[400, gy], [640, gy], [640, 620], [400, 620]], '#0b1a28');
    line(0, gy, sloped ? 290 : 400, gy, '#6b5138', 4); line(sloped ? 750 : 640, gy, 1200, gy, '#6b5138', 4);
    if (shored) { [400, 640].forEach(function (x) { for (var j = 0; j < 6; j++) box(x - (x === 400 ? 0 : 10), gy - 10 + j * 38, 10, 34, '#d9a441', 2); }); [450, 540].forEach(function (y) { box(410, y, 220, 12, k === 'monitor' && m < 2 ? '#8a6a4a' : '#c9d3da', 4); }); }
    var slump = m === 1 ? clamp((t - .9) / .9) : 0;
    if (m < 2 && k !== 'monitor' && k !== 'inspect') poly([[660, gy], [800, gy], [730, gy - 70]], '#5a4028', '#6b5138', 2);
    if (m < 2 && (k === 'inspect' || k === 'slope')) { line(650, gy + 10, 676, gy + 70, '#1a100a', 4); line(676, gy + 70, 662, gy + 120, '#1a100a', 3); }
    if (!(m === 1 && slump >= 1)) person(520, 620, 1.5, { pose: m === 2 ? 'stand' : 'dig', now: now });
    if (slump > 0) { poly([[640, gy], [800, gy], [lerp(640, 430, slump), 620], [640, 620]], '#4a3524'); poly([[640, gy], [820, gy], [820, gy + lerp(0, 80, slump)], [640, gy + lerp(0, 150, slump)]], '#0b1a28'); }
    if (m === 0) tags(this.T[k], t, 760, 190);
    if (m === 1) impact(t, 1.5, 540, 600, now, '토사 붕괴', 760, 210);
    if (m === 2) { if (sloped) alpha(ap(t, .7), function () { txt('1 : 1.2', 716, 520, 26, P.amber, 'left', 800); }); if (k === 'monitor') alpha(ap(t, .7), function () { gauge(300, 300, .45, '정상', P.green); }); checks(vr.g, t); }
  } };

/* --- 밀폐공간: k = program | measure | vent | count | sign | watch | ppe | rescue --- */
TPL.confined = { bed: 'under', c2: '산소가 부족하거나 유해가스가 있으면 몇 초 만에 쓰러집니다. 구하러 따라 들어간 사람도 함께 쓰러집니다.', g: ['농도 측정', '환기', '감시인 배치'],
  sfx0: [[.8, 'hiss']], sfx1: [[.6, 'hiss'], [1.3, 'thud'], [1.7, 'alarm']], sfx2: [[.5, 'motor'], [1.0, 'ring']],
  T: { program: ['출입 확인 절차 없음'], measure: ['산소·가스 측정 안 함'], vent: ['환기 안 함'], count: ['인원 점검 없음'], sign: ['출입금지 표지 없음'], watch: ['감시인 없음'], ppe: ['송기마스크 없음'], rescue: ['대피용 기구 없음'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'measure', gy = 310; night(now, { ground: gy, city: .5 });
    cx().fillStyle = grad(0, gy, 0, 720, [[0, '#33383f'], [1, '#191c20']]); cx().fillRect(0, gy, 1200, 410);
    box(440, gy - 6, 100, 130, '#0b1a28', 0); box(250, 430, 480, 200, '#0b1a28', 12, '#3a4b59', 3); box(250, 596, 480, 34, 'rgba(60,110,90,.5)', 8);
    box(424, gy - 12, 132, 12, '#55697a', 4);
    for (var i = 0; i < 6; i++) line(450, gy + 14 + i * 22, 474, gy + 14 + i * 22, '#8fa3b1', 3); line(450, gy, 450, 440, '#8fa3b1', 3); line(474, gy, 474, 440, '#8fa3b1', 3);
    if (m < 2) for (var j = 0; j < 14; j++) { var ph = (now * .25 + hash(j)) % 1; circ(280 + hash(j + 3) * 420, 600 - ph * 150, 6 + ph * 10, 'rgba(160,220,90,' + (.35 * (1 - ph)).toFixed(3) + ')'); }
    if (m === 0) { person(462, lerp(gy, 430, clamp(t / 2.6)), 1.3, { pose: 'up' }); tags(this.T[k], t, 600, 200); alpha(ap(t, 1.9), function () { txt('H₂S ?   O₂ ?', 480, 540, 26, 'rgba(190,240,120,.9)', 'center', 800); }); }
    if (m === 1) { if (t < 1.3) person(400, 596, 1.4, { pose: 'stand' }); else person(430, 596, 1.4, { pose: 'lie' });
      var k2 = pop(t, 2.0); if (t > 1.9) { person(600, gy, 1.5, { pose: 'reach', flip: true }); cross(560, gy - 150, k2, P.red, 20); }
      impact(t, 1.3, 400, 580, now, '질식', 700, 190); tag(700, 254, '따라 들어가면 안 됩니다', 'warn', pop(t, 2.2)); }
    if (m === 2) { person(400, 596, 1.4, { pose: 'stand' }); line(398, 596 - 70 * 1.4, 462, gy, P.cyan, 3);
      alpha(ap(t, .5), function () { box(600, gy - 70, 90, 70, '#22384b', 8, '#3a556a', 2); circ(645, gy - 35, 24, '#0b1622', P.cyan, 3); for (var q = 0; q < 3; q++) { var an = now * 8 + q * 2.09; line(645, gy - 35, 645 + Math.cos(an) * 20, gy - 35 + Math.sin(an) * 20, P.cyan, 5); } });
      cx().save(); cx().strokeStyle = '#6b8797'; cx().lineWidth = 16; cx().lineJoin = 'round'; cx().beginPath(); cx().moveTo(600, gy - 30); cx().lineTo(524, gy - 30); cx().lineTo(524, 470); cx().stroke(); cx().restore();
      for (var d = 0; d < 5; d++) { var p2 = (now * .7 + d / 5) % 1; circ(524 + Math.sin(p2 * 9) * 40, 470 + p2 * 110, 5, 'rgba(61,224,255,' + (1 - p2).toFixed(2) + ')'); }
      person(330, gy, 1.5, { pose: 'tablet', vest: '#2fae6b' }); tag(150, gy - 150, '감시인', 'good', pop(t, .9));
      alpha(ap(t, 1.2), function () { box(770, 420, 400, 150, 'rgba(6,13,22,.92)', 14, P.green, 2); txt('O₂ 20.9%', 800, 474, 30, P.green, 'left', 800); txt('H₂S 0ppm · CO 0ppm', 800, 528, 26, P.green, 'left', 700); });
      checks(vr.g, t, 1.2); }
  } };

/* --- 폭염: k = rest | record | shade --- */
TPL.heat = { bed: 'hot', c2: '쉬지 못하고 체온이 계속 오르면 열사병으로 쓰러집니다.', g: ['2시간마다 20분 휴식', '그늘·물', '체감온도 기록'],
  sfx0: [[1.4, 'pop']], sfx1: [[1.2, 'thud'], [1.6, 'siren']], sfx2: [[.8, 'pop']],
  T: { rest: ['2시간 넘게 연속 작업'], record: ['온·습도계·기록 없음'], shade: ['그늘·물 없음'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'rest'; daysky(now);
    glow('#fff3cf', 60, function () { circ(680, 250, 58, '#fff0c0'); }); for (var i = 0; i < 12; i++) { var an = now * .4 + i * .5236; line(680 + Math.cos(an) * 76, 250 + Math.sin(an) * 76, 680 + Math.cos(an) * 104, 250 + Math.sin(an) * 104, 'rgba(255,240,192,.75)', 6); }
    box(380, 160, 190, 96, 'rgba(20,8,4,.82)', 14, m === 2 ? P.amber : P.red, 2.5); txt('체감온도', 475, 196, 21, P.text, 'center', 700); txt('34℃', 475, 240, 38, m === 2 ? P.amber : '#ff7a5a', 'center', 800);
    if (m === 2) { poly([[440, 420], [760, 420], [800, 470], [400, 470]], '#2f6f9e', '#5aa0d0', 3); line(430, 470, 430, 600, '#c9d3da', 6); line(770, 470, 770, 600, '#c9d3da', 6); box(520, 560, 170, 14, '#8a6a4a', 4); line(536, 574, 536, 600, '#8a6a4a', 6); line(674, 574, 674, 600, '#8a6a4a', 6);
      person(580, 560, 1.5, { pose: 'sit' }); box(690, 520, 22, 40, '#bfe9ff', 6, '#5aa0d0', 2); tag(420, 340, '2시간마다 20분 휴식', 'good', pop(t, .9)); checks(vr.g, t, 1.4); }
    if (m === 0) { person(430, 600, 1.7, { pose: 'dig', now: now }); for (var s = 0; s < 3; s++) { var ph = (now * .9 + s / 3) % 1; circ(410 + s * 18, 470 + ph * 40, 4, 'rgba(160,220,255,' + (1 - ph).toFixed(2) + ')'); } tags(this.T[k], t, 150, 330); }
    if (m === 1) { if (t < 1.2) person(430 + Math.sin(now * 5) * 6, 600, 1.7, { pose: 'stand' }); else person(470, 600, 1.7, { pose: 'lie' }); impact(t, 1.2, 440, 600, now, '열사병 의심', 150, 330); tag(150, 394, '바로 119 신고', 'warn', pop(t, 2.0)); }
  } };

/* --- 서류·체제: k = seat(선임) | doc(문서) | edu(교육) | board(게시) | meet(회의) --- */
TPL.desk = { bed: 'office', c2: '감독에서 드러나면 과태료가 부과되고, 관리의 빈틈은 사고로 이어집니다.', g: ['기준 확인', '기한 내 이행', '기록 보관'],
  sfx0: [[1.3, 'pop']], sfx1: [[1.0, 'paper'], [1.8, 'stamp']], sfx2: [[.6, 'paper']],
  prop: function (full, t, now, vr) { var k = vr.k || 'doc', dim = full ? 1 : .35;
    box(0, 600, 1200, 120, '#0b141d'); line(0, 600, 1200, 600, '#22384b', 3);
    if (k === 'seat') { box(260, 500, 320, 16, '#6b4a2b', 5); box(280, 516, 14, 84, '#4a321c', 3); box(546, 516, 14, 84, '#4a321c', 3);
      box(150, 470, 70, 12, '#33495c', 5); box(150, 410, 12, 72, '#33495c', 5); line(185, 482, 185, 600, '#33495c', 8);
      if (full) person(170, 600, 1.7, { pose: 'sit', helmet: false, vest: '#2f5f9e' }); else { cx().save(); cx().setLineDash([8, 8]); circ(190, 400, 22, null, 'rgba(255,90,90,.8)', 3); box(162, 426, 56, 56, null, 10, 'rgba(255,90,90,.8)', 3); cx().restore(); }
      box(330, 448, 220, 52, '#eef3f1', 6); txt(vr.role || '안전관리자', 440, 483, 25, '#16283a', 'center', 800);
      if (!full && Math.sin(now * 5) > -.3) { box(470, 396, 96, 42, P.red, 6); txt('공석', 518, 426, 25, '#fff', 'center', 800); }
    } else if (k === 'edu') { box(250, 210, 440, 220, full ? '#0d2a22' : '#0b1622', 10, '#3a556a', 3); txt(vr.doc || '안전보건교육', 470, 262, 28, full ? P.green : P.dim, 'center', 800);
      if (full) for (var i = 0; i < 4; i++) box(290, 290 + i * 30, 360 - (i % 2) * 90, 10, 'rgba(87,227,154,.5)', 5);
      for (var s = 0; s < 5; s++) { var sx = 250 + s * 100; box(sx - 26, 560, 52, 10, '#33495c', 4); if (full) person(sx - 12, 560, 1.15, { pose: 'sit', vest: s % 2 ? P.vest : '#2f5f9e' }); else { cx().save(); cx().setLineDash([7, 7]); circ(sx, 488, 14, null, 'rgba(255,90,90,.7)', 2.5); cx().restore(); } }
      if (full) person(170, 600, 1.6, { pose: 'point', helmet: false, vest: '#2f5f9e' });
    } else if (k === 'board') { box(240, 190, 470, 300, '#3a2a1a', 10, '#6b4a2b', 5); box(256, 206, 438, 268, '#8a6a4a', 4); txt('게시판', 475, 180, 22, P.muted, 'center', 700);
      if (full) { doc(280, 226, 150, 200, { head: '#2f5f9e', title: (vr.doc || '법령 요지').slice(0, 7), rows: 5 }); poly([[550, 250], [620, 370], [480, 370]], '#ffd23d', '#1a1a1a', 4); txt('!', 550, 356, 54, '#1a1a1a', 'center', 800); box(468, 392, 164, 44, '#1f7a3d', 6); txt('안전제일', 550, 424, 24, '#fff', 'center', 800); }
      else { cx().save(); cx().setLineDash([10, 10]); box(280, 226, 150, 200, null, 6, 'rgba(255,255,255,.35)', 3); box(470, 246, 190, 180, null, 6, 'rgba(255,255,255,.35)', 3); cx().restore(); }
    } else if (k === 'meet') { box(250, 470, 440, 20, '#6b4a2b', 6); box(300, 490, 16, 110, '#4a321c', 3); box(624, 490, 16, 110, '#4a321c', 3); txt('근로자위원', 330, 420, 22, P.muted, 'center', 700); txt('사용자위원', 610, 420, 22, P.muted, 'center', 700);
      [300, 390].forEach(function (x) { if (full) person(x, 600, 1.5, { pose: 'sit' }); else { cx().save(); cx().setLineDash([7, 7]); circ(x + 16, 498 - 40, 16, null, 'rgba(255,90,90,.7)', 2.5); cx().restore(); } });
      [560, 650].forEach(function (x) { if (full) person(x, 600, 1.5, { pose: 'sit', flip: true, suit: true }); else { cx().save(); cx().setLineDash([7, 7]); circ(x - 16, 498 - 40, 16, null, 'rgba(255,90,90,.7)', 2.5); cx().restore(); } });
      if (full) doc(420, 400, 100, 66, { rows: 2 });
    } else { alpha(dim + (full ? 0 : .15), function () { doc(300, 190, 330, 400, { head: full ? '#2f5f9e' : '#55697a', title: vr.doc || '문서', rows: full ? 11 : 0 }); });
      if (!full) { cx().save(); cx().setLineDash([12, 10]); box(300, 190, 330, 400, null, 6, 'rgba(255,90,90,.8)', 3); cx().restore(); txt('?', 465, 440, 120, 'rgba(255,90,90,.55)', 'center', 800); }
      else alpha(ap(t, .9), function () { circ(560, 520, 40, null, '#e0312e', 5); txt('확인', 560, 530, 25, '#e0312e', 'center', 800); }); }
  },
  draw: function (m, t, now, vr) { blueprint(); this.prop(m === 2, t, now, vr);
    if (m === 0) tags(vr.T || [vr.k === 'seat' ? '선임하지 않음' : vr.k === 'edu' ? '교육을 하지 않음' : vr.k === 'board' ? '게시하지 않음' : vr.k === 'meet' ? '회의를 열지 않음' : '작성하지 않음'], t, 740, 230);
    if (m === 1) { inspector(lerp(1180, 860, clamp(t / 1.2)), 600, now, t < 1.2); alpha(ap(t, 1.0, .5), function () { doc(lerp(820, 740, ap(t, 1.0, .5)), 250, 230, 150, { head: P.red, title: vr.notice || '과태료 고지서', rows: 3 }); }); stamp(520, 330, vr.stamp || '과태료', clamp((t - 1.8) / .25)); if (t > 1.8 && t < 2.3) flash(1 - (t - 1.8) / .5); }
    if (m === 2) checks(vr.g, t);
  } };

/* --- 사고 대응: k = stop | report | keep | order | cmd | hide | fair --- */
TPL.emg = { bed: 'plant', c2: '같은 위험이 남아 있어 2차 사고가 날 수 있습니다.', g: ['즉시 작업중지', '근로자 대피', '지체 없이 보고'],
  C2: { report: '보고하지 않은 사실이 드러나면 무거운 과태료가 부과됩니다.', hide: '숨긴 사실이 드러나면 더 무거운 제재를 받습니다.', keep: '원인을 밝힐 수 없게 되고, 훼손한 사람은 처벌받습니다.', order: '명령을 어기는 것 자체가 형사처벌 대상입니다.', cmd: '명령을 어기는 것 자체가 형사처벌 대상입니다.', fair: '위험을 말하지 못하는 현장에서는 사고를 막을 수 없습니다.' },
  sfx0: [[.4, 'motor'], [1.4, 'pop']], sfx1: [[1.0, 'alarm'], [1.9, 'stamp']], sfx2: [[.4, 'stop'], [1.0, 'ring']],
  T: { stop: ['사고 뒤에도 작업 계속'], report: ['보고하지 않음'], keep: ['사고 현장을 치움'], order: ['작업중지명령 중 가동'], cmd: ['시정명령 미이행'], hide: ['발생 사실을 숨김'], fair: ['작업을 멈춘 근로자에 불이익'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'stop'; plant(now);
    var run = m < 2 && (k === 'stop' || k === 'order' || k === 'cmd' || k === 'fair'), a = run ? now * 5 : .8;
    box(520, 430, 220, 170, '#1c3040', 10, '#2f4a5e', 2); roller(590, 510, 38, a); roller(672, 510, 38, -a); siren(720, 428, now, m === 1);
    /* 사고 지점 */
    ell(290, 606, 96, 12, 'rgba(255,90,90,.22)'); cone(210, 606, 1.1); at(300, 592, 1, .5, function () { cx().beginPath(); cx().arc(0, 0, 18, Math.PI, 0); cx().fillStyle = P.helmet; cx().fill(); cx().fillRect(-22, -1, 44, 5); });
    if (m === 2 || k === 'keep') { if (!(k === 'keep' && m < 2)) { [180, 400].forEach(function (x) { line(x, 606, x, 540, '#c9d3da', 5); }); line(180, 552, 400, 552, P.helmet, 7); for (var i = 0; i < 6; i++) line(190 + i * 36, 548, 206 + i * 36, 556, '#1a1a1a', 4); } }
    if (k === 'keep' && m < 2) person(360, 600, 1.6, { pose: 'dig', now: now, flip: true });
    if (k === 'stop' && m < 2) person(450, 600, 1.6, { pose: 'reach', now: now });
    if ((k === 'order' || k === 'cmd') && m < 2) { box(540, 330, 180, 84, '#fff', 6, P.red, 4); txt(k === 'order' ? '작업중지명령' : '시정명령', 630, 366, 23, P.red, 'center', 800); txt('고용노동부', 630, 398, 19, '#333', 'center', 700); person(450, 600, 1.6, { pose: 'reach', now: now }); }
    if (k === 'fair') { person(450, 600, 1.6, { pose: m === 2 ? 'stand' : 'point' }); person(830, 600, 1.6, { pose: m === 2 ? 'stand' : 'point', flip: true, suit: true }); if (m < 2) { box(600, 250, 190, 60, 'rgba(6,13,22,.94)', 12, P.red, 2.5); txt('"왜 멈췄어!"', 695, 290, 25, '#ffb4b4', 'center', 800); } }
    if (k === 'hide' && m < 2) { var dy = clamp((t - .8) / 1.4); box(840, 470, 190, 130, '#22384b', 8, '#3a556a', 2); box(852, 482, 166, 16, '#0b1622', 4); cx().save(); cx().beginPath(); cx().rect(820, 250, 240, 240); cx().clip(); doc(866, lerp(280, 440, dy), 138, 170, { head: '#55697a', title: '재해 기록', rows: 4 }); cx().restore(); txt('서랍 속으로', 935, 560, 22, P.muted, 'center', 700); }
    if ((k === 'report' || k === 'hide' || k === 'stop') && (m === 2 || k === 'report')) { /* 전화 */
      at(m === 2 ? 320 : 0, m === 2 ? 222 : 0, m === 2 ? .64 : 1, 0, function () { box(880, 330, 150, 250, '#0d1824', 20, m === 2 ? P.green : '#3a5266', 3); box(892, 350, 126, 196, '#050d15', 8);
      if (m === 2) { rings(955, 440, now, P.green, 14, 60, 3, 1.3); txt('보고 중', 955, 448, 26, P.green, 'center', 800); txt('고용노동관서', 955, 520, 19, P.text, 'center', 700); }
      else { txt('00:00', 955, 440, 28, P.dim, 'center', 800); txt('통화 기록 없음', 955, 500, 16, P.muted, 'center', 700); } }); }
    if (m === 2 && (k === 'order' || k === 'cmd' || k === 'keep' || k === 'fair')) alpha(ap(t, .8), function () { doc(850, 430, 180, 164, { head: '#1f7a3d', title: k === 'keep' ? '현장 보존' : k === 'fair' ? '작업중지 기록' : '조치 결과', rows: 4 }); });
    if (m === 2 && k === 'stop') { person(lerp(450, 300, clamp(t / 2)), 600, 1.6, { pose: 'walk', flip: true, now: now }); }
    if (m === 0) tags(this.T[k], t, 600, 190);
    if (m === 1) { if (k === 'stop') impact(t, 1.0, 600, 540, now, '2차 사고 위험', 600, 190); else { inspector(lerp(1180, k === 'fair' ? 990 : 800, clamp(t / 1.2)), 600, now, t < 1.2); stamp(520, 300, vr.stamp || '적발', clamp((t - 1.9) / .25)); if (t > 1.9 && t < 2.4) flash(1 - (t - 1.9) / .5); } }
    if (m === 2) checks(vr.g, t);
  } };

/* --- 도급: k = safe | ban | council --- */
TPL.contract = { bed: 'site', c2: '하청 근로자가 다치면 원청도 책임을 집니다.', g: ['원청이 안전시설', '협의체·순회점검', '역할 문서화'],
  C2: { ban: '유해물질에 노출되는 위험을 하청 근로자에게 떠넘기게 됩니다.', council: '여러 업체의 작업이 엉키면서 사고가 납니다.' },
  sfx0: [[1.3, 'pop']], sfx1: [[1.5, 'thud'], [1.8, 'alarm']], sfx2: [[.8, 'pop']],
  draw: function (m, t, now, vr) { var k = vr.k || 'safe'; night(now);
    building(120, 600, 230, 300, '도급인 (원청)'); txt('관계수급인 (하청)', 640, 286, 22, P.text, 'center', 700);
    var col = m === 2 ? P.green : P.red; if (m === 2) line(350, 440, 560, 440, col, 5); else dashed(350, 440, 560, 440, col, 5, now, 0);
    if (k === 'ban') { box(600, 500, 220, 100, '#22384b', 10, '#3a556a', 3); box(612, 512, 196, 40, m === 2 ? 'rgba(61,224,255,.3)' : 'rgba(160,220,90,.5)', 6); if (m < 2) plume(710, 510, now, { col: 'rgba(160,220,90,', a: .5, len: 150, dx: 20, n: 12 });
      txt('도금·수은·납·카드뮴', 710, 588, 20, P.amber, 'center', 700); person(560, 600, 1.5, { pose: 'reach', vest: m === 2 ? '#2f5f9e' : P.vest });
      if (m === 0) tags(['유해작업을 사내 하청에'], t, 400, 200); if (m === 1) { stamp(700, 380, '과징금', clamp((t - 1.5) / .25)); if (t > 1.5 && t < 2) flash(1 - (t - 1.5) / .5); }
      if (m === 2) tag(430, 380, '승인 받은 경우만', 'good', pop(t, .8));
    } else if (k === 'council') { box(560, 520, 240, 16, '#6b4a2b', 5); box(590, 536, 12, 64, '#4a321c', 3); box(758, 536, 12, 64, '#4a321c', 3);
      if (m === 2) { person(600, 600, 1.4, { pose: 'sit', vest: '#2f5f9e' }); person(760, 600, 1.4, { pose: 'sit', flip: true }); tag(560, 380, '협의체 매월 1회', 'good', pop(t, .8)); person(lerp(880, 1040, (Math.sin(now * .8) + 1) / 2), 600, 1.4, { pose: 'walk', vest: '#2f5f9e', now: now }); }
      else { person(900, 600, 1.5, { pose: 'dig', now: now }); if (m === 0) tags(['협의체 회의 없음', '순회점검 없음'], t, 400, 190); if (m === 1) impact(t, 1.5, 900, 600, now, '작업 혼재 사고', 400, 200); }
    } else { box(560, 470, 300, 14, '#b9884f', 3); [570, 850].forEach(function (x) { line(x, 600, x, 470, '#5d7385', 7); });
      if (m === 2) { line(570, 400, 850, 400, P.amber, 6); line(570, 436, 850, 436, P.amber, 4); [570, 850].forEach(function (x) { line(x, 470, x, 400, P.amber, 5); }); person(700, 470, 1.4, { pose: 'stand' }); }
      if (m === 0) { person(lerp(620, 830, clamp(t / 3.2)), 470, 1.4, { pose: 'walk', now: now }); tags(['안전시설을 설치하지 않음'], t, 380, 200); }
      if (m === 1) { faller(t, .8, 850, 470, 900, 600, 1.4, {}); impact(t, 1.5, 900, 600, now, '하청 근로자 추락', 380, 200); arrow(840, 380, 370, 380, P.red, 5, clamp((t - 2) / .6)); alpha(ap(t, 2.4), function () { txt('도급인 책임', 600, 364, 24, '#ffb4b4', 'center', 800); }); } }
    if (m === 2) checks(vr.g, t);
  } };

/* --- 화학물질: k = label | post | submit | psm --- */
TPL.chem = { bed: 'plant', c2: '무엇이 든 용기인지 모르고 다루다 중독이나 화재가 납니다.', g: ['용기마다 경고표시', 'MSDS 비치', '취급자 교육'],
  C2: { psm: '검증되지 않은 설비에서 누출이나 폭발이 날 수 있습니다.' },
  sfx0: [[1.3, 'pop']], sfx1: [[.9, 'hiss'], [1.6, 'alarm']], sfx2: [[.7, 'paper']],
  T: { label: ['경고표시 없는 용기'], post: ['MSDS가 작업장에 없음'], submit: ['MSDS 미제출'], psm: ['적합 통보 전 가동'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'label'; plant(now);
    if (k === 'psm') { box(360, 330, 150, 270, '#22384b', 20, '#4a6a82', 3); ell(435, 330, 75, 16, '#3a556a'); cx().save(); cx().strokeStyle = '#6b8797'; cx().lineWidth = 14; cx().lineJoin = 'round'; cx().beginPath(); cx().moveTo(510, 480); cx().lineTo(640, 480); cx().lineTo(640, 600); cx().stroke(); cx().restore(); circ(576, 480, 18, m === 2 ? P.green : P.red, '#0b1622', 3);
      if (m === 1 && t > .9) plume(600, 470, now, { col: 'rgba(200,170,90,', a: .6, len: 220, dx: 80, n: 16, r0: 10, r1: 40 });
      if (m === 2) alpha(ap(t, .7), function () { doc(150, 330, 170, 220, { head: '#1f7a3d', title: '적합 통보', rows: 5 }); });
    } else { box(330, 600, 300, 10, '#33495c', 3); [380, 470, 560].forEach(function (x, i) { drum(x, 600, m === 2, ['#3d5a70', '#5a4a70', '#70503d'][i]); });
      box(610, 300, 130, 150, '#22384b', 8, '#3a556a', 2); if (m === 2 || (k !== 'post' && k !== 'submit')) { box(626, 316, 44, 118, '#2f5f9e', 4); txt('M', 648, 356, 22, '#fff', 'center', 800); txt('S', 648, 384, 22, '#fff', 'center', 800); txt('D', 648, 412, 22, '#fff', 'center', 800); box(678, 316, 44, 118, '#1f7a3d', 4); } else { cx().save(); cx().setLineDash([8, 8]); box(626, 316, 96, 118, null, 4, 'rgba(255,90,90,.8)', 3); cx().restore(); }
      if (m === 1 && t > .9) plume(470, 500, now, { col: 'rgba(170,120,220,', a: .6, len: 200, dx: 30, n: 16, r0: 10, r1: 38 }); }
    person(m === 1 && t > 1.6 ? 236 : 250, 600, 1.7, { pose: m === 2 ? 'tablet' : 'reach', now: now });
    if (m === 0) tags(this.T[k], t, 760, 210);
    if (m === 1) impact(t, 1.6, 460, 520, now, k === 'psm' ? '누출' : '유해물질 노출', 760, 220);
    if (m === 2) checks(vr.g, t);
  } };

/* --- 보건: k = measure | checkup | customer | msd | stress --- */
TPL.health = { bed: 'plant', c2: '노출 수준을 모른 채 일하다 직업병이 생깁니다.', g: ['주기적 측정', '결과 알리기', '초과 시 개선'],
  C2: { checkup: '질병을 일찍 찾지 못해 병이 깊어집니다.', customer: '폭언이 반복되면 건강장해로 이어집니다.', msd: '허리와 어깨에 부담이 쌓여 근골격계질환이 됩니다.', stress: '과로와 스트레스가 쌓이면 뇌심혈관질환 위험이 높아집니다.' },
  BED: { checkup: 'office', customer: 'office', stress: 'office' },
  sfx0: [[1.3, 'pop']], sfx1: [[1.2, 'heart'], [1.9, 'heart'], [2.6, 'heart']], sfx2: [[.8, 'pop']],
  T: { measure: ['작업환경측정 안 함'], checkup: ['건강진단 안 함'], customer: ['폭언에 그대로 노출'], msd: ['유해요인조사 안 함'], stress: ['야간·장시간 근로 방치'] },
  draw: function (m, t, now, vr) { var k = vr.k || 'measure', office = k === 'checkup' || k === 'customer' || k === 'stress';
    if (office) { blueprint(); box(0, 600, 1200, 120, '#0b141d'); line(0, 600, 1200, 600, '#22384b', 3); } else plant(now);
    var bad = m === 1 && t > 1.2;
    if (k === 'measure') { box(480, 440, 200, 160, '#1c3040', 10, '#2f4a5e', 2); roller(580, 520, 44, now * 6); rings(580, 520, now, 'rgba(255,181,71,.8)', 50, 150, 3, 1.4); plume(640, 440, now, { col: 'rgba(200,180,150,', a: .45, len: 160, dx: 40 });
      person(330, 600, 1.7, { pose: 'reach', now: now }); if (bad) glow(P.red, 24, function () { circ(330, 476, 16, 'rgba(255,90,90,.7)'); });
      if (m === 2) { person(820, 600, 1.6, { pose: 'tablet', flip: true, vest: '#2f5f9e', hat: '#fff' }); box(318, 520, 18, 26, P.cyan, 4); tag(150, 380, '측정기 부착', 'good', pop(t, .8)); }
    } else if (k === 'checkup') { box(300, 250, 260, 240, '#eef3f1', 10); box(300, 250, 260, 48, m === 2 ? '#1f7a3d' : P.red, 10); txt('건강진단', 430, 284, 25, '#fff', 'center', 800); for (var i = 0; i < 12; i++) { var cxp = 326 + (i % 4) * 58, cyp = 330 + Math.floor(i / 4) * 50; box(cxp, cyp, 40, 34, '#c6d2d6', 4); if (m === 2 && i === 5) tick(cxp + 18, cyp + 16, ap(t, .9), '#1f7a3d'); if (m < 2 && i === 5) cross(cxp + 20, cyp + 17, 1, P.red, 10); }
      person(700, 600, 1.7, { pose: 'stand', flip: true }); if (bad) glow(P.red, 24, function () { circ(700, 500, 16, 'rgba(255,90,90,.7)'); }); if (m === 2) person(860, 600, 1.6, { pose: 'tablet', flip: true, helmet: false, vest: '#eef3f1' });
    } else if (k === 'customer') { box(420, 500, 300, 100, '#22384b', 8, '#3a556a', 2); person(520, 600, 1.6, { pose: 'stand', helmet: false, vest: '#2f5f9e' }); person(830, 600, 1.6, { pose: 'point', flip: true, suit: true });
      if (m < 2) { box(640, 300, 150, 70, 'rgba(6,13,22,.94)', 14, P.red, 2.5); txt('!!!', 715, 350, 40, '#ff7a7a', 'center', 800); if (Math.sin(now * 8) > 0) txt('#@!', 760, 280, 30, '#ff7a7a', 'center', 800); }
      if (bad) glow(P.red, 30, function () { circ(520, 480, 20, 'rgba(255,90,90,.6)'); });
      if (m === 2) { box(470, 250, 220, 80, '#0b3b24', 10, P.green, 2.5); txt('폭언 금지', 580, 284, 25, P.green, 'center', 800); txt('응대 중단 가능', 580, 314, 20, P.text, 'center', 600); person(330, 600, 1.6, { pose: 'point', helmet: false, suit: true }); }
    } else if (k === 'msd') { var lift = (Math.sin(now * 3) + 1) / 2; box(470, 540 - (m === 2 ? 0 : lift * 60), 110, 60, '#b9884f', 6, '#8a6a4a', 3); txt('25kg', 525, 578 - (m === 2 ? 0 : lift * 60), 22, '#3a2a10', 'center', 800);
      person(390, 600, 1.7, { pose: m === 2 ? 'stand' : 'reach', now: now }); if (bad) glow(P.red, 26, function () { circ(384, 520, 18, 'rgba(255,90,90,.7)'); });
      if (m === 2) { box(440, 588, 180, 12, '#55697a', 4); circ(470, 606, 12, '#c9d3da'); circ(590, 606, 12, '#c9d3da'); line(620, 588, 650, 500, '#55697a', 6); doc(628, 426, 134, 160, { head: '#2f5f9e', title: '유해요인조사', rows: 3 }); }
    } else { box(380, 500, 300, 16, '#6b4a2b', 5); box(400, 516, 14, 84, '#4a321c', 3); box(646, 516, 14, 84, '#4a321c', 3); box(470, 400, 130, 90, '#0b1622', 8, '#3a556a', 3); person(300, 600, 1.7, { pose: 'sit', helmet: false, vest: '#2f5f9e' });
      circ(640, 280, 60, '#0b1622', m === 2 ? P.green : P.red, 4); line(640, 280, 640, 240, P.text, 5); line(640, 280, 670, 290, P.text, 5); txt(m === 2 ? '18:00' : '03:00', 640, 380, 28, m === 2 ? P.green : '#ff7a7a', 'center', 800);
      if (bad) glow(P.red, 26, function () { circ(318, 500, 18, 'rgba(255,90,90,.7)'); }); }
    if (m === 0) tags(this.T[k], t, k === 'checkup' || k === 'stress' ? 150 : 720, k === 'checkup' || k === 'stress' ? 190 : 200);
    if (m === 1 && t > 1.2) tag(720, 200, k === 'customer' ? '건강장해' : k === 'stress' ? '뇌심혈관 위험' : k === 'msd' ? '근골격계질환' : '직업병 위험', 'bad', pop(t, 1.35));
    if (m === 1) flash((1 - (t - 1.2) / .6) * (t > 1.2 ? .6 : 0));
    if (m === 2) checks(vr.g, t, 1.3);
  } };

/* --- 중대재해처벌법 경영책임자: vr.rows(표 항목), vr.hi(해당 항목), vr.bad(미이행 표시할 항목들) --- */
var R9 = ['목표·경영방침', '전담 조직', '유해·위험요인 확인·개선', '예산 편성·집행', '책임자 권한·평가', '전문인력 배치', '종사자 의견 청취', '비상대응 매뉴얼', '도급 평가 기준'];
var R4 = ['관계 법령 의무 반기 점검', '재발방지 대책', '개선·시정명령 이행', '이행 기록 5년 보관'];
TPL.exec = { bed: 'office', c2: '의무를 어겨 중대산업재해가 나면 경영책임자가 처벌받습니다.', g: ['반기 1회 점검', '미흡하면 인력·예산', '기록 5년 보관'],
  sfx0: [[1.6, 'pop']], sfx1: [[.5, 'alarm'], [1.3, 'pop'], [2.0, 'pop'], [2.7, 'gavel']], sfx2: [[1.4, 'tick'], [2.0, 'ding']],
  board: function (m, t, now, vr) { var rows = vr.rows || R9, n = rows.length, rh = Math.min(50, 400 / n), bad = vr.bad || (vr.hi != null ? [vr.hi] : []);
    panel(500, 160, 660, 80 + n * rh, vr.title || '안전보건관리체계', m === 2 ? P.green : P.orange);
    rows.forEach(function (s, i) { var y = 226 + i * rh, k = ap(t, .5 + i * .1, .3), isBad = bad.indexOf(i) >= 0, blink = isBad && m === 0 && Math.sin(now * 6) > -.2;
      alpha(k, function () { if (isBad) box(514, y - 6, 632, rh - 6, m === 2 ? 'rgba(87,227,154,.14)' : 'rgba(255,90,90,' + (blink ? .22 : .1) + ')', 8, m === 2 ? P.green : P.red, 2);
        txt((i + 1) + '', 536, y + rh / 2 + 3, 22, P.muted, 'center', 700); txt(s, 566, y + rh / 2 + 4, 24, isBad ? P.text : (m === 2 ? P.text : P.muted), 'left', isBad ? 800 : 600); });
      if (isBad && m === 0) cross(1114, y + rh / 2 - 6, ap(t, 1.6 + bad.indexOf(i) * .2, .3), P.red, 11); else tick(1112, y + rh / 2 - 6, isBad ? ap(t, 1.4, .4) : k * .999, isBad ? P.green : 'rgba(143,163,177,.6)'); });
  },
  draw: function (m, t, now, vr) { blueprint(); box(0, 600, 1200, 120, '#0b141d'); line(0, 600, 1200, 600, '#22384b', 3);
    if (m === 1) { building(110, 600, 250, 250, null); siren(235, 348, now, true); rings(235, 470, now, 'rgba(255,90,90,.8)', 30, 150, 3, 1);
      var steps = ['의무 위반', '중대산업재해', '경영책임자 처벌'];
      steps.forEach(function (s, i) { var k = pop(t, 1.3 + i * .7), x = 440 + i * 250; if (k > 0) { cx().save(); cx().translate(x + 100, 330); cx().scale(clamp(k, 0, 1.15), clamp(k, 0, 1.15)); box(-110, -44, 220, 88, 'rgba(6,13,22,.94)', 14, i === 2 ? P.red : P.amber, 3); txt(s, 0, 9, 25, P.text, 'center', 800); cx().restore(); } if (i < 2) arrow(x + 214, 330, x + 246, 330, P.amber, 5, clamp((t - 1.7 - i * .7) / .3)); });
      alpha(ap(t, 2.9), function () { txt('의무 위반 + 재해 발생 + 인과관계', 440, 452, 24, P.muted, 'left', 700); }); gavel(1010, 530, t, 2.7);
    } else { box(140, 500, 260, 16, '#6b4a2b', 5); box(160, 516, 14, 84, '#4a321c', 3); box(366, 516, 14, 84, '#4a321c', 3); person(110, 600, 1.7, { pose: 'sit', suit: true }); box(200, 452, 180, 48, '#eef3f1', 6); txt('경영책임자', 290, 485, 24, '#16283a', 'center', 800);
      this.board(m, t, now, vr);
      if (m === 0) tag(150, 300, (vr.bad && vr.bad.length > 1) ? '여러 의무 미이행' : '미이행', 'bad', pop(t, 1.9));
      if (m === 2) { tag(150, 250, '반기 1회 점검', 'good', pop(t, 1.6)); tag(150, 314, '기록 5년 보관', 'good', pop(t, 2.1)); } }
  } };

/* ---------- ④ 처벌 장면 (데이터에서 읽음) ---------- */
function shortPen(s) { s = String(s || ''); var m = s.match(/(\d+년 (?:이하|이상)의 징역 또는 [^().]*?이하의 벌금)/) || s.match(/([0-9천백억만]+원 이하의 (?:벌금|과태료|과징금))/); if (m) return m[1]; return s.split(/[.(]/)[0]; }
function penCards(v) { var c = [];
  if (v.crime) c.push({ k: '형사처벌', col: P.red, main: shortPen(v.crime) });
  if (v.crimeDeath) c.push({ k: '근로자 사망 시', col: '#ff8a8a', main: shortPen(v.crimeDeath) });
  if (v.fine) { var sub = ''; if (v.fineTable && v.fineTable.rows && v.fineTable.rows[1]) { var r = v.fineTable.rows[1]; sub = '1차 ' + r[1] + ' · 2차 ' + r[2] + ' · 3차 이상 ' + r[3]; if (sub.length > 44) sub = ''; }
    c.push({ k: '과태료', col: P.amber, main: /없음/.test(v.fine) ? '현재 없음 · ' + (v.fineShort || '') + ' 적용' : (v.fineShort || shortPen(v.fine)), sub: sub }); }
  if (!v.crime && !v.fine && v.penaltyNote) c.push({ k: v.admin ? '행정제재' : '처벌', col: P.cyan, main: v.penaltyNote });
  if (v.corp && c.length < 4) c.push({ k: '법인', col: P.muted, main: /10억/.test(v.corp) ? '사망 시 10억원 이하 벌금 등' : /50억/.test(v.corp) ? '사망 50억원 · 부상 10억원 이하 벌금' : shortPen(v.corp) });
  return c.slice(0, 4); }
function penCaption(v) { var p = [];
  if (v.crime) p.push('형사처벌은 ' + shortPen(v.crime) + '입니다.');
  if (v.crimeDeath) p.push('근로자가 사망하면 ' + shortPen(v.crimeDeath) + '입니다.');
  if (v.fine) p.push(/없음/.test(v.fine) ? '지금은 과태료가 없지만 ' + (v.fineShort || '') + ' 적용됩니다.' : '과태료는 ' + (v.fineShort || shortPen(v.fine)) + '입니다.');
  if (!p.length) p.push(v.penaltyNote ? v.penaltyNote + '.' : '처벌 규정을 상세 화면에서 확인하세요.');
  if (v.law === '중대재해처벌법' && v.crime && v.id.indexOf('sapa-4') === 0) p = ['이 의무 위반만으로는 처벌되지 않지만, 중대산업재해가 나면 사망 시 1년 이상 징역 또는 10억원 이하 벌금입니다.'];
  return p.join(' '); }
function penScene(v) { var cards = penCards(v), sfx = [[.5, 'gavel'], [1.1, 'gavel']]; cards.forEach(function (c0, i) { sfx.push([1.4 + i * .6, 'stamp']); });
  return { name: '처벌', cap: penCaption(v), bed: 'court', sfx: sfx, dur: Math.max(6.5, 3.4 + cards.length * .9 + penCaption(v).length * .05),
    draw: function (t, now) { blueprint(); gavel(240, 430, t, .5);
      alpha(ap(t, .3), function () { txt(v.law, 240, 560, 22, P.muted, 'center', 700); });
      var ch = Math.min(132, 470 / Math.max(1, cards.length));
      cards.forEach(function (c0, i) { var k = ap(t, 1.4 + i * .6, .4), y = 160 + i * (ch + 10); alpha(k, function () { var x = 470 + (1 - k) * 40;
        box(x, y, 690, ch, 'rgba(6,13,22,.92)', 14, c0.col, 2.5); box(x, y, 12, ch, c0.col, 6);
        txt(c0.k, x + 34, y + 36, 23, c0.col, 'left', 800);
        if (c0.sub) { wrap(c0.main, x + 34, y + 74, 630, 32, 30, P.text, 800, 1); txt(c0.sub, x + 34, y + ch - 14, 22, P.muted, 'left', 600); }
        else wrap(c0.main, x + 34, y + 76, 630, 34, ch > 110 ? 30 : 27, P.text, 800, ch > 110 ? 2 : 1); }); });
      alpha(ap(t, 1.6 + cards.length * .6), function () { txt('실제 처분은 위반 내용과 횟수에 따라 달라집니다', 815, 668, 19, P.dim, 'center', 600); });
    } }; }

/* ============================================================
   위반사례 → 틀·자막 연결
   M(id, 틀, 변형, 첫 장면 자막, { g: 세 번째 장면 체크 항목, c2: 둘째 장면 자막, ... })
   ============================================================ */
var MAP = {};
function M(id, tpl, k, c1, o) { o = o || {}; o.k = k; MAP[id] = { tpl: tpl, c1: c1, vr: o }; }
/* 산업안전보건법 */
M('osh-14', 'desk', 'doc', '대표이사가 올해 안전보건계획을 이사회에 보고하지 않았습니다.', { doc: '안전보건계획', g: ['매년 계획 수립', '이사회 보고·승인', '의사록 보관'] });
M('osh-15', 'desk', 'seat', '사업장을 총괄하는 안전보건관리책임자를 정하지 않았습니다.', { role: '관리책임자', g: ['총괄 책임자 지정', '총괄 업무 명시', '직무교육 이수'] });
M('osh-16', 'desk', 'seat', '관리감독자가 점검·지도 같은 안전 직무를 하지 않고 있습니다.', { role: '관리감독자', T: ['안전 직무를 하지 않음'], g: ['직무를 업무분장에', '작업 전 점검 기록', '보호구 착용 지도'] });
M('osh-17', 'desk', 'seat', '선임해야 할 안전관리자가 없습니다.', { role: '안전관리자', g: ['기준에 맞게 선임', '14일 이내 보고', '공백 없이 후임 지정'] });
M('osh-18', 'desk', 'seat', '선임해야 할 보건관리자가 없습니다.', { role: '보건관리자', g: ['기준에 맞게 선임', '14일 이내 보고', '전문기관 위탁 가능'] });
M('osh-19', 'desk', 'seat', '20명 이상 50명 미만 사업장인데 안전보건관리담당자가 없습니다.', { role: '관리담당자', g: ['담당자 1명 이상', '대상 업종 확인', '보수교육 이수'] });
M('osh-24', 'desk', 'meet', '산업안전보건위원회를 구성하지 않았거나 분기 회의를 열지 않았습니다.', { g: ['노사 같은 수로 구성', '분기마다 정기회의', '회의록 작성'] });
M('osh-25', 'desk', 'doc', '작성해야 할 안전보건관리규정이 없습니다.', { doc: '안전보건관리규정', g: ['30일 이내 작성', '위원회 심의·의결', '게시·비치'] });
M('osh-36', 'desk', 'doc', '유해·위험요인을 찾아 줄이는 위험성평가를 하지 않았습니다.', { doc: '위험성평가', stamp: '미실시', notice: '점검 결과', T: ['위험성평가 미실시'], c2: '위험을 모른 채 작업이 이어집니다. 2027년부터는 과태료 대상이 됩니다.', g: ['매년·수시로 실시', '근로자 참여', '결과 3년 보존'] });
M('osh-29-1', 'desk', 'edu', '근로자와 관리감독자 정기교육을 하지 않았습니다.', { doc: '정기 안전보건교육', g: ['반기별 교육', '관리감독자 연 16시간', '교육일지 보관'] });
M('osh-29-2', 'desk', 'edu', '새로 들어온 근로자를 교육 없이 바로 작업에 투입했습니다.', { doc: '채용 시 교육', g: ['투입 전에 교육', '일용직도 대상', '출석부 남기기'] });
M('osh-29-3', 'desk', 'edu', '유해·위험 작업에 배치하면서 특별교육을 하지 않았습니다.', { doc: '특별교육', g: ['배치 전 특별교육', '대상 작업 확인', '교육 기록 보관'] });
M('osh-32', 'desk', 'edu', '안전관리자 등이 신규·보수 직무교육을 받지 않았습니다.', { doc: '직무교육', g: ['선임 후 3개월 내', '2년마다 보수교육', '이수증 보관'] });
M('osh-34', 'desk', 'board', '법령 요지와 안전보건관리규정을 게시하지 않았습니다.', { doc: '법령 요지', g: ['법령 요지 게시', '규정 비치', '보기 쉬운 장소'] });
M('osh-37', 'desk', 'board', '위험한 장소에 안전보건표지를 붙이지 않았습니다.', { doc: '안전표지', T: ['표지를 붙이지 않음'], g: ['위험 장소마다 표지', '외국어 표지 병행', '훼손되면 교체'] });
M('osh-38', 'fall', 'deck', '추락·끼임 같은 위험에 필요한 안전조치를 하지 않았습니다.', { g: ['위험성평가', '규칙의 기준 확인', '작업 전 점검'] });
M('osh-39', 'confined', 'measure', '질식·중독 같은 건강장해를 막는 보건조치를 하지 않았습니다.', { g: ['유해인자 파악', '환기·보호구', '측정·건강진단'] });
M('osh-41', 'health', 'customer', '고객의 폭언에 시달리는 근로자를 보호하지 않았습니다.', { g: ['폭언 금지 안내', '업무 중단·전환', '치료·상담 지원'] });
M('osh-52', 'emg', 'fair', '위험해서 작업을 멈춘 근로자에게 불이익을 주었습니다.', { stamp: '부당', g: ['작업중지권 보장', '불리한 처우 금지', '조치 결과 기록'] });
M('osh-53', 'emg', 'cmd', '고용노동부의 시정·사용중지 명령을 따르지 않았습니다.', { stamp: '명령 위반', g: ['기한 안에 조치', '명령 사항 게시', '결과 보고'] });
M('osh-54-1', 'emg', 'stop', '중대재해가 났는데도 작업을 멈추지 않았습니다.', { g: ['즉시 작업중지', '근로자 대피', '추가 피해 방지'] });
M('osh-54-2', 'emg', 'report', '중대재해가 난 사실을 고용노동관서에 알리지 않았습니다.', { stamp: '미보고', g: ['지체 없이 보고', '전화·팩스 등', '개요·피해·조치'] });
M('osh-55', 'emg', 'order', '작업중지명령이 내려졌는데 작업을 계속했습니다.', { stamp: '명령 위반', g: ['명령 범위 확인', '안전조치 완료', '해제 신청'] });
M('osh-56', 'emg', 'keep', '원인조사가 끝나기 전에 사고 현장을 치웠습니다.', { stamp: '현장 훼손', g: ['현장 그대로 보존', '출입 통제', '기록·영상 확보'] });
M('osh-57-1', 'emg', 'hide', '산업재해가 났는데 발생 사실을 숨겼습니다.', { stamp: '은폐', g: ['숨기지 않기', '산재로 처리', '조사표 제출'] });
M('osh-57-3', 'emg', 'hide', '3일 이상 쉬어야 하는 재해가 났는데 산업재해조사표를 내지 않았습니다.', { stamp: '미보고', T: ['조사표를 내지 않음'], g: ['1개월 이내 제출', '근로자대표 확인', '재발방지 계획'] });
M('osh-58', 'contract', 'ban', '도금·수은·납·카드뮴 작업을 승인 없이 사내 하청에 맡겼습니다.', { g: ['유해작업 도급 금지', '예외는 승인 필요', '원청이 직접 수행'] });
M('osh-63', 'contract', 'safe', '하청 근로자가 일하는 곳에 원청이 안전시설을 갖추지 않았습니다.', { g: ['원청이 안전시설', '역할을 문서로', '위험 장소 점검'] });
M('osh-64', 'contract', 'council', '원청이 협의체 회의와 작업장 순회점검을 하지 않았습니다.', { g: ['협의체 매월 1회', '순회점검', '합동 안전점검'] });
M('osh-42', 'desk', 'doc', '유해위험방지계획서를 내지 않고 공사를 시작했습니다.', { doc: '유해위험방지계획서', T: ['제출하지 않고 착공'], g: ['착공 전 제출', '심사 후 착공', '현장에 비치'] });
M('osh-72', 'desk', 'doc', '산업안전보건관리비를 계상하지 않거나 다른 곳에 썼습니다.', { doc: '안전보건관리비', T: ['미계상·목적 외 사용'], g: ['관리비 계상', '정해진 용도만', '사용명세서 보존'] });
M('osh-80', 'caught', 'prot', '방호조치가 없는 기계를 사용하도록 내놓았습니다.', { g: ['방호장치 부착', '해체 금지', '상시 점검'] });
M('osh-87', 'caught', 'cert', '안전인증을 받지 않은 기계를 쓰고 있습니다.', { g: ['인증 표시 확인', '인증품만 구매', '부적합 시 중지'] });
M('osh-93', 'caught', 'insp', '안전검사 기한이 지난 기계를 계속 쓰고 있습니다.', { g: ['검사 주기 관리', '합격증명서 부착', '불합격 기계 금지'] });
M('osh-110', 'chem', 'submit', '화학제품을 만들거나 들여오면서 물질안전보건자료를 제출하지 않았습니다.', { g: ['제조·수입 전 제출', '받는 쪽에 제공', '변경 시 다시 제출'] });
M('osh-114', 'chem', 'post', '취급하는 화학물질의 물질안전보건자료를 작업장에 두지 않았습니다.', { g: ['취급 장소에 비치', '최신본 유지', '취급자 교육'] });
M('osh-115', 'chem', 'label', '화학물질 용기에 경고표시가 없습니다.', { g: ['용기마다 경고표시', '옮겨 담은 용기도', '훼손 시 다시 부착'] });
M('osh-125', 'health', 'measure', '소음·분진·유기용제 작업장의 작업환경측정을 하지 않았습니다.', { g: ['6개월마다 측정', '결과 알리기', '초과 시 시설 개선'] });
M('osh-129', 'health', 'checkup', '근로자 일반건강진단을 실시하지 않았습니다.', { g: ['사무직 2년 1회', '그 밖 1년 1회', '결과 통보·보존'] });
M('osh-130', 'health', 'checkup', '유해인자에 노출되는 근로자의 특수건강진단을 하지 않았습니다.', { g: ['배치 전 건강진단', '주기별 특수검진', '결과에 따른 조치'] });
M('osh-44', 'chem', 'psm', '공정안전보고서 적합 통보를 받기 전에 위험 설비를 가동했습니다.', { g: ['보고서 제출', '적합 통보 후 가동', '보고서 내용 준수'] });
/* 안전보건규칙 */
M('rule-42', 'fall', 'deck', '작업발판도 방호망도 없이 높은 곳에서 작업합니다.', { g: ['작업발판 설치', '추락방호망', '안전대 착용'] });
M('rule-42-4', 'fall', 'ladder', '이동식 사다리 맨 위 칸에 올라서서 작업합니다.', { g: ['최상부 발판 금지', '높이 3.5m 이하', '넘어짐 방지·안전모'] });
M('rule-24', 'fall', 'ladder', '통로로 쓰는 사다리가 기준에 맞지 않게 놓여 있습니다.', { g: ['상단 60cm 이상', '미끄럼 방지', '기울기 75도 이하'] });
M('rule-13', 'fall', 'rail', '안전난간이 기준보다 낮고 발끝막이판이 없습니다.', { g: ['상부 난간 90cm 이상', '중간 난간대', '발끝막이판 10cm'] });
M('rule-43', 'fall', 'hole', '바닥 개구부에 덮개나 난간이 없습니다.', { g: ['덮개 고정', '개구부 표시', '안전난간'] });
M('rule-44', 'fall', 'anchor', '안전대는 지급했지만 걸 곳이 없습니다.', { g: ['부착설비 설치', '로프 처짐 방지', '작업 전 점검'] });
M('rule-92', 'caught', 'lock', '기계를 멈추지 않고 정비·청소를 합니다.', { g: ['운전 정지', '잠금장치·열쇠 관리', '정비 중 표지'] });
M('rule-87', 'caught', 'cover', '돌아가는 축과 벨트에 덮개가 없습니다.', { g: ['덮개·울 설치', '연동장치', '열면 정지'] });
M('rule-93', 'caught', 'guard', '설치된 방호장치를 떼어내고 기계를 씁니다.', { g: ['방호장치 유지', '수리 후 즉시 복구', '우회 금지'] });
M('rule-192', 'caught', 'estop', '컨베이어에 비상정지장치가 없습니다.', { g: ['비상정지장치', '손 닿는 위치', '매일 작동 확인'] });
M('rule-123', 'caught', 'roller', '롤러기 물림점에 울이 없습니다.', { g: ['울·가이드롤러', '정지 후 이물 제거', '잠금'] });
M('rule-172', 'vehicle', 'hit', '지게차가 다니는 곳을 사람이 그대로 지나다닙니다.', { g: ['출입 통제', '유도자 배치', '보행 통로 분리'] });
M('rule-171', 'vehicle', 'tip', '경사지고 무른 곳에서 유도자 없이 지게차를 몹니다.', { g: ['유도자 배치', '지반 침하 방지', '갓길 붕괴 방지'] });
M('rule-179', 'vehicle', 'light', '전조등과 후진경보기가 없는 지게차를 씁니다.', { g: ['전조등·후미등', '후진경보기·경광등', '작업 전 점검'] });
M('rule-180', 'vehicle', 'guard', '헤드가드 없는 지게차로 높이 쌓인 짐을 다룹니다.', { g: ['헤드가드 장착', '개조 금지', '백레스트 확인'] });
M('rule-199', 'vehicle', 'etip', '굴착기가 무른 갓길 끝에서 작업합니다.', { g: ['유도자 배치', '갓길 붕괴 방지', '도로 폭 유지'] });
M('rule-200', 'vehicle', 'swing', '굴착기 작업반경 안에서 사람이 일합니다.', { g: ['작업반경 출입금지', '유도자 배치', '신호 후 접근'] });
M('rule-133', 'crane', 'label', '크레인과 달기구에 정격하중 표시가 없습니다.', { g: ['정격하중 표시', '달기구에도 표시', '지워지면 교체'] });
M('rule-134', 'crane', 'over', '과부하방지장치가 듣지 않는 크레인을 씁니다.', { g: ['과부하방지장치', '권과방지장치', '비상정지 확인'] });
M('rule-137', 'crane', 'hook', '훅 해지장치 없이 짐을 들어 올립니다.', { g: ['해지장치 사용', '걸쇠 상태 확인', '불량 시 교체'] });
M('rule-241', 'fire', 'spark', '가연물 옆에서 불티를 막지 않고 용접합니다.', { g: ['비산방지·방화포', '가연물 치우기', '소화기 비치'] });
M('rule-241-2', 'fire', 'watch', '가연물이 가까운데 화재감시자 없이 용접합니다.', { g: ['화재감시자 지정', '확성기·대피마스크', '작업 내내 감시'] });
M('rule-301', 'elec', 'live', '분전반 충전부가 드러나 있습니다.', { g: ['외함·절연덮개', '분전반 문 잠금', '위험 표시'] });
M('rule-302', 'elec', 'ground', '전동기계 외함을 접지하지 않았습니다.', { g: ['외함 접지', '접지형 플러그', '접지선 점검'] });
M('rule-304', 'elec', 'elcb', '물기 있는 곳에서 누전차단기 없이 전동공구를 씁니다.', { g: ['누전차단기 30mA', '기기마다 설치', '작업 전 시험'] });
M('rule-319', 'elec', 'lock', '전원을 끊지 않고 전기 작업을 합니다.', { g: ['전원 차단', '잠금·꼬리표', '검전·접지'] });
M('rule-339', 'collapse', 'slope', '굴착면을 기준보다 가파르게 팠습니다.', { g: ['기울기 기준', '흙막이 설치', '빗물 침투 방지'] });
M('rule-338', 'collapse', 'inspect', '균열과 용수를 살피지 않고 굴착을 시작합니다.', { g: ['균열·부석 점검', '용수·동결 확인', '비 온 뒤 재점검'] });
M('rule-340', 'collapse', 'shore', '무너질 수 있는 굴착 바닥에 흙막이 없이 들어갑니다.', { g: ['흙막이 지보공', '출입 금지', '가장자리 적치 금지'] });
M('rule-347', 'collapse', 'monitor', '흙막이 지보공을 점검하지도 계측하지도 않습니다.', { g: ['정기 점검', '설계대로 계측', '이상 시 즉시 보강'] });
M('rule-619', 'confined', 'program', '출입 확인 절차 없이 밀폐공간에 들어갑니다.', { g: ['작업 프로그램', '작업 전 확인·게시', '6개월마다 훈련'] });
M('rule-619-2', 'confined', 'measure', '산소와 유해가스를 재지 않고 들어갑니다.', { g: ['작업 전 농도 측정', '재개 전에도 측정', '기록 3년 보존'] });
M('rule-620', 'confined', 'vent', '환기하지 않은 밀폐공간에서 작업합니다.', { g: ['작업 전·중 환기', '불가 시 송기마스크', '방독마스크는 불가'] });
M('rule-621', 'confined', 'count', '누가 들어갔는지 인원을 확인하지 않습니다.', { g: ['입장 때 인원 점검', '퇴장 때 인원 점검', '명패 걸이판'] });
M('rule-622', 'confined', 'sign', '밀폐공간에 출입금지 표지가 없습니다.', { g: ['밀폐공간 목록화', '출입금지 표지', '평소 덮개 잠금'] });
M('rule-623', 'confined', 'watch', '밖에서 지켜보는 감시인이 없습니다.', { g: ['감시인 상시 배치', '이상 시 119 신고', '상시 연락설비'] });
M('rule-624', 'confined', 'ppe', '송기마스크와 구명밧줄 없이 내려갑니다.', { g: ['송기마스크', '안전대·구명밧줄', '체결 설비'] });
M('rule-625', 'confined', 'rescue', '비상시 구출할 기구가 준비되어 있지 않습니다.', { g: ['공기호흡기 비치', '사다리·섬유로프', '위치·사용법 교육'] });
M('rule-560', 'heat', 'rest', '체감온도 33도가 넘는데 쉬지 않고 일합니다.', { g: ['2시간마다 20분', '냉방·시간대 조정', '물·그늘 준비'] });
M('rule-562', 'heat', 'record', '온·습도계도 체감온도 기록도 없습니다.', { g: ['온·습도계 비치', '체감온도 일지', '의심 시 119 신고'] });
M('rule-567', 'heat', 'shade', '폭염 속 옥외작업에 그늘과 물이 없습니다.', { g: ['그늘진 휴식 장소', '소금·깨끗한 물', '가까운 곳에 설치'] });
M('rule-657', 'health', 'msd', '무거운 물건을 반복해 드는 작업의 유해요인조사를 하지 않았습니다.', { g: ['3년마다 조사', '발생 시 1개월 내', '근로자 참여'] });
M('rule-669', 'health', 'stress', '야간·교대 근무자의 직무스트레스를 관리하지 않습니다.', { g: ['스트레스 요인 평가', '근무·휴식 배분', '뇌심혈관 평가'] });
M('rule-32', 'fall', 'deck', '안전모·안전대 같은 보호구를 지급하지 않았습니다.', { nohat: true, g: ['작업자 수 이상 지급', '작업에 맞는 보호구', '착용 확인'] });
M('rule-38', 'desk', 'doc', '지게차·중량물 작업을 사전조사와 작업계획서 없이 시작합니다.', { doc: '작업계획서', stamp: '위반', notice: '점검 결과', c2: '계획 없이 시작한 작업에서 부딪힘·깔림 사고가 납니다. 적발되면 형사처벌 대상입니다.', g: ['사전조사·기록', '작업계획서 작성', '근로자에게 알림'] });
M('rule-39', 'vehicle', 'hit', '작업계획서가 필요한 작업에 작업지휘자가 없습니다.', { g: ['작업지휘자 지정', '계획서대로 지휘', '누구인지 표시'] });
/* 중대재해처벌법 */
M('sapa-death', 'exec', null, '안전보건관리체계 의무를 지키지 않은 사업장에서 근로자가 사망했습니다.', { bad: [2, 4, 7] });
M('sapa-injury', 'exec', null, '의무를 지키지 않아 여러 명이 다치거나 직업성 질병에 걸렸습니다.', { bad: [2, 4] });
['안전·보건 목표와 경영방침을 정하지 않았습니다.', '대상 기업인데 안전·보건 전담 조직이 없습니다.', '유해·위험요인을 확인하고 고치는 절차가 없거나 반기 점검을 하지 않았습니다.', '재해예방에 필요한 예산을 편성하지 않았거나 쓰지 않았습니다.',
  '안전보건관리책임자 등을 평가하는 기준이 없고 반기 평가도 하지 않았습니다.', '법에서 정한 수의 안전·보건 전문인력을 배치하지 않았습니다.', '종사자 의견을 듣는 절차가 없습니다.', '중대산업재해에 대비한 매뉴얼이 없습니다.', '협력업체의 안전 역량을 평가하는 기준과 절차가 없습니다.']
  .forEach(function (c1, i) { M('sapa-4-' + (i + 1), 'exec', null, c1, { hi: i }); });
M('sapa-5', 'exec', null, '안전·보건 관계 법령을 지키는지 반기마다 점검하지 않았습니다.', { rows: R4, hi: 0, title: '이행 관리' });
M('sapa-recur', 'exec', null, '재해가 났는데 재발방지 대책을 세우지 않았습니다.', { rows: R4, hi: 1, title: '이행 관리' });
M('sapa-order', 'exec', null, '행정기관의 개선·시정명령을 이행하지 않았습니다.', { rows: R4, hi: 2, title: '이행 관리' });
M('sapa-records', 'exec', null, '의무를 이행한 기록을 남기지 않았습니다.', { rows: R4, hi: 3, title: '이행 관리', c2: '사고가 나면 의무를 이행했다는 것을 증명할 길이 없습니다.' });
M('sapa-edu', 'exec', null, '중대산업재해가 난 회사의 경영책임자가 안전보건교육을 받지 않았습니다.', { rows: ['교육 대상 통보', '안전보건교육 이수 (20시간 범위)', '이수확인서 보관'], hi: 1, title: '경영책임자 교육', c2: '정당한 사유 없이 받지 않으면 과태료가 부과됩니다.' });
M('sapa-damages', 'exec', null, '고의나 중대한 과실로 의무를 어겨 중대재해가 났습니다.', { rows: ['고의 또는 중대한 과실', '법에서 정한 의무 위반', '중대재해 발생', '손해액의 5배 이내 배상'], bad: [0, 1], title: '손해배상 책임', c2: '형사처벌과 별도로 손해액의 5배까지 배상책임을 집니다.' });

/* ---------- 이야기 만들기 ---------- */
function build(v) { var m = MAP[v.id]; if (!m) return null; var tpl = TPL[m.tpl], vr = m.vr, k = vr.k;
  if (!vr.g) vr.g = tpl.g;
  var n = vr.g.length, s2 = (tpl.sfx2 || []).slice(), i;
  if (m.tpl !== 'exec') { for (i = 0; i < n; i++) s2.push([(m.tpl === 'confined' ? 1.2 : m.tpl === 'heat' ? 1.4 : m.tpl === 'health' ? 1.3 : 1.2) + i * .5, 'tick']); s2.push([1.4 + n * .5, 'ding']); }
  var envBed = (tpl.BED && tpl.BED[k]) || tpl.bed;
  function mk(mode) { return function (t, now) { tpl.draw(mode, t, now, vr); }; }
  return { title: v.name, scenes: [
    { name: '어떤 위반인가', cap: m.c1, bed: envBed, sfx: (tpl.sfx0 || []).concat([[1.3, 'pop']]), draw: mk(0) },
    { name: '무슨 일이 생기나', cap: vr.c2 || (tpl.C2 && tpl.C2[k]) || tpl.c2, bed: 'tense', sfx: tpl.sfx1 || [], draw: mk(1) },
    { name: '이렇게 지킵니다', cap: v.tip || '기준을 확인하고 작업 전에 점검하세요.', bed: 'calm', sfx: s2, draw: mk(2) },
    penScene(v)
  ] }; }
/* 중대재해 발생 시 대응 — 사고 대응 틀의 '올바른 상태'를 순서대로 */
function emergency(E) { var kinds = ['stop', 'report', 'keep', 'order', 'hide'], names = ['작업중지·대피', '지체 없이 보고', '현장 보존', '작업중지명령', '조사표 제출'],
    gs = [['즉시 작업중지', '근로자 대피', '119 신고·응급조치'], ['지방고용노동관서', '전화·팩스 등', '개요·피해·조치'], ['현장 그대로 두기', '출입 통제', '기록·영상 확보'], ['명령 범위 확인', '안전조치 완료', '해제 신청'], ['1개월 이내 제출', '근로자대표 확인', '숨기지 않기']];
  return { title: '중대재해 발생 시 대응', scenes: kinds.map(function (k, i) { var st = E.steps[i], vr = { k: k, g: gs[i] }, sfx = (i === 0 ? [[.3, 'siren']] : []).concat(TPL.emg.sfx2 || []);
    gs[i].forEach(function (x, j) { sfx.push([1.2 + j * .5, 'tick']); });
    return { name: names[i], cap: st.when + ' — ' + st.items[0], bed: i === 0 ? 'tense' : 'calm', sfx: sfx, draw: function (t, now) { TPL.emg.draw(2, t, now, vr); } }; }) }; }

window.SAFE_SCENES = { build: build, emergency: emergency, has: function (id) { return !!MAP[id]; }, ids: function () { return Object.keys(MAP); }, TPL: TPL };
})();
