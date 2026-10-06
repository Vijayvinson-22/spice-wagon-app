import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyRazorpaySignature } from './payment-rules.js';

test('verifies an HMAC-SHA256 Razorpay order/payment signature', () => {
  const orderId = 'order_test';
  const paymentId = 'pay_test';
  const secret = 'test-secret';
  const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

  assert.equal(verifyRazorpaySignature(orderId, paymentId, signature, secret), true);
  assert.equal(verifyRazorpaySignature(orderId, 'pay_other', signature, secret), false);
  assert.equal(verifyRazorpaySignature(orderId, paymentId, 'not-a-signature', secret), false);
  assert.equal(verifyRazorpaySignature(orderId, paymentId, signature, ''), false);
});
