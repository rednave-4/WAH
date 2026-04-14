// ═══════════════════════════════════════
// app.js — core state, XP, level, nav
// ═══════════════════════════════════════

const SK = 'osn_hunter_v4';

const RANKS = [
  {t:'ROOKIE',          col:'#9ca3af', bg:'rgba(156,163,175,.15)', min:0,  s:'Mulai belajar CP'},
  {t:'KABUPATEN',       col:'#34d399', bg:'rgba(52,211,153,.12)',  min:5,  s:'Lolos seleksi kab/kota'},
  {t:'PROVINSI I',      col:'#60a5fa', bg:'rgba(96,165,250,.12)',  min:10, s:'Lolos provinsi'},
  {t:'PROVINSI II',     col:'#38bdf8', bg:'rgba(56,189,248,.12)',  min:13, s:'Memperkuat materi provinsi'},
  {t:'PROVINSI III',    col:'#818cf8', bg:'rgba(129,140,248,.12)', min:16, s:'Siap tantang nasional'},
  {t:'NASIONAL',        col:'#a78bfa', bg:'rgba(167,139,250,.12)', min:20, s:'Lolos OSN nasional'},
  {t:'NASIONAL II',     col:'#c084fc', bg:'rgba(192,132,252,.12)', min:25, s:'Bersaing papan tengah'},
  {t:'MEDALI PERUNGGU', col:'#d97706', bg:'rgba(217,119,6,.12)',   min:30, s:'Raih perunggu OSN'},
  {t:'MEDALI PERAK',    col:'#94a3b8', bg:'rgba(148,163,184,.12)', min:38, s:'Raih perak OSN'},
  {t:'MEDALI EMAS',     col:'#fbbf24', bg:'rgba(251,191,36,.12)',  min:48, s:'Raih emas OSN'},
  {t:'IOI CANDIDATE',   col:'#f97316', bg:'rgba(249,115,22,.12)',  min:58, s:'Seleksi tim IOI'},
  {t:'IOI HUNTER',      col:'#f87171', bg:'rgba(248,113,113,.12)', min:70, s:'Wakili Indonesia IOI'},
];

const CF_TIERS = [
  [0,'Newbie','#9ca3af'],[1200,'Pupil','#34d399'],[1400,'Specialist','#818cf8'],
  [1600,'Expert','#a78bfa'],[1900,'Candidate Master','#c084fc'],
  [2100,'Master','#fbbf24'],[2300,'International Master','#fbbf24'],
  [2400,'Grandmaster','#f87171'],[2600,'Int. Grandmaster','#f87171'],
  [3000,'Legendary GM','#f87171'],
];
const AC_TIERS = [
  [0,'Gray','#9ca3af'],[400,'Brown','#a78bfa'],[800,'Green','#34d399'],
  [1200,'Cyan','#22d3ee'],[1600,'Blue','#60a5fa'],
  [2000,'Yellow','#fbbf24'],[2400,'Orange','#fb923c'],[2800,'Red','#f87171'],
];

const CF_XP = {800:15,900:20,1000:25,1100:30,1200:38,1300:48,1400:60,1500:75,1600:92,1700:112,1800:135,1900:160,2000:190,2100:220,2200:252,2300:285,2400:318,2500:352,2600:390,2700:430,2800:472,2900:515,3000:558};

// Default state
const DEFAULT = {
  name: 'Hunter',
  level: 1, xp: 0, totalXP: 0,
  stats: {algo:10, math:10, dp:10, graph:10, ds:10, impl:10},
  customStats: [],
  plat: {cf:1000, tlx:0, ac:400},
  topics: [],          // populated from topics.json
  customTopics: [],
  tlxProgress: {},     // {subId: solved}
  tlxOlympiadAC: {},   // {type_year_prob: true}
  tlxOlympiadXP: {},   // {type_year_prob: true}  — anti-farm
  atcData: {},         // {type_num_prob: 'ac'|'wa'|'none'}
  atcXP: {},           // {type_num_prob: true}    — anti-farm
  cfAwardedProblems: {},
  cfData: null, cfHandle: '',
  rewards: [
    {id:1,name:'Nonton anime 1 episode',cost:50},
    {id:2,name:'Main game 30 menit',cost:80},
    {id:3,name:'Snack favorit',cost:30},
    {id:4,name:'Istirahat bebas 1 jam',cost:120},
  ],
  nextRid: 5,
  activeDays: [], streak: 0, bestStreak: 0, totalSolved: 0,
  events: [], nextEvtId: 1,
  projects: [
    {id:1,name:'OSN Informatika',color:'#a78bfa'},
    {id:2,name:'Codeforces Grind',color:'#34d399'},
    {id:3,name:'Matematika',color:'#fbbf24'},
  ],
  notes: [], nextNoteId: 1, nextProjId: 4,
  activeProjId: null,
  pomo: {focusMin:25,shortMin:5,longMin:15,todaySess:0,todayMin:0,totalSess:0,log:[],today:''},
  grindHistory: [],
  grindRating: 1200,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelected: null,
  claudeApiKey: '',
  zoom: 100,
};

let S = {};

// ── STATE PERSISTENCE ──
function loadState() {
  try {
    const raw = localStorage.getItem(SK);
    if (raw) S = Object.assign(deepClone(DEFAULT), JSON.parse(raw));
    else S = deepClone(DEFAULT);
  } catch(e) { S = deepClone(DEFAULT); }
}
function saveState() {
  try { localStorage.setItem(SK, JSON.stringify(S)); } catch(e) { console.warn('Save failed:', e); }
}
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// ── XP & LEVEL ──
function xpReq(lv) { return Math.floor(150 * Math.pow(1.06, lv - 1)); }
function curRank() {
  for (let i = RANKS.length - 1; i >= 0; i--)
    if (S.level >= RANKS[i].min) return RANKS[i];
  return RANKS[0];
}
function gainXP(amt) {
  S.xp += amt; S.totalXP += amt;
  let leveled = false;
  while (S.xp >= xpReq(S.level)) {
    S.xp -= xpReq(S.level);
    S.level++;
    leveled = true;
  }
  if (leveled) notify('⬆ LEVEL UP! Level ' + S.level + ' — ' + curRank().t, 'up');
  renderHeader();
  saveState();
}

// ── NOTIFY ──
function notify(msg, cls = 'ok') {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.className = 'notif show ' + cls;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'notif'; }, 3500);
}

// ── HEADER ──
function renderHeader() {
  const req = xpReq(S.level);
  const pct = Math.min(100, Math.round(S.xp / req * 100));
  document.getElementById('hdrName').textContent = S.name || 'Hunter';
  document.getElementById('xpLbl').textContent = 'LV' + S.level + ' · ' + S.xp + '/' + req;
  document.getElementById('xpFill').style.width = pct + '%';
  const r = curRank();
  const b = document.getElementById('rankBadge');
  b.textContent = r.t;
  b.style.color = r.col;
  b.style.borderColor = r.col + '55';
  b.style.background = r.bg;
}

// ── NAV ──
const TABS = ['status','cf','grind','pomodoro','topics','activity','notes','guide','rank','reward','tlx','atcoder','settings'];

function go(tab) {
  document.querySelectorAll('.ntab').forEach((b, i) => b.classList.toggle('on', TABS[i] === tab));
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('on'));
  document.getElementById('pane-' + tab).classList.add('on');
  // lazy render
  const renders = {
    status: renderStatus, cf: renderCFProfile, grind: renderGrindHistory,
    pomodoro: renderPomoStats, topics: renderTopics,
    activity: renderActivity, notes: renderNotes,
    guide: renderGuide, rank: renderRankLadder,
    reward: renderRewards, tlx: renderTLX,
    atcoder: renderATCoder, settings: renderSettings,
  };
  if (renders[tab]) renders[tab]();
}

// ── UTILS ──
function today() { return new Date().toISOString().slice(0, 10); }
function fmt(d) { return new Date(d).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}); }
function tierOf(r, tiers) { let t = tiers[0]; for (const x of tiers) if (r >= x[0]) t = x; return t; }

// ── STATUS ──
const STAT_COLS = {algo:'#8b5cf6',math:'#f59e0b',dp:'#10b981',graph:'#3b82f6',ds:'#ef4444',impl:'#6b7280'};
const STAT_LABELS = {algo:'ALGORITHM',math:'MATH',dp:'DP',graph:'GRAPH',ds:'DATA STRUCT',impl:'IMPL/SPEED'};

function renderStatus() {
  // Built-in stats
  const grid = document.getElementById('statGrid');
  grid.innerHTML = Object.keys(STAT_COLS).map(k => `
    <div class="scard" onclick="addStat('${k}')">
      <div class="scard-accent" style="background:${STAT_COLS[k]}"></div>
      <div class="scard-num" id="sv-${k}" style="color:${STAT_COLS[k]}">${S.stats[k]}</div>
      <div class="scard-name">${STAT_LABELS[k]}</div>
      <div class="bar-wrap"><div class="bar-fill" id="sb-${k}" style="background:${STAT_COLS[k]};width:${Math.min(100,S.stats[k])}%"></div></div>
    </div>`).join('') + renderCustomStatCards();

  // Stat buttons
  document.getElementById('statBtns').innerHTML =
    Object.keys(STAT_COLS).map(k => `<button class="btn btn-sm" onclick="addStat('${k}')">+${k.charAt(0).toUpperCase()+k.slice(1)}</button>`).join('') +
    (S.customStats||[]).map((s,i) => `<button class="btn btn-sm btn-gold" onclick="addCustomStat(${i})">+${s.name}</button>
      <button class="btn btn-sm btn-red" style="padding:5px 6px" onclick="removeCustomStat(${i})">×</button>`).join('') +
    `<button class="btn btn-sm btn-dash" onclick="addNewStat()">+ Stat Baru</button>`;

  // Platform ratings
  document.getElementById('cfRatingInp').value = S.plat.cf;
  document.getElementById('tlxRatingInp').value = S.plat.tlx;
  document.getElementById('acRatingInp').value = S.plat.ac;
  updatePlatLabels();
}

function renderCustomStatCards() {
  return (S.customStats||[]).map((s,i) => `
    <div class="scard" onclick="addCustomStat(${i})">
      <div class="scard-accent" style="background:#fbbf24"></div>
      <div class="scard-num" style="color:#fbbf24">${s.val||0}</div>
      <div class="scard-name">${s.name.toUpperCase().slice(0,12)}</div>
      <div class="bar-wrap"><div class="bar-fill" style="background:#fbbf24;width:${Math.min(100,s.val||0)}%"></div></div>
    </div>`).join('');
}

function addStat(k) {
  S.stats[k] = Math.min(100, S.stats[k] + 1);
  gainXP(10);
  notify('+1 ' + STAT_LABELS[k] + ' · +10 XP', 'ok');
  renderStatus();
  checkTopicUnlocks();
}
function addNewStat() {
  const name = prompt('Nama stat baru (misal: BinSearch, Strings, Geometry):');
  if (!name || !name.trim()) return;
  if (!S.customStats) S.customStats = [];
  S.customStats.push({name: name.trim(), val: 10});
  gainXP(5); saveState(); renderStatus();
  notify('Stat baru: ' + name.trim(), 'ok');
}
function addCustomStat(i) {
  S.customStats[i].val = Math.min(100, (S.customStats[i].val||0) + 1);
  gainXP(10); notify('+1 ' + S.customStats[i].name + ' · +10 XP', 'ok');
  renderStatus(); saveState();
}
function removeCustomStat(i) {
  if (!confirm('Hapus stat "' + S.customStats[i].name + '"?')) return;
  S.customStats.splice(i, 1); saveState(); renderStatus();
}
function updatePlatLabels() {
  const cf = tierOf(S.plat.cf, CF_TIERS);
  const el = document.getElementById('cfDivLbl');
  if(el){el.textContent = cf[1]; el.style.color = cf[2];}
  const ac = tierOf(S.plat.ac, AC_TIERS);
  const el2 = document.getElementById('acDivLbl');
  if(el2){el2.textContent = ac[1]; el2.style.color = ac[2];}
}
function savePlatRating(k, v) { S.plat[k] = parseInt(v)||0; updatePlatLabels(); saveState(); }

// ── RANK LADDER ──
function renderRankLadder() {
  const cur = curRank();
  document.getElementById('rankLadder').innerHTML = RANKS.map((r, i) => {
    const done = S.level >= r.min; const isCur = r.t === cur.t;
    return `<div class="rl-row ${isCur?'cur':''}">
      <div class="rl-ico" style="background:${r.bg};color:${r.col}">${done?'✓':i+1}</div>
      <div class="rl-info">
        <div class="rl-title" style="color:${r.col}">${r.t}</div>
        <div class="rl-sub">${r.s} · min level ${r.min}</div>
      </div>
      <div class="rl-status" style="color:${isCur?r.col:done?'#34d399':'#374151'}">${isCur?'SEKARANG':done?'LEWAT':'—'}</div>
    </div>`;
  }).join('');
}

// ── REWARDS ──
function renderRewards() {
  document.getElementById('xpPool').textContent = S.xp;
  document.getElementById('rewardList').innerHTML = S.rewards.length ?
    S.rewards.map(r => `
      <div class="reward-item">
        <div>
          <div style="font-size:12px;font-weight:600">${r.name}</div>
          <div style="font-size:10px;color:#fbbf24;font-family:var(--ft);margin-top:2px">${r.cost} XP</div>
        </div>
        <div class="row">
          <button class="btn btn-gold btn-sm" onclick="claimReward(${r.id})">Klaim</button>
          <button class="btn btn-red btn-sm" style="padding:5px 7px" onclick="deleteReward(${r.id})">×</button>
        </div>
      </div>`).join('')
    : '<div style="font-size:12px;color:var(--muted);padding:12px 0">Tambah reward dulu.</div>';
}
function claimReward(id) {
  const r = S.rewards.find(x => x.id === id); if (!r) return;
  if (S.xp < r.cost) { notify('XP tidak cukup! Butuh ' + r.cost + ' XP, punya ' + S.xp, 'err'); return; }
  S.xp -= r.cost;
  renderHeader(); renderRewards();
  notify('Reward diklaim: ' + r.name + '!', 'ok'); saveState();
}
function deleteReward(id) { S.rewards = S.rewards.filter(r => r.id !== id); renderRewards(); saveState(); }
function addReward() {
  const n = document.getElementById('rInp').value.trim();
  const c = parseInt(document.getElementById('rCost').value)||50;
  if (!n) return;
  S.rewards.push({id: S.nextRid++, name: n, cost: c});
  document.getElementById('rInp').value = '';
  renderRewards(); saveState();
}

// ── SETTINGS ──
function renderSettings() {
  document.getElementById('setName').value = S.name || '';
  const ak = document.getElementById('setApiKey');
  if (ak) ak.value = S.claudeApiKey || '';
  document.getElementById('zoomSlider').value = S.zoom || 100;
  document.getElementById('zoomVal').textContent = (S.zoom||100) + '%';
  applyZoom(S.zoom||100, false);
}
function saveName() {
  const n = document.getElementById('setName').value.trim();
  if (!n) return; S.name = n; renderHeader(); saveState(); notify('Nama disimpan!', 'ok');
}
function saveApiKey() {
  const k = document.getElementById('setApiKey').value.trim();
  if (!k) return; S.claudeApiKey = k; saveState(); notify('API key disimpan!', 'ok');
}
function applyZoom(val, save=true) {
  val = Math.min(130, Math.max(70, parseInt(val)));
  document.documentElement.style.fontSize = val + '%';
  const slider = document.getElementById('zoomSlider');
  const lbl = document.getElementById('zoomVal');
  if (slider) slider.value = val;
  if (lbl) lbl.textContent = val + '%';
  if (save) { S.zoom = val; saveState(); }
}
function exportData() {
  const b = new Blob([JSON.stringify(S, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(b);
  a.download = 'osn-hunter-' + today() + '.json'; a.click();
}
function importData(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const d = JSON.parse(ev.target.result);
      S = Object.assign(deepClone(DEFAULT), d);
      saveState(); initApp();
      notify('Data berhasil diimport!', 'ok');
    } catch(err) { notify('File tidak valid!', 'err'); }
  };
  reader.readAsText(file);
}
function resetAll() {
  if (!confirm('Reset SEMUA data? Tidak bisa di-undo!')) return;
  localStorage.removeItem(SK);
  location.reload();
}

// ── INIT ──
async function initApp() {
  loadState();
  // Load topics from JSON if not yet saved in state
  if (!S.topics || S.topics.length === 0) {
    try {
      const res = await fetch('data/topics.json');
      const raw = await res.json();
      S.topics = raw.map(t => ({...t, prog: 0, status: 'learning'}));
      // first few are always unlocked
      S.topics.forEach(t => { if (t.xpUnlock > 0 && S.totalXP < t.xpUnlock) t.status = 'locked'; });
      saveState();
    } catch(e) { S.topics = []; }
  }
  renderHeader();
  applyZoom(S.zoom || 100, false);
  go('status');
  if (Notification && Notification.permission === 'default') Notification.requestPermission();
}

window.addEventListener('DOMContentLoaded', initApp);
