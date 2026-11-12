/*! 안전비서 — 통합 검색
 *  1) 낱말 검색: 모든 낱말이 들어 있는 항목(제목에 있으면 더 위로)
 *  2) 결과가 3건 미만이면 문장형 검색: ask.js 사전으로 현장어를 법령 용어로 넓혀 관련도 순 정렬
 *  브라우저와 Node(tools/ask-test.cjs) 양쪽에서 동작합니다.
 */
(function (root) {
'use strict';
function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' '); }
var JOSA = /(에서는|으로는|에서|으로|에게|까지|부터|이랑|하고|이나|은|는|이|가|을|를|에|의|도|로|와|과|만|요)$/;
function tokens(q) {
  return norm(q).replace(/[?!.,~"'()·]/g, ' ').split(' ').filter(Boolean).map(function (t) {
    return t.length > 2 ? t.replace(JOSA, '') : t;
  }).filter(Boolean);
}
function buildIndex(D) {
  var docs = [], laws = Object.keys(D.meta.laws);
  D.violations.forEach(function (v) {
    docs.push({ type: 'v', law: v.law, id: v.id, title: v.name, sub: v.article,
      head: norm(v.name + ' ' + (v.keywords || []).join(' ') + ' ' + v.group),
      hay: norm([v.name, v.group, v.article, v.basis, v.text, (v.points || []).join(' '), v.crime, v.crimeDeath, v.fine, v.admin, v.penaltyNote, v.tip, (v.keywords || []).join(' ')].join(' ')) });
  });
  laws.forEach(function (law) {
    var m = (D.manuals && D.manuals[law]) || { tips: [], checklist: [] };
    m.tips.forEach(function (t, i) { docs.push({ type: 't', law: law, idx: i, title: t.title, sub: law + ' 관리요령', head: norm(t.title), hay: norm(t.title + ' ' + t.content.join(' ') + ' ' + (t.article || '')) }); });
    m.checklist.forEach(function (q) { docs.push({ type: 'c', law: law, id: q.id, title: q.q, sub: law + ' 자가점검' + (q.article ? ' · ' + q.article : ''), head: norm(q.q), hay: norm(q.q + ' ' + (q.article || '')) }); });
    ((D.refs && D.refs[law]) || []).forEach(function (r) {
      var body = (r.rows || []).map(function (x) { return x.join(' '); }).join(' ') + ' ' + (r.items || []).join(' ') + ' ' + (r.note || '') + ' ' + (r.desc || '');
      docs.push({ type: 'r', law: law, id: r.id, title: r.title, sub: law + ' 참고자료' + (r.basis ? ' · ' + r.basis : ''), head: norm(r.title + ' ' + (r.keywords || []).join(' ')), hay: norm(r.title + ' ' + body) });
    });
  });
  if (D.emergency) docs.push({ type: 'e', title: '중대재해 발생 시 대응 순서', sub: '작업중지 · 보고 · 현장보존 · 산업재해조사표',
    head: norm('중대재해 사망 사고 발생 대응 보고 작업중지 현장보존'),
    hay: norm(D.emergency.steps.map(function (s) { return s.title + ' ' + s.items.join(' '); }).join(' ')) });
  return docs;
}
function create(D, ask) {
  var INDEX = null;
  function search(q) {
    if (!INDEX) INDEX = buildIndex(D);
    var toks = tokens(q); if (!toks.length) return { items: [], terms: [], mode: 'none' };
    var and = INDEX.filter(function (d) { return toks.every(function (t) { return d.hay.indexOf(t) >= 0; }); });
    and.forEach(function (d) { d._s = toks.reduce(function (a, t) { return a + (d.head.indexOf(t) >= 0 ? 3 : 1); }, 0) + (d.type === 'v' ? 0.5 : 0); });
    and.sort(function (a, b) { return b._s - a._s; });
    if (and.length >= 3 || !ask) return { items: and, terms: toks, mode: 'keyword' };
    var ex = ask.expand(q, toks);
    var scored = INDEX.map(function (d) {
      var s = 0;
      ex.terms.forEach(function (t) { if (d.head.indexOf(t.t) >= 0) s += 3 * t.w; else if (d.hay.indexOf(t.t) >= 0) s += t.w; });
      if (and.indexOf(d) >= 0) s += 10;
      if (s > 0 && d.type === 'v') s += 0.5;
      if (s > 0 && ex.laws.length && d.law && ex.laws.indexOf(d.law) >= 0) s += 1;
      return { d: d, s: s };
    }).filter(function (x) { return x.s >= 2; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.d; });
    return { items: scored.slice(0, 40), terms: ex.terms.map(function (t) { return t.t; }), mode: 'ask', topics: ex.topics };
  }
  return { search: search, tokens: tokens };
}
root.SAFE_SEARCH = { create: create, tokens: tokens, norm: norm };
})(typeof window !== 'undefined' ? window : globalThis);
