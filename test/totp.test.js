import { test } from 'node:test';
import assert from 'node:assert';
import { base32Decode, generateTOTP, getRemainingSeconds } from '../src/totp.js';

const ASCII_1234567890_20 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

test('base32Decode decodes Hello', () => {
  assert.deepStrictEqual(Array.from(base32Decode('JBSWY3DP')), [72, 101, 108, 108, 111]);
});

test('RFC 6238 SHA1 vector at T=59, 8 digits', async () => {
  const code = await generateTOTP(ASCII_1234567890_20, { digits: 8, epoch: 59 });
  assert.strictEqual(code, '94287082');
});

test('RFC 6238 SHA1 vector at T=59, 6 digits', async () => {
  const code = await generateTOTP(ASCII_1234567890_20, { digits: 6, epoch: 59 });
  assert.strictEqual(code, '287082');
});

test('code has requested digit length', async () => {
  const code = await generateTOTP(ASCII_1234567890_20, { epoch: 1000000 });
  assert.match(code, /^\d{6}$/);
});

test('getRemainingSeconds is within the period', () => {
  const r = getRemainingSeconds();
  assert.ok(r >= 1 && r <= 30);
});
