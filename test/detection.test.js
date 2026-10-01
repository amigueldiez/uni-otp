import { test } from 'node:test';
import assert from 'node:assert';
import { inputLooksLikeCode, pageHasMfaKeywords } from '../src/detection.js';

test('accepts an input named otp', () => {
  assert.ok(inputLooksLikeCode({ name: 'otp', id: '', placeholder: '', type: 'text' }));
});

test('accepts an input with id containing code', () => {
  assert.ok(inputLooksLikeCode({ name: '', id: 'verificationCode', placeholder: '', type: 'text' }));
});

test('accepts a telephone input with code placeholder', () => {
  assert.ok(inputLooksLikeCode({ name: '', id: '', placeholder: 'Código de verificación', type: 'tel' }));
});

test('rejects a checkbox', () => {
  assert.ok(!inputLooksLikeCode({ name: 'otp', id: '', placeholder: '', type: 'checkbox' }));
});

test('rejects a text input named email', () => {
  assert.ok(!inputLooksLikeCode({ name: 'email', id: '', placeholder: '', type: 'text' }));
});

test('pageHasMfaKeywords matches the real SSO text', () => {
  const text = 'Autenticación multifactor. Introduzca código de verificación.';
  assert.ok(pageHasMfaKeywords(text, 'Autenticación multifactor'));
});

test('pageHasMfaKeywords false on unrelated page', () => {
  assert.ok(!pageHasMfaKeywords('Portal del estudiante', 'Inicio'));
});
