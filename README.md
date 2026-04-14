// ═══════════════════════════════════════
// tlx.js — TLX Course & Olympiad
// ═══════════════════════════════════════

let TLX_DATA = null;

async function loadTLXData() {
  if (TLX_DATA) return TLX_DATA;
  try {
    const res = await fetch('data/tlx.json');
    TLX_DATA = await res.json();
  } catch(e) { TLX_DATA = {chapters:[], osn:[], osnp:[]}; }
  return TLX_DATA;
}

async function renderTLX() {
  const data = await loadTLXData();
  renderTLXCourses(data.chapters);
  renderTLXOlympiad('osn', data.osn);
  renderTLXOlympiad('osnp', data.osnp);
}

// ── COURSES ──
function renderTLXCourses(chapters) {
  if (!S.tlxProgress) S.tlxProgress = {};
  const container = document.getElementById('tlxCourses');
  container.innerHTML = chapters.map((ch, ci) => {
    const totalSolved = ch.subs.reduce((a,s) => a + (S.tlxProgress[s.id]||0), 0);
    const totalAll = ch.subs.reduce((a,s) => a + s.total, 0);
    const pct = totalAll ? Math.round(totalSolved/totalAll*100) : 0;
    return `
    <div class="tlx-chapter" id="tlx-chapter-${ci}">
      <div class="tlx-ch-hdr" onclick="toggleChapter(${ci})">
        <div style="display:flex;align-items:center;gap:10px;flex:1">
          <div class="tlx-ch-ico" style="background:${ch.color}22;color:${ch.color}">${ci+1}</div>
          <div>
            <div class="tlx-ch-name">${ch.name}</div>
            <div class="tlx-ch-stat" id="tlxChStat${ci}">${totalSolved} / ${totalAll} solved</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="tlx-ch-pct" id="tlxChPct${ci}">${pct}%</div>
          <div class="tlx-ch-arr" id="tlxChArr${ci}">▼</div>
        </div>
      </div>
      <div class="tlx-ch-bar-wrap"><div class="tlx-ch-bar" id="tlxChBar${ci}" style="background:${ch.color};width:${pct}%"></div></div>
      <div class="tlx-ch-body" id="tlxChBody${ci}">
        <div class="tlx-sub-grid">
          ${ch.subs.map(s => renderTLXSub(s, ch.color)).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderTLXSub(s, color) {
  const solved = S.tlxProgress[s.id] || 0;
  const pct = s.total ? Math.round(solved/s.total*100) : 0;
  return `
    <div class="tlx-sub-card">
      <div class="tlx-sub-name">${s.name}</div>
      <div class="bar-wrap"><div class="bar-fill" style="background:${color};width:${pct}%"></div></div>
      <div class="tlx-sub-meta">
        <span class="tlx-sub-count">${solved}/${s.total}</span>
        <span class="tlx-sub-pct">${pct}%</span>
        <button class="tlx-sub-edit" onclick="editTLXSub('${s.id}',${s.total},'${s.name.replace(/'/g,"\\'")}')">✎</button>
      </div>
    </div>`;
}

function toggleChapter(ci) {
  const body = document.getElementById('tlxChBody'+ci);
  const arr = document.getElementById('tlxChArr'+ci);
  body.classList.toggle('open');
  arr.classList.toggle('open');
}

function editTLXSub(id, total, name) {
  const cur = S.tlxProgress[id] || 0;
  const val = prompt(`"${name}"\nSolved (0–${total}):`, cur);
  if (val === null) return;
  const newVal = Math.min(parseInt(val)||0, total);
  const diff = newVal - cur;
  S.tlxProgress[id] = newVal;
  if (diff > 0) { gainXP(diff * 5); notify(name + ' diperbarui! +' + diff*5 + ' XP', 'ok'); }
  else notify(name + ' diperbarui!', 'ok');
  saveState(); renderTLX();
}

// ── OLYMPIAD ──
function renderTLXOlympiad(type, contests) {
  if (!S.tlxOlympiadAC) S.tlxOlympiadAC = {};
  if (!S.tlxOlympiadXP) S.tlxOlympiadXP = {};

  const containerId = type === 'osn' ? 'tlxOSNyears' : 'tlxOSNPyears';
  const statId = type === 'osn' ? 'tlxOSNstat' : 'tlxOSNPstat';
  const pctId  = type === 'osn' ? 'tlxOSNpct'  : 'tlxOSNPpct';
  const barId  = type === 'osn' ? 'tlxOSNbar'  : 'tlxOSNPbar';

  let totalAC = 0, totalProbs = 0;
  contests.forEach(c => {
    totalProbs += c.problems;
    for (let i = 1; i <= c.problems; i++) {
      if (S.tlxOlympiadAC[`${type}_${c.year}_${i}`] === 'AC') totalAC++;
    }
  });
  const pct = totalProbs ? Math.round(totalAC/totalProbs*100) : 0;
  const statEl = document.getElementById(statId);
  const pctEl  = document.getElementById(pctId);
  const barEl  = document.getElementById(barId);
  if(statEl) statEl.textContent = totalAC + ' / ' + totalProbs + ' AC';
  if(pctEl)  pctEl.textContent  = pct + '%';
  if(barEl)  barEl.style.width  = pct + '%';

  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = contests.map(c => {
    const probs = Array.from({length: c.problems}, (_,i)=>i+1);
    const acCount = probs.filter(i => S.tlxOlympiadAC[`${type}_${c.year}_${i}`]==='AC').length;
    return `
      <div class="tlx-year-block">
        <div class="tlx-year-hdr">
          <div>
            <div class="tlx-year-lbl">${c.name}</div>
            ${c.loc ? `<div class="tlx-year-loc">${c.loc}</div>` : ''}
          </div>
          <div class="tlx-year-prog">${acCount}/${c.problems} AC</div>
        </div>
        <div class="tlx-probs">
          ${probs.map(i => {
            const key = `${type}_${c.year}_${i}`;
            const st = S.tlxOlympiadAC[key] || 'none';
            return `<div class="tlx-prob ${st==='AC'?'ac':st==='WA'?'wa':''}" 
              onclick="toggleTLXProb('${type}','${c.year}',${i})" title="${c.name} - Soal ${i}">${i}</div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

function toggleTLXProb(type, year, prob) {
  if (!S.tlxOlympiadAC) S.tlxOlympiadAC = {};
  if (!S.tlxOlympiadXP) S.tlxOlympiadXP = {};
  const key = `${type}_${year}_${prob}`;
  const cur = S.tlxOlympiadAC[key] || 'none';
  const next = cur==='none'?'AC':cur==='AC'?'WA':'none';
  S.tlxOlympiadAC[key] = next;
  if (next === 'AC') {
    if (!S.tlxOlympiadXP[key]) {
      S.tlxOlympiadXP[key] = true;
      gainXP(40);
      notify(`${type.toUpperCase()} ${year} Soal ${prob} — AC! +40 XP`, 'ok');
    } else {
      notify(`${type.toUpperCase()} ${year} Soal ${prob} — AC (XP sudah diterima)`, 'up');
    }
  }
  saveState(); renderTLX();
}

function addTLXOlympiadContest(type) {
  const name = prompt('Nama contest (misal: OSN Informatika 2026):'); if(!name) return;
  const year = prompt('Tahun/ID unik (misal: 2026):'); if(!year) return;
  const loc = prompt('Lokasi (boleh kosong):')||'';
  const numProbs = parseInt(prompt('Jumlah soal:')||0); if(!numProbs) return;
  // Push to local TLX_DATA
  if (!TLX_DATA) return;
  const arr = type==='OSN'?TLX_DATA.osn:TLX_DATA.osnp;
  arr.unshift({year, name, loc, problems: numProbs});
  notify('Contest ' + name + ' ditambahkan!', 'ok');
  renderTLX();
}
