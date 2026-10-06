export const orderStatuses = [
  'Order placed',
  'Shop accepted',
  'Ingredients checked',
  'Milling',
  'Quality check',
  'Packed',
  'Ready',
  'Out for delivery',
  'Delivered',
];

const terminalOrderStatuses = new Set(['Delivered', 'Rejected', 'Cancelled']);

export function normalizePincodes(value) {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[,\s]+/) : [];
  const pincodes = values.map((pincode) => String(pincode).trim()).filter(Boolean);
  if (pincodes.some((pincode) => !/^\d{6}$/.test(pincode))) return null;
  return [...new Set(pincodes)];
}

export function pincodeFromAddress(address) {
  if (typeof address !== 'string') return null;
  const matches = address.match(/(?:^|\D)([1-9]\d{5})(?=\D|$)/g);
  if (!matches?.length) return null;
  return matches[matches.length - 1].replace(/\D/g, '');
}

export function shopCoversPincode(shop, pincode) {
  return Boolean(pincode && shop?.approved && shop.servicePincodes?.includes(pincode));
}

export function shopReadiness(shop) {
  const pincodes = normalizePincodes(shop?.servicePincodes);
  return {
    address: typeof shop?.address === 'string' && shop.address.trim().length >= 8,
    servicePincodes: Boolean(pincodes?.length),
    mapPin: Number.isFinite(shop?.location?.lat) && shop.location.lat >= -90 && shop.location.lat <= 90
      && Number.isFinite(shop?.location?.lng) && shop.location.lng >= -180 && shop.location.lng <= 180,
  };
}

export function isAllowedOrderTransition(current, next) {
  if (current === next || terminalOrderStatuses.has(current)) return false;
  if (next === 'Rejected') return true;
  if (next === 'Cancelled') return false;
  return orderStatuses[orderStatuses.indexOf(next)] === next
    && orderStatuses.indexOf(next) === orderStatuses.indexOf(current) + 1;
}

export function nextOrderStatuses(current) {
  if (terminalOrderStatuses.has(current)) return [];
  const next = orderStatuses[orderStatuses.indexOf(current) + 1];
  return [next, 'Rejected'].filter(Boolean);
}
