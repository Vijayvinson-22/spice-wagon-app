import crypto from 'node:crypto';

export function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  if (![orderId, paymentId, signature, secret].every((value) => typeof value === 'string' && value.length > 0)) return false;
  if (!/^[a-f\d]{64}$/i.test(signature)) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest();
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
}
