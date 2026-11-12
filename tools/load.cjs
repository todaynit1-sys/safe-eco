// js/data.js · ask.js · search.js 를 Node에서 읽어 들이는 도우미 (브라우저 window 대신 globalThis)
const fs = require('fs');
const path = require('path');
const vm = require('vm');
module.exports = function load() {
  const root = path.resolve(__dirname, '..');
  const ctx = { console };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['js/data.js', 'js/ask.js', 'js/search.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  }
  return { D: ctx.SAFE_DATA, ASK: ctx.SAFE_ASK, SEARCH: ctx.SAFE_SEARCH.create(ctx.SAFE_DATA, ctx.SAFE_ASK) };
};
