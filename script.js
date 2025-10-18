const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const STORAGE_USER_KEY = 'utm_user';
const ENTRIES_PREFIX = 'utm_entries_';
const COLORS_PREFIX = 'utm_colors_';
const ADMIN_FLAG_PREFIX = 'utm_isAdmin_';

let currentUser = localStorage.getItem(STORAGE_USER_KEY);
if (!currentUser) window.location.href = 'login.html';

let currentIsAdmin = (localStorage.getItem('utm_currentIsAdmin') === '1');

const userSubtitle = document.getElementById('user-subtitle');
const logoutBtn = document.getElementById('logout-btn');
const userSelect = document.getElementById('user-select');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');

const entryForm = document.getElementById('entry-form');
const titleInput = document.getElementById('title');
const daySelect = document.getElementById('day');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const locationInput = document.getElementById('location');
const clearBtn = document.getElementById('clear-btn');

const weekGrid = document.getElementById('week-grid');

const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

let entries = [];
let subjectColors = {};
let editingId = null;
let viewedUser = currentUser;

// Populate day select
WEEK_DAYS.forEach(d => {
  const opt = document.createElement('option');
  opt.value = d;
  opt.textContent = d;
  daySelect.appendChild(opt);
});

// Storage helpers
const entriesKeyFor = user => ENTRIES_PREFIX + user;
const colorsKeyFor = user => COLORS_PREFIX + user;

function loadEntriesFor(user) {
  const raw = localStorage.getItem(entriesKeyFor(user));
  return raw ? JSON.parse(raw) : [];
}

function saveEntriesFor(user, arr) {
  localStorage.setItem(entriesKeyFor(user), JSON.stringify(arr || []));
}

function loadColorsFor(user) {
  const raw = localStorage.getItem(colorsKeyFor(user));
  return raw ? JSON.parse(raw) : {};
}

function saveColorsFor(user, map) {
  localStorage.setItem(colorsKeyFor(user), JSON.stringify(map || {}));
}

function getSubjectColorFor(user, subject) {
  const map = loadColorsFor(user);
  if (map[subject]) return map[subject];
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue} 70% 60%)`;
  map[subject] = color;
  saveColorsFor(user, map);
  return color;
}

// Users
function listLocalUsers() {
  const users = new Set();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(ENTRIES_PREFIX)) {
      const uname = k.replace(ENTRIES_PREFIX, '');
      if (uname) users.add(uname);
    }
  }
  users.add(currentUser);
  return Array.from(users).sort();
}

function renderUserSelector() {
  if (!currentIsAdmin) {
    userSelect.classList.add('hidden');
    return;
  }
  userSelect.classList.remove('hidden');
  userSelect.innerHTML = '';
  listLocalUsers().forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u + (u === 'admin' ? ' (admin)' : '');
    userSelect.appendChild(opt);
  });
  userSelect.value = viewedUser;
  userSelect.addEventListener('change', () => {
    viewedUser = userSelect.value;
    loadForViewedUser();
    render();
  });
}

// Load/save for viewed user
function loadForViewedUser() {
  entries = loadEntriesFor(viewedUser);
  subjectColors = loadColorsFor(viewedUser);
  editingId = null;
  clearForm();
}

function saveForViewedUser() {
  saveEntriesFor(viewedUser, entries);
  saveColorsFor(viewedUser, subjectColors);
}

// Header & logout
function updateHeader() {
  userSubtitle.textContent = currentIsAdmin ? `${currentUser} — Admin` : `Signed in as ${currentUser}`;
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem('utm_currentIsAdmin');
  window.location.href = 'login.html';
});

// Form submit
entryForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const entry = {
    id: editingId || Date.now().toString(),
    title: (titleInput.value || '').trim(),
    day: daySelect.value,
    start: startInput.value || '08:00',
    end: endInput.value || '09:00',
    location: (locationInput.value || '').trim()
  };
  if (!entry.title) return alert('Enter subject name');
  entries = editingId ? entries.map(e => e.id === editingId ? entry : e) : [...entries, entry];
  saveForViewedUser();
  clearForm();
  render();
});

// Clear form
function clearForm() {
  titleInput.value = '';
  locationInput.value = '';
  startInput.value = '08:00';
  endInput.value = '09:00';
  daySelect.value = 'Monday';
  editingId = null;
}
clearBtn.addEventListener('click', clearForm);

// Render timetable
function render() {
  weekGrid.innerHTML = '';
  const byDay = {};
  WEEK_DAYS.forEach(d => byDay[d] = []);
  entries.forEach(e => byDay[e.day] ? byDay[e.day].push(e) : (byDay[e.day] = [e]));
  const sortOpt = sortSelect.value;
  WEEK_DAYS.forEach(d => byDay[d].sort((a,b)=>a.start.localeCompare(b.start)));
  const q = (searchInput.value || '').toLowerCase().trim();

  WEEK_DAYS.forEach(day => {
    const col = document.createElement('div');
    col.className = 'day-col';
    const head = document.createElement('div');
    head.className = 'day-head';
    head.textContent = day;
    col.appendChild(head);

    const container = document.createElement('div');
    const dayEntries = byDay[day] || [];
    if (dayEntries.length === 0) {
      const no = document.createElement('div');
      no.className = 'muted';
      no.textContent = 'No classes';
      container.appendChild(no);
    } else {
      dayEntries.forEach(it => {
        const textCombined = `${it.title} ${it.day} ${it.location} ${it.start} ${it.end}`.toLowerCase();
        if (q && !textCombined.includes(q)) return;
        const color = subjectColors[it.title] || getSubjectColorFor(viewedUser, it.title);
        const card = document.createElement('div');
        card.className = 'entry';
        card.style.borderLeft = `6px solid ${color}`;
        card.style.boxShadow = `0 10px 30px ${color}26`;

        const h3 = document.createElement('h3');
        h3.textContent = it.title;
        h3.style.color = color;
        card.appendChild(h3);

        const p1 = document.createElement('p');
        p1.innerHTML = `<strong>Time:</strong> ${it.start} - ${it.end}`;
        card.appendChild(p1);

        const p2 = document.createElement('p');
        p2.innerHTML = `<strong>Location:</strong> ${it.location || '—'}`;
        card.appendChild(p2);

        const actions = document.createElement('div');
        actions.className = 'row actions small';
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'ghost';
        editBtn.addEventListener('click', () => {
          if (currentUser !== viewedUser && !currentIsAdmin) return alert('Cannot edit other users.');
          titleInput.value = it.title;
          daySelect.value = it.day;
          startInput.value = it.start;
          endInput.value = it.end;
          locationInput.value = it.location;
          editingId = it.id;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'danger';
        delBtn.addEventListener('click', () => {
          if (!confirm('Delete this entry?')) return;
          if (currentUser !== viewedUser && !currentIsAdmin) return alert('Cannot delete other users.');
          entries = entries.filter(e => e.id !== it.id);
          saveForViewedUser();
          render();
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        card.appendChild(actions);
        container.appendChild(card);
      });
    }
    col.appendChild(container);
    weekGrid.appendChild(col);
  });
}

// Export/Import/Clear
exportBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(JSON.stringify(entries, null, 2))
    .then(() => alert('Timetable JSON copied to clipboard.'))
    .catch(()=> alert('Could not copy to clipboard.'));
});

importBtn.addEventListener('click', () => {
  const data = prompt('Paste timetable JSON (array of entries):');
  if (!data) return;
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) throw new Error('Invalid');
    entries = parsed;
    saveForViewedUser();
    render();
  } catch (e) {
    alert('Invalid JSON.');
  }
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm(`Clear all entries for ${viewedUser}?`)) return;
  entries = [];
  saveForViewedUser();
  render();
});

// Search & sort
searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);

// Theme
function initTheme() {
  const stored = localStorage.getItem('utm_theme');
  if (stored === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  } else if (stored === 'light') {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('utm_theme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// Start
function start() {
  updateHeader();
  renderUserSelector();
  viewedUser = currentIsAdmin ? (userSelect.value || currentUser) : currentUser;
  loadForViewedUser();
  initTheme();
  render();
}
start();
