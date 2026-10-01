import { test } from 'node:test';
import assert from 'node:assert';
import { encryptSecret, decryptSecret } from '../src/crypto.js';

test('round-trip encrypt/decrypt returns the secret', async () => {
  const payload = await encryptSecret('JBSWY3DPEHPK3PXP', 'mypassword');
  const secret = await decryptSecret(payload, 'mypassword');
  assert.strictEqual(secret, 'JBSWY3DPEHPK3PXP');
});

test('wrong password rejects', async () => {
  const payload = await encryptSecret('JBSWY3DPEHPK3PXP', 'mypassword');
  await assert.rejects(() => decryptSecret(payload, 'wrong'), /wrong_password/);
});

test('payload does not contain the plaintext secret', async () => {
  const payload = await encryptSecret('JBSWY3DPEHPK3PXP', 'mypassword');
  assert.ok(!JSON.stringify(payload).includes('JBSWY3DPEHPK3PXP'));
});

test('random salt/iv differ between encryptions', async () => {
  const a = await encryptSecret('JBSWY3DPEHPK3PXP', 'mypassword');
  const b = await encryptSecret('JBSWY3DPEHPK3PXP', 'mypassword');
  assert.notStrictEqual(a.salt, b.salt);
  assert.notStrictEqual(a.iv, b.iv);
});
