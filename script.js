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
