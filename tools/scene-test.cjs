// 안전비서 — 모션그래픽 장면 점검: 모든 위반사례의 4장면을 여러 시각에서 가짜 캔버스에 그려 실행 오류를 찾습니다.
// 그림이 보기 좋은지는 브라우저에서 확인해야 합니다. 사용: node tools/scene-test.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const errors = [];
function fakeCtx() {
  const store = {};
  return new Proxy(store, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'measureText') return s => ({ width: String(s).length * 12 });
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (p === 'createPattern') return () => ({});
      return () => undefined;
    },
    set(t, p, v) { t[p] = v; return true; }
  });
}
const ctx = { console: { log: console.log, error: e => errors.push(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)) } };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.localStorage = { getItem: () => null, setItem() {} };
ctx.document = { createElement: () => ({ width: 0, height: 0, getContext: fakeCtx }) };
ctx.performance = { now: () => 0 };
vm.createContext(ctx);
for (const f of ['js/data.js', 'js/cine.js', 'js/scenes.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
const D = ctx.SAFE_DATA, C = ctx.SAFE_CINE, S = ctx.SAFE_SCENES;
let frames = 0, missing = [], total = 0, longCap = [];
const stories = D.violations.map(v => { const st = S.build(v); if (!st) missing.push(v.id); return [v.id, st]; }).filter(x => x[1]);
stories.push(['emergency', S.emergency(D.emergency)]);
for (const [id, st] of stories) {
  let dur = 0;
  st.scenes.forEach((sc, i) => {
    dur += C.sceneDur(sc);
    if (!sc.cap) errors.push(id + ' 장면 ' + (i + 1) + ': 자막 없음');
    if (sc.cap && sc.cap.length > 150) longCap.push(id + '#' + (i + 1) + ' ' + sc.cap.length + '자');
    for (const t of [0, 0.3, 0.9, 1.3, 1.7, 2.2, 3.0, 4.5]) { const before = errors.length; C.snap(st, i, t, 300); frames++; if (errors.length > before) errors[errors.length - 1] = id + ' 장면 ' + (i + 1) + ' t=' + t + ': ' + errors[errors.length - 1]; }
  });
  total += dur;
}
const uniq = [...new Set(errors)];
console.log('이야기', stories.length, '편 · 프레임', frames, '· 평균 길이', (total / stories.length).toFixed(1) + '초');
if (missing.length) console.log('장면 없는 위반사례:', missing.join(', '));
if (longCap.length) console.log('긴 자막:', longCap.join(', '));
uniq.slice(0, 25).forEach(e => console.log('오류', e));
console.log(uniq.length || missing.length ? '실패: 오류 ' + uniq.length + '종' : '통과');
process.exit(uniq.length || missing.length ? 1 : 0);
