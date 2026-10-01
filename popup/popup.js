import { generateTOTP, getRemainingSeconds } from '../src/totp.js';
import { encryptSecret, decryptSecret } from '../src/crypto.js';

const $ = (id) => document.getElementById(id);
let config = null;
let codeViewPassword = null;
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

async function getSecretForDisplay() {
  if (!config) return null;
  if (config.mode === 'plain') return config.secret;
  if (!codeViewPassword) return null;
  try {
    return await decryptSecret(config.payload, codeViewPassword);
  } catch (e) {
    codeViewPassword = null;
    return 'wrong';
  }
}

async function renderCode() {
  const empty = $('code-empty');
  const codeEl = $('code');
  const expiresEl = $('expires');
  const unlock = $('unlock');
  const codeView = $('code-view');
  const refresh = $('refresh-code');
  clearInterval(unlockTimer);
  if (!config) {
    empty.classList.remove('hidden');
    codeView.classList.add('hidden');
    unlock.classList.add('hidden');
    refresh.classList.add('hidden');
    return;
  }
  const secret = await getSecretForDisplay();
  if (secret === 'wrong') {
    empty.classList.add('hidden');
    codeView.classList.add('hidden');
    refresh.classList.add('hidden');
    unlock.classList.remove('hidden');
    return;
  }
  if (!secret) {
    empty.classList.add('hidden');
    codeView.classList.add('hidden');
    refresh.classList.add('hidden');
    unlock.classList.remove('hidden');
    return;
  }
  unlock.classList.add('hidden');
  empty.classList.add('hidden');
  codeView.classList.remove('hidden');
  refresh.classList.remove('hidden');
  const tick = async () => {
    const code = await generateTOTP(secret);
    codeEl.textContent = code;
    expiresEl.textContent = `Válido ${getRemainingSeconds()} s`;
  };
  await tick();
  unlockTimer = setInterval(tick, 1000);
}

async function unlock() {
  const password = $('password').value;
  const err = $('unlock-error');
  const secret = await getSecretForDisplay();
  const decrypted = await decryptSecret(config.payload, password).catch(() => null);
  if (!decrypted) {
    err.classList.remove('hidden');
    return;
  }
  err.classList.add('hidden');
  codeViewPassword = password;
  await chrome.runtime.sendMessage({ type: 'UNLOCK', secret: decrypted });
  $('password').value = '';
  renderCode();
}

async function saveConfig() {
  const mode = $('mode').value;
  const secret = $('secret').value.trim().replace(/\s+/g, '');
  const password = $('new-password').value;
  const msg = $('config-msg');
  if (!secret) {
    msg.textContent = 'Introduce un secret válido.';
    msg.classList.remove('hidden');
    return;
  }
  if (mode === 'plain') {
    config = { mode, secret };
  } else {
    if (!password) {
      msg.textContent = 'Introduce una contraseña.';
      msg.classList.remove('hidden');
      return;
    }
    config = { mode, payload: await encryptSecret(secret, password) };
  }
  await chrome.storage.local.set({ config });
  await chrome.runtime.sendMessage({ type: 'LOCK' });
  codeViewPassword = mode === 'encrypted' ? password : null;
  switchView('code');
  msg.textContent = 'Guardado.';
  msg.classList.remove('hidden');
}

function syncConfigForm() {
  if (!config) return;
  $('mode').value = config.mode || 'plain';
  $('mode').dispatchEvent(new Event('change'));
  $('secret').value = config.mode === 'plain' ? (config.secret || '') : '';
  $('new-password').value = '';
}

async function init() {
  for (const [name, el] of Object.entries(tabs)) {
    el.addEventListener('click', () => switchView(name));
  }
  $('mode').addEventListener('change', () => {
    $('password-field').classList.toggle('hidden', $('mode').value !== 'encrypted');
  });
  $('save-config').addEventListener('click', saveConfig);
  $('unlock-btn').addEventListener('click', unlock);
  $('password').addEventListener('keydown', (e) => { if (e.key === 'Enter') unlock(); });
  $('refresh-code').addEventListener('click', renderCode);
  await loadConfig();
  syncConfigForm();
  $('password-field').classList.toggle('hidden', !config || config.mode !== 'encrypted');
  renderCode();
}

init();
