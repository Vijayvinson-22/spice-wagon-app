import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAllowedOrderTransition,
  canAssignCourier,
  nextOrderStatuses,
  normalizePincodes,
  orderAssignmentError,
  pincodeFromAddress,
  shopCanServeAddress,
  shopCoversPincode,
  shopReadiness,
} from './marketplace-rules.js';

test('normalizes, validates and deduplicates service pincodes', () => {
  assert.deepEqual(normalizePincodes('600001, 600002 600001'), ['600001', '600002']);
  assert.equal(normalizePincodes(['600001', 'invalid']), null);
});

test('extracts a six-digit postal code from a complete address', () => {
  assert.equal(pincodeFromAddress('12 Beach Road, Chennai, Tamil Nadu 600001'), '600001');
  assert.equal(pincodeFromAddress('12 Beach Road, Chennai'), null);
});

test('only approved shops with matching pincodes cover an address', () => {
  assert.equal(shopCoversPincode({ approved: true, servicePincodes: ['600001'] }, '600001'), true);
  assert.equal(shopCoversPincode({ approved: false, servicePincodes: ['600001'] }, '600001'), false);
});

test('demo shops serve addresses only when demo checkout is enabled', () => {
  const shop = { approved: true, isDemo: true, servicePincodes: ['600083'] };
  assert.equal(shopCanServeAddress(shop, '600083'), false);
  assert.equal(shopCanServeAddress(shop, '600083', true), true);
  assert.equal(shopCanServeAddress(shop, '600001', true), false);
});

test('shop onboarding readiness requires an address, valid postal code, and map pin', () => {
  assert.deepEqual(shopReadiness({
    address: '15 Lakshmi Street, Saidapet, Chennai',
    servicePincodes: ['600015'],
    location: { lat: 13.02, lng: 80.22 },
  }), { address: true, servicePincodes: true, mapPin: true });
  assert.deepEqual(shopReadiness({ address: 'Short', servicePincodes: ['invalid'], location: null }), {
    address: false,
    servicePincodes: false,
    mapPin: false,
  });
});

test('allows only the next delivery milestone or rejection', () => {
  assert.equal(isAllowedOrderTransition('Order placed', 'Shop accepted'), true);
  assert.equal(isAllowedOrderTransition('Order placed', 'Delivered'), false);
  assert.equal(isAllowedOrderTransition('Milling', 'Rejected'), true);
  assert.equal(isAllowedOrderTransition('Delivered', 'Rejected'), false);
  assert.deepEqual(nextOrderStatuses('Packed'), ['Ready', 'Rejected']);
  assert.equal(isAllowedOrderTransition('Quality check', 'Order prepared'), true);
  assert.equal(isAllowedOrderTransition('Ready', 'Delivery assigned'), true);
  assert.deepEqual(nextOrderStatuses('Ready'), ['Delivery assigned', 'Rejected']);
});

test('shop and courier assignment are required before order acceptance and dispatch', () => {
  assert.match(orderAssignmentError({}, 'Shop accepted'), /Assign this order to a shop/);
  assert.equal(orderAssignmentError({ shopId: 'shop-1' }, 'Shop accepted'), null);
  assert.match(orderAssignmentError({ shopId: 'shop-1' }, 'Out for delivery'), /Assign a courier/);
  assert.match(orderAssignmentError({ shopId: 'shop-1' }, 'Delivery assigned'), /Assign a courier/);
  assert.equal(orderAssignmentError({ courierName: 'Mina', courierPhone: '9876543210' }, 'Out for delivery'), null);
  assert.equal(canAssignCourier('Ready'), true);
  assert.equal(canAssignCourier('Delivery assigned'), true);
  assert.equal(canAssignCourier('Milling'), false);
});
