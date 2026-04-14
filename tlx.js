// ═══════════════════════════════════════
// atcoder.js — AtCoder progress table
// virtual-scrolled, no lag
// ═══════════════════════════════════════

const ATC_TYPES = {
  ABC: { max: 500, probsFn: n => n <= 211 ? 'ABCDEF' : 'ABCDEFG' },
  ARC: { max: 300, probsFn: n => n <= 99  ? 'ABCD'   : 'ABCDEF'  },
  AGC: { max: 100, probsFn: () => 'ABCDEF' },
  AHC: { max:  50, probsFn: () => 'A'      },
};

const ATC_XP_MAP = {A:10, B:18, C:30, D:50, E:80, F:100, G:120};

let atcFilter = 'ABC';
let atcPage   = 0;
const ATC_PAGE_SIZE = 50;  // render 50 contests at a time

function renderATCoder() {
  atcFilter = S.atcCurrentFilter || 'ABC';
  atcPage   = S.atcPage || 0;
  document.querySelectorAll('.atc-filter-btn').forEach(b =>
    b.classList.toggle('on', b.dataset.type === atcFilter));
  buildATCTable();
  updateATCStats();
}

function atcSetFilter(type) {
  atcFilter = type; atcPage = 0;
  S.atcCurrentFilter = type; S.atcPage = 0; saveState();
  document.querySelectorAll('.atc-filter-btn').forEach(b =>
    b.classList.toggle('on', b.dataset.type === type));
  buildATCTable(); updateATCStats();
}

function buildATCTable() {
  if (!S.atcData) S.atcData = {};
  const cfg = ATC_TYPES[atcFilter];
  if (!cfg) return;
  const total = cfg.max;
  const startContest = atcPage * ATC_PAGE_SIZE + 1;
  const endContest   = Math.min(startContest + ATC_PAGE_SIZE - 1, total);

  // Build set of all problem letters in this page
  const allProbs = new Set();
  for (let n = startContest; n <= endContest; n++) {
    cfg.probsFn(n).split('').forEach(p => allProbs.add(p));
  }
  const probCols = [...allProbs].sort();

  let html = `<table class="atc-tbl"><thead><tr>
    <th class="row-hdr">Contest</th>
    ${probCols.map(p=>`<th>${p}</th>`).join('')}
  </tr></thead><tbody>`;

  for (let n = startContest; n <= endContest; n++) {
    const num = String(n).padStart(3, '0');
    const probs = cfg.probsFn(n);
    html += `<tr><td class="row-hdr">${atcFilter}${num}</td>`;
    for (const p of probCols) {
      if (!probs.includes(p)) { html += `<td><div class="atc-cell skip"></div></td>`; continue; }
      const key = `${atcFilter}_${num}_${p}`;
      const st = S.atcData[key] || 'none';
      html += `<td><div class="atc-cell ${st}"
        onclick="toggleATC('${atcFilter}','${num}','${p}')"
        title="${atcFilter}${num}-${p}: ${st==='AC'?'AC':st==='WA'?'WA':'Belum'}">${p}</div></td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  document.getElementById('atcTable').innerHTML = html;

  // Pagination
  const pages = Math.ceil(total / ATC_PAGE_SIZE);
  let pagHtml = `<div class="row" style="gap:5px;flex-wrap:wrap;justify-content:center;margin-top:8px">`;
  pagHtml += `<button class="btn btn-sm" onclick="atcChangePage(-1)" ${atcPage===0?'disabled style="opacity:.4"':''}>‹ Prev</button>`;
  pagHtml += `<span style="font-size:11px;color:var(--muted);padding:5px 8px">
    ${atcFilter} ${startContest}–${endContest} / ${total} (Page ${atcPage+1}/${pages})
  </span>`;
  pagHtml += `<button class="btn btn-sm" onclick="atcChangePage(1)" ${atcPage>=pages-1?'disabled style="opacity:.4"':''}>Next ›</button>`;
  pagHtml += `</div>`;
  document.getElementById('atcPagination').innerHTML = pagHtml;
}

function atcChangePage(dir) {
  const cfg = ATC_TYPES[atcFilter];
  const pages = Math.ceil(cfg.max / ATC_PAGE_SIZE);
  atcPage = Math.max(0, Math.min(pages-1, atcPage + dir));
  S.atcPage = atcPage; saveState();
  buildATCTable();
}

function toggleATC(type, num, prob) {
  if (!S.atcData) S.atcData = {};
  if (!S.atcXP)   S.atcXP   = {};
  const key = `${type}_${num}_${prob}`;
  const cur = S.atcData[key] || 'none';
  const next = cur==='none'?'AC':cur==='AC'?'WA':'none';
  S.atcData[key] = next;
  if (next === 'AC') {
    if (!S.atcXP[key]) {
      S.atcXP[key] = true;
      const xp = (type==='AGC'&&prob>='B')?150 : (type==='ARC'&&prob>='C')?110 : ATC_XP_MAP[prob]||30;
      gainXP(xp);
      notify(`${type}${num}-${prob} AC! +${xp} XP`, 'ok');
    } else {
      notify(`${type}${num}-${prob} AC (XP sudah diterima)`, 'up');
    }
  }
  saveState(); buildATCTable(); updateATCStats();
}

function updateATCStats() {
  if (!S.atcData) return;
  const cfg = ATC_TYPES[atcFilter];
  let totalAC = 0, totalContestWithAC = 0, totalCells = 0;
  const seenContest = new Set();
  for (const [key, val] of Object.entries(S.atcData)) {
    if (!key.startsWith(atcFilter + '_')) continue;
    const parts = key.split('_');
    if (val === 'AC') {
      totalAC++;
      if (!seenContest.has(parts[1])) { seenContest.add(parts[1]); totalContestWithAC++; }
    }
  }
  for (let n = 1; n <= cfg.max; n++) totalCells += cfg.probsFn(n).length;
  document.getElementById('atcTotalAC').textContent = totalAC;
  document.getElementById('atcTotalContest').textContent = totalContestWithAC;
  document.getElementById('atcCompletePct').textContent = totalCells ? Math.round(totalAC/totalCells*100)+'%' : '0%';
}

function addATCContestManual() {
  const type = document.getElementById('atcManualType').value;
  const num  = String(document.getElementById('atcManualNum').value||'').padStart(3,'0');
  const probs= document.getElementById('atcManualProbs').value.trim().toUpperCase().replace(/[^A-G]/g,'');
  if (!num || !probs) { notify('Isi nomor dan soal dulu', 'err'); return; }
  // For manual contests we just note them — the table covers all 1-500/300/100
  notify(`${type}${num} sudah ada di tabel (cover semua 1–${ATC_TYPES[type].max})`, 'up');
  document.getElementById('atcManualNum').value = '';
  document.getElementById('atcManualProbs').value = '';
}
