// 안전비서 — 질문형 검색 점검: tools/ask-cases.json 의 각 질문에서 기대 항목이 상위 N개 안에 드는지 확인
// 사용: node tools/ask-test.cjs            (전체 사례)
//       node tools/ask-test.cjs "질문"     (한 질문 결과 보기)
const fs = require('fs');
const path = require('path');
const { SEARCH } = require('./load.cjs')();
const one = process.argv[2];
if (one) {
  const r = SEARCH.search(one);
  console.log('mode:', r.mode, '| topics:', (r.topics || []).join(', '));
  r.items.slice(0, 10).forEach((d, i) => console.log(String(i + 1).padStart(2), d.type, d.id || d.idx || '', d.title));
  process.exit(0);
}
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'ask-cases.json'), 'utf8'));
let fail = 0;
for (const c of cases) {
  const r = SEARCH.search(c.q);
  const top = r.items.filter(d => d.type === 'v').slice(0, c.top || 3).map(d => d.id);
  const ok = c.expect.some(id => top.includes(id));
  if (!ok) fail++;
  console.log((ok ? '통과 ' : '실패 ') + c.q + ' → ' + top.join(', ') + (ok ? '' : '  (기대: ' + c.expect.join(' 또는 ') + ')'));
}
console.log(fail ? '실패 ' + fail + '/' + cases.length : '모두 통과 ' + cases.length + '건');
process.exit(fail ? 1 : 0);
