// 안전비서 — 데이터 점검: 필수 필드, 중복 id, 끊어진 참조(vids), 법령 키, 처벌 정보 누락
// 사용: node tools/check-data.cjs
const { D } = require('./load.cjs')();
const errors = [], warns = [];
const laws = Object.keys(D.meta.laws);
const ids = new Set();
for (const v of D.violations) {
  if (ids.has(v.id)) errors.push('중복 id: ' + v.id);
  ids.add(v.id);
  for (const k of ['id', 'law', 'group', 'name', 'article']) if (!v[k]) errors.push(v.id + ': ' + k + ' 없음');
  if (!laws.includes(v.law)) errors.push(v.id + ': 알 수 없는 법령 ' + v.law);
  if (!v.crime && !v.fine && !v.admin && !v.penaltyNote) errors.push(v.id + ': 처벌·조치 정보가 하나도 없음');
  if (v.crime && !v.crimeShort) warns.push(v.id + ': crimeShort 없음');
  if (v.fine && !v.fineShort) warns.push(v.id + ': fineShort 없음');
  if (!['verified', 'partial', 'unverified'].includes(v.confidence)) errors.push(v.id + ': confidence 값 오류');
  if (!v.sources || !v.sources.length) warns.push(v.id + ': 출처 없음');
  if (v.fineTable && (!v.fineTable.rows || v.fineTable.rows.length < 2)) errors.push(v.id + ': fineTable 형식 오류');
  if (v.report && /\[\s*\]/.test(v.report)) warns.push(v.id + ': 빈 [ ] 슬롯');
}
const ref = (where, list) => (list || []).forEach(id => { if (!ids.has(id)) errors.push(where + ': 없는 위반사례 ' + id); });
for (const law of laws) {
  const m = D.manuals[law];
  if (!m) { errors.push(law + ': manuals 없음'); continue; }
  const qids = new Set();
  m.tips.forEach((t, i) => { if (!t.title || !t.content || !t.content.length) errors.push(law + ' 관리요령 ' + (i + 1) + ': 내용 없음'); ref(law + ' 관리요령 ' + t.title, t.vids); });
  m.checklist.forEach(q => { if (qids.has(q.id)) errors.push(law + ' 점검항목 중복 ' + q.id); qids.add(q.id); ref(law + ' 점검 ' + q.id, q.vids); });
  (D.refs[law] || []).forEach(r => ref(law + ' 참고자료 ' + r.id, r.vids));
}
(D.emergency.steps || []).forEach((s, i) => ref('대응 ' + (i + 1), s.vids));
const unlinked = D.violations.filter(v => !laws.some(l => D.manuals[l].checklist.some(q => (q.vids || []).includes(v.id))));
if (unlinked.length) warns.push('자가점검과 연결되지 않은 위반사례 ' + unlinked.length + '건: ' + unlinked.map(v => v.id).join(', '));
const by = {}; D.violations.forEach(v => { by[v.law] = by[v.law] || { n: 0, verified: 0, partial: 0, unverified: 0 }; by[v.law].n++; by[v.law][v.confidence]++; });
console.log('위반사례', D.violations.length, '건', JSON.stringify(by));
laws.forEach(l => console.log(l, '관리요령', D.manuals[l].tips.length, '· 점검항목', D.manuals[l].checklist.length, '· 참고자료', (D.refs[l] || []).length));
warns.forEach(w => console.log('주의', w));
errors.forEach(e => console.log('오류', e));
console.log(errors.length ? '실패: 오류 ' + errors.length + '건' : '통과');
process.exit(errors.length ? 1 : 0);
