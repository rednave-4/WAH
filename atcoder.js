// ═══════════════════════════════════════
// cf.js — Codeforces sync & grind
// ═══════════════════════════════════════

const RATINGS = [800,900,1000,1100,1200,1300,1400,1500,1600,1700,1800,1900,2000,2100,2200,2300,2400,2500,2600,2700,2800,2900,3000,3100,3200,3300,3400,3500];

// ── CF SYNC ──
async function syncCF() {
  const handle = document.getElementById('cfHandleInp').value.trim();
  if (!handle) { notify('Masukkan CF handle dulu!', 'err'); return; }
  notify('Mengambil data CF... (butuh internet)', 'up');
  try {
    const [userRes, subRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
      fetch(`https://codeforces.com/api/user.status?handle=${handle}&count=10000`),
    ]);
    const user = await userRes.json();
    const subs = await subRes.json();
    if (user.status !== 'OK') throw new Error(user.comment || 'Handle tidak ditemukan');
    const u = user.result[0];

    // Deduplicate by contestId + index
    const seen = new Set(); const unique = [];
    for (const s of subs.result) {
      if (s.verdict !== 'OK') continue;
      const id = s.problem.contestId + '_' + s.problem.index;
      if (!seen.has(id)) { seen.add(id); unique.push(s); }
    }

    // Build tag + diff charts
    const tagCount = {}, diffCount = {};
    for (const s of unique) {
      for (const tag of (s.problem.tags||[])) tagCount[tag] = (tagCount[tag]||0) + 1;
      const r = s.problem.rating; if (r) diffCount[r] = (diffCount[r]||0) + 1;
    }

    // Award XP for new problems only — anti-farm across syncs & accounts
    if (!S.cfAwardedProblems) S.cfAwardedProblems = {};
    let newXP = 0, newCount = 0;
    for (const s of unique) {
      const pid = s.problem.contestId + '_' + s.problem.index;
      if (!S.cfAwardedProblems[pid]) {
        S.cfAwardedProblems[pid] = true;
        const r = s.problem.rating || 0;
        newXP += CF_XP[r] || Math.min(Math.floor(r/55), 50) || 5;
        newCount++;
      }
    }

    S.cfHandle = handle;
    S.plat.cf = u.rating || 0;
    S.cfData = {
      handle, rating: u.rating||0, maxRating: u.maxRating||0,
      rank: u.rank||'', solved: unique.length, tagCount, diffCount,
    };

    if (newXP > 0) gainXP(newXP);
    renderCFProfile();
    updatePlatLabels();
    saveState();

    if (newXP > 0)
      notify(`CF sync! ${unique.length} AC total · ${newCount} soal baru · +${newXP} XP`, 'ok');
    else
      notify(`CF sync berhasil! ${unique.length} AC · Semua XP sudah dihitung sebelumnya`, 'up');

  } catch(e) {
    notify('Gagal sync: ' + e.message + ' (cek koneksi internet)', 'err');
  }
}

function renderCFProfile() {
  const area = document.getElementById('cfProfileArea');
  const diffArea = document.getElementById('cfDiffArea');
  const tagArea = document.getElementById('cfTagArea');
  if (!S.cfData) {
    area.innerHTML = '<div style="font-size:12px;color:var(--muted)">Masukkan CF handle dan klik Sync.</div>';
    diffArea.innerHTML = ''; tagArea.innerHTML = '';
    return;
  }
  const d = S.cfData;
  if (S.cfHandle) document.getElementById('cfHandleInp').value = S.cfHandle;
  const cfT = tierOf(d.rating, CF_TIERS);

  area.innerHTML = `
    <div class="cf-profile">
      <div class="cf-avatar" style="color:${cfT[2]}">${d.handle.slice(0,2).toUpperCase()}</div>
      <div style="flex:1">
        <div style="font-family:var(--ft);font-size:14px;color:${cfT[2]}">${d.handle}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${d.rank||cfT[1]}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--ft);font-size:24px;font-weight:700;color:${cfT[2]}">${d.rating}</div>
        <div style="font-size:10px;color:var(--muted)">max: ${d.maxRating}</div>
      </div>
    </div>`;

  // Solved stats
  const g = `<div class="g3" style="margin-bottom:14px">
    <div class="mstat"><div class="mstat-num" style="color:#a78bfa">${d.solved}</div><div class="mstat-lbl">Total Solved</div></div>
    <div class="mstat"><div class="mstat-num" style="color:${cfT[2]}">${d.rating}</div><div class="mstat-lbl">Rating</div></div>
    <div class="mstat"><div class="mstat-num" style="color:#fbbf24">${d.maxRating}</div><div class="mstat-lbl">Max Rating</div></div>
  </div>`;

  // Diff breakdown
  const diffs = Object.entries(d.diffCount).sort((a,b)=>Number(a[0])-Number(b[0]));
  const diffCards = diffs.map(([r,c]) => {
    const col = Number(r)>=2400?'#f87171':Number(r)>=2100?'#fbbf24':Number(r)>=1900?'#c084fc':Number(r)>=1600?'#a78bfa':Number(r)>=1400?'#818cf8':Number(r)>=1200?'#34d399':'#9ca3af';
    return `<div class="mstat" style="min-width:56px"><div class="mstat-num" style="color:${col};font-size:16px">${c}</div><div class="mstat-lbl" style="color:${col}">${r}</div></div>`;
  }).join('');
  diffArea.innerHTML = g + `<div class="slbl">Solved per Rating</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">${diffCards}</div>`;

  // Top tags
  const topTags = Object.entries(d.tagCount).sort((a,b)=>b[1]-a[1]).slice(0,15);
  const maxTag = topTags[0]?.[1] || 1;
  const tagRows = topTags.map(([t,c]) => `
    <div class="tag-row">
      <div class="tag-name">${t}</div>
      <div class="tag-bar-wrap"><div class="tag-bar-fill" style="width:${Math.round(c/maxTag*100)}%"></div></div>
      <div class="tag-count">${c}</div>
    </div>`).join('');
  tagArea.innerHTML = `<div class="slbl">Problems by Tags (Top 15)</div><div class="card">${tagRows}</div>`;
}

// ── GRIND ──
function renderRatingPicker() {
  document.getElementById('ratingPicker').innerHTML = RATINGS.map(r => `
    <div class="rpick${S.grindRating===r?' on':''}" onclick="selectRating(${r})">${r}</div>`).join('');
}
function selectRating(r) { S.grindRating = r; saveState(); renderRatingPicker(); }

async function fetchRandomProblem() {
  const tag = document.getElementById('grindTag').value.trim();
  const r = S.grindRating;
  notify('Mengambil problem dari Codeforces...', 'up');
  try {
    const url = `https://codeforces.com/api/problemset.problems${tag?'?tags='+encodeURIComponent(tag):''}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') throw new Error('API error');
    let problems = data.result.problems.filter(p => p.rating === r);
    if (!problems.length) { notify('Tidak ada problem rating ' + r + (tag?' tag '+tag:''), 'err'); return; }
    problems.sort(() => Math.random() - .5);
    const p = problems[0];
    renderGrindProblem(p);
    if (!S.grindHistory) S.grindHistory = [];
    S.grindHistory.unshift({contestId:p.contestId,index:p.index,name:p.name,rating:r,tags:p.tags||[],date:today(),solved:false});
    if (S.grindHistory.length > 50) S.grindHistory.pop();
    saveState(); renderGrindHistory();
  } catch(e) { notify('Gagal ambil problem: ' + e.message, 'err'); }
}

function renderGrindProblem(p) {
  const url = `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
  const cfT = tierOf(p.rating||0, CF_TIERS);
  document.getElementById('grindProblem').innerHTML = `
    <div class="prob-card">
      <div style="font-size:14px;font-weight:600;margin-bottom:6px">${p.contestId}${p.index}. ${p.name}</div>
      <div class="row" style="margin-bottom:8px">
        <span class="badge badge-learn">CF</span>
        <span class="badge" style="background:${cfT[2]}22;color:${cfT[2]}">${p.rating||'?'}</span>
      </div>
      <div class="row" style="margin-bottom:12px">${(p.tags||[]).map(t=>`<span class="prob-tag">${t}</span>`).join('')}</div>
      <div class="row">
        <a href="${url}" target="_blank" class="btn btn-teal" style="text-decoration:none">Buka Soal ↗</a>
        <button class="btn btn-gold" onclick="markGrindSolved('${p.contestId}','${p.index}')">AC! +XP</button>
        <button class="btn" onclick="fetchRandomProblem()">Skip / Random Lagi</button>
      </div>
    </div>`;
}

function markGrindSolved(cid, idx) {
  if (!S.grindHistory) return;
  const h = S.grindHistory.find(x => String(x.contestId) === String(cid) && x.index === idx);
  if (h && h.solved) { notify('Sudah di-AC!', 'up'); return; }

  // anti-farm: same as CF sync awarded problems
  const pid = cid + '_' + idx;
  if (!S.cfAwardedProblems) S.cfAwardedProblems = {};
  if (S.cfAwardedProblems[pid]) { notify('XP sudah diterima untuk soal ini sebelumnya', 'up'); if(h) h.solved=true; saveState(); renderGrindHistory(); return; }

  S.cfAwardedProblems[pid] = true;
  if (h) h.solved = true;
  const r = S.grindRating;
  const xp = CF_XP[r] || Math.min(Math.floor(r/55),50) || 5;
  gainXP(xp); S.totalSolved++;
  notify('AC! +' + xp + ' XP (rating ' + r + ')', 'ok');
  renderGrindHistory(); saveState();
}

function renderGrindHistory() {
  renderRatingPicker();
  const el = document.getElementById('grindHistory');
  if (!S.grindHistory || !S.grindHistory.length) {
    el.innerHTML = '<div style="font-size:11px;color:var(--muted)">Belum ada riwayat. Klik "Get Problem!" untuk mulai.</div>';
    return;
  }
  el.innerHTML = S.grindHistory.slice(0,15).map(h => `
    <div style="display:flex;align-items:center;gap:9px;padding:9px 12px;background:var(--ink2);border:1px solid var(--bor);border-radius:var(--r);margin-bottom:5px;${h.solved?'opacity:.45':''}">
      <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${h.solved?'#10b981':'#a78bfa'}"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          <a href="https://codeforces.com/problemset/problem/${h.contestId}/${h.index}" target="_blank" style="color:var(--txt);text-decoration:none">${h.contestId}${h.index}. ${h.name}</a>
        </div>
        <div style="font-size:10px;color:var(--muted)">Rating ${h.rating} · ${h.date}</div>
      </div>
      <div style="font-size:10px;font-family:var(--ft);color:${h.solved?'#34d399':'#a78bfa'}">${h.solved?'AC':'—'}</div>
      ${!h.solved?`<button class="btn btn-sm btn-gold" onclick="markGrindSolved('${h.contestId}','${h.index}')">AC!</button>`:''}
    </div>`).join('');
}
