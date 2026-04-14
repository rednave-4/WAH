// ═══════════════════════════════════════
// guide.js — OSN roadmap & Claude Q&A
// ═══════════════════════════════════════

const OSN_EVENTS = [
  {id:'osnk', name:'OSN-K', full:'OSN Kabupaten',   date:'2026-06-18', col:'#34d399'},
  {id:'osnp', name:'OSN-P', full:'OSN Provinsi',    date:'2026-07-27', col:'#60a5fa'},
  {id:'osns', name:'OSN-S', full:'OSN Semifinal',   date:'2026-08-12', col:'#a78bfa'},
  {id:'osnf', name:'OSN-F', full:'OSN Final',       date:'2026-08-23', col:'#fbbf24'},
];

const PHASES = [
  {id:'p1', name:'Foundation Blast', start:'2026-04-12', end:'2026-05-18', target:'OSN-K', col:'#34d399',
   desc:'Kuatkan fondasi — soal OSN-K mayoritas Greedy, DP dasar, dan Graph dasar.',
   cfRange:'800–1300', atcTarget:'ABC A–C konsisten',
   topics:['impl','greedy','binsearch','prefix','sorting','bruteforce','dp-basic','graph-bfs'],
   resources:[
     {name:'USACO Guide — Bronze', url:'https://usaco.guide/bronze', ico:'U', col:'#34d399'},
     {name:'CP-Algorithms', url:'https://cp-algorithms.com', ico:'CP', col:'#60a5fa'},
     {name:'TLX — Pemrograman Dasar', url:'https://tlx.toki.id', ico:'TLX', col:'#fbbf24'},
   ],
   asks:['Jelaskan strategi greedy dengan contoh soal OSN','Contoh soal DP 1D yang sering keluar OSN-K','Tips manajemen waktu saat OSN-K?','Cara debug BFS/DFS cepat saat contest?'],
   daily:'3 soal CF 800–1200 + 1 topik + streak harian'},
  {id:'p2', name:'OSN-K Sprint', start:'2026-05-18', end:'2026-06-18', target:'OSN-K', col:'#34d399',
   desc:'Sprint akhir OSN-K — fokus kecepatan implementasi dan latihan soal OSN tahun lalu.',
   cfRange:'1000–1400', atcTarget:'ABC A–D, A–C < 60 menit',
   topics:['greedy','sorting','prefix','dp-basic','graph-bfs','number'],
   resources:[
     {name:'TLX Olympiad — OSN-P archive', url:'https://tlx.toki.id/problems/osn-p', ico:'TLX', col:'#fbbf24'},
     {name:'CF Virtual Contest', url:'https://codeforces.com/contests', ico:'CF', col:'#f87171'},
     {name:'CSES Problem Set', url:'https://cses.fi/problemset', ico:'CS', col:'#a78bfa'},
   ],
   asks:['Soal OSN-K biasanya level berapa di Codeforces?','Strategi membaca soal saat contest OSN-K?','Simulasi 5 soal OSN-K beserta penyelesaiannya','Apa yang harus di-review 1 minggu sebelum OSN-K?'],
   daily:'4 soal CF 1000–1400 + virtual contest tiap minggu'},
  {id:'p3', name:'Provinsi Push', start:'2026-06-18', end:'2026-07-15', target:'OSN-P', col:'#60a5fa',
   desc:'Naik level ke materi provinsi — Graph lanjut, DP bitmask, Number Theory, dan DS.',
   cfRange:'1300–1700', atcTarget:'ABC A–D rutin, coba E sesekali',
   topics:['graph-sp','graph-tree','dp-adv','number','segment','fenwick','dsu'],
   resources:[
     {name:'CP-Algorithms — Graph', url:'https://cp-algorithms.com/graph', ico:'CP', col:'#60a5fa'},
     {name:'USACO Guide — Silver', url:'https://usaco.guide/silver', ico:'U', col:'#34d399'},
     {name:'AtCoder Educational DP', url:'https://atcoder.jp/contests/dp', ico:'AC', col:'#a78bfa'},
   ],
   asks:['Jelaskan Dijkstra vs BFS, kapan pakai masing-masing?','Contoh soal DP bitmask OSN level beserta solusinya','Cara belajar Segment Tree dari nol dalam 2 minggu?','Materi apa yang paling sering keluar di OSN-P?'],
   daily:'3 soal CF 1300–1700 + 1 topik baru + TLX Olympiad'},
  {id:'p4', name:'OSN-P Final', start:'2026-07-15', end:'2026-07-27', target:'OSN-P', col:'#60a5fa',
   desc:'Final prep OSN-P — simulasi penuh, review kelemahan, dan mental preparation.',
   cfRange:'1500–1800', atcTarget:'ARC A–B, ABC full dalam waktu',
   topics:['graph-sp','graph-tree','dp-adv','segment','topo','mst'],
   resources:[
     {name:'TLX Olympiad — OSN archive', url:'https://tlx.toki.id', ico:'TLX', col:'#fbbf24'},
     {name:'Competitive Programmer Handbook', url:'https://cses.fi/book/book.pdf', ico:'B', col:'#9ca3af'},
   ],
   asks:['Simulasi soal OSN-P: berikan 4 soal dengan tingkat kesulitan progressif','Strategi menghadapi soal yang tidak bisa diselesaikan saat contest?','Checklist review materi 1 minggu sebelum OSN-P','Tips mental untuk performa optimal saat OSN?'],
   daily:'Virtual contest CF + review OSN archive + istirahat cukup'},
  {id:'p5', name:'Nasional Grind', start:'2026-07-27', end:'2026-08-12', target:'OSN-S', col:'#a78bfa',
   desc:'Level nasional — materi berat: SCC, String algo, advanced DP, dan data struktur kompleks.',
   cfRange:'1700–2100', atcTarget:'ARC C–D, AGC A–B',
   topics:['scc','string','segment','topo','flow','matrix'],
   resources:[
     {name:'CP-Algorithms — Strings', url:'https://cp-algorithms.com/string', ico:'CP', col:'#60a5fa'},
     {name:'USACO Guide — Gold', url:'https://usaco.guide/gold', ico:'U', col:'#fbbf24'},
     {name:'IOI Syllabus', url:'https://ioinformatics.org/files/ioi-syllabus-2024.pdf', ico:'IOI', col:'#f87171'},
   ],
   asks:['Jelaskan SCC dengan contoh soal','Algoritma KMP vs Z-function, perbedaan dan penggunaannya','Soal OSN Nasional biasanya setara rating berapa di CF?','Roadmap 2 minggu menuju OSN-S untuk level provinsi'],
   daily:'2 soal CF 1700–2100 + ARC/AGC + review topik berat'},
  {id:'p6', name:'Peak Performance', start:'2026-08-12', end:'2026-08-23', target:'OSN-F', col:'#fbbf24',
   desc:'Final push — review menyeluruh, simulasi IOI-style, dan peak condition.',
   cfRange:'1900–2400', atcTarget:'AGC A–B, ARC C–D full solve',
   topics:['flow','geo','scc','string','dp-adv','convex'],
   resources:[
     {name:'IOI Past Problems', url:'https://ioinformatics.org/page/problems', ico:'IOI', col:'#f87171'},
     {name:'USACO Guide — Platinum', url:'https://usaco.guide/platinum', ico:'U', col:'#a78bfa'},
     {name:'CF EDU section', url:'https://codeforces.com/edu/courses', ico:'CF', col:'#f87171'},
   ],
   asks:['Berikan soal setara IOI untuk latihan minggu ini','Strategi menghadapi soal subtask pada format IOI?','Review: semua algoritma penting sebelum OSN-F','Tips mental untuk tampil maksimal di hari H OSN Final?'],
   daily:'1–2 soal keras + review + simulasi + istirahat optimal'},
];

let activePhaseId = null;

function daysUntil(ds) {
  const now = new Date(); now.setHours(0,0,0,0);
  const d   = new Date(ds); d.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
}

function getCurrentPhase() {
  const now = today();
  return PHASES.find(p => now >= p.start && now < p.end) || PHASES[PHASES.length-1];
}

function renderGuide() {
  renderCountdowns();
  const cur = getCurrentPhase();
  if (!activePhaseId) activePhaseId = cur.id;
  renderPhaseTabs(cur);
  renderPhaseDetail();
  renderReadinessHeatmap();
}

function renderCountdowns() {
  document.getElementById('guideCountdowns').innerHTML = OSN_EVENTS.map(e => {
    const d = daysUntil(e.date);
    const past = d < 0;
    const urgent = d >= 0 && d <= 14;
    return `<div class="countdown-card">
      <div class="cdown-bar" style="background:${past?'#374151':e.col}"></div>
      <div class="cdown-days" style="color:${past?'#4b5563':e.col}">${past?'Selesai':d}</div>
      <div class="cdown-lbl">${past?'hari lalu':'hari lagi'}</div>
      <div class="cdown-name" style="color:${past?'var(--hint)':e.col}">${e.name}</div>
      <div class="cdown-date">${e.date}</div>
    </div>`;
  }).join('');
}

function renderPhaseTabs(curPhase) {
  document.getElementById('phaseTabs').innerHTML = PHASES.map(ph => {
    const isCur = ph.id === curPhase.id;
    const isAct = ph.id === activePhaseId;
    return `<button class="phase-btn ${isAct?'on':''} ${isCur?'live':''}" onclick="setPhase('${ph.id}')">${ph.name}${isCur?' ◀':''}</button>`;
  }).join('');
}

function setPhase(id) { activePhaseId = id; renderPhaseDetail(); renderQuickAsks(); }

function renderPhaseDetail() {
  const ph = PHASES.find(p => p.id === activePhaseId); if (!ph) return;
  const days = Math.round((new Date(ph.end)-new Date(ph.start))/86400000);
  const topicObjs = ph.topics.map(k => S.topics.find(t=>t.key===k)).filter(Boolean);

  document.getElementById('phaseDetail').innerHTML = `
    <div class="phase-card">
      <div class="phase-hdr" style="border-top:3px solid ${ph.col}">
        <div>
          <div class="phase-title" style="color:${ph.col}">${ph.name}</div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px">${ph.start} → ${ph.end} · ${days} hari · Target: ${ph.target}</div>
        </div>
        <span class="badge" style="background:${ph.col}22;color:${ph.col}">${ph.cfRange} CF</span>
      </div>
      <div class="phase-body">
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.7">${ph.desc}</div>
        <div class="g3" style="margin-bottom:12px">
          <div class="mstat"><div class="mstat-num" style="color:${ph.col};font-size:15px">${ph.cfRange}</div><div class="mstat-lbl">CF target</div></div>
          <div class="mstat"><div class="mstat-num" style="color:${ph.col};font-size:11px">${ph.atcTarget.split(',')[0]}</div><div class="mstat-lbl">AtCoder</div></div>
          <div class="mstat"><div class="mstat-num" style="color:${ph.col}">${ph.topics.length}</div><div class="mstat-lbl">topik</div></div>
        </div>
        <div class="slbl">Topik yang harus dikuasai</div>
        <div style="margin-bottom:12px">
          ${topicObjs.map(t=>{
            const pct=Math.round(t.prog||0); const done=t.status==='mastered';
            return `<div class="topic-check-row ${done?'done-t':''}" onclick="go('topics')">
              <div class="check-box">${done?'✓':''}</div>
              <div style="flex:1;font-size:12px;font-weight:600">${t.name}</div>
              <div style="font-size:10px;color:${done?'#34d399':pct>0?'#a78bfa':'var(--hint)'}">${done?'Mastered':pct>0?pct+'%':'Belum'}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="slbl">Target harian</div>
        <div style="background:var(--pl);border:1px solid var(--bor2);border-radius:var(--r);padding:9px 12px;font-size:12px;margin-bottom:12px">${ph.daily}</div>
        <div class="slbl">Sumber belajar</div>
        ${ph.resources.map(r=>`
          <a href="${r.url}" target="_blank" class="resource-link">
            <div class="resource-ico" style="background:${r.col}22;color:${r.col}">${r.ico}</div>
            <span>${r.name}</span>
          </a>`).join('')}
      </div>
    </div>`;
  renderQuickAsks();
}

function renderQuickAsks() {
  const ph = PHASES.find(p => p.id === activePhaseId); if (!ph) return;
  document.getElementById('quickAskBtns').innerHTML = ph.asks.map(q =>
    `<button class="quick-ask-btn" onclick="setAskQ(this)" data-q="${q.replace(/"/g,'&quot;')}">${q.length>55?q.slice(0,52)+'…':q}</button>`
  ).join('');
}

function setAskQ(btn) { document.getElementById('guideAskInp').value = btn.dataset.q; }

async function askClaude() {
  const q = document.getElementById('guideAskInp').value.trim(); if (!q) return;
  const ansDiv  = document.getElementById('guideAnswer');
  const ansText = document.getElementById('guideAnswerText');
  ansDiv.style.display = 'block';
  ansText.innerHTML = '<span class="loading-text">Sedang bertanya ke Claude</span>';

  const ph = PHASES.find(p => p.id === activePhaseId);
  const ctx = `Kamu adalah mentor Competitive Programming untuk siswa OSN Indonesia.
Siswa ini: level ${curRank().t}, rating CF ~${S.plat.cf}, fase "${ph?.name||'belajar'}" menuju ${ph?.target||'OSN'}.
Jawab konkret, praktis, dalam Bahasa Indonesia. Kode pakai C++. Maksimal 400 kata.`;

  const apiKey = S.claudeApiKey || '';
  if (!apiKey) {
    ansText.innerHTML = `<div style="color:#f87171;margin-bottom:8px">API key belum diset.</div>
      <div style="font-size:11px;color:var(--muted);line-height:1.7">
        Buka tab <strong>Pengaturan</strong> → isi API Key Claude.<br>
        Dapatkan key gratis di <a href="https://console.anthropic.com" target="_blank" style="color:#a78bfa">console.anthropic.com</a>
      </div>`;
    return;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: ctx,
        messages: [{role:'user', content: q}],
      }),
    });
    if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.error?.message||'HTTP '+res.status); }
    const data = await res.json();
    const text = data.content?.map(b=>b.text||'').join('') || 'Tidak ada respons.';
    ansText.innerHTML = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>')
      .replace(/`([^`]+)`/g,'<code style="background:var(--ink3);padding:1px 5px;border-radius:3px;font-size:11px;font-family:monospace">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  } catch(e) {
    ansText.innerHTML = `<div style="color:#f87171">Error: ${e.message}</div>
      <div style="font-size:11px;color:var(--muted);margin-top:6px">Pastikan API key benar dan koneksi internet aktif.</div>`;
  }
}

function renderReadinessHeatmap() {
  const el = document.getElementById('readinessHeatmap'); if (!el) return;
  el.innerHTML = PHASES.map(ph => {
    const tops = ph.topics.map(k=>S.topics.find(t=>t.key===k)).filter(Boolean);
    const mastered = tops.filter(t=>t.status==='mastered').length;
    const partial  = tops.filter(t=>t.status==='learning'&&(t.prog||0)>=50).length;
    const pct = tops.length ? Math.round((mastered + partial*.5)/tops.length*100) : 0;
    const cells = Array.from({length:10},(_,i)=>{
      const thr = (i+1)*10;
      const bg = pct>=thr ? ph.col : pct>=(thr-10) ? ph.col+'55' : 'var(--ink3)';
      return `<div class="heat-cell" style="background:${bg}" title="${pct}%"></div>`;
    }).join('');
    return `<div class="heat-row">
      <div class="heat-lbl">${ph.name}</div>
      <div class="heat-cells">${cells}</div>
      <div style="font-size:10px;color:${ph.col};font-family:var(--ft);min-width:32px;margin-left:4px">${pct}%</div>
      <div style="font-size:10px;color:var(--muted);margin-left:4px">${mastered}/${tops.length}</div>
    </div>`;
  }).join('');
}
