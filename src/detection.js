const CODE_FIELD_PATTERN = /(code|otp|token|mfa|verification|verif|pin|one-?time|totp|passcode|two-?factor|2fa)/i;
const ALLOWED_TYPES = new Set(['text', 'tel', 'number', 'password', 'email']);
const MFA_KEYWORDS = /(autenticaci[oó]n multifactor|c[oó]digo de verificaci[oó]n|doble factor|multi-?factor|two-?factor|verification code)/i;

export function inputLooksLikeCode(el) {
  if (!el) return false;
  const type = String(el.type || 'text').toLowerCase();
  if (!ALLOWED_TYPES.has(type)) return false;
  const hay = `${el.name || ''} ${el.id || ''} ${el.placeholder || ''}`;
  return CODE_FIELD_PATTERN.test(hay) || /[0-9]{4,}/.test(String(el.placeholder || ''));
}

export function pageHasMfaKeywords(text, title) {
  const hay = `${title || ''} ${text || ''}`;
  return MFA_KEYWORDS.test(hay);
}
