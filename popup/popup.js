import { generateTOTP, getRemainingSeconds } from '../src/totp.js';

const $ = (id) => document.getElementById(id);
let config = null;
let unlockTimer = null;

const views = { code: $('view-code'), config: $('view-config') };
const tabs = { code: $('tab-code'), config: $('tab-config') };

function switchView(name) {
  views.code.classList.toggle('hidden', name !== 'code');
  views.config.classList.toggle('hidden', name !== 'config');
  tabs.code.classList.toggle('active', name === 'code');
  tabs.config.classList.toggle('active', name === 'config');
  if (name === 'code') renderCode();
}

async function loadConfig() {
  config = (await chrome.storage.local.get('config')).config || null;
}

function setMessage(text, type = '') {
  const msg = $('config-msg');
  msg.textContent = text;
  msg.classList.remove('hidden', 'ok', 'error');
  if (type) msg.classList.add(type);
}

function updateProgress() {
  const total = 30;
  const remaining = getRemainingSeconds();
  const pct = (remaining / total) * 100;
  const bar = $('progress-bar');
  bar.style.width = `${pct}%`;
  bar.classList.toggle('warning', remaining <= 10 && remaining > 5);
  bar.classList.toggle('critical', remaining <= 5);
}

let copyTimer = null;
async function copyCode() {
  const code = $('code').textContent;
  if (!code) return;
  await navigator.clipboard.writeText(code);
  const btn = $('copy-code');
  btn.classList.add('copied');
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => btn.classList.remove('copied'), 1500);
}

async function renderCode() {
  const empty = $('code-empty');
  const codeEl = $('code');
  const expiresEl = $('expires');
  const codeCard = $('code-card');
  const refresh = $('refresh-code');
  clearInterval(unlockTimer);
  if (!config) {
    empty.classList.remove('hidden');
    codeCard.classList.add('hidden');
    refresh.classList.add('hidden');
    return;
  }
  const secret = config.secret;
  empty.classList.add('hidden');
  codeCard.classList.remove('hidden');
  refresh.classList.remove('hidden');
  const tick = async () => {
    const code = await generateTOTP(secret);
    codeEl.textContent = code;
    expiresEl.textContent = `Válido ${getRemainingSeconds()} s`;
    updateProgress();
  };
  await tick();
  unlockTimer = setInterval(tick, 1000);
}

async function saveConfig() {
  const secret = $('secret').value.trim().replace(/\s+/g, '');
  if (!secret) {
    setMessage('Introduce un secret válido.', 'error');
    return;
  }
  config = { mode: 'plain', secret };
  await chrome.storage.local.set({ config });
  switchView('code');
  setMessage('Guardado.', 'ok');
}

function syncConfigForm() {
  if (!config) return;
  $('secret').value = config.secret || '';
}

async function init() {
  for (const [name, el] of Object.entries(tabs)) {
    el.addEventListener('click', () => switchView(name));
  }
  $('config-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveConfig();
  });
  $('refresh-code').addEventListener('click', renderCode);
  $('copy-code').addEventListener('click', copyCode);
  $('goto-config').addEventListener('click', () => switchView('config'));
  await loadConfig();
  syncConfigForm();
  renderCode();
}

init();
