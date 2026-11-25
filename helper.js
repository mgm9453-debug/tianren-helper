(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.天仁授權核心=factory();})(typeof window==='object'?window:globalThis,()=>{
  function create(a){
    let until=0,expires=0,allowed=false,epoch=0,dead=false;
    function reject(reason='授權已到期，請重新驗證'){
      if(dead)return;dead=true;allowed=false;epoch++;a.stop(reason);
    }
    return {
      begin(block=true){if(block)allowed=false;return ++epoch},
      accept(data,version=epoch){
        if(dead||version!==epoch)return false;
        if(data?.valid!==true||!Number.isFinite(data.server_time)||!(data.expires_at===null||Number.isFinite(data.expires_at)&&data.expires_at>data.server_time))throw Error('驗證回覆不正確');
        const remaining=data.expires_at===null?300000:Math.min(300000,(data.expires_at-data.server_time)*1000);
        const now=a.now();
        expires=data.expires_at===null?null:now+(data.expires_at-data.server_time)*1000;
        until=now+remaining;allowed=true;return true;
      },
      valid(){if(allowed&&a.now()>=until)reject();return allowed&&!dead},
      reject,
      remaining:()=>expires===null?null:Math.max(0,expires-a.now()),
      dead:()=>dead
    };
  }
  function formatRemaining(ms){
    if(ms===null)return '永久';
    const minutes=Math.ceil(Math.max(0,ms)/60000);
    return Math.floor(minutes/1440)+'天 '+String(Math.floor(minutes/60)%24).padStart(2,'0')+'時 '+String(minutes%60).padStart(2,'0')+'分';
  }
  return {create,formatRemaining};
});

(function(){
  if(location.hostname!=='classic.lescaria.com'){alert('請在遊戲頁面使用天仁輔助書籤');return;}
  if(window.__天仁授權){window.__天仁授權.show();return;}
  if(window.__天仁輔助){alert('請先重新整理遊戲，再使用天仁輔助書籤，避免舊版同時運作。');return;}
  if(!window.__wl?.net?.on||!window.__wl?.world?.self){alert('請先登入遊戲角色，再使用測試書籤。');return;}
  const api='https://tianren-licens-api.mgm9453.workers.dev/verify';
  const storageKey='天仁輔助金鑰';
  let started=false,busy=false,timer=null,deadline=null;
  const box=document.createElement('section');
  box.style.cssText='position:fixed;right:20px;top:30px;z-index:2147483647;background:#151719;color:#f5f3ed;padding:18px;border:1px solid #e4c98b;border-radius:12px;width:280px;font:16px Microsoft JhengHei,sans-serif';
  box.innerHTML='<strong>天仁輔助・金鑰驗證</strong><p><input type="password" aria-label="玩家金鑰" placeholder="輸入玩家金鑰" style="width:96%;font-size:16px;padding:8px"></p><button type="button">驗證並啟動</button><p role="status">請輸入玩家金鑰</p>';
  document.body.append(box);
  const input=box.querySelector('input'),button=box.querySelector('button'),status=box.querySelector('[role=status]');
  try{input.value=localStorage.getItem(storageKey)||localStorage.getItem('天仁輔助金鑰測試')||'';}catch{}
  function stop(reason){clearInterval(timer);clearInterval(deadline);window.__天仁輔助?.licenseStop?.();box.hidden=false;button.disabled=true;status.textContent=reason+'。請重新整理遊戲後再驗證。';}
  let gate=window.天仁授權核心.create({now:()=>performance.now(),stop});
  const state={get gate(){return gate},show(){if(started&&gate.valid())window.__天仁輔助?.show();else box.hidden=false}};
  window.__天仁授權=state;
  function updateCountdown(){
    if(!gate.valid())return;
    const label=document.querySelector('#裝備強化第一版 [data-ui="licenseCountdown"]');
    if(!label)return;
    const text=window.天仁授權核心.formatRemaining(gate.remaining());
    if(label.textContent!==text)label.textContent=text;
  }
  async function verify(block=false){
    if(busy){if(block&&started)gate.reject('頁面恢復時尚未完成重新驗證');return;}busy=true;button.disabled=true;
    if(!started)gate=window.天仁授權核心.create({now:()=>performance.now(),stop});
    const version=gate.begin(block);
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
    try{
      const key=input.value.trim().toUpperCase();
      const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key}),cache:'no-store',credentials:'omit',signal:controller.signal});
      const data=await response.json();
      if(!response.ok||data.valid!==true){if(started)gate.reject(data.error||'授權失效');else status.textContent=data.error||'金鑰無效';return;}
      if(!gate.accept(data,version))return;
      try{localStorage.setItem(storageKey,key);}catch{}
      if(!started){started=true;啟動授權輔助();timer=setInterval(()=>verify(false),60000);deadline=setInterval(updateCountdown,1000);}
      updateCountdown();
      box.hidden=true;
    }catch{
      if(started){if(block)gate.reject('重新驗證失敗，功能已停止');else if(!gate.valid())gate.reject('授權驗證逾時');}
      else status.textContent='連線驗證失敗，請稍後再試。';
    }finally{clearTimeout(timeout);busy=false;button.disabled=started;}
  }
  button.onclick=()=>verify(true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&started&&!gate.dead())verify(true)});
  window.addEventListener('pageshow',event=>{if(event.persisted&&started&&!gate.dead())verify(true)});
  window.addEventListener('pagehide',()=>{clearInterval(timer);clearInterval(deadline)});
  if(input.value)verify(true);
  function 啟動授權輔助(){
    (function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.裝備強化流程=factory();})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 function classify(item){
  if(!Number.isInteger(item.safe))return null;
  if(item.weapon)return item.safe===6?{kind:'weapon',safe:6,category:'武器',scroll:'對武器施法的卷軸'}:null;
  const name=String(item.name||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
  const match=[['手套','手套'],['頭盔','頭盔'],['盔甲','盔甲'],['抗魔法鏈甲','鏈甲'],['腕甲','腕甲'],['袍','袍'],['靴','靴'],['斗篷','斗篷'],['斗蓬','斗篷'],['t恤','T恤'],['盾','盾']].find(([key])=>name.includes(key));
  return match?{kind:'armor',safe:name.startsWith('精靈')?6:4,category:match[1],scroll:'對盔甲施法的卷軸'}:null;
 }
 async function run(adapter,options,signal,onProgress=()=>{}){
  const {name,target,key}=options;
  if(!name||!Number.isInteger(target)||target<1||target>15||!['F5','F6'].includes(key))throw Error('設定無效');
  const check=()=>{if(signal?.aborted)throw Error('已停止');};
  const matching=()=>adapter.snapshot().filter(x=>x.name===name);
  const reached=()=>matching().some(x=>x.level>=target);
  check();if(reached())return {reason:'開始前已有達標裝備',attempts:0};
  const cohort=matching().filter(x=>!x.equipped&&!x.locked);
  if(cohort.some(x=>x.kind==='armor'?![4,6].includes(x.safe):x.safe!==6))throw Error('裝備安定值不支援，已停止');
  const base=cohort[0]?.safe??6;
  if(cohort.some(x=>x.safe!==base))throw Error('同名裝備安定值不一致，已停止');
  const ids=cohort.map(x=>x.id);let attempts=0;
  const current=id=>matching().find(x=>x.id===id);
  const remaining=()=>ids.map(current).filter(Boolean);
  async function step(id,round){
   check();const item=current(id);if(!item)return;
   if(item.equipped||item.locked)throw Error('裝備穿戴或封印狀態改變，已停止');
   if(++attempts>2000)throw Error('已達本次操作上限');
   onProgress({round,item,attempts});
   await adapter.enhance({...item},key,signal);
   const after=current(id);
   if(after&&after.level<=item.level)throw Error('未確認裝備強化結果，已停止');
   check();
  }
  for(const id of ids){while(current(id)&&current(id).level<Math.min(base,target))await step(id,'補至＋'+Math.min(base,target));}
  check();if(reached())return {reason:'達到目標',attempts};
  for(let level=base+1;level<=target;level++){
   for(const id of ids){const item=current(id);if(item&&item.level<level)await step(id,'挑戰＋'+level);}
   check();if(reached())return {reason:'達到目標',attempts};
   if(!remaining().length)return {reason:'沒有剩餘候選裝備',attempts};
  }
  return {reason:remaining().length?'已完成':'沒有剩餘候選裝備',attempts};
 }
 return {run,classify};
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.武器修理流程 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  function damage(text) {
    if (!/攻擊力\s*[:：]/.test(text)) return null;
    if (!/損壞度/.test(text)) return 0;
    const match = text.match(/損壞度\s*[:：]?\s*(\d+)/);
    return match ? Number(match[1]) : null;
  }
  async function run(adapter, signal) {
    let count = 0;
    for (;;) {
      if (signal?.aborted) throw Error('已停止');
      const before = await adapter.read();
      if (!Number.isInteger(before) || before < 0) throw Error('無法確認武器損壞度');
      if (before === 0) return count;
      if (signal?.aborted) throw Error('已停止');
      await adapter.repair(before, signal); count++;
      if (signal?.aborted) throw Error('已停止');
      const after = await adapter.read();
      if (!Number.isInteger(after) || after < 0) throw Error('無法確認修理結果');
      if (after >= before) throw Error('損壞度未下降，停止修理');
    }
  }
  return { damage, run };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.自動刪物流程序 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  function fullName(text, count) {
    const name = String(text || '').trim();
    const suffix = ` (${count})`;
    return count > 1 && name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
  }
  function eligible(item, names) {
    return !!item && Number.isSafeInteger(item.count) && item.count > 0 && !item.equipped && !item.locked && !item.cannotDelete
      && !/[（(]\s*(?:揮舞|穿戴)\s*[）)]/.test(item.fullName) && names.has(item.fullName);
  }
  function parseLabel(text, knownCount) {
    const label = String(text || '').trim();
    if (!label) throw Error('尚未讀到物品名稱');
    const match = label.match(/^(.*?)\s+\(([\d,]+)\)$/);
    const displayed = match ? Number(match[2].replace(/,/g, '')) : null;
    const known = Number.isSafeInteger(knownCount) && knownCount > 0;
    if (known && knownCount > 1 && displayed !== knownCount) throw Error('物品數量更新中');
    const count = known ? knownCount : displayed > 1 ? displayed : 1;
    if (!Number.isSafeInteger(count) || count <= 0) throw Error('無法確認物品數量');
    return { fullName: match && count > 1 && displayed === count ? match[1] : label, count };
  }
  function createNameStore({ names, storage, character, changed = () => {}, error = () => {} }) {
    let key = null;
    const pending = new Map();
    function save() {
      if (!key) return;
      try { storage.setItem(key, JSON.stringify([...names])); }
      catch { error('名單未能儲存，請確認瀏覽器允許網站儲存資料'); }
    }
    function sync() {
      const char = String(character() || '');
      if (!char.trim()) return false;
      const nextKey = `天仁刪物:${char}`;
      if (key === nextKey) return true;
      let saved;
      try {
        saved = JSON.parse(storage.getItem(nextKey) || '[]');
        if (!Array.isArray(saved) || saved.some(name => typeof name !== 'string')) throw Error();
      } catch { error('名單讀取失敗，未覆寫原本的儲存資料'); return false; }
      const merged = new Set(saved);
      for (const [name, add] of pending) { if (add) merged.add(name); else merged.delete(name); }
      const hadEdits = pending.size > 0, switched = key !== null;
      key = nextKey; pending.clear(); names.clear();
      for (const name of merged) if (name) names.add(name);
      if (hadEdits) save();
      changed(switched);
      return true;
    }
    function edit(name, add) {
      if (!name) return;
      const bound = sync();
      if (add) names.add(name); else names.delete(name);
      if (!bound) pending.set(name, add); else save();
    }
    return { sync, edit };
  }
  function backupActiveList(storage, character, values) {
    if (!character || !Array.isArray(values) || !values.length || values.some(value => typeof value !== 'string' || !value)) return false;
    storage.setItem(`天仁刪物:${character}`, JSON.stringify([...new Set(values)]));
    return true;
  }
  function mount(a) {
    const ui = a.ui, cache = new Map(), names = new Set();
    const changedIds = new Set();
    let needsProcess = true, bagSignature = null;
    let busy = false, dirty = true, pending = null, pauseUntil = 0, stopped = false, manualRequested = false, unconfirmed = 0, backgroundQueued = false;
    const status = text => { if (ui('discardStatus').textContent !== text) ui('discardStatus').textContent = text; };
    const store = createNameStore({ names, storage: localStorage, character: a.character,
      changed(switched) { needsProcess = true; paintList(); if (switched) disable('角色已變更，已載入該角色名單'); }, error: status });
    function paintList() {
      const selected = ui('discardList').value;
      ui('discardList').replaceChildren();
      for (const name of names) { const opt = document.createElement('option'); opt.value = opt.textContent = name; ui('discardList').append(opt); }
      if (names.has(selected)) ui('discardList').value = selected;
    }
    function paintBag() {
      const selected = ui('discardItem').value;
      const choices = [...new Set([...cache.values()].filter(item => !item.equipped
        && !/[（(]\s*(?:揮舞|穿戴)\s*[）)]/.test(item.fullName)).map(item => item.fullName))].sort();
      const signature = JSON.stringify(choices);
      if (signature === bagSignature) return;
      bagSignature = signature;
      ui('discardItem').replaceChildren();
      for (const name of choices) { const opt = document.createElement('option'); opt.value = opt.textContent = name; ui('discardItem').append(opt); }
      if (choices.includes(selected)) ui('discardItem').value = selected;
    }
    function disable(text) { ui('discardEnabled').checked = false; status(text); }
    async function scan(force = false, full = true) {
      const incremental = !force && !full && !!a.current;
      const updates = [...changedIds]; changedIds.clear();
      const snapshot = a.snapshot ? incremental ? updates.map(id => {
        try { return a.current(id) || { id, removed: true }; }
        catch { changedIds.add(id); return { id, fullName: '' }; }
      }) : await a.snapshot() : null;
      const memory = snapshot ? new Map(snapshot.map(item => [item.id, item])) : null;
      const cells = memory ? null : await a.cells();
      if (force) cache.clear();
      const ids = new Set(memory ? memory.keys() : cells.map(cell => Number(cell.dataset.itemId)));
      if (!incremental) for (const id of cache.keys()) if (!ids.has(id)) cache.delete(id);
      let failed = 0, index = 0;
      for (const id of ids) {
        const cell = memory ? null : a.cell(id);
        index++;
        if (memory?.get(id)?.removed) { cache.delete(id); continue; }
        if (!memory && !cell) continue;
        if (memory ? memory.get(id).equipped : a.equipped(cell)) { cache.delete(id); continue; }
        if (!cache.has(id)) {
          try {
            const item = memory ? memory.get(id) : a.read(cell);
            if (item.fullName && !item.equipped && !/[（(]\s*(?:揮舞|穿戴)\s*[）)]/.test(item.fullName)) cache.set(id, item);
            else if (!item.fullName) { failed++; changedIds.add(id); }
          } catch { failed++; changedIds.add(id); }
        }
        if (!memory) status(`讀取物品 ${index}／${ids.size}`);
        if (!memory && index % 8 === 0 && a.frame) await a.frame();
      }
      paintBag();
      if (failed && !a.current) dirty = true;
      return { count: ui('discardItem').options.length, failed };
    }
    async function destroy(item) {
      // 送出前重讀同一個編號，不使用強化功能移除等級後的名稱。
      const cell = a.current ? null : a.cell(item.id);
      if (!a.current && (!cell || a.equipped(cell))) return;
      let current;
      try { current = a.current ? a.current(item.id) : a.verify ? a.verify(cell) : a.read(cell); }
      catch { cache.delete(item.id); changedIds.add(item.id); needsProcess = true; unconfirmed++; return; }
      if (!ui('discardEnabled').checked || !current || current.id !== item.id || !eligible(current, names) || current.fullName !== item.fullName) {
        cache.delete(item.id); changedIds.add(item.id); needsProcess = true; return;
      }
      await new Promise((resolve, reject) => {
        const finish = (fn, value) => { clearTimeout(timer); pending = null; fn(value); };
        const timer = setTimeout(() => finish(reject, Error('等待刪除結果逾時，已停止，不會重送')), 4000);
        pending = { id: current.id, resolve: () => finish(resolve), reject: error => finish(reject, error) };
        try {
          status(`正在刪除：${current.fullName} × ${current.count}`);
          a.destroy(current.id, current.count);
        } catch (error) { pending.reject(error); }
      });
      cache.delete(current.id);
      status(`已刪除：${current.fullName} × ${current.count}`);
    }
    async function tick(manual = false) {
      if (stopped) return;
      store.sync();
      if (manual) manualRequested = true;
      if (stopped || busy || a.busy() || Date.now() < pauseUntil || a.picking()) {
        if (manualRequested) status('等待目前操作完成後讀取物品…');
        return;
      }
      const requested = manualRequested;
      if (!requested && !ui('discardEnabled').checked) return;
      if (!requested && !dirty && !changedIds.size && !needsProcess) return;
      manualRequested = false;
      needsProcess = false;
      busy = true; a.lock(true); ui('discardScan').disabled = true;
      try {
        let result;
        if (requested || dirty || changedIds.size) { const full = dirty; dirty = false; result = await scan(requested, full); }
        if (requested) status(`已讀取 ${result.count} 種物品${result.failed ? `，${result.failed} 格暫未讀取` : ''}`);
        if (ui('discardEnabled').checked) {
          if (!names.size) status('請先新增物品');
          else {
            unconfirmed = 0;
            for (const item of [...cache.values()]) {
              if (!ui('discardEnabled').checked || Date.now() < pauseUntil) break;
              if (a.busy()) { needsProcess = true; break; }
              if (eligible(item, names)) await destroy(item);
            }
            if (ui('discardEnabled').checked && !pending) status(unconfirmed ? `偵測中，${unconfirmed} 項等待重新確認` : '偵測中');
          }
        }
      } catch (error) { disable(error.message); }
      finally { busy = false; a.lock(false); ui('discardScan').disabled = false; }
    }
    const unsubscribe = a.net.on(msg => {
      if (msg.t === 'inv.remove') { cache.delete(msg.id); changedIds.add(msg.id); needsProcess = true; if (pending?.id === msg.id) pending.resolve(); }
      if (msg.t === 'inv.add' || msg.t === 'inv.update') {
        const id = msg.item?.id ?? msg.id; cache.delete(id); changedIds.add(id); needsProcess = true;
        if (!a.current) dirty = true;
      }
      if (msg.t === 'inv.list') { cache.clear(); dirty = true; }
      if (msg.t === 'world.map' || msg.t === 'world.enter' || msg.t === 'world.teleport') { pauseUntil = Date.now() + 4000; dirty = true; }
      if (msg.t === 'conn.closed') { disable('斷線，已停止刪物'); pending?.reject(Error('斷線，停止刪物')); }
      // 背景時由背包通知喚醒；合併同批通知，等待既有背包處理完成再讀取。
      if (document.hidden && a.current && ui('discardEnabled').checked && !backgroundQueued
        && ['inv.list', 'inv.add', 'inv.update', 'inv.remove'].includes(msg.t)) {
        backgroundQueued = true;
        queueMicrotask(() => { backgroundQueued = false; if (!stopped) tick(); });
      }
    });
    ui('discardScan').onclick = () => tick(true);
    ui('discardAdd').onclick = () => { const name = ui('discardItem').value; if (!name) return; store.edit(name, true); needsProcess = true; paintList(); };
    ui('discardDelete').onclick = () => { store.edit(ui('discardList').value, false); needsProcess = true; paintList(); };
    ui('discardEnabled').onchange = () => { dirty = true; status(ui('discardEnabled').checked ? '偵測中' : '已停止'); if (ui('discardEnabled').checked) tick(); };
    store.sync(); paintList();
    const timer = setInterval(tick, 2000);
    return { stop() { disable('已停止'); }, dispose() { stopped = true; clearInterval(timer); unsubscribe?.(); } };
  }
  return { fullName, eligible, parseLabel, createNameStore, backupActiveList, mount };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.天仁背包來源 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  function nameDecoder(strings) {
    const probe = '天仁物品名稱 測試';
    const candidates = [];
    if (typeof strings.r === 'function') candidates.push(text => strings.r(text));
    if (typeof strings.c === 'function' && typeof strings.d === 'function') candidates.push(text => strings.d(strings.c(text)));
    for (const decode of candidates) {
      try { if (decode(probe) === probe) return decode; } catch {}
    }
    throw Error('遊戲名稱轉換介面已變更，無法讀取物品');
  }
  function bindInstance(prototype, net, timeout = 6000, captured = () => {}) {
    return new Promise((resolve, reject) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'onMsg');
      if (typeof descriptor?.value !== 'function') { reject(Error('找不到遊戲背包介面')); return; }
      const original = descriptor.value;
      const restore = () => { if (prototype.onMsg === wrapper) Object.defineProperty(prototype, 'onMsg', descriptor); };
      const timer = setTimeout(() => { restore(); reject(Error('尚未取得背包資料，請稍後再讀取')); }, timeout);
      function wrapper(...args) {
        const result = original.apply(this, args);
        if (this.net === net && typeof this.deps?.inventory?.all === 'function' && typeof this.deps.inventory.item === 'function') {
          clearTimeout(timer); restore(); captured(this); resolve(this.deps.inventory);
        }
        return result;
      }
      // 僅等待一次正常訊息以取得現有實例，隨即還原；不送請求或重建遊戲物件。
      Object.defineProperty(prototype, 'onMsg', { ...descriptor, value: wrapper });
    });
  }
  function normalize(raw, decode, parseLabel) {
    if (!raw || !Number.isSafeInteger(raw.id) || raw.id <= 0) throw Error('無效物品編號');
    if (!Number.isSafeInteger(raw.count) || raw.count <= 0) throw Error('無法確認物品數量');
    const text = decode(String(raw.name || '')).trim();
    if (/\$\d+/.test(text)) throw Error('物品中文名稱尚未載入');
    // 遊戲可只更新數量欄位，名稱尾端仍留舊數量；以結構化資料為準。
    const parsed = { fullName: text.replace(/\s+\([\d,]+\)$/, ''), count: raw.count };
    if (!parsed.fullName) throw Error('尚未讀到物品名稱');
    const detail = (raw.desc || []).map(entry => decode(String(entry.text || ''))).join('\n');
    const level = parsed.fullName.match(/^\+(\d+)\s*(.+)$/);
    const safe = detail.match(/安定值\s*[:：]?\s*(\d+)/);
    return { id: raw.id, ...parsed, name: level ? level[2].trim() : parsed.fullName, level: level ? Number(level[1]) : 0,
      equipped: !!raw.equipped, bless: raw.bless, useType: raw.useType, locked: Number(raw.bless) >= 128, cannotDelete: !!(raw.status & 4),
      wielding: /[（(]\s*揮舞\s*[）)]/.test(text), weapon: raw.useType === 1 || /攻擊力\s*[:：]/.test(detail),
      safe: safe ? Number(safe[1]) : null, detail };
  }
  function create({ net, parseLabel, resources = () => performance.getEntriesByType('resource'), load = url => import(url), base = location.href }) {
    let inventory = null, decode = null, hudInstance = null;
    const normalized = new Map();
    function read(raw) {
      const fingerprint = [raw.name, raw.count, raw.equipped, raw.bless, raw.status, raw.useType, raw.desc];
      const old = normalized.get(raw.id);
      if (old && fingerprint.every((value, index) => value === old.fingerprint[index])) return old.item;
      const item = normalize(raw, decode, parseLabel);
      normalized.set(raw.id, { fingerprint, item });
      return item;
    }
    const ready = (async () => {
      const urls = resources().map(entry => entry.name);
      const hudUrl = urls.find(url => /\/assets\/classicOpenHud-[^/]+\.js(?:\?|$)/.test(url));
      const stringsUrl = urls.find(url => /\/assets\/strings-[^/]+\.js(?:\?|$)/.test(url));
      if (!hudUrl || !stringsUrl) throw Error('未找到已載入的遊戲背包模組');
      for (const url of [hudUrl, stringsUrl]) if (new URL(url, base).origin !== new URL(base).origin) throw Error('遊戲模組來源不符');
      const [hud, strings] = await Promise.all([load(hudUrl), load(stringsUrl)]);
      decode = nameDecoder(strings);
      inventory = await bindInstance(hud.ClassicOpenHud.prototype, net, 6000, hud => { hudInstance = hud; });
      return true;
    })();
    // 由使用方顯示錯誤，避免未勾選功能時出現未處理拒絕。
    ready.catch(() => {});
    const all = () => {
      if (!inventory) throw Error('等待背包資料');
      const rawItems = inventory.all(), ids = new Set(rawItems.map(item => item.id));
      for (const id of normalized.keys()) if (!ids.has(id)) normalized.delete(id);
      const items = rawItems.map(item => { try { return read(item); } catch { return { id: item.id, count: item.count, equipped: !!item.equipped, fullName: '' }; } });
      if (items.length && items.every(item => !item.fullName)) throw Error('背包物品名稱解析失敗，請更新輔助；目前未執行道具操作');
      return items;
    };
    return { ready, available: () => !!inventory, all,
      decodeName(text) { if (!decode) throw Error('等待名稱資料'); return decode(String(text || '')); },
      health() { const value = hudInstance?.st; return value ? { hp: value.hp, maxHp: value.maxHp } : null; },
      loading: () => hudInstance?.mapLoading === true,
      async snapshot() { await ready; return all(); },
      item(id) { if (!inventory) throw Error('等待背包資料'); const item = inventory.item(id); if (!item) { normalized.delete(id); return null; } return read(item); }
    };
  }
  return { nameDecoder, bindInstance, normalize, create };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.天仁血量保護 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  const choices = [['home', '傳送回家的卷軸'], ['blink', '瞬間移動卷軸'], ['clan', '血盟傳送卷軸']];
  const plainName = name => String(name || '').trim().replace(/\s*(?:[（(]\s*刻印\s*[）)]|刻印)$/, '').trim();
  const engraved = item => plainName(item?.fullName) !== String(item?.fullName || '').trim();
  function scrollKind(item) {
    if (!item || item.equipped || item.locked || !Number.isSafeInteger(item.count) || item.count <= 0) return null;
    const name = plainName(item.fullName);
    if (/^(?:瞬間移動卷軸|瞬間移動的卷軸)(?:[（(]刻印[）)])?$/.test(name) && item.bless !== 0) return 'blink';
    if (/^傳送回家的卷軸(?:[（(]刻印[）)])?$/.test(name)) return 'home';
    if (/^血盟傳送卷軸(?:[（(]刻印[）)])?$/.test(name)) return 'clan';
    return null;
  }
  function findScroll(items, current, kind) {
    for (const preferEngraved of [true, false]) for (const item of items.values()) {
      if (scrollKind(item) !== kind) continue;
      try { const latest = current(item.id); if (scrollKind(latest) === kind && engraved(latest) === preferEngraved) return latest; } catch {}
    }
    return null;
  }
  function create(a) {
    const schedule = a.schedule || setTimeout, cancel = a.cancel || clearTimeout;
    const rules = choices.map(([kind], index) => ({ enabled: false, percent: [30, 20, 10][index], kind }));
    const items = new Map();
    let health = null, inventoryReady = false, pending = null, latched = false, recoverAt = 0, disposed = false, status = '尚未啟動';
    let pausedRules = null;
    const valid = value => value && Number.isFinite(value.hp) && Number.isFinite(value.maxHp) && value.maxHp > 0 && value.hp >= 0 && value.hp <= value.maxHp;
    const low = percent => valid(health) && health.hp * 100 < health.maxHp * percent;
    const state = () => ({ health: health && { ...health }, rules: rules.map(rule => ({ ...rule })), status, pending: !!pending });
    const notify = () => a.changed?.(state());
    function clearPending() { if (pending) { cancel(pending.deadline); if (pending.check != null) cancel(pending.check); pending = null; } }
    function stop(text = '已停止血量保護') { rules.forEach(rule => { rule.enabled = false; }); pausedRules = null; clearPending(); latched = false; status = text; notify(); }
    function cancelScrolls() { rules.forEach(rule => { rule.enabled = false; }); status = '已取消傳送卷軸'; notify(); }
    function toggleScrolls() {
      if (pausedRules === null) { pausedRules = rules.map(rule => rule.enabled); cancelScrolls(); return true; }
      rules.forEach((rule, index) => { rule.enabled = pausedRules[index]; }); pausedRules = null;
      if (!pending) latched = false;
      status = '已恢復傳送設定'; evaluate(); notify(); return false;
    }
    function finish(ok) {
      if (!pending) return;
      const row = pending.row;
      clearPending();
      status = !ok ? `第${row + 1}組：未確認傳送，本次不重送` : rules[row].enabled ? `第${row + 1}組：傳送已確認，持續監看` : `第${row + 1}組：傳送已確認，目前已關閉`;
      notify();
    }
    function verifyLater() {
      if (!pending || !pending.consumed || !pending.teleported || pending.check != null) return;
      pending.check = schedule(() => {
        if (!pending) return;
        pending.check = null;
        if (a.loading?.()) { verifyLater(); return; }
        const current = a.health?.();
        if (valid(current)) health = { hp: current.hp, maxHp: current.maxHp };
        finish(true);
      }, 400);
    }
    function evaluate() {
      if (disposed || pending || a.busy?.() || !inventoryReady || !valid(health) || health.hp <= 0) return;
      if (latched) {
        if (low(recoverAt)) return;
        latched = false;
      }
      const row = rules.map((rule, index) => ({ ...rule, index })).filter(rule => rule.enabled && low(rule.percent))
        .sort((left, right) => left.percent - right.percent || left.index - right.index)[0];
      if (!row) return;
      const target = findScroll(items, a.current, row.kind);
      if (!target) { status = `第${row.index + 1}組：等待指定卷軸`; notify(); return; }
      latched = true; recoverAt = Math.max(...rules.filter(rule => rule.enabled).map(rule => rule.percent));
      pending = { row: row.index, percent: row.percent, id: target.id, count: target.count, consumed: false, teleported: false, check: null, deadline: null };
      pending.deadline = schedule(() => finish(false), 4000);
      status = `第${row.index + 1}組：已使用${choices.find(([kind]) => kind === row.kind)[1]}，等待傳送結果`;
      try { a.use(target.id); if (row.kind === 'home') rules[row.index].enabled = false; } catch { finish(false); }
      notify();
    }
    function setHealth(value, seed = false) {
      if (value && Number.isFinite(value.hp) && value.hp < 0) value = { ...value, hp: 0 };
      if (!valid(value) || seed && health) return;
      health = { hp: value.hp, maxHp: value.maxHp };
      if (health.hp === 0) { clearPending(); status = '角色已死亡，暫停使用卷軸'; notify(); return; }
      evaluate(); notify();
    }
    function refresh() {
      if (disposed) return;
      try { items.clear(); for (const item of a.all()) if (scrollKind(item)) items.set(item.id, item); inventoryReady = true; evaluate(); notify(); }
      catch { inventoryReady = false; status = '等待卷軸資料'; notify(); }
    }
    function receive(msg) {
      if (disposed) return;
      if (msg.t === 'self.hp') { setHealth(msg); return; }
      if (msg.t === 'self.status') { setHealth(msg.status); return; }
      if (msg.t === 'self.patch' && health && (msg.status?.hp !== undefined || msg.status?.maxHp !== undefined)) { setHealth({ ...health, ...msg.status }); return; }
      if (msg.t === 'conn.closed' || msg.t === 'world.enter') { clearPending(); health = null; inventoryReady = false; latched = false; status = '等待角色資料'; notify(); return; }
      if (msg.t === 'world.map' || msg.t === 'world.teleport' && !msg.preload) { if (pending) { pending.teleported = true; verifyLater(); } return; }
      if (msg.t === 'inv.list') { refresh(); return; }
      if (!['inv.add', 'inv.update', 'inv.remove'].includes(msg.t)) return;
      const id = msg.item?.id ?? msg.id;
      let item;
      if (msg.t !== 'inv.remove') try { item = a.current(id); } catch {}
      items.delete(id); if (scrollKind(item)) items.set(id, item);
      const count = msg.item?.count ?? msg.count;
      if (pending?.id === id && (msg.t === 'inv.remove' || Number.isSafeInteger(count) && count >= 0 && count < pending.count || Number.isInteger(item?.count) && item.count < pending.count)) {
        pending.consumed = true; verifyLater();
      }
      evaluate();
    }
    function configure(index, patch) {
      const rule = rules[index]; if (!rule) return;
      const next = { ...rule, ...patch };
      if (!Number.isFinite(next.percent) || next.percent <= 0 || next.percent > 100 || !choices.some(([kind]) => kind === next.kind)) {
        rule.enabled = false; status = `第${index + 1}組：請設定1至100%的血量`; notify(); return;
      }
      const arming = !rule.enabled && next.enabled;
      Object.assign(rule, next);
      if (arming && !pending) latched = false;
      status = rules.some(value => value.enabled) ? '監看中' : '尚未啟動';
      evaluate(); notify();
    }
    function settings() { return { rules: rules.map(rule => ({ ...rule })), pausedRules: pausedRules && [...pausedRules] }; }
    function restore(value) {
      rules.forEach((rule, index) => { const saved = value?.rules?.[index]; if (saved && Number.isFinite(saved.percent) && saved.percent >= 1 && saved.percent <= 100 && choices.some(([kind]) => kind === saved.kind)) Object.assign(rule, { enabled: saved.enabled === true, percent: saved.percent, kind: saved.kind }); });
      pausedRules = Array.isArray(value?.pausedRules) && value.pausedRules.length === 3 ? value.pausedRules.map(enabled => enabled === true) : null;
      latched = false; status = rules.some(rule => rule.enabled) ? '監看中' : '尚未啟動'; notify(); evaluate();
    }
    return { state, settings, restore, receive, configure, refresh, seed: value => setHealth(value, true), stop, cancelScrolls, toggleScrolls, pause(text) { clearPending(); status = text; notify(); },
      dispose() { disposed = true; clearPending(); } };
  }
  function mount(a) {
    const pane = a.pane;
    pane.innerHTML = '<div class="protection-title">低血傳送</div><div data-health="rows"></div><div class="health-hint">HOME：暫停／恢復傳送</div>';
    const rowElements = choices.map(([kind, title], index) => {
      const row = document.createElement('div'); row.className = 'health-row';
      row.innerHTML = `<input type="checkbox" aria-label="第${index + 1}組啟動"><input type="number" min="1" max="100" step="1" value="${[30, 20, 10][index]}" aria-label="第${index + 1}組血量百分比"><span>%</span><select aria-label="第${index + 1}組卷軸"></select>`;
      const select = row.querySelector('select');
      for (const [value, name] of choices) { const option = document.createElement('option'); option.value = value; option.textContent = name; select.append(option); }
      select.value = kind; pane.querySelector('[data-health="rows"]').append(row);
      return { enabled: row.querySelector('[type="checkbox"]'), percent: row.querySelector('[type="number"]'), kind: select };
    });
    let renderTimer = null, disposed = false;
    const controller = create({ ...a, changed(state) {
      a.changed?.(state);
      if (renderTimer != null || disposed) return;
      renderTimer = setTimeout(render, 150);
    } });
    function render() {
      renderTimer = null; if (disposed) return;
      const current = controller.state();
      rowElements.forEach((row, index) => {
        const rule = current.rules[index]; row.enabled.checked = rule.enabled;
        if (document.activeElement !== row.percent) row.percent.value = String(rule.percent);
        if (row.kind.value !== rule.kind) row.kind.value = rule.kind;
      });
    }
    rowElements.forEach((row, index) => {
      const change = () => controller.configure(index, { enabled: row.enabled.checked, percent: Number(row.percent.value), kind: row.kind.value });
      row.enabled.onchange = row.percent.onchange = row.kind.onchange = change;
      row.percent.oninput = () => { if (row.percent.value && row.percent.validity.valid) change(); };
    });
    const unsubscribe = a.net.on(controller.receive);
    const onKey = event => { if (event.key === 'Home' && !event.repeat && !event.isComposing) { event.preventDefault(); event.stopPropagation(); a.toggleOtherScrolls?.(controller.toggleScrolls()); } };
    document.addEventListener('keydown', onKey, true);
    a.ready.then(() => { if (disposed) return; controller.seed(a.health?.()); controller.refresh(); }).catch(() => { if (!disposed) controller.pause('無法取得血量或背包資料'); });
    render();
    return { settings: controller.settings, restore: controller.restore, recheck: () => { controller.seed(a.health?.()); controller.receive({ t: 'self.hp', ...a.health?.() }); }, stop: () => controller.stop(), dispose() { disposed = true; document.removeEventListener('keydown', onKey, true); clearTimeout(renderTimer); unsubscribe?.(); controller.dispose(); } };
  }
  return { choices, plainName, engraved, findScroll, scrollKind, create, mount };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./health.js'));
  else root.天仁保護擴充 = factory(root.天仁血量保護);
})(typeof window === 'undefined' ? globalThis : window, healthModule => {
  const potionNames = ['治癒藥水', '強力治癒藥水', '終極治癒藥水', '濃縮體力回復劑', '濃縮強力體力回復劑', '濃縮終極體力回復劑', '古代體力恢復劑', '古代強力體力恢復劑', '古代終極體力恢復劑'];
  const allowedPotions = new Set(potionNames);
  function potionBase(name) {
    if (typeof name !== 'string') return null;
    const base = name.trim().replace(/\s*(?:[（(]\s*刻印\s*[）)]|刻印)$/, '').trim();
    return allowedPotions.has(base) ? base : null;
  }
  function potionName(item) {
    return item && !item.equipped && !item.locked && item.count > 0 && potionBase(item.fullName) ? item.fullName : null;
  }
  function scene(world, loading) {
    if (loading || !world?.self || world.self.dead || !world.map || !world.ents?.values
      || !['isForcible', 'isDoor', 'isScenery'].every(key => typeof world[key] === 'function')) return null;
    const monster = entity => entity?.obj?.kind === 'npc' && !entity.dead && !entity.obj.doll && !entity.obj.pet && !entity.obj.master
      && !world.isForcible(entity) && !world.isDoor(entity) && !world.isScenery(entity);
    let monsters = false;
    for (const entity of world.ents.values()) if (monster(entity)) { monsters = true; break; }
    return { monsters, fighting: !!world.autoAttack && monster(world.target), selfId: world.selfId };
  }
  function create(a) {
    const now = a.now || Date.now, schedule = a.schedule || setTimeout, cancel = a.cancel || clearTimeout;
    const rules = [70, 50, 30].map((percent, index) => ({ enabled: false, percent, name: potionNames[index] }));
    const idle = { enabled: false, seconds: 7 }, items = new Map();
    let hp = null, ready = false, disposed = false, pending = null, timer = null, emptySince = null, cooldownUntil = 0, lastCombat = 0;
    let status = '', idleReason = '未啟動', namesDirty = true, nameCache = [];
    let pausedTeleport = null;
    let lastBackgroundCheck = -Infinity;
    const validHp = value => value && Number.isFinite(value.hp) && Number.isFinite(value.maxHp) && value.maxHp > 0 && value.hp >= 0 && value.hp <= value.maxHp;
    function names() {
      if (namesDirty) { nameCache = [...new Set([...items.values()].map(potionName).filter(Boolean))].sort((x, y) => potionNames.indexOf(potionBase(x)) - potionNames.indexOf(potionBase(y)) || x.localeCompare(y, 'zh-Hant')); namesDirty = false; }
      return nameCache;
    }
    const state = () => ({ rules: rules.map(rule => ({ ...rule })), idle: { ...idle }, names: names(), health: hp && { ...hp }, pending: !!pending, status, idleReason });
    const changed = () => a.changed?.(state());
    function reason(value) { if (idleReason !== value) { idleReason = value; changed(); } }
    const active = () => idle.enabled || rules.some(rule => rule.enabled);
    function clearPending() { if (pending) cancel(pending.deadline); pending = null; }
    function stop(text = '') {
      rules.forEach(rule => { rule.enabled = false; }); idle.enabled = false; emptySince = null; pausedTeleport = null;
      clearPending(); if (timer != null) cancel(timer); timer = null; status = text; idleReason = '未啟動'; changed();
    }
    function fail(text) {
      if (!pending) return;
      if (pending.type === 'potion') rules[pending.row].enabled = false; else idle.enabled = false;
      clearPending(); emptySince = null; cooldownUntil = now() + 1000; status = text; changed(); wake();
    }
    function confirmed() {
      if (!pending || !pending.consumed || pending.type === 'blink' && !pending.teleported) return;
      clearPending(); emptySince = null; status = ''; changed(); wake();
    }
    function send(type, item, row) {
      emptySince = null;
      pending = { type, row, id: item.id, count: item.count, consumed: false, teleported: false, deadline: null };
      pending.deadline = schedule(() => fail('未確認道具結果，已停止'), 4000);
      cooldownUntil = now() + 1000; changed();
      try { a.use(item.id, type); } catch { fail('無法使用道具，已停止'); }
    }
    function wake() {
      if (timer != null || disposed || !active()) return;
      timer = schedule(() => { timer = null; evaluate(); wake(); }, 500);
    }
    function evaluate() {
      if (disposed || !active()) return;
      if (!ready || !validHp(hp) || hp.hp <= 0) { reason('等待角色或背包資料'); return; }
      if (a.loading?.()) { emptySince = null; reason('地圖載入中'); return; }
      if (pending) { emptySince = null; reason('等待道具回覆'); return; }
      if (a.busy?.() || a.picking?.()) { emptySince = null; reason('等待其他操作'); return; }
      if (now() < cooldownUntil) { reason('道具使用間隔'); return; }
      const row = rules.map((rule, index) => ({ ...rule, index })).filter(rule => rule.enabled && hp.hp * 100 < hp.maxHp * rule.percent)
        .sort((x, y) => x.percent - y.percent || x.index - y.index)[0];
      if (row) {
        let selected;
        const candidates = [row.name];
        if (healthModule.engraved({ fullName: row.name })) candidates.push(potionBase(row.name));
        for (const name of candidates) {
          for (const item of items.values()) if (potionName(item) === name) {
            try { const latest = a.current(item.id); if (potionName(latest) === name) { selected = latest; break; } } catch {}
          }
          if (selected) break;
        }
        if (selected) { if (selected.fullName !== row.name) { rules[row.index].name = selected.fullName; changed(); } send('potion', selected, row.index); return; }
        rules[row.index].enabled = false; status = '找不到指定藥水'; changed();
      }
      if (!idle.enabled) { reason('未啟動'); return; }
      if (!Number.isSafeInteger(a.selfId?.()) || a.selfId() <= 0) { emptySince = null; reason('等待角色資料'); return; }
      reason('等待實際攻擊');
      if (emptySince == null) emptySince = Math.max(now(), lastCombat);
      if (now() - emptySince < idle.seconds * 1000) return;
      const scroll = healthModule.findScroll(items, a.current, 'blink');
      if (scroll) { send('blink', scroll); return; }
      idle.enabled = false; status = '找不到瞬間移動卷軸'; changed();
    }
    function refresh() {
      try { items.clear(); for (const item of a.all()) if (potionName(item) || healthModule.scrollKind(item) === 'blink') items.set(item.id, item); ready = true; }
      catch { ready = false; }
      namesDirty = true; changed(); evaluate(); wake();
    }
    function receive(msg) {
      if (disposed) return;
      if (msg.t === 'conn.closed' || msg.t === 'world.enter') { ready = false; hp = null; stop('請重新啟動保護'); return; }
      if (msg.t === 'self.hp' || msg.t === 'self.status' || msg.t === 'self.patch') {
        let value = msg.t === 'self.hp' ? msg : { ...hp, ...msg.status };
        if (Number.isFinite(value.hp) && value.hp < 0) value = { ...value, hp: 0 };
        if (validHp(value)) { hp = { hp: value.hp, maxHp: value.maxHp }; if (!hp.hp) { stop('角色已死亡'); return; } evaluate(); changed(); }
        return;
      }
      if (msg.t === 'world.map' || msg.t === 'world.teleport') {
        emptySince = null;
        if (pending?.type === 'blink' && (msg.t === 'world.map' || !msg.preload)) { pending.teleported = true; confirmed(); }
        return;
      }
      if (msg.t === 'obj.attack' || msg.t === 'obj.attackMany') {
        const selfId = a.selfId?.();
        if (selfId && msg.id === selfId) { lastCombat = now(); emptySince = lastCombat; }
        return;
      }
      // 物件更新包含商人、門、寵物及召喚物；只依已分類的場景判斷是否有怪物，不因通用更新歸零。
      if (msg.t === 'inv.list') { refresh(); return; }
      if (!['inv.add', 'inv.update', 'inv.remove'].includes(msg.t)) {
        // 計時器被背景降頻時，沿用收到的遊戲訊息檢查經過時間，不另外送探測請求。
        if (idle.enabled && a.background?.() && now() - lastBackgroundCheck >= 500) { lastBackgroundCheck = now(); evaluate(); }
        return;
      }
      const id = msg.item?.id ?? msg.id;
      let item = null;
      if (msg.t !== 'inv.remove') try { item = a.current(id); } catch {}
      const before = potionName(items.get(id)); items.delete(id);
      if (potionName(item) || healthModule.scrollKind(item) === 'blink') items.set(id, item);
      if (before !== potionName(item)) { namesDirty = true; changed(); }
      const receivedCount = msg.item?.count ?? msg.count;
      if (pending?.id === id && (msg.t === 'inv.remove' || Number.isSafeInteger(receivedCount) && receivedCount >= 0 && receivedCount < pending.count || item && item.count < pending.count)) { pending.consumed = true; confirmed(); }
      // 數量通知不在同一個呼叫堆疊再次送出，交由既有半秒計時器處理。
    }
    function configure(index, patch) {
      const rule = rules[index]; if (!rule) return;
      const next = { ...rule, ...patch };
      if (!Number.isFinite(next.percent) || next.percent < 1 || next.percent > 100 || next.enabled && !potionBase(next.name)) { rule.enabled = false; status = '請選擇藥水及血量'; }
      else { Object.assign(rule, next); status = ''; }
      changed(); evaluate(); wake();
    }
    function configureIdle(patch) {
      const next = { ...idle, ...patch };
      if (!Number.isFinite(next.seconds) || next.seconds < 1 || next.seconds > 3600) { idle.enabled = false; status = '秒數需介於1至3600'; }
      else { Object.assign(idle, next); status = ''; }
      emptySince = null; changed(); evaluate(); wake();
    }
    function cancelTeleport() { idle.enabled = false; emptySince = null; changed(); }
    function toggleTeleport(paused) {
      if (paused) { pausedTeleport = idle.enabled; cancelTeleport(); }
      else if (pausedTeleport !== null) { idle.enabled = pausedTeleport; pausedTeleport = null; emptySince = null; changed(); evaluate(); wake(); }
    }
    function settings() { return { rules: rules.map(rule => ({ ...rule })), idle: { ...idle }, pausedTeleport }; }
    function restore(value) {
      rules.forEach((rule, index) => { const saved = value?.rules?.[index]; if (saved && Number.isFinite(saved.percent) && saved.percent >= 1 && saved.percent <= 100 && (saved.name === '' || potionBase(saved.name))) Object.assign(rule, { enabled: saved.enabled === true && !!saved.name, percent: saved.percent, name: saved.name || potionNames[index] }); });
      if (value?.idle && Number.isFinite(value.idle.seconds) && value.idle.seconds >= 1 && value.idle.seconds <= 3600) Object.assign(idle, { enabled: value.idle.enabled === true, seconds: value.idle.seconds });
      pausedTeleport = typeof value?.pausedTeleport === 'boolean' ? value.pausedTeleport : null;
      status = active() ? '監看中' : ''; emptySince = null; changed(); evaluate(); wake();
    }
    return { state, settings, restore, recheck: evaluate, configure, configureIdle, refresh, receive, stop, cancelTeleport, toggleTeleport, seed(value) { if (validHp(value)) hp = { hp: value.hp, maxHp: value.maxHp }; },
      dispose() { disposed = true; stop(); } };
  }
  function mount(a) {
    const pane = document.createElement('div'); pane.className = 'protection-extra';
    pane.innerHTML = '<div class="protection-title">自動喝水</div><div data-extra="rows"></div><div class="protection-title">未打怪瞬移</div><label class="idle-row"><input type="checkbox" data-extra="idle">啟動 <input type="number" min="1" max="3600" value="7" data-extra="seconds" aria-label="未打怪秒數">秒</label><div data-extra="status" role="status"></div>';
    a.pane.append(pane);
    const rows = [70, 50, 30].map((percent, index) => {
      const row = document.createElement('div'); row.className = 'health-row';
      row.innerHTML = `<input type="checkbox" aria-label="第${index + 1}組喝水啟動"><input type="number" min="1" max="100" value="${percent}" aria-label="第${index + 1}組喝水血量"><span>%</span><select aria-label="第${index + 1}組藥水"></select>`;
      pane.querySelector('[data-extra="rows"]').append(row);
      return { enabled: row.querySelector('[type="checkbox"]'), percent: row.querySelector('[type="number"]'), name: row.querySelector('select') };
    });
    let renderTimer = null, disposed = false, signature = null;
    const write = (node, text) => { if (node.textContent !== text) node.textContent = text; };
    const controller = create({ ...a, background: () => document.hidden, changed(state) { a.changed?.(state); if (renderTimer == null && !disposed) renderTimer = setTimeout(render, 150); } });
    function render() {
      renderTimer = null; if (disposed) return;
      const state = controller.state(), choices = [...new Set([...state.names, ...state.rules.map(rule => rule.name).filter(Boolean)])], nextSignature = JSON.stringify(choices);
      if (signature !== nextSignature) {
        signature = nextSignature;
        rows.forEach((row, index) => {
          const selected = state.rules[index].name;
          row.name.replaceChildren();
          for (const name of ['', ...choices]) {
            const option = document.createElement('option'); option.value = name; option.textContent = name || '選擇藥水'; row.name.append(option);
          }
          row.name.value = selected;
        });
      }
      rows.forEach((row, index) => { row.enabled.checked = state.rules[index].enabled; if (document.activeElement !== row.percent) row.percent.value = String(state.rules[index].percent); const selected = state.rules[index].name; if (row.name.value !== selected) row.name.value = selected; });
      pane.querySelector('[data-extra="idle"]').checked = state.idle.enabled;
      const secondsInput = pane.querySelector('[data-extra="seconds"]'); if (document.activeElement !== secondsInput) secondsInput.value = String(state.idle.seconds);
      if (pane.dataset.idleReason !== state.idleReason) pane.dataset.idleReason = state.idleReason;
      write(pane.querySelector('[data-extra="status"]'), state.status === '監看中' ? '' : state.status);
    }
    rows.forEach((row, index) => {
      const change = () => controller.configure(index, { enabled: row.enabled.checked, percent: Number(row.percent.value), name: row.name.value });
      row.enabled.onchange = row.percent.onchange = row.name.onchange = change;
      row.percent.oninput = () => { if (row.percent.value && row.percent.validity.valid) change(); };
    });
    const idleInput = pane.querySelector('[data-extra="idle"]'), seconds = pane.querySelector('[data-extra="seconds"]');
    const changeIdle = () => controller.configureIdle({ enabled: idleInput.checked, seconds: Number(seconds.value) });
    idleInput.onchange = seconds.onchange = changeIdle;
    seconds.oninput = () => { if (seconds.value && seconds.validity.valid) changeIdle(); };
    const unsubscribe = a.net.on(controller.receive);
    a.ready.then(() => { if (!disposed) { controller.seed(a.health()); controller.refresh(); } }).catch(() => { if (!disposed) controller.stop('無法讀取保護資料'); });
    render();
    return { settings: controller.settings, restore: controller.restore, recheck: controller.recheck, toggleTeleport: paused => controller.toggleTeleport(paused), cancelTeleport: () => controller.cancelTeleport(), stop: () => controller.stop(), dispose() { disposed = true; clearTimeout(renderTimer); unsubscribe?.(); controller.dispose(); } };
  }
  return { potionNames, potionBase, potionName, scene, create, mount };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./health.js'));
  else root.天仁快速強化 = factory(root.天仁血量保護);
})(typeof window === 'undefined' ? globalThis : window, variants => {
  function hotbarId(saved, key) {
    const index = ['F5', 'F6'].indexOf(key);
    if (index < 0 || !saved || !Number.isInteger(saved.page) || saved.page < 0 || saved.page > 2) throw Error('無法確認目前快捷欄');
    const entry = saved.sets?.[saved.page]?.[index];
    if (entry?.kind !== 'item' || !Number.isSafeInteger(entry.id) || entry.id <= 0) throw Error(`${key}沒有綁定道具`);
    return entry.id;
  }
  function create(a) {
    let pending = null;
    const bindings = new Map();
    const schedule = a.schedule || setTimeout, cancel = a.cancel || clearTimeout;
    function finish(error) {
      if (!pending) return;
      const current = pending; pending = null; cancel(current.timer);
      if (error) current.reject(error); else current.resolve();
    }
    const unsubscribe = a.net.on(msg => {
      if (!pending) return;
      if (msg.t === 'conn.closed' || msg.t === 'world.enter' || msg.t === 'inv.list') { finish(Error('連線或背包重新同步，強化已停止')); return; }
      if (!['inv.update', 'inv.remove'].includes(msg.t)) return;
      try {
        if (msg.id === pending.targetId) {
          const item = a.current(pending.targetId);
          if (msg.t === 'inv.remove' || !item) pending.targetDone = true;
          else if (item.level > pending.level) pending.targetDone = true;
          else if (item.equipped || item.locked) { finish(Error('裝備狀態變更，強化已停止')); return; }
        }
        if (pending && msg.id === pending.scrollId) {
          const scroll = a.current(pending.scrollId);
          if (msg.t === 'inv.remove' || !scroll || scroll.count < pending.count) pending.scrollDone = true;
        }
        if (pending?.targetDone && pending.scrollDone) finish();
      } catch { finish(Error('無法確認強化結果，停止且不重送')); }
    });
    async function enhance(item, key, signal) {
      if (pending) throw Error('前次強化尚未確認');
      if (signal?.aborted) throw Error('已停止');
      if (a.hidden?.()) throw Error('遊戲不在前景，已停止');
      if (a.picking?.()) throw Error('目前存在其他物品選取');
      const target = a.current(item.id);
      if (!target || target.equipped || target.locked || target.level !== item.level || target.name !== item.name) throw Error('裝備資料已改變，請重新讀取');
      const scrollName = item.kind === 'armor' ? '對盔甲施法的卷軸' : '對武器施法的卷軸';
      const saved = a.hotbar(), bindingKey = `${saved?.page}:${key}`, previous = bindings.get(bindingKey);
      let scrollId;
      try { scrollId = hotbarId(saved, key); } catch (error) {
        const entry = saved?.sets?.[saved.page]?.[['F5', 'F6'].indexOf(key)];
        if (entry != null || !previous?.engraved || previous.name !== scrollName) throw error;
        scrollId = previous.id;
      }
      let scroll = a.current(scrollId);
      if ((!scroll || scroll.count <= 0 && !scroll.locked) && previous?.id === scrollId && previous.engraved && previous.name === scrollName) {
        const valid = value => value && !value.locked && !value.equipped && value.count > 0 && (value.bless & 31) === 1 && value.fullName === scrollName;
        let replacement = previous.fallbackId ? a.current(previous.fallbackId) : null;
        if (!valid(replacement)) for (const candidate of a.all?.() || []) {
          if (candidate.fullName !== scrollName) continue;
          const latest = a.current(candidate.id);
          if (valid(latest)) { replacement = latest; break; }
        }
        if (valid(replacement)) { scroll = replacement; scrollId = replacement.id; previous.fallbackId = replacement.id; }
      }
      if (!scroll || scroll.locked || scroll.count <= 0 || (scroll.bless & 31) !== 1
        || variants.plainName(scroll.fullName) !== scrollName) throw Error(`${key}必須綁定普通「${scrollName}」`);
      if (!previous || scrollId === hotbarIdSafe(saved, key)) bindings.set(bindingKey, { id: scrollId, name: scrollName, engraved: variants.engraved(scroll) });
      await new Promise((resolve, reject) => {
        pending = { targetId: target.id, level: target.level, scrollId, count: scroll.count, targetDone: false, scrollDone: false, resolve, reject, timer: null };
        pending.timer = schedule(() => finish(Error('強化結果或卷軸數量逾時，停止且不重送')), 4000);
        try {
          if (signal?.aborted) throw Error('已停止');
          a.beforeSend?.();
          a.net.send({ t: 'item.use', id: scrollId, targetId: target.id });
        } catch (error) { finish(error); }
      });
    }
    function hotbarIdSafe(saved, key) { try { return hotbarId(saved, key); } catch { return null; } }
    return { enhance, busy: () => !!pending, dispose() { finish(Error('強化程式已關閉')); unsubscribe?.(); } };
  }
  return { hotbarId, create };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.天仁角色設定 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  const keyFor = name => `天仁設定:${name}`;
  const clone = value => JSON.parse(JSON.stringify(value));
  function create(a) {
    const defaults = clone(a.capture());
    let character = '', last = '', applying = false, blocked = false;
    const pending = new Map();
    function sync(force = false) {
      const name = String(a.character() || '').trim();
      if (!name) return false;
      if (name === character && (!force || blocked)) return !blocked;
      let saved = {};
      try {
        const text = a.storage.getItem(keyFor(name));
        if (text) {
          const data = JSON.parse(text);
          if (data.schema !== 1 || !data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) throw Error('角色設定格式不符');
          saved = data.settings;
        }
      } catch { character = name; blocked = true; a.error?.('無法讀取角色設定，未覆蓋原資料'); return false; }
      character = name; blocked = false; applying = true;
      try { a.apply({ ...clone(defaults), ...saved, ...Object.fromEntries(pending) }); pending.clear(); }
      finally { applying = false; }
      last = ''; return save();
    }
    function save(section) {
      if (applying) return false;
      const name = String(a.character() || '').trim();
      if (!name || name !== character) {
        if (section) pending.set(section, clone(a.capture()[section]));
        return sync();
      }
      if (blocked) return false;
      const text = JSON.stringify({ schema: 1, settings: a.capture() });
      if (text === last) return true;
      try { a.storage.setItem(keyFor(name), text); last = text; return true; }
      catch { a.error?.('角色設定儲存失敗，請保留目前頁面'); return false; }
    }
    return { sync, save, current: () => !!character && character === String(a.character() || '').trim() && !blocked };
  }
  function fromPanel(panel) {
    const ui = name => panel.querySelector(`[data-ui="${name}"]`);
    const rows = selector => [...panel.querySelectorAll(selector)].map(row => ({ enabled: row.querySelector('[type=checkbox]').checked, percent: Number(row.querySelector('[type=number]').value), value: row.querySelector('select').value }));
    const shoppingList = panel.querySelector('[data-buy="list"]');
    return {
      ...(shoppingList ? { shopping: { enabled: !!panel.querySelector('[data-buy="enabled"]')?.checked, rules: [...shoppingList.options].map(option => ({ name: option.value, target: Number(option.dataset.target) })) } } : {}),
      health: { rules: rows('[data-health="rows"] .health-row').map(({ value, ...rule }) => ({ ...rule, kind: value })) },
      extra: { rules: rows('.protection-extra .health-row').map(({ value, ...rule }) => ({ ...rule, name: value })), idle: { enabled: !!panel.querySelector('[data-extra="idle"]')?.checked, seconds: Number(panel.querySelector('[data-extra="seconds"]')?.value || 7) } },
      general: { repair: !!ui('autoRepair')?.checked, discard: !!ui('discardEnabled')?.checked, day: !!ui('day')?.checked },
      enchant: { name: ui('weapon')?.value || '', key: ui('key')?.value || 'F5', target: Number(ui('target')?.value || 7) }
    };
  }
  function backupFromPanel(storage, name, panel) {
    if (!name || !panel) return false;
    const text = storage.getItem(keyFor(name));
    const saved = text ? JSON.parse(text) : null;
    if (saved && (saved.schema !== 1 || !saved.settings || typeof saved.settings !== 'object' || Array.isArray(saved.settings))) throw Error('角色設定格式不符');
    storage.setItem(keyFor(name), JSON.stringify({ schema: 1, settings: { ...saved?.settings, ...fromPanel(panel) } })); return true;
  }
  return { create, keyFor, fromPanel, backupFromPanel };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.天仁商店資料 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  const items = ['肉', '治癒藥水', '強力治癒藥水', '終極治癒藥水', '自我加速藥水', '勇敢藥水', '惡魔之血', '精靈餅乾', '慎重藥水', '鑑定卷軸', '瞬間移動卷軸', '傳送回家的卷軸', '血盟傳送卷軸', '復活卷軸', '變形卷軸', '對盔甲施法的卷軸', '對武器施法的卷軸'];
  const prices = [1, 40, 220, 660, 220, 880, 880, 1980, 660, 55, 77, 132, 132, 1100, 1430, 59600, 118700];
  const rows = [
    [1000000799, '邁爾', [1,12,13,14,16,17,18,19,20,21,22,23,24,26,27,28,29]],
    [1000001181, '露西', [3,11,12,13,15,16,17,18,19,20,21,22,23,26,25,null,null]],
    [1000001465, '艾米娜', [1,11,12,null,14,15,16,17,18,19,20,21,22,25,24,null,null]],
    [1000001931, '潘朵拉', [25,28,29,null,31,32,33,34,35,37,38,39,40,null,41,null,null], { 治癒藥水:44, 強力治癒藥水:242, 自我加速藥水:242 }],
    [1000000760, '梅林', [1,11,12,null,14,15,16,17,18,19,20,21,22,25,24,null,null], { 治癒藥水:44, 強力治癒藥水:242, 自我加速藥水:242, 鑑定卷軸:60, 瞬間移動卷軸:84, 傳送回家的卷軸:145, 血盟傳送卷軸:145, 復活卷軸:1210 }],
    [1000000882, '索拉雅', [3,12,13,14,16,17,18,19,20,21,22,23,24,27,26,null,null]],
    [1000001071, '傑克森', [8,13,null,null,15,16,17,18,19,20,21,null,null,null,null,null,null], { 治癒藥水:44, 自我加速藥水:242, 精靈餅乾:880, 慎重藥水:1980, 鑑定卷軸:660, 瞬間移動卷軸:55 }],
    [1000000753, '蓓莉', [1,6,7,8,10,11,12,13,14,16,17,18,19,21,22,null,null]],
    [1000000899, '畢伍斯', [1,12,13,14,16,17,18,19,20,24,25,21,22,28,23,null,null]]
  ];
  const shops = rows.map(([id, name, orders, overrides = {}]) => ({ id, name, items: items.flatMap((name, index) => orders[index] == null ? [] : [{ name, orderId: orders[index], price: overrides[name] ?? prices[index] }]) }));
  const shopsByName = new Map(shops.map(shop => [shop.name, shop]));
  function nearby(world, decode = x => x) {
    const self = world?.self, screen = world?.app?.screen;
    if (!self || self.dead || !screen || !world.ents?.entries || world.mapLoadBusy === true || world.mapLoading === true) return null;
    const start = world.screenToWorld(0, 0), end = world.screenToWorld(screen.width, screen.height);
    const candidates = [];
    for (const [id, entity] of world.ents.entries()) {
      if (!entity || entity.obj?.kind !== 'npc' || entity.dead || entity.crowdHidden || entity.root?.visible !== true) continue;
      if (!Number.isSafeInteger(id) || id <= 0 || entity.obj.id !== id) continue;
      if (![entity.gx, entity.gy, self.gx, self.gy].every(Number.isFinite)) continue;
      const distance = Math.max(Math.abs(entity.gx-self.gx), Math.abs(entity.gy-self.gy));
      if (distance > 5) continue;
      let name;
      try { name = String(decode(entity.obj.name || '')).trim().replace(/^雜貨商\s*/, ''); } catch { continue; }
      const shop = shopsByName.get(name);
      if (!shop) continue;
      const point = world.smoothFoot(entity);
      if (distance > 5 || ![point.x,point.y,start.x,start.y,end.x,end.y].every(Number.isFinite) || point.x < start.x || point.y < start.y || point.x > end.x || point.y > end.y) continue;
      candidates.push({ ...shop, id, distance });
    }
    return candidates.sort((a,b) => a.distance-b.distance || a.id-b.id)[0] || null;
  }
  return { items, shops, nearby };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./merchant-data.js'));
  else root.天仁自動購買 = factory(root.天仁商店資料);
})(typeof window === 'undefined' ? globalThis : window, catalog => {
  function create(a) {
    const schedule = a.schedule || setTimeout, cancel = a.cancel || clearTimeout, defer = a.defer || queueMicrotask;
    let enabled = false, rules = [], pending = null, timer = null, paused = false, ready = a.initialReady === true, disposed = false, status = '未啟動';
    let revision = 0, lastCheck = '';
    const settings = () => ({ enabled, rules: rules.map(x => ({ ...x })) });
    const state = () => ({ ...settings(), pending: !!pending, paused, status });
    const changed = () => { if (!disposed) a.changed?.(state()); };
    const text = value => { if (status !== value) { status = value; changed(); } };
    function cancelTick() { if (timer != null) cancel(timer); timer = null; }
    function release() { if (pending) cancel(pending.deadline); pending = null; }
    function halt(message) { release(); paused = true; cancelTick(); text(message + '；取消再勾選啟動可重試'); changed(); }
    function wake() { if (timer == null && !disposed && enabled && !paused && !pending && rules.length) timer = schedule(() => { timer = null; tick(); wake(); }, 1000); }
    function inventory() {
      const items = a.all();
      if (!Array.isArray(items) || items.some(x => !x.fullName || !Number.isSafeInteger(x.count) || x.count <= 0)) throw Error('背包資料不完整');
      return items;
    }
    const total = (items, name) => items.filter(x => x.fullName === name).reduce((n,x) => n+x.count,0);
    function confirm() {
      if (!pending || disposed) return;
      try {
        const items = inventory(), count = total(items,pending.name), gold = total(items,'金幣');
        if (count >= pending.beforeCount+pending.count && gold === pending.beforeGold-pending.cost) {
          const finished = pending; release(); text(`已補貨：${finished.name}＋${finished.count}`); changed(); wake();
        }
      } catch {}
    }
    function tick() {
      if (disposed || !enabled || paused || pending) return;
      if (!ready) { text('等待背包資料'); return; }
      if (!rules.length) { text('請新增補貨物品'); return; }
      if (a.busy?.()) { text('等待目前操作完成'); return; }
      let shop;
      try { shop = a.nearby(); } catch { text('等待場景資料'); return; }
      if (!shop) { text('等待商人（畫面內5格）'); return; }
      if (lastCheck === `${shop.id}:${revision}`) { text(`${shop.name}：可購買項目已補齊`); return; }
      try {
        const items = inventory();
        for (const rule of rules) {
          const product = shop.items.find(x => x.name === rule.name);
          if (!product) continue;
          const count = rule.target-total(items,rule.name); if (count <= 0) continue;
          if (a.blockedItem?.(rule.name)) { halt(`${rule.name}同時在刪物清單`); return; }
          if (!Number.isSafeInteger(shop.id) || !Number.isSafeInteger(product.orderId) || !Number.isSafeInteger(product.price) || product.price < 0) { halt('商店資料不符'); return; }
          const gold = total(items,'金幣'), cost = count*product.price;
          if (!Number.isSafeInteger(cost) || gold < cost) { halt('金幣不足'); return; }
          pending = { shopId:shop.id,name:rule.name,count,cost,beforeGold:gold,beforeCount:total(items,rule.name),deadline:null };
          pending.deadline = schedule(() => { if (!pending) return; confirm(); if (pending) halt('購買結果未確認，請檢查背包或負重'); },5000);
          cancelTick(); text(`${shop.name}：補貨${rule.name}×${count}`); changed();
          try { a.send({t:'shop.buy',npcId:shop.id,lines:[{orderId:product.orderId,count}]}); }
          catch { halt('購買結果未確認'); }
          return;
        }
        lastCheck = `${shop.id}:${revision}`; text(`${shop.name}：可購買項目已補齊`);
      } catch { text('等待完整背包資料'); }
    }
    function enable(value) {
      enabled = value === true; paused = false; lastCheck = ''; cancelTick();
      text(enabled ? '準備補貨' : pending ? '已停用，等待最後一筆結果' : '未啟動'); changed(); tick(); wake();
    }
    function valid(rule) { return rule && catalog.items.includes(rule.name) && Number.isSafeInteger(rule.target) && rule.target >= 1 && rule.target <= 9999; }
    function upsert(name,target) {
      const rule={name,target}; if(!valid(rule)) throw Error('請選擇物品，數量填1至9999');
      const old=rules.find(x=>x.name===name); if(old) old.target=target; else rules.push(rule); lastCheck='';
      changed(); tick(); wake();
    }
    function restore(value) {
      cancelTick(); lastCheck=''; const unique=new Map();
      for(const rule of Array.isArray(value?.rules)?value.rules:[]) if(valid(rule)) unique.set(rule.name,{name:rule.name,target:rule.target});
      rules=[...unique.values()]; enabled=value?.enabled===true; paused=false;
      text(enabled?'準備補貨':'未啟動'); changed(); tick(); wake();
    }
    function receive(msg) {
      if(disposed) return;
      if(['inv.list','inv.add','inv.update','inv.remove'].includes(msg.t)) revision++;
      if(msg.t==='world.enter'||msg.t==='conn.closed') { ready=false; if(pending) halt('連線或角色變更，購買結果未確認'); return; }
      if(msg.t==='world.map'||msg.t==='world.teleport') { if(pending) halt('位置變更，購買結果未確認'); return; }
      if(msg.t==='inv.list') { defer(()=>{if(disposed)return;ready=true;confirm();wake();}); return; }
      if(['inv.add','inv.update','inv.remove'].includes(msg.t)&&pending) defer(confirm);
    }
    return {state,settings,tick,receive,enable,upsert,restore,remove(name){rules=rules.filter(x=>x.name!==name);lastCheck='';changed();if(!rules.length)cancelTick();},
      setReady(){ready=true;tick();wake();}, stop(){enable(false);},
      dispose(){disposed=true;cancelTick();release();} };
  }
  function mount(a) {
    const pane=a.pane;
    pane.innerHTML='<label class="buy-enable"><input type="checkbox" data-buy="enabled"> 啟動</label><div class="buy-entry"><label>物品<select data-buy="item" aria-label="補貨物品"></select></label><label>補到<input type="number" data-buy="target" min="1" max="9999" value="10" aria-label="補貨目標數量"></label></div><div class="actions"><button data-buy="add">新增</button><button data-buy="remove">刪除</button></div><label>補貨清單<select data-buy="list" size="5" aria-label="補貨清單"></select></label><div data-buy="status" role="status">未啟動</div>';
    const el=name=>pane.querySelector(`[data-buy="${name}"]`);
    for(const name of catalog.items){const option=document.createElement('option');option.value=name;option.textContent=name;el('item').append(option);}
    let disposed=false,signature='';
    const controller=create({...a,changed(current){
      if(disposed)return;el('enabled').checked=current.enabled;el('status').textContent=current.status;
      const next=JSON.stringify(current.rules);
      if(next!==signature){signature=next;const selected=el('list').value;el('list').replaceChildren(...current.rules.map(rule=>{const option=document.createElement('option');option.value=rule.name;option.dataset.target=String(rule.target);option.textContent=`${rule.name} → ${rule.target}`;return option;}));if(current.rules.some(x=>x.name===selected))el('list').value=selected;}
      a.changed?.(current);
    }});
    el('enabled').onchange=()=>controller.enable(el('enabled').checked);
    el('add').onclick=()=>{try{controller.upsert(el('item').value,Number(el('target').value));}catch(error){el('status').textContent=error.message;}};
    el('remove').onclick=()=>controller.remove(el('list').value);
    el('list').onchange=()=>{const rule=controller.settings().rules.find(x=>x.name===el('list').value);if(rule){el('item').value=rule.name;el('target').value=String(rule.target);}};
    const unsubscribe=a.net.on(controller.receive);
    a.ready.then(()=>{if(!disposed)controller.setReady();}).catch(()=>{if(!disposed)el('status').textContent='背包讀取失敗';});
    return {settings:controller.settings,restore:controller.restore,stop:controller.stop,recheck:controller.tick,dispose(){disposed=true;unsubscribe?.();controller.dispose();}};
  }
  return {create,mount};
});

(function (root) {
  root.天仁介面樣式 = `
  #裝備強化第一版{--底:#151719;--卡:#20252a;--線:#687480;--金:#e4c98b;--字:#f5f3ed;--次:#c4cbd2;position:fixed;right:14px;top:14px;width:352px;max-width:calc(100vw - 24px);z-index:2147483647;background:linear-gradient(145deg,#20252b,var(--底) 52%);color:var(--字);border:1px solid #6b6246;border-radius:15px;padding:12px;box-shadow:0 14px 36px #0007,0 1px 0 #e7d9ab18 inset;font:15px/1.5 'Microsoft JhengHei',sans-serif;box-sizing:border-box;color-scheme:dark}
  #裝備強化第一版 *{box-sizing:border-box}#裝備強化第一版 [hidden]{display:none!important}
  #裝備強化第一版 header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 14px;padding:0 2px 12px;border-bottom:1px solid var(--線)}
  #裝備強化第一版 .brand{display:flex;align-items:center;gap:9px;font-size:19px;font-weight:700;white-space:nowrap;letter-spacing:.5px}#裝備強化第一版 .brand-mark{display:grid;place-items:center;width:30px;height:34px;border:1px solid #a88d55;border-radius:8px;color:var(--金);background:#c5ab6c0b;font-size:19px;font-weight:400}#裝備強化第一版 .build-label{display:block;font-size:13px;letter-spacing:.3px;font-weight:400;color:var(--次);margin-top:1px}
  #裝備強化第一版 button,#裝備強化第一版 select,#裝備強化第一版 input{margin:0;font:inherit;border:1px solid var(--線);border-radius:7px;background:#272c31;color:var(--字);padding:8px;min-width:0}
  #裝備強化第一版 button{cursor:pointer;transition:background-color .15s,border-color .15s}#裝備強化第一版 button:hover:not(:disabled){background:#3a424b;border-color:#99865d}#裝備強化第一版 button:disabled{opacity:.4;cursor:default}#裝備強化第一版 :is(button,input,select):focus-visible{outline:2px solid var(--金);outline-offset:2px}
  #裝備強化第一版 .window-actions{display:flex;gap:5px;flex-shrink:0}#裝備強化第一版 .window-actions button{padding:5px 8px;font-size:13px;background:#ffffff05}#裝備強化第一版 [data-ui=close]{font-size:18px;line-height:18px;color:#c4c8be}
  #裝備強化第一版 nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;margin-bottom:14px;padding:3px;border:1px solid #58636e;border-radius:9px;background:#111418}#裝備強化第一版 nav button{font-size:14px;letter-spacing:-.5px;white-space:nowrap;padding:8px 0;border:1px solid transparent;background:transparent;color:#e1e6eb;min-width:0}#裝備強化第一版 nav button[aria-selected=true]{background:linear-gradient(#efdaa5,#e4c98b);color:#17191b;border-color:#dec88e;font-weight:700;box-shadow:0 2px 6px #0004}
  #裝備強化第一版 [data-pane]{max-height:min(590px,var(--面板可用高度,calc(100dvh - 150px)));overflow:auto;scrollbar-width:thin;scrollbar-color:#84909d #151719;padding:0 2px 2px}#裝備強化第一版 [data-pane=health]{max-height:min(540px,var(--面板可用高度,calc(100dvh - 190px)));padding-right:4px}
  #裝備強化第一版 label{display:block;margin-top:10px;font-size:14px;color:var(--次)}#裝備強化第一版 select{width:100%;margin-top:4px}#裝備強化第一版 input{width:100%;font-variant-numeric:tabular-nums}#裝備強化第一版 input[type=checkbox]{width:16px;height:16px;margin:0 5px 0 0;accent-color:var(--金);vertical-align:middle;flex-shrink:0;cursor:pointer}#裝備強化第一版 select option,#裝備強化第一版 select optgroup{color:#fff;background:#272c31}
  #裝備強化第一版 .row{display:flex;gap:10px}#裝備強化第一版 .row label{flex:1;min-width:0}#裝備強化第一版 .row input{margin-top:4px}#裝備強化第一版 .actions{display:flex;gap:8px;margin:12px 0}#裝備強化第一版 .actions button{flex:1;min-height:37px}
  #裝備強化第一版 [data-ui=start],#裝備強化第一版 [data-buy=add]{background:linear-gradient(#efdaa5,#e4c98b);border-color:#e4c98b;color:#17191b;font-weight:700}#裝備強化第一版 [data-ui=stop]{background:#422c29;border-color:#69403a;color:#f2c5b9}
  #裝備強化第一版 [role=status]{padding:9px 10px;margin-top:10px;background:#101316;border:1px solid #58636e;border-left:2px solid #9d8c5d;border-radius:6px;color:#d8e0e7;font-size:13px;line-height:1.6;white-space:pre-line;overflow-wrap:anywhere}#裝備強化第一版 [role=status]:empty{display:none}
  #裝備強化第一版 [data-health=hp]{padding:12px;border:1px solid #465340;border-radius:9px;background:linear-gradient(110deg,#293a29,#1a241d);font-size:16px;font-weight:600;letter-spacing:.2px;font-variant-numeric:tabular-nums}
  #裝備強化第一版 .protection-title{display:flex;align-items:center;gap:8px;margin-top:15px;font-size:16px;color:var(--金);font-weight:600;letter-spacing:.8px}#裝備強化第一版 .protection-title:after{content:'';height:1px;flex:1;background:var(--線)}#裝備強化第一版 .health-hint{font-size:13px;color:var(--次);margin:4px 0 7px}
  #裝備強化第一版 .health-row{display:grid;grid-template-columns:18px 54px 14px minmax(0,1fr);gap:4px 5px;align-items:center;padding:7px 8px;margin-top:5px;background:var(--卡);border:1px solid #58636e;border-radius:7px}#裝備強化第一版 .health-row input,#裝備強化第一版 .health-row select{padding:6px;font-size:15px;min-width:0;margin:0}#裝備強化第一版 .health-row>span:not(.health-equivalent){color:var(--次);font-size:14px}#裝備強化第一版 .health-equivalent{grid-column:2/5;font-size:11px;color:#adb9a8;line-height:1.2}#裝備強化第一版 [data-health=status]{padding:6px 9px;margin-top:7px}#裝備強化第一版 [data-health=status]+.health-hint{margin-top:6px}
  #裝備強化第一版 .idle-row{display:flex;align-items:center;gap:6px;padding:9px;background:var(--卡);border:1px solid var(--線);border-radius:7px;margin-top:7px}#裝備強化第一版 .idle-row input[type=number]{width:64px;padding:5px}
  #裝備強化第一版 .buy-enable{display:flex;align-items:center;gap:4px;padding:10px 12px;margin:0 0 12px;border:1px solid #8996a3;border-radius:8px;background:#272c31;color:var(--字);font-size:15px}#裝備強化第一版 .buy-enable:has(input:checked){border-color:#e4c98b;background:#38332a}#裝備強化第一版 .buy-entry{display:grid;grid-template-columns:minmax(0,1fr) 82px;gap:8px}#裝備強化第一版 .buy-entry label{min-width:0;margin-top:0}#裝備強化第一版 .buy-entry input{margin-top:4px}#裝備強化第一版 select[size]{border:1px solid #687480;background:#1b2025;border-radius:8px;padding:6px;min-height:155px}#裝備強化第一版 select[size] option{padding:8px;border-radius:4px;background:#1b2025;white-space:normal}
  #裝備強化第一版 [data-pane=repair]>label{display:flex;align-items:center;background:var(--卡);color:var(--字);padding:12px;border:1px solid var(--線);border-radius:8px;font-size:15px}#裝備強化第一版 [data-ui=repairScan]{margin-top:10px;width:100%}#裝備強化第一版 hr{border:0;border-top:1px solid var(--線);margin:15px 0}
  #裝備強化第一版 small{display:block;color:var(--次);margin-top:10px;font-size:12px}
  #裝備強化第一版.is-collapsed>:not(header):not(style){display:none!important}#裝備強化第一版.is-collapsed{width:64px;height:36px;padding:0;right:8px;top:8px;border-radius:8px;box-shadow:0 2px 8px #0006}#裝備強化第一版.is-collapsed header{height:100%;display:block;padding:0;border:0;margin:0}#裝備強化第一版.is-collapsed header>span:first-child,#裝備強化第一版.is-collapsed [data-ui=close]{display:none}#裝備強化第一版.is-collapsed .window-actions{display:block;height:100%}#裝備強化第一版.is-collapsed [data-ui=collapse]{width:100%;height:100%;border:0;background:transparent;color:var(--金);font-size:13px;touch-action:none;user-select:none;cursor:grab}#裝備強化第一版.is-dragging [data-ui=collapse]{cursor:grabbing}
  @media(max-width:360px){#裝備強化第一版{right:12px;padding:10px}#裝備強化第一版 nav{grid-template-columns:repeat(3,minmax(0,1fr))}#裝備強化第一版 nav button{font-size:14px;letter-spacing:0}#裝備強化第一版 .brand{font-size:19px}#裝備強化第一版 .health-row{padding:6px;grid-template-columns:17px 48px 13px minmax(0,1fr);gap:4px}#裝備強化第一版 .health-row select{font-size:15px}}
  @media(prefers-reduced-motion:reduce){#裝備強化第一版 button{transition:none}}
  `;
  const 配色 = [
    { 名稱: ['治癒藥水'], 色: '#ff8b91' },
    { 名稱: ['強力治癒藥水'], 色: '#fff176' },
    { 名稱: ['終極治癒藥水'], 色: '#e8bd68' },
    { 名稱: ['傳送回家的卷軸', '傳送回家卷軸', 'home'], 色: '#ffcf40' }
  ];
  root.天仁介面樣式 += '#裝備強化第一版 select,#裝備強化第一版 select option{color:#fff}';
  for (const 項 of 配色) {
    const 條件 = 項.名稱.flatMap(名稱 => [
      `[value="${名稱}"]`, `[value^="${名稱}("]`, `[value^="${名稱}（"]`, `[value="${名稱}刻印"]`, `[value="${名稱} 刻印"]`
    ]);
    const 選擇器 = 條件.flatMap(值 => [`#裝備強化第一版 option${值}`, `#裝備強化第一版 select:has(option${值}:checked)`]);
    root.天仁介面樣式 += `${選擇器.join(',')}{color:${項.色}}`;
  }
})(typeof window === 'undefined' ? globalThis : window);

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.天仁面板拖曳 = factory();
})(typeof window === 'undefined' ? globalThis : window, () => {
  function attach({panel,button,viewport=()=>({width:window.innerWidth,height:window.innerHeight})}) {
    let active=null,suppress=false;
    const clamp=(n,min,max)=>Math.max(min,Math.min(Math.max(min,max),n));
    function down(e) {
      suppress=false;
      if(e.button!==0||!panel.classList.contains('is-collapsed'))return;
      const rect=panel.getBoundingClientRect();
      active={id:e.pointerId,x:e.clientX,y:e.clientY,rect,moved:false,
        expandedRight:Number(panel.dataset.expandedMeasuredRight)||0,expandedTop:Number(panel.dataset.expandedMeasuredTop)||0};
      button.setPointerCapture?.(e.pointerId);
    }
    function move(e) {
      if(!active||e.pointerId!==active.id)return;
      let dx=e.clientX-active.x,dy=e.clientY-active.y;
      if(!active.moved&&Math.hypot(dx,dy)<4)return;
      active.moved=true; const size=viewport(),rect=active.rect;
      const left=clamp(rect.left+dx,0,size.width-rect.width),top=clamp(rect.top+dy,0,size.height-rect.height);
      dx=left-rect.left;dy=top-rect.top;
      panel.style.right=`${size.width-left-rect.width}px`;panel.style.top=`${top}px`;
      panel.dataset.expandedRight=`${clamp(active.expandedRight-dx,0,size.width-(Number(panel.dataset.expandedWidth)||352))}px`;
      panel.dataset.expandedTop=`${Math.max(0,active.expandedTop+dy)}px`;
      panel.classList.add('is-dragging');e.preventDefault();
    }
    function up(e) {
      if(!active||e.pointerId!==active.id)return;
      suppress=active.moved;active=null;panel.classList.remove('is-dragging');
      try{button.releasePointerCapture?.(e.pointerId);}catch{}
    }
    function abort() {if(!active)return;active=null;suppress=false;panel.classList.remove('is-dragging');}
    function click(e) {if(!suppress)return;suppress=false;e.preventDefault();e.stopImmediatePropagation();}
    const handlers={pointerdown:down,pointermove:move,pointerup:up,pointercancel:abort,lostpointercapture:abort,click};
    for(const [type,fn]of Object.entries(handlers))button.addEventListener(type,fn,type==='click');
    return ()=>{abort();for(const [type,fn]of Object.entries(handlers))button.removeEventListener(type,fn,type==='click');};
  }
  return {attach};
});

(() => {
  'use strict';
  if (window.__天仁輔助) {
    if (window.__天仁輔助.version !== '1.8.1') {
      try {
        const 角色名 = window.__wl?.world?.selfName?.();
        if (!角色名) { alert('角色資料尚未就緒，請稍後再點書籤，先不要重新整理。'); return; }
        window.天仁角色設定.backupFromPanel(localStorage, 角色名, document.querySelector('#裝備強化第一版'));
        const values = [...document.querySelectorAll('#裝備強化第一版 [data-ui="discardList"] option')].map(option => option.value);
        const saved = window.自動刪物流程序.backupActiveList(localStorage, window.__wl?.world?.selfName?.(), values);
        if (values.length && !saved) { alert('角色資料尚未就緒，請稍後再點書籤，先不要重新整理。'); return; }
        alert('已保存目前設定' + (saved ? '與刪物名單。' : '。') + '請重新整理遊戲，再點書籤載入最新版。');
      } catch { alert('目前名單儲存失敗，請先保留遊戲頁面。'); }
    }
    window.__天仁輔助.show(); return;
  }
  if (window.__裝備強化第一版) { window.__裝備強化第一版.close(); alert('請重新整理遊戲，再點「天仁輔助」，避免舊版同時操作。'); return; }
  const 模擬 = location.hostname === '127.0.0.1' && document.body.dataset.enchantDemo === 'true';
  if (location.hostname !== 'classic.lescaria.com' && !模擬) { alert('請進入遊戲後，再點「天仁輔助」書籤。'); return; }
  if (!window.__wl?.net?.on || !window.裝備強化流程) { alert('請先登入遊戲。'); return; }
  const 授權連線 = { on(fn){return window.__wl.net.on(fn)},send(...args){if(!window.__天仁授權.gate.valid())throw Error('授權已停止');return window.__wl.net.send(...args)} };
  const 資料 = new Map();
  const 背包來源 = window.天仁背包來源.create({ net: window.__wl.net, parseLabel: window.自動刪物流程序.parseLabel });
  let 控制 = null, 工作中 = false, 待回覆 = null, 次數 = 0, 需要重讀 = true;
  let 修理中 = false, 修理控制 = null, 修理回覆 = false, 修理次數 = 0, 已關閉 = false;
  let 換圖暫停至 = 0, 修理因換圖中斷 = false, 修理因操作中斷 = false;
  let 刪物中 = false, 刪物管理 = null;
  let 血量傳送中 = false, 血量管理 = null, 保護擴充 = null, 低血傳送中 = false, 擴充道具中 = false;
  let 設定保存 = null, 正在還原 = false, 角色待還原 = false, 已選裝備 = '';
  let 購買管理 = null, 購買中 = false, 上次購買設定 = '';
  let 上次血量設定 = '', 上次擴充設定 = '';
  let 使用中武器編號 = null;
  let 快捷欄快取 = { key: null, text: null, data: null };
  const 快速強化器 = window.天仁快速強化.create({ net: 授權連線, current: id => 背包來源.item(id), all: () => 背包來源.all(),
    hotbar() {
      const name = window.__wl.world?.selfName?.();
      if (!name) throw Error('角色資料尚未就緒');
      try {
        const key = `wl.classicHotbar.${name}`, text = localStorage.getItem(key);
        if (key !== 快捷欄快取.key || text !== 快捷欄快取.text) 快捷欄快取 = { key, text, data: JSON.parse(text || 'null') };
        return 快捷欄快取.data;
      }
      catch { throw Error('快捷欄資料無法讀取'); }
    }, hidden: () => document.hidden, picking: () => document.body.classList.contains('wl-pick-item'), beforeSend() { 次數++; } });
  const 主框 = document.createElement('section');
  主框.id = '裝備強化第一版';
  主框.setAttribute('aria-label', '天仁輔助');
  主框.dataset.version = '1.8.1';
  主框.innerHTML = `<style>${window.天仁介面樣式} #裝備強化第一版 header{gap:5px} #裝備強化第一版 .brand{font-size:17px;gap:0} #裝備強化第一版 .brand-mark{display:none} #裝備強化第一版 .window-actions{align-items:center} #裝備強化第一版 [data-ui=licenseCountdown]{font-size:13px;font-weight:600;color:var(--金);font-variant-numeric:tabular-nums;white-space:nowrap;margin-right:2px} #裝備強化第一版.is-collapsed [data-ui=licenseCountdown]{display:none}</style><header><span class="brand"><span class="brand-mark" aria-hidden="true">仁</span><span>天仁輔助<span class="build-label">1.8.1 · 正式版</span></span></span><span class="window-actions"><span data-ui="licenseCountdown" aria-label="金鑰剩餘時間"></span><button data-ui="collapse" aria-label="收合面板" aria-expanded="true">收合</button><button data-ui="close" aria-label="關閉並停止">×</button></span></header>
  <nav role="tablist" aria-label="輔助功能"><button role="tab" data-tab="health" data-ui="healthTab" aria-selected="true">血量保護</button><button role="tab" data-tab="repair" aria-selected="false">功能</button><button role="tab" data-tab="shopping" aria-selected="false">自動購買</button><button role="tab" data-tab="enchant" aria-selected="false">點裝備</button><button role="tab" data-tab="discard" aria-selected="false">自動刪物</button></nav>
  <div data-pane="health"></div>
  <div data-pane="repair" hidden><label><input data-ui="day" type="checkbox"> 全白天</label><div data-ui="dayStatus" hidden></div><hr><label><input data-ui="autoRepair" type="checkbox" checked> 自動修武器</label><button data-ui="repairScan">重新讀取背包</button><div data-ui="repairStatus" role="status" aria-live="polite">正在讀取背包…</div></div>
  <div data-pane="enchant" hidden>
  <button data-ui="scan">讀取裝備</button>
  <label>裝備<select data-ui="weapon"><option value="">請先讀取裝備</option></select></label>
  <div class="row"><label>卷軸鍵<select data-ui="key"><option>F5</option><option>F6</option></select></label><label>目標＋<input data-ui="target" type="number" min="1" max="15" value="7"></label></div>
  <div class="actions"><button data-ui="start" disabled>開始</button><button data-ui="stop">停止</button></div>
  <div data-ui="status" role="status" aria-live="polite">先讀取裝備，再選擇名稱。</div>
  </div>
  <div data-pane="shopping" hidden></div>
  <div data-pane="discard" hidden><label><input data-ui="discardEnabled" type="checkbox"> 啟動</label><button data-ui="discardScan">讀取物品</button><label>身上物品<select data-ui="discardItem"></select></label><div class="actions"><button data-ui="discardAdd">新增</button><button data-ui="discardDelete">刪除</button></div><label>丟棄物品欄<select data-ui="discardList" size="6" aria-label="丟棄物品欄"></select></label><div data-ui="discardStatus" role="status" aria-live="polite">已停止</div></div>`;
  document.body.appendChild(主框);
  const 元素 = 名稱 => 主框.querySelector(`[data-ui="${名稱}"]`);
  const 狀態 = 文字 => { if (元素('status').textContent !== 文字) 元素('status').textContent = 文字; };
  const 下一格 = () => new Promise(resolve => requestAnimationFrame(resolve));
  const 解析 = 名稱 => {
    const 文字 = String(名稱 || '').trim().replace(/\s*\([\d,]+\)\s*$/, '');
    const 比對 = 文字.match(/^\+(\d+)\s*(.+)$/);
    return { name: 比對 ? 比對[2].trim() : 文字, level: 比對 ? Number(比對[1]) : 0 };
  };
  const 格子 = id => document.querySelector(`.classic-open__inv-cell[data-item-id="${Number(id)}"]`);
  const 顯示 = e => !!e && e.getClientRects().length > 0;
  const 穿戴 = e => { const m = e?.querySelector('[data-csb="Mark_On"]'); return !!m && !m.hidden; };
  const 封印 = e => { const m = e?.querySelector('[data-csb="Mark_Lock"]'); return !!m && !m.hidden; };
  function 按鍵(key) {
    const input = document.querySelector('input.classic-open__chat-input');
    if (!input) throw Error('找不到遊戲鍵盤輸入欄位');
    input.focus({ preventScroll: true });
    const init = { key, code: key, bubbles: true, cancelable: true };
    try { input.dispatchEvent(new KeyboardEvent('keydown', init)); }
    finally { input.dispatchEvent(new KeyboardEvent('keyup', init)); }
  }
  function 取消選取() { if (document.body.classList.contains('wl-pick-item')) 按鍵('Escape'); }
  function 讀提示(cell) {
    if (document.body.classList.contains('wl-pick-item')) throw Error('請先取消遊戲中的物品選取');
    cell.dispatchEvent(new PointerEvent('pointerenter'));
    const 名稱框 = document.querySelector('.classic-open__item-name:not([hidden])');
    let 名稱 = 名稱框?.innerText.trim() || '';
    const 懸停名稱 = 名稱;
    // 單次 click 只查看資訊，不發出 pointerdown，避免觸發遊戲的雙擊使用。
    cell.click();
    if (document.body.classList.contains('wl-pick-item')) { 取消選取(); throw Error('背包目前處於特殊選取模式，請先關閉'); }
    const 提示 = document.querySelector('.classic-open__tip:not([hidden])');
    const 詳細 = 提示?.innerText.trim() || '';
    if (詳細) 名稱 = 詳細.split('\n')[0].trim();
    cell.dispatchEvent(new PointerEvent('pointerleave'));
    const 安定 = 詳細.match(/安定值\s*[:：]?\s*(\d+)/);
    const 數量節點 = cell.querySelector('[data-csb="Tx_Count"]');
    const 數量文字 = 數量節點 && !數量節點.hidden ? 數量節點.textContent.replace(/,/g, '').trim() : '';
    const count = /^\d+$/.test(數量文字) ? Number(數量文字) : 1;
    return { id: Number(cell.dataset.itemId), ...解析(名稱), safe: 安定 ? Number(安定[1]) : null,
      fullName: window.自動刪物流程序.fullName(名稱, count), count,
      verifiedName: !!懸停名稱 && !!詳細 && window.自動刪物流程序.fullName(懸停名稱, count) === window.自動刪物流程序.fullName(名稱, count),
      weapon: /攻擊力\s*[:：]/.test(詳細), equipped: 穿戴(cell), locked: 封印(cell),
      wielding: /[（(]\s*揮舞\s*[）)]/.test(名稱), damage: window.武器修理流程.damage(詳細) };
  }
  function 鎖定(鎖) {
    for (const 名 of ['scan', 'weapon', 'key', 'target']) 元素(名).disabled = 鎖;
    元素('start').disabled = 鎖 || 需要重讀 || !元素('weapon').value;
    元素('stop').disabled = false;
  }
  function 停止() {
    if (!工作中) { 狀態('目前已停止，沒有進行強化。'); return; }
    控制?.abort();
    狀態(待回覆 || 快速強化器.busy() ? '停止中，等待最後一次結果；不再發起下一次。' : '正在停止…');
  }
  async function 讀取背包() {
    if (工作中 || 修理中 || 刪物中 || 血量傳送中) return;
    工作中 = true; 控制 = new AbortController(); 鎖定(true);
    try {
      if (document.body.classList.contains('wl-pick-item')) throw Error('請先按Esc取消目前選取');
      let cells = [...document.querySelectorAll('.classic-open__inv-cell[data-item-id]')];
      if (!cells.some(顯示)) {
        const open = document.querySelector('button[aria-label="開關道具欄"]');
        if (!open) throw Error('請先打開背包');
        open.click(); await 下一格(); await 下一格();
        cells = [...document.querySelectorAll('.classic-open__inv-cell[data-item-id]')];
      }
      if (!cells.length || !cells.some(顯示)) throw Error('請先打開背包');
      需要重讀 = true; 資料.clear();
      const ids = [...new Set(cells.map(e => Number(e.dataset.itemId)))];
      for (let i = 0; i < ids.length; i++) {
        if (控制.signal.aborted) throw Error('已停止讀取');
        const cell = 格子(ids[i]); if (!cell) continue;
        const item = 讀提示(cell); if (item.name) 資料.set(item.id, item);
        狀態(`讀取背包 ${i + 1}／${ids.length}`);
        if (i % 8 === 0) await 下一格();
      }
      const 選項 = new Map();
      for (const item of 資料.values()) {
        const 分類 = window.裝備強化流程.classify(item);
        if (!分類) continue;
        Object.assign(item, 分類);
        if (!選項.has(item.name)) 選項.set(item.name, []);
        選項.get(item.name).push(item);
      }
      元素('weapon').replaceChildren();
      for (const [名稱, 清單] of 選項) {
        const option = document.createElement('option'); option.value = 名稱;
        const 可用 = 清單.filter(x => !x.equipped && !x.locked).length;
        option.textContent = `${名稱}（${清單[0].category}／安定${清單[0].safe}／${可用}件）`; 元素('weapon').append(option);
      }
      const 預設 = [...元素('weapon').options].find(x => x.value === 已選裝備) || [...元素('weapon').options].find(x => x.value === '死亡騎士的烈炎之劍');
      if (預設) 元素('weapon').value = 預設.value;
      if (!選項.size) { 狀態('沒有可強化的裝備。'); return; }
      需要重讀 = false; 狀態(`已讀取${ids.length}格。請選裝備與目標。`);
    } catch (e) { 狀態(e.message); }
    finally { 工作中 = false; 控制 = null; 鎖定(false); }
  }
  function 更新訊息(msg) {
    if (msg.t === 'conn.closed') 停止修理('遊戲已斷線，修理已停止。');
    if (msg.t === 'world.enter' || msg.t === 'world.map' || msg.t === 'world.teleport') {
      換圖暫停至 = Date.now() + 4000;
      if (修理中) { 修理因換圖中斷 = true; 修理控制?.abort(); }
      if (元素('autoRepair').checked) 修理狀態('換地圖中，保持開啟；載入後自動繼續監看。');
    }
    if (修理中 && msg.t === 'inv.update') 修理回覆 = true;
    if (msg.t === 'conn.closed' && 待回覆) { 待回覆.reject(Error('遊戲已斷線，停止')); return; }
    if (msg.t === 'inv.remove') 資料.delete(msg.id);
    if (msg.t === 'inv.update') {
      const old = 資料.get(msg.id);
      if (old) {
        const next = { ...old };
        if (typeof msg.name === 'string') next.level = 解析(msg.name).level;
        if (typeof msg.equipped === 'boolean') next.equipped = msg.equipped;
        資料.set(msg.id, next);
      }
    }
    if (msg.t === 'inv.list' && 工作中 && 待回覆) { 待回覆.reject(Error('背包重新同步，請重新讀取')); return; }
    const pending = 待回覆;
    if (pending && msg.id === pending.id) {
      const item = 資料.get(pending.id);
      if (msg.t === 'inv.remove' || msg.t === 'inv.update' && item && item.level > pending.level) pending.resolve();
    }
  }
  const 取消監聽 = 授權連線.on(更新訊息);
  async function 強化(item, key, signal) {
    if (!背包來源.available()) throw Error('背包資料尚未就緒，請稍後再開始');
    await 快速強化器.enhance(item, key, signal);
    const confirmed = 背包來源.item(item.id);
    if (!confirmed) 資料.delete(item.id);
    else 資料.set(item.id, { ...資料.get(item.id), ...confirmed, kind: item.kind, safe: item.safe });
  }
  async function 開始() {
    if(!window.__天仁授權.gate.valid())return;
    if (工作中 || 修理中 || 刪物中 || 血量傳送中) { 狀態('請等待目前操作結束。'); return; }
    const name = 元素('weapon').value, target = Number(元素('target').value), key = 元素('key').value;
    if (!name || 需要重讀) { 狀態('請先讀取背包'); return; }
    工作中 = true; 控制 = new AbortController(); 次數 = 0; 鎖定(true);
    let 必須重讀 = true;
    let 上次進度更新 = 0;
    try {
      const result = await window.裝備強化流程.run({ snapshot: () => [...資料.values()], enhance: 強化 }, { name, target, key }, 控制.signal,
        ({ round, item, attempts }) => {
          const now = performance.now(); if (attempts > 1 && now - 上次進度更新 < 100) return;
          上次進度更新 = now; 狀態(`${round}\n${item.name}：＋${item.level} → 下一級\n準備第${attempts}次強化`);
        });
      必須重讀 = result.attempts > 0;
      狀態(result.attempts === 0 ? `未開始強化：${result.reason}。\n目標為＋${target}，背包已有符合目標的同名裝備。` : `${result.reason}\n已完成${result.attempts}次強化操作。`);
    } catch (e) { 狀態(`${e.message}\n本次已發起${次數}次。重新讀取背包後才能再開始。`); }
    finally { 工作中 = false; 控制 = null; 需要重讀 = 必須重讀; 取消選取(); 鎖定(false); }
  }
  const 修理狀態 = text => { if (元素('repairStatus').textContent !== text) 元素('repairStatus').textContent = text; };
  function 停止修理(text = '自動修理已關閉。') {
    元素('autoRepair').checked = false;
    修理控制?.abort();
    修理狀態(修理中 ? text + '\n等待已發出的那次結果，不再繼續。' : text);
  }
  function 目前武器() {
    if (使用中武器編號 !== null) {
      const cached = 背包來源.item(使用中武器編號);
      if (cached?.weapon && cached.wielding && cached.equipped) return 重新讀武器(cached.id);
      使用中武器編號 = null;
    }
    const candidates = 背包來源.all().filter(item => item.weapon && item.wielding && item.equipped);
    if (candidates.length !== 1) throw Error('等待使用中的武器資料');
    使用中武器編號 = candidates[0].id;
    return 重新讀武器(candidates[0].id);
  }
  function 重新讀武器(id) {
    const item = 背包來源.item(id);
    if (!item || !item.equipped) throw Error('原本武器已卸下或消失，停止修理');
    if (!item.weapon || !item.wielding || item.locked) throw Error('武器未標示「（揮舞）」或已封印，停止修理');
    item.damage = window.武器修理流程.damage(item.detail);
    if (item.damage === null) throw Error('無法確認損壞度，停止修理');
    資料.set(id, item); return item;
  }
  const 暫等 = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function 修一次(id, before, signal) {
    if(!window.__天仁授權.gate.valid())throw Error('授權已停止');
    if (signal.aborted || document.hidden) throw Error('已停止或遊戲不在前景');
    if (document.body.classList.contains('wl-pick-item')) throw Error('存在其他物品選取，停止修理');
    重新讀武器(id);
    const stone = 背包來源.all().find(x => x.fullName === '磨刀石' && 格子(x.id) && !x.locked);
    if (!stone) throw Error('找不到可使用的磨刀石，請補充後重新讀取');
    const cell = 格子(stone.id);
    // 遊戲以兩次按下事件辨識雙擊；只使用已確認名稱的磨刀石。
    for (let i = 0; i < 2; i++) {
      cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }));
      cell.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' }));
    }
    if (!document.body.classList.contains('wl-pick-item') || !document.querySelector('#wl-pick-hint')?.textContent.includes('磨刀石')) {
      取消選取(); throw Error('磨刀石未進入正確選取模式，停止修理');
    }
    try {
      if (signal.aborted) throw Error('已停止');
      const target = 格子(id);
      if (!target || !穿戴(target)) throw Error('武器已更換，停止修理');
      修理回覆 = false;
      if(!window.__天仁授權.gate.valid())throw Error('授權已停止');
      target.click(); 修理次數++;
      const deadline = Date.now() + 4000;
      while (Date.now() < deadline) {
        await 暫等(120);
        // 已發出的修理仍等最後結果，避免停止後立刻啟動其他物品操作。
        if (document.hidden) continue;
        if (修理回覆 && !document.body.classList.contains('wl-pick-item')) {
          const current = 重新讀武器(id);
          if (current.damage < before) { 修理狀態(`已修理${修理次數}次\n損壞度：${before} → ${current.damage}`); return; }
        }
      }
      throw Error('修理結果逾時或損壞度未下降，停止且不重送');
    } finally { 取消選取(); }
  }
  async function 檢查修理() {
    if (已關閉 || !元素('autoRepair').checked || 工作中 || 修理中 || 刪物中 || 血量傳送中) return;
    if (Date.now() < 換圖暫停至 || window.__wl.world?.mapLoading === true) { 修理狀態('換地圖中，保持開啟；載入後自動繼續監看。'); return; }
    if (document.hidden) { 修理狀態('背景分頁暫停，回到遊戲後繼續監看。'); return; }
    if (document.body.classList.contains('wl-pick-item')) { 修理狀態('目前有其他選取操作，暫停修理。'); return; }
    修理中 = true; 修理控制 = new AbortController();
    let 已確認武器 = false, 已鎖定 = false;
    try {
      const item = 目前武器(); 修理次數 = 0;
      if (item.damage === null) throw Error('暫時無法讀取武器損壞度');
      已確認武器 = true;
      if (item.damage > 0 && !格子(item.id)) { 修理狀態('武器有損壞，等待物品操作欄位載入。'); return; }
      修理狀態(`${item.name}\n損壞度：${item.damage ?? '無法讀取'}\n${item.damage === 0 ? '監看中，無需修理。' : '正在修理…'}`);
      if (item.damage === 0) return;
      鎖定(true); 已鎖定 = true; 元素('repairScan').disabled = true;
      const count = await window.武器修理流程.run({ read: async () => 重新讀武器(item.id).damage,
        repair: (before, signal) => 修一次(item.id, before, signal) }, 修理控制.signal);
      if (count) 修理狀態(`修理完成，共${count}次，損壞度已歸零。\n持續監看使用中的武器。`);
    } catch (e) {
      if (修理因換圖中斷 && 元素('autoRepair').checked) 修理狀態('換地圖中，保持開啟；載入後自動繼續監看。');
      else if (修理因操作中斷 && 元素('autoRepair').checked) 修理狀態('手動操作暫停修理，稍後自動繼續監看。');
      else if (!已確認武器 && 元素('autoRepair').checked) 修理狀態('暫時讀不到使用中的武器，保持開啟並等待重讀。\n' + e.message);
      else { 停止修理(e.message); 修理狀態(e.message); }
    }
    finally { 修理因換圖中斷 = false; 修理因操作中斷 = false; 修理中 = false; 修理控制 = null; if (已鎖定) { 元素('repairScan').disabled = false; 鎖定(false); } }
  }
  async function 重讀修理() {
    if (工作中 || 修理中 || 刪物中 || 血量傳送中) return;
    await 讀取背包();
    if (元素('autoRepair').checked) await 檢查修理();
    else if (!修理狀態已提示()) 修理狀態('背包已讀取，開啟開關即可監看。');
  }
  function 修理狀態已提示() { return 元素('repairStatus').textContent !== '正在讀取背包…'; }
  const world = window.__wl.world;
  let 原始暗度 = null;
  function 切換白天() {
    if(元素('day').checked&&!window.__天仁授權.gate.valid())return;
    try {
      if (typeof world?.darkness !== 'function' || typeof world?.drawDark !== 'function') throw Error('找不到場景暗度控制');
      if (元素('day').checked) { 原始暗度 ??= world.darkness; world.darkness = 全亮; }
      else if (原始暗度 && world.darkness === 全亮) world.darkness = 原始暗度;
      world.drawDark(); 元素('dayStatus').textContent = 元素('day').checked ? '全白天已開啟' : '已恢復遊戲原本光線';
    } catch (e) { 元素('day').checked = false; 元素('dayStatus').textContent = e.message; }
  }
  function 全亮() { return 0; }
  function 切換收合() {
    const 按鈕位置 = 元素('collapse').getBoundingClientRect?.();
    const 面板位置 = 主框.getBoundingClientRect?.();
    const collapsed = 主框.classList.toggle('is-collapsed');
    if (按鈕位置 && 主框.style && 主框.dataset) {
      if (collapsed) {
        主框.dataset.expandedRight = 主框.style.right;
        主框.dataset.expandedTop = 主框.style.top;
        if (面板位置) {
          主框.dataset.expandedMeasuredRight = String(window.innerWidth - 面板位置.right);
          主框.dataset.expandedMeasuredTop = String(面板位置.top);
          主框.dataset.expandedWidth = String(面板位置.width);
          主框.dataset.expandedHeight = String(面板位置.height);
        }
        // 讓64×36的「天仁」按鈕中心保持在原本「收合」按鈕中心。
        主框.style.right = `${Math.max(0, window.innerWidth - 按鈕位置.left - 按鈕位置.width / 2 - 32)}px`;
        主框.style.top = `${Math.max(0, 按鈕位置.top + 按鈕位置.height / 2 - 18)}px`;
      } else {
        主框.style.right = 主框.dataset.expandedRight || '';
        主框.style.top = 主框.dataset.expandedTop || '';
        if (Number.isFinite(window.innerHeight)) 主框.style.setProperty?.('--面板可用高度', `${Math.max(80, window.innerHeight - parseFloat(主框.style.top || '14') - 145)}px`);
        delete 主框.dataset.expandedRight; delete 主框.dataset.expandedTop;
      }
    }
    元素('collapse').textContent = collapsed ? '天仁' : '收合';
    元素('collapse').setAttribute('aria-expanded', String(!collapsed));
    元素('collapse').setAttribute('aria-label', collapsed ? '展開面板' : '收合面板');
  }
  元素('collapse').onclick = 切換收合;
  const 移除拖曳 = window.天仁面板拖曳.attach({ panel: 主框, button: 元素('collapse') });
  for (const tab of 主框.querySelectorAll('[data-tab]')) tab.onclick = () => {
    for (const button of 主框.querySelectorAll('[data-tab]')) button.setAttribute('aria-selected', String(button === tab));
    for (const pane of 主框.querySelectorAll('[data-pane]')) pane.hidden = pane.dataset.pane !== tab.dataset.tab;
  };
  元素('autoRepair').onchange = () => { if (元素('autoRepair').checked) 檢查修理(); else 停止修理(); };
  元素('repairScan').onclick = 重讀修理;
  元素('day').onchange = 切換白天;
  元素('day').checked = true;
  切換白天();
  const 監看計時器 = setInterval(() => { if (設定保存?.sync(角色待還原)) 角色待還原 = false; 檢查修理(); }, 3000);
  主框.addEventListener('pointerdown', e => e.stopPropagation());
  主框.addEventListener('keydown', e => e.stopPropagation());
  元素('scan').onclick = 讀取背包; 元素('start').onclick = 開始; 元素('stop').onclick = 停止;
  元素('weapon').onchange = () => { 已選裝備 = 元素('weapon').value; if (!工作中) 元素('start').disabled = 需要重讀 || !元素('weapon').value; };
  元素('close').onclick = () => { 購買管理?.stop(); 血量管理?.stop(); 保護擴充?.stop(); 停止修理(); 刪物管理?.stop(); if (工作中) 停止(); 主框.hidden = true; };
  const 人工介入 = e => {
    if (!e.isTrusted || 主框.contains(e.target)) return;
    if (工作中) 停止();
    if (修理中) {
      修理因操作中斷 = true; 修理控制?.abort();
      換圖暫停至 = Date.now() + 4000;
      if (元素('autoRepair').checked) 修理狀態('手動操作暫停修理，稍後自動繼續監看。');
    }
  };
  document.addEventListener('pointerdown', 人工介入, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden && 工作中) 停止(); });
  刪物管理 = window.自動刪物流程序.mount({ ui: 元素, net: 授權連線,
    character: () => window.__wl.world?.selfName?.() || '', busy: () => 工作中 || 修理中 || 血量傳送中,
    picking: () => document.body.classList.contains('wl-pick-item'),
    snapshot: () => 背包來源.snapshot(), current: id => 背包來源.item(id),
    lock(value) { 刪物中 = value; 鎖定(value); },
    destroy(id, count) { 授權連線.send({ t: 'item.destroy', id, count }); }
  });
  血量管理 = window.天仁血量保護.mount({ pane: 主框.querySelector('[data-pane="health"]'), net: 授權連線,
    ready: 背包來源.ready, all: () => 背包來源.all(), current: id => 背包來源.item(id), health: () => 背包來源.health(), loading: () => 背包來源.loading(),
    busy: () => 正在還原 || 擴充道具中, toggleOtherScrolls: paused => { 保護擴充?.toggleTeleport(paused); 設定保存?.save('health'); 設定保存?.save('extra'); },
    changed(state) { 低血傳送中 = state.pending; 血量傳送中 = 低血傳送中 || 擴充道具中; const flags = state.rules.map(rule => rule.enabled).join(','); if (flags !== 上次血量設定) { 上次血量設定 = flags; if (!正在還原 && !已關閉 && !角色待還原 && 設定保存?.current()) 設定保存.save('health'); } },
    use(id) { 血量傳送中 = true; 控制?.abort(); if (修理中) { 修理因操作中斷 = true; 修理控制?.abort(); } 授權連線.send({ t: 'item.use', id }); }
  });
  保護擴充 = window.天仁保護擴充.mount({ pane: 主框.querySelector('[data-pane="health"]'), net: 授權連線,
    ready: 背包來源.ready, all: () => 背包來源.all(), current: id => 背包來源.item(id), health: () => 背包來源.health(), loading: () => 背包來源.loading(),
    selfId: () => window.__wl.world?.selfId,
    busy: () => 正在還原 || 低血傳送中 || 工作中 || 修理中 || 刪物中, picking: () => document.body.classList.contains('wl-pick-item'),
    changed(state) { const released = 擴充道具中 && !state.pending; 擴充道具中 = state.pending; 血量傳送中 = 低血傳送中 || 擴充道具中; if (released && !已關閉) 血量管理?.recheck(); const flags = state.rules.map(rule => `${rule.enabled}:${rule.name}`).join(',') + state.idle.enabled; if (flags !== 上次擴充設定) { 上次擴充設定 = flags; if (!正在還原 && !已關閉 && !角色待還原 && !/重新啟動|死亡/.test(state.status) && 設定保存?.current()) 設定保存.save('extra'); } },
    use(id) { 授權連線.send({ t: 'item.use', id }); }
  });
  購買管理 = window.天仁自動購買.mount({ pane: 主框.querySelector('[data-pane="shopping"]'), net: 授權連線,
    ready: 背包來源.ready, all: () => 背包來源.all(),
    nearby: () => window.天仁商店資料.nearby(window.__wl.world, text => 背包來源.decodeName(text)),
    busy: () => 正在還原 || 角色待還原 || 工作中 || 修理中 || 刪物中 || 血量傳送中 || document.body.classList.contains('wl-pick-item'),
    blockedItem: name => 元素('discardEnabled').checked && [...元素('discardList').options].some(option => option.value === name),
    send(msg) { 授權連線.send(msg); },
    changed(state) { 購買中 = state.pending; const next = JSON.stringify({ enabled: state.enabled, rules: state.rules }); if (next !== 上次購買設定) { 上次購買設定 = next; if (!正在還原 && !已關閉 && !角色待還原) 設定保存?.save('shopping'); } }
  });
  設定保存 = window.天仁角色設定.create({ storage: localStorage, character: () => window.__wl.world?.selfName?.() || '',
    capture: () => ({ health: 血量管理.settings(), extra: 保護擴充.settings(), shopping: 購買管理.settings(),
      general: { repair: 元素('autoRepair').checked, discard: 元素('discardEnabled').checked, day: 元素('day').checked },
      enchant: { name: 已選裝備 || 元素('weapon').value, key: 元素('key').value, target: Number(元素('target').value) } }),
    apply(value) {
      正在還原 = true;
      try {
        元素('autoRepair').checked = value.general?.repair !== false;
        元素('day').checked = value.general?.day !== false; 切換白天();
        元素('discardEnabled').checked = value.general?.discard === true;
        已選裝備 = typeof value.enchant?.name === 'string' ? value.enchant.name : '';
        元素('key').value = value.enchant?.key === 'F6' ? 'F6' : 'F5';
        元素('target').value = Number.isInteger(value.enchant?.target) && value.enchant.target >= 1 && value.enchant.target <= 15 ? value.enchant.target : 7;
        血量管理.restore(value.health); 保護擴充.restore(value.extra); 購買管理.restore(value.shopping);
      } finally { 正在還原 = false; }
      血量管理.recheck(); 保護擴充.recheck(); 購買管理.recheck();
    }, error: message => 狀態(message)
  });
  function 保存欄位(event) {
    if (event.target.validity && !event.target.validity.valid) return;
    const section = event.target.closest('[data-pane="shopping"]') ? 'shopping' : event.target.closest('.protection-extra') ? 'extra' : event.target.closest('[data-pane="health"]') ? 'health' : event.target.closest('[data-pane="enchant"]') ? 'enchant' : 'general';
    設定保存.save(section);
  }
  主框.addEventListener('change', 保存欄位); 主框.addEventListener('input', 保存欄位);
  const 設定訊息 = 授權連線.on(msg => {
    if (msg.t === 'world.enter') 角色待還原 = true;
    if (msg.t === 'world.enter' || msg.t === 'self.status' || msg.t === 'obj.put' && msg.obj?.id === window.__wl.world?.selfId) queueMicrotask(() => { if (!已關閉 && 設定保存.sync(角色待還原)) 角色待還原 = false; });
  });
  設定保存.sync();
  window.__天仁輔助 = { version: '1.8.1', show() { 主框.hidden = false; 元素('healthTab').click(); }, close() { 購買管理?.stop(); 血量管理?.stop(); 保護擴充?.stop(); 停止修理(); 刪物管理?.stop(); 停止(); 主框.hidden = true; } };
  window.__天仁輔助.licenseStop = () => {
    if(已關閉)return;
    設定保存?.save(); 已關閉=true;
    window.__天仁輔助.close();
    if(原始暗度 && world.darkness===全亮){world.darkness=原始暗度;world.drawDark();}
    clearInterval(監看計時器); 設定訊息?.(); 購買管理?.dispose(); 保護擴充?.dispose(); 快速強化器.dispose(); 血量管理?.dispose(); 刪物管理?.dispose();
    控制?.abort(); 修理控制?.abort(); if(typeof 取消監聽==='function')取消監聽(); 移除拖曳(); 主框.remove();
  };
  window.addEventListener('pagehide', () => { if (!角色待還原) 設定保存.save(); 已關閉 = true; 移除拖曳(); 設定訊息?.(); 購買管理?.dispose(); 保護擴充?.dispose(); 快速強化器.dispose(); 血量管理?.dispose(); 刪物管理?.dispose(); 控制?.abort(); 修理控制?.abort(); clearInterval(監看計時器); if (typeof 取消監聽 === 'function') 取消監聽(); }, { once: true });
  背包來源.ready.then(() => { if (元素('autoRepair').checked) 檢查修理(); }).catch(error => 修理狀態(error.message));
})();

  }
})();
