import { generateTOTP } from './totp.js';
import { inputLooksLikeCode, pageHasMfaKeywords } from './detection.js';

let decryptedSecret = null;

async function getConfig() {
  return (await chrome.storage.local.get('config')).config || {};
}

function resolveSecret(config) {
  if (config.mode === 'encrypted') return decryptedSecret;
  return config.secret || null;
}

async function handleCheckPage(message) {
  const config = await getConfig();
  const secret = resolveSecret(config);
  if (!secret) return { isMfa: false };
  if (!pageHasMfaKeywords(message.text, message.title)) return { isMfa: false };
  const inputs = Array.isArray(message.inputs) ? message.inputs : [];
  const index = inputs.findIndex(inputLooksLikeCode);
  if (index === -1) return { isMfa: false };
  const code = await generateTOTP(secret);
  return { isMfa: true, inputIndex: index, code };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_PAGE') {
    handleCheckPage(message).then(sendResponse).catch((e) => sendResponse({ isMfa: false }));
    return true;
  }
  if (message.type === 'UNLOCK') {
    decryptedSecret = message.secret;
    sendResponse({ ok: true });
    return;
  }
  if (message.type === 'LOCK') {
    decryptedSecret = null;
    sendResponse({ ok: true });
    return;
  }
  return false;
});
