// ═══════════════════════════════════════
// notes.js — Notes with projects
// ═══════════════════════════════════════

let activeNoteId = null;

function renderNotes() {
  renderProjectList();
  renderNoteList();
  populateNoteProjectSelect();
  if (activeNoteId) openNote(activeNoteId);
  else clearNoteEditor();
}

function renderProjectList() {
  const all = {id: null, name: 'Semua Catatan', color: '#a78bfa'};
  const items = [all, ...(S.projects||[])];
  document.getElementById('projList').innerHTML = items.map(p => `
    <div class="proj-item ${S.activeProjId===p.id?'on':''}" onclick="selectProject(${JSON.stringify(p.id)})">
      <div class="proj-dot" style="background:${p.color}"></div>
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</span>
      ${p.id!==null?`<button onclick="event.stopPropagation();deleteProject(${p.id})" style="background:transparent;border:none;color:var(--hint);cursor:pointer;font-size:14px;padding:0 2px" title="Hapus project">×</button>`:''}
    </div>`).join('');
}

function selectProject(id) {
  S.activeProjId = id; saveState();
  renderProjectList(); renderNoteList();
}

function addProject() {
  const name = prompt('Nama project baru:'); if (!name || !name.trim()) return;
  const colors = ['#a78bfa','#34d399','#fbbf24','#f87171','#60a5fa','#fb923c'];
  const color  = colors[Math.floor(Math.random()*colors.length)];
  if (!S.projects) S.projects = [];
  S.projects.push({id: S.nextProjId++, name: name.trim(), color});
  saveState(); renderProjectList();
}

function deleteProject(id) {
  if (!confirm('Hapus project ini? Catatannya tidak ikut terhapus.')) return;
  S.projects = S.projects.filter(p => p.id !== id);
  // Move notes from this project to "Semua"
  (S.notes||[]).forEach(n => { if (n.projectId === id) n.projectId = null; });
  if (S.activeProjId === id) S.activeProjId = null;
  saveState(); renderNotes();
}

function renderNoteList() {
  const pid = S.activeProjId;
  const notes = (S.notes||[]).filter(n => pid === null || n.projectId === pid);
  const list  = document.getElementById('noteList'); if (!list) return;
  list.innerHTML = notes.length
    ? notes.map(n => `
        <div class="note-card ${activeNoteId===n.id?'on':''}" onclick="openNote(${n.id})">
          <div class="note-card-title">${n.title||'Tanpa judul'}</div>
          <div class="note-card-preview">${(n.body||'Kosong').slice(0,60)}</div>
        </div>`).join('')
    : '<div style="font-size:11px;color:var(--hint);padding:6px">Belum ada catatan di sini.</div>';
}

function addNote() {
  if (!S.notes)  S.notes = [];
  const id = S.nextNoteId++;
  const pid = S.activeProjId;
  S.notes.push({id, title:'', body:'', projectId: pid!==null?pid:null, updated: today()});
  saveState();
  activeNoteId = id;
  renderNoteList();
  openNote(id);
}

function openNote(id) {
  const n = (S.notes||[]).find(x => x.id === id); if (!n) return;
  activeNoteId = id;
  document.getElementById('noteTitleInp').value = n.title || '';
  document.getElementById('noteBodyInp').value  = n.body  || '';
  populateNoteProjectSelect();
  document.getElementById('noteProject').value  = n.projectId || '';
  document.getElementById('noteTimestamp').textContent = 'Terakhir diubah: ' + (n.updated||'-');
  document.getElementById('delNoteBtn').style.display = 'inline-block';
  renderNoteList();
}

function clearNoteEditor() {
  document.getElementById('noteTitleInp').value = '';
  document.getElementById('noteBodyInp').value  = '';
  document.getElementById('noteTimestamp').textContent = '';
  document.getElementById('delNoteBtn').style.display = 'none';
}

function saveNote() {
  if (!activeNoteId) return;
  const n = (S.notes||[]).find(x => x.id === activeNoteId); if (!n) return;
  n.title     = document.getElementById('noteTitleInp').value.trim() || 'Tanpa judul';
  n.body      = document.getElementById('noteBodyInp').value;
  const selP  = document.getElementById('noteProject').value;
  n.projectId = selP ? parseInt(selP) : null;
  n.updated   = today();
  saveState(); renderNoteList(); renderProjectList();
  notify('Catatan disimpan!', 'ok');
}

function deleteNote() {
  if (!activeNoteId) return;
  if (!confirm('Hapus catatan ini?')) return;
  S.notes = (S.notes||[]).filter(n => n.id !== activeNoteId);
  activeNoteId = null;
  clearNoteEditor();
  saveState(); renderNoteList();
  notify('Catatan dihapus.', 'ok');
}

function populateNoteProjectSelect() {
  const sel = document.getElementById('noteProject'); if (!sel) return;
  sel.innerHTML = '<option value="">— Tanpa Project —</option>' +
    (S.projects||[]).map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}
