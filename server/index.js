   import dns from 'node:dns';
   dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import multer from 'multer';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Product, Shop, Order, Subscription, CustomBlend, User } from './models.js';
import { allowRoles, authenticate } from './middleware/auth.js';
import { isAllowedOrderTransition, normalizePincodes, pincodeFromAddress, shopCoversPincode, shopReadiness } from './marketplace-rules.js';
import { verifyRazorpaySignature } from './payment-rules.js';

const app = express();
const port = Number(process.env.PORT) || 4000;
const legacyDemoShopSlugs = ['spice-route-mill', 'ammammas-pantry', 'mysore-heritage-masalas'];
const dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.join(dirname, 'uploads');
await mkdir(uploadDirectory, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const extensionAllowed = ['.pdf', '.jpg', '.jpeg', '.png'].includes(path.extname(file.originalname).toLowerCase());
    const validFile = allowed.includes(file.mimetype) && extensionAllowed;
    callback(validFile ? null : Object.assign(new Error('Upload a PDF, JPEG, or PNG certification document.'), { status: 400 }), validFile);
  },
});

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({ origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)) }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDirectory, { fallthrough: false, dotfiles: 'deny' }));

function dbRequired(_req, res, next) {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'The marketplace database is not connected. Configure MONGODB_URI and try again.' });
  return next();
}
function validEmail(value) { return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function validDeliveryLocation(value) {
  return value === null || (
    value && typeof value === 'object' && !Array.isArray(value)
    && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90
    && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180
    && (value.accuracy === undefined || (Number.isFinite(value.accuracy) && value.accuracy >= 0))
  );
}
function normalizeDeliveryLocation(value) {
  if (!value) return undefined;
  return {
    latitude: value.latitude,
    longitude: value.longitude,
    ...(value.accuracy !== undefined ? { accuracy: value.accuracy } : {}),
    updatedAt: new Date(),
  };
}
function safeUser(user) { return { id: user._id, name: user.name, email: user.email, role: user.role, address: user.address, deliveryLocation: user.deliveryLocation }; }
function tokenFor(user) { return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
function errorMessage(error) {
  if (error.name === 'ValidationError') return Object.values(error.errors).map((item) => item.message).join(' ');
  if (error.code === 11000) return 'An account or record with those details already exists.';
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') return 'Certification documents must be 5 MB or smaller.';
  return error.message || 'Something went wrong.';
}
async function releaseInventory(items) {
  await Promise.all(items.map((item) => Product.updateOne({ slug: item.productId }, { $inc: { inventory: item.quantity } })));
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/auth/register', dbRequired, async (req, res, next) => {
  try {
    const { name, email, password, address, deliveryLocation } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return res.status(400).json({ message: 'Name must be between 2 and 100 characters.' });
    if (!validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
    if (address !== undefined && (typeof address !== 'string' || address.trim().length > 500)) return res.status(400).json({ message: 'Delivery address must be no longer than 500 characters.' });
    if (deliveryLocation !== undefined && !validDeliveryLocation(deliveryLocation)) return res.status(400).json({ message: 'GPS coordinates are invalid.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), address: address?.trim() || '', deliveryLocation: deliveryLocation || undefined, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ ...safeUser(user), token: tokenFor(user) });
  } catch (error) { return next(error); }
});

app.post('/api/auth/login', dbRequired, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!validEmail(email) || typeof password !== 'string') return res.status(400).json({ message: 'A valid email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return res.status(401).json({ message: 'Email or password is incorrect.' });
    return res.json({ ...safeUser(user), token: tokenFor(user) });
  } catch (error) { return next(error); }
});

app.get('/api/auth/me', dbRequired, authenticate, (req, res) => res.json({ user: safeUser(req.user) }));

app.patch('/api/auth/me', dbRequired, authenticate, async (req, res, next) => {
  try {
    const { name, email, address, password, deliveryLocation } = req.body || {};
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)) return res.status(400).json({ message: 'Name must be between 2 and 100 characters.' });
    if (email !== undefined && !validEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (address !== undefined && (typeof address !== 'string' || address.trim().length > 500)) return res.status(400).json({ message: 'Delivery address must be no longer than 500 characters.' });
    if (password !== undefined && (typeof password !== 'string' || password.length < 8 || password.length > 128)) return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
    if (deliveryLocation !== undefined && !validDeliveryLocation(deliveryLocation)) return res.status(400).json({ message: 'GPS coordinates are invalid.' });
    if (name !== undefined) req.user.name = name.trim();
    if (email !== undefined) req.user.email = email.toLowerCase().trim();
    if (address !== undefined) req.user.address = address.trim();
    if (password) req.user.passwordHash = await bcrypt.hash(password, 12);
    if (deliveryLocation !== undefined) req.user.deliveryLocation = normalizeDeliveryLocation(deliveryLocation);
    await req.user.save();
    return res.json(safeUser(req.user));
  } catch (error) { return next(error); }
});

app.get('/api/products', dbRequired, async (req, res, next) => {
  try {
    const filter = { active: true };
    if (typeof req.query.search === 'string' && req.query.search.trim()) filter.$text = { $search: req.query.search.trim() };
    if (typeof req.query.category === 'string' && req.query.category !== 'All spices') filter.category = req.query.category;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
    const [items, total] = await Promise.all([Product.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(), Product.countDocuments(filter)]);
    return res.json({ items, page, pages: Math.ceil(total / limit), total });
  } catch (error) { return next(error); }
});

app.post('/api/products', dbRequired, authenticate, allowRoles('shop_owner', 'admin'), async (req, res, next) => {
  try {
    const { name, price, unit, origin, inventory, shopId } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || !Number.isFinite(price) || price < 1 || typeof unit !== 'string' || !origin) return res.status(400).json({ message: 'Name, positive price, unit, and origin are required.' });
    if (inventory !== undefined && (!Number.isInteger(inventory) || inventory < 0)) return res.status(400).json({ message: 'Inventory must be a whole number of zero or more.' });
    if (req.user.role === 'shop_owner' && !await Shop.exists({ _id: shopId, ownerId: req.user._id })) return res.status(403).json({ message: 'Add this product to a shop managed by your account.' });
    const product = await Product.create({ ...req.body, name: name.trim(), slug: String(req.body.slug || name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), inventory: inventory ?? 0, shopId: shopId || undefined });
    return res.status(201).json({ product });
  } catch (error) { return next(error); }
});

app.patch('/api/products/:id', dbRequired, authenticate, allowRoles('shop_owner', 'admin'), async (req, res, next) => {
  try {
    const productFilter = { $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }] };
    if (req.user.role === 'shop_owner') {
      const existing = await Product.findOne(productFilter).select('shopId').lean();
      if (!existing || !existing.shopId || !await Shop.exists({ _id: existing.shopId, ownerId: req.user._id })) return res.status(404).json({ message: 'Product not found in a shop managed by your account.' });
    }
    const changes = { ...req.body };
    delete changes._id;
    delete changes.createdAt;
    delete changes.updatedAt;
    if (req.user.role !== 'admin') delete changes.shopId;
    if (changes.price !== undefined && (!Number.isFinite(changes.price) || changes.price < 1)) return res.status(400).json({ message: 'Price must be a positive number.' });
    if (changes.inventory !== undefined && (!Number.isInteger(changes.inventory) || changes.inventory < 0)) return res.status(400).json({ message: 'Inventory must be a whole number of zero or more.' });
    const product = await Product.findOneAndUpdate(productFilter, changes, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ product });
  } catch (error) { return next(error); }
});

app.get('/api/shops', dbRequired, async (_req, res, next) => {
  try {
    const filter = { approved: true, servicePincodes: { $exists: true, $ne: [] } };
    if (typeof _req.query.pincode === 'string') {
      if (!/^\d{6}$/.test(_req.query.pincode)) return res.status(400).json({ message: 'Enter a valid six-digit postal code.' });
      filter.servicePincodes = _req.query.pincode;
    }
    const [items, productCounts] = await Promise.all([
      Shop.find(filter).sort({ name: 1 }).lean(),
      Product.aggregate([{ $match: { active: true, shopId: { $exists: true } } }, { $group: { _id: '$shopId', count: { $sum: 1 } } }]),
    ]);
    const counts = new Map(productCounts.map((item) => [item._id.toString(), item.count]));
    return res.json({ shops: items.map((shop) => ({ ...shop, productCount: counts.get(shop._id.toString()) || 0 })) });
  }
  catch (error) { return next(error); }
});

app.get('/api/owner/dashboard', dbRequired, authenticate, allowRoles('shop_owner'), async (req, res, next) => {
  try {
    const shops = await Shop.find({ ownerId: req.user._id }).sort({ createdAt: -1 }).lean();
    const shopIds = shops.map((shop) => shop._id);
    const [orders, products] = await Promise.all([
      Order.find({ shopId: { $in: shopIds } }).sort({ createdAt: -1 }).limit(100).lean(),
      Product.find({ shopId: { $in: shopIds } }).sort({ name: 1 }).lean(),
    ]);
    return res.json({ shops, orders, products, openOrders: orders.filter((order) => !['Delivered', 'Rejected', 'Cancelled'].includes(order.status)).length });
  } catch (error) { return next(error); }
});

app.post('/api/shops', dbRequired, authenticate, allowRoles('shop_owner', 'admin'), async (req, res, next) => {
  try {
    const { name, address, servicePincodes, location, description } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || typeof address !== 'string' || address.trim().length < 5) return res.status(400).json({ message: 'A shop name and complete address are required.' });
    const pincodes = normalizePincodes(servicePincodes);
    if (!pincodes?.length) return res.status(400).json({ message: 'Add at least one valid six-digit delivery postal code.' });
    if (location !== undefined && (!location || !Number.isFinite(location.lat) || location.lat < -90 || location.lat > 90 || !Number.isFinite(location.lng) || location.lng < -180 || location.lng > 180)) return res.status(400).json({ message: 'The optional map pin must contain valid map coordinates.' });
    const shop = await Shop.create({ name: name.trim(), address: address.trim(), description: typeof description === 'string' ? description.trim().slice(0, 1000) : '', ...(location ? { location } : {}), servicePincodes: pincodes, slug: String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), ownerId: req.user.role === 'shop_owner' ? req.user._id : undefined, approved: false });
    return res.status(201).json({ shop });
  } catch (error) { return next(error); }
});

app.patch('/api/shops/:id', dbRequired, authenticate, allowRoles('shop_owner', 'admin'), async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === 'shop_owner') filter.ownerId = req.user._id;
    const currentShop = await Shop.findOne(filter);
    if (!currentShop) return res.status(404).json({ message: 'Shop not found or not managed by your account.' });
    const changes = {};
    for (const field of ['name', 'address', 'description', 'location', 'servicePincodes', 'openingTime', 'closingTime']) {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    }
    if (changes.servicePincodes !== undefined) {
      changes.servicePincodes = normalizePincodes(changes.servicePincodes);
      if (!changes.servicePincodes) return res.status(400).json({ message: 'Delivery postal codes must each contain six digits.' });
    }
    if (changes.location !== undefined && changes.location !== null && (!Number.isFinite(changes.location.lat) || changes.location.lat < -90 || changes.location.lat > 90 || !Number.isFinite(changes.location.lng) || changes.location.lng < -180 || changes.location.lng > 180)) return res.status(400).json({ message: 'The optional map pin must contain valid map coordinates.' });
    const update = { $set: { ...changes } };
    if (changes.location === null) {
      delete update.$set.location;
      update.$unset = { location: 1 };
    }
    const nextShop = {
      address: changes.address ?? currentShop.address,
      servicePincodes: changes.servicePincodes ?? currentShop.servicePincodes,
      location: changes.location === null ? null : changes.location ?? currentShop.location,
    };
    if (currentShop.approved && !Object.values(shopReadiness(nextShop)).every(Boolean)) update.$set.approved = false;
    const shop = await Shop.findOneAndUpdate(filter, update, { new: true, runValidators: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found or not managed by your account.' });
    return res.json({ shop });
  } catch (error) { return next(error); }
});

app.post('/api/shops/:id/certifications', dbRequired, authenticate, allowRoles('shop_owner', 'admin'), upload.single('document'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose a certification document to upload.' });
    const shop = await Shop.findById(req.params.id);
    if (!shop || (req.user.role === 'shop_owner' && shop.ownerId?.toString() !== req.user._id.toString())) return res.status(404).json({ message: 'Shop not found or not managed by your account.' });
    const name = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 100) : '';
    if (!name) return res.status(400).json({ message: 'Certification name is required.' });
    shop.certifications.push({ name, documentUrl: `/uploads/${req.file.filename}`, verified: false });
    await shop.save();
    return res.status(201).json({ certifications: shop.certifications });
  } catch (error) { return next(error); }
});

app.post('/api/orders', dbRequired, authenticate, async (req, res, next) => {
  const reservations = [];
  try {
    const { items, paymentMethod, deliveryAddress, deliveryLocation } = req.body || {};
    if (!Array.isArray(items) || items.length < 1 || items.length > 30) return res.status(400).json({ message: 'An order must contain between 1 and 30 items.' });
    if (!['cod', 'razorpay'].includes(paymentMethod)) return res.status(400).json({ message: 'Choose cash on delivery or Razorpay.' });
    if (typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 10 || deliveryAddress.length > 500) return res.status(400).json({ message: 'Enter a complete delivery address.' });
    if (deliveryLocation !== undefined && !validDeliveryLocation(deliveryLocation)) return res.status(400).json({ message: 'GPS coordinates are invalid.' });
    const pincode = pincodeFromAddress(deliveryAddress);
    if (!pincode) return res.status(400).json({ message: 'Add the six-digit delivery postal code to your address.' });
    const deliveryShop = await Shop.findOne({ approved: true, servicePincodes: pincode }).select('_id').lean();
    if (!deliveryShop) return res.status(409).json({ message: 'Delivery is not available for this postal code yet. Check Local shops or contact support.' });
    const orderItems = [];
    for (const item of items) {
      if (!item || typeof item.productId !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50) return res.status(400).json({ message: 'Each order item needs a product and a quantity from 1 to 50.' });
      if (item.customization && typeof item.customization === 'object') {
        const { weights, quantity, heat, blendName } = item.customization;
        const values = weights && Object.values(weights);
        if (!Array.isArray(values) || values.length < 2 || values.length > 12 || values.some((value) => !Number.isInteger(value) || value < 0 || value > 100) || values.reduce((sum, value) => sum + value, 0) !== 100 || ![100, 200, 500].includes(quantity) || !Number.isInteger(heat) || heat < 0 || heat > 100 || typeof blendName !== 'string' || blendName.length > 42) return res.status(400).json({ message: 'The custom blend recipe is incomplete or ingredient percentages do not total 100%.' });
        orderItems.push({ productId: 'custom-blend', name: blendName.trim() || 'Custom spice blend', quantity: 1, unitPrice: Math.round(quantity * (1.65 + heat / 100)), customization: item.customization });
      } else {
        const product = await Product.findOne({ slug: item.productId, active: true }).lean();
        if (!product) return res.status(400).json({ message: `The spice "${item.name || item.productId}" is no longer available.` });
        orderItems.push({ productId: product.slug, name: product.name, quantity: item.quantity, unitPrice: product.price });
      }
    }
    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const total = subtotal + deliveryFee;
    const paymentStatus = paymentMethod === 'cod' ? 'pay_on_delivery' : 'pending';
    const order = new Order({ customerId: req.user._id, shopId: deliveryShop._id, items: orderItems, subtotal, deliveryFee, total, deliveryAddress: deliveryAddress.trim(), deliveryLocation: normalizeDeliveryLocation(deliveryLocation) || req.user.deliveryLocation, paymentMethod, paymentStatus, statusHistory: [{ status: 'Order placed', note: 'Your order was accepted for processing by a shop that serves this postal code.' }] });
    if (paymentMethod === 'razorpay' && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) return res.status(503).json({ message: 'Online payment is not configured. Choose cash on delivery or contact the shop.' });
    for (const item of orderItems) {
      if (item.productId === 'custom-blend') continue;
      const reserved = await Product.findOneAndUpdate({ slug: item.productId, active: true, inventory: { $gte: item.quantity } }, { $inc: { inventory: -item.quantity } }, { new: true }).lean();
      if (!reserved) {
        await releaseInventory(reservations);
        reservations.length = 0;
        return res.status(409).json({ message: `${item.name} is no longer available in the requested quantity.` });
      }
      reservations.push(item);
    }
    let payment = null;
    if (paymentMethod === 'razorpay') {
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const paymentOrder = await razorpay.orders.create({ amount: total * 100, currency: 'INR', receipt: `sw_${order._id}`, notes: { orderId: order._id.toString(), customerId: req.user._id.toString() } });
      order.razorpayOrderId = paymentOrder.id;
      payment = { orderId: paymentOrder.id, amount: paymentOrder.amount, currency: paymentOrder.currency, keyId: process.env.RAZORPAY_KEY_ID };
    }
    await order.save();
    return res.status(201).json({ order, payment });
  } catch (error) {
    if (reservations.length) await releaseInventory(reservations);
    return next(error);
  }
});

app.post('/api/orders/:id/payment-failure', dbRequired, authenticate, async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, customerId: req.user._id, paymentMethod: 'razorpay' };
    const order = await Order.findOne(filter);
    if (!order) return res.status(404).json({ message: 'The online payment order could not be found.' });
    if (order.paymentStatus === 'failed') return res.json({ order, released: true });
    if (order.paymentStatus !== 'pending') return res.status(409).json({ message: 'Only a pending online payment can be cancelled.' });
    const failedOrder = await Order.findOneAndUpdate(
      { ...filter, paymentStatus: 'pending' },
      { $set: { paymentStatus: 'failed' }, $push: { statusHistory: { status: order.status, note: 'Online payment was cancelled before verification.', at: new Date() } } },
      { new: true },
    );
    if (!failedOrder) return res.status(409).json({ message: 'The payment status changed before cancellation could be completed. Refresh your order history.' });
    await releaseInventory(failedOrder.items.filter((item) => item.productId !== 'custom-blend'));
    return res.json({ order: failedOrder, released: true });
  } catch (error) { return next(error); }
});

app.post('/api/payments/verify', dbRequired, authenticate, async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {};
    if (![orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature].every((value) => typeof value === 'string')) return res.status(400).json({ message: 'Payment verification details are incomplete.' });
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: 'Online payment verification is not configured.' });
    const order = await Order.findOne({ _id: orderId, customerId: req.user._id });
    if (!order || order.paymentMethod !== 'razorpay' || order.razorpayOrderId !== razorpayOrderId) return res.status(404).json({ message: 'The matching payment order could not be found.' });
    if (order.paymentStatus === 'paid' && order.razorpayPaymentId === razorpayPaymentId) return res.json({ order, verified: true });
    if (order.paymentStatus !== 'pending') return res.status(409).json({ message: 'This payment is no longer pending and cannot be confirmed.' });
    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, process.env.RAZORPAY_KEY_SECRET)) return res.status(400).json({ message: 'Payment signature verification failed. The order remains unpaid.' });
    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, customerId: req.user._id, paymentMethod: 'razorpay', razorpayOrderId, paymentStatus: 'pending' },
      { $set: { razorpayPaymentId, paymentStatus: 'paid' } },
      { new: true },
    );
    if (paidOrder) return res.json({ order: paidOrder, verified: true });
    const updatedOrder = await Order.findById(order._id);
    if (updatedOrder?.paymentStatus === 'paid' && updatedOrder.razorpayPaymentId === razorpayPaymentId) return res.json({ order: updatedOrder, verified: true });
    return res.status(409).json({ message: 'The payment status changed before verification could be completed. Refresh your order history.' });
  } catch (error) { return next(error); }
});

app.get('/api/orders', dbRequired, authenticate, async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : req.user.role === 'shop_owner' ? { shopId: { $in: await Shop.find({ ownerId: req.user._id }).distinct('_id') } } : { customerId: req.user._id };
    return res.json({ orders: await Order.find(filter).sort({ createdAt: -1 }).limit(100).lean() });
  } catch (error) { return next(error); }
});

app.patch('/api/orders/:id/status', dbRequired, authenticate, allowRoles('shop_owner', 'admin'), async (req, res, next) => {
  try {
    const { status, note, batchId, millingDate, shelfLife, storageInstructions } = req.body || {};
    if (typeof status !== 'string') return res.status(400).json({ message: 'Choose a valid order status.' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (!isAllowedOrderTransition(order.status, status)) return res.status(409).json({ message: 'Orders must move one delivery step at a time. Terminal orders cannot be changed.' });
    if (status === 'Shop accepted' && order.paymentMethod === 'razorpay' && order.paymentStatus !== 'paid') return res.status(409).json({ message: 'Verify payment before accepting this online order.' });
    if (req.user.role === 'shop_owner' && !order.shopId) return res.status(403).json({ message: 'This order has not been assigned to a shop.' });
    if (req.user.role === 'shop_owner') {
      const shop = await Shop.findOne({ _id: order.shopId, ownerId: req.user._id });
      if (!shop) return res.status(403).json({ message: 'This order belongs to another shop.' });
    }
    order.status = status;
    if (batchId !== undefined) order.batchId = String(batchId).slice(0, 100);
    if (millingDate !== undefined) order.millingDate = new Date(millingDate);
    if (shelfLife !== undefined) order.shelfLife = String(shelfLife).slice(0, 120);
    if (storageInstructions !== undefined) order.storageInstructions = String(storageInstructions).slice(0, 500);
    order.statusHistory.push({ status, note: typeof note === 'string' ? note.slice(0, 500) : '', at: new Date() });
    await order.save();
    return res.json({ order });
  } catch (error) { return next(error); }
});

app.get('/api/blends', dbRequired, authenticate, async (req, res, next) => {
  try { return res.json({ blends: await CustomBlend.find({ customerId: req.user._id }).sort({ updatedAt: -1 }).lean() }); }
  catch (error) { return next(error); }
});

app.post('/api/blends', dbRequired, authenticate, async (req, res, next) => {
  try {
    const { name, ingredients, spiceLevel, heatLevel, saltLevel, quantity } = req.body || {};
    const percentages = ingredients && Object.values(ingredients);
    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 42 || !ingredients || Array.isArray(ingredients) || typeof ingredients !== 'object' || Object.keys(ingredients).length < 2 || Object.keys(ingredients).length > 12 || percentages.some((value) => !Number.isInteger(value) || value < 0 || value > 100) || percentages.reduce((sum, value) => sum + value, 0) !== 100) return res.status(400).json({ message: 'Add a blend name and ingredient percentages that total exactly 100%.' });
    if (![spiceLevel, heatLevel, saltLevel].every((value) => Number.isInteger(value) && value >= 0 && value <= 100) || ![100, 200, 500].includes(quantity)) return res.status(400).json({ message: 'Spice, heat and salt levels must be 0–100 and batch size must be 100, 200 or 500 g.' });
    const blend = await CustomBlend.create({ customerId: req.user._id, name: name.trim(), ingredients, spiceLevel, heatLevel, saltLevel, quantity });
    return res.status(201).json({ blend });
  } catch (error) { return next(error); }
});

app.patch('/api/blends/:id', dbRequired, authenticate, async (req, res, next) => {
  try {
    const blend = await CustomBlend.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!blend) return res.status(404).json({ message: 'Saved blend not found.' });
    const { name, ingredients, spiceLevel, heatLevel, saltLevel, quantity } = req.body || {};
    const nextIngredients = ingredients ?? Object.fromEntries(blend.ingredients);
    const percentages = Object.values(nextIngredients);
    if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.trim().length > 42)) return res.status(400).json({ message: 'Blend name must be between 1 and 42 characters.' });
    if (Array.isArray(nextIngredients) || Object.keys(nextIngredients).length < 2 || Object.keys(nextIngredients).length > 12 || percentages.some((value) => !Number.isInteger(value) || value < 0 || value > 100) || percentages.reduce((sum, value) => sum + value, 0) !== 100) return res.status(400).json({ message: 'Ingredient percentages must total exactly 100%.' });
    if (![spiceLevel ?? blend.spiceLevel, heatLevel ?? blend.heatLevel, saltLevel ?? blend.saltLevel].every((value) => Number.isInteger(value) && value >= 0 && value <= 100) || ![100, 200, 500].includes(quantity ?? blend.quantity)) return res.status(400).json({ message: 'Levels must be 0–100 and batch size must be 100, 200 or 500 g.' });
    Object.assign(blend, { name: name === undefined ? blend.name : name.trim(), ingredients: nextIngredients, spiceLevel: spiceLevel ?? blend.spiceLevel, heatLevel: heatLevel ?? blend.heatLevel, saltLevel: saltLevel ?? blend.saltLevel, quantity: quantity ?? blend.quantity });
    await blend.save();
    return res.json({ blend });
  } catch (error) { return next(error); }
});

app.delete('/api/blends/:id', dbRequired, authenticate, async (req, res, next) => {
  try {
    const blend = await CustomBlend.findOneAndDelete({ _id: req.params.id, customerId: req.user._id });
    if (!blend) return res.status(404).json({ message: 'Saved blend not found.' });
    return res.json({ deleted: true });
  } catch (error) { return next(error); }
});

app.post('/api/subscriptions', dbRequired, authenticate, async (req, res, next) => {
  try {
    const { productId, quantity, interval, intervalDays, customization } = req.body || {};
    if (typeof productId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 50 || !['weekly', 'monthly', 'custom'].includes(interval)) return res.status(400).json({ message: 'Choose a product, a quantity from 1 to 50, and a valid delivery interval.' });
    if (interval === 'custom' && (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365)) return res.status(400).json({ message: 'Custom deliveries must be between 1 and 365 days apart.' });
    const product = await Product.findOne({ slug: productId, active: true }).lean();
    if (!product && productId !== 'custom-blend') return res.status(404).json({ message: 'That product is not available for subscription.' });
    if (customization && (Object.values(customization.weights || {}).reduce((sum, value) => sum + value, 0) !== 100)) return res.status(400).json({ message: 'Custom blend ingredient percentages must total 100%.' });
    const days = interval === 'weekly' ? 7 : interval === 'monthly' ? 30 : intervalDays;
    const subscription = await Subscription.create({ customerId: req.user._id, productId, productName: product?.name || customization?.blendName || 'Custom spice blend', quantity, interval, intervalDays: days, nextDeliveryAt: new Date(Date.now() + days * 86400000), customization, history: [{ action: 'created' }] });
    return res.status(201).json({ subscription });
  } catch (error) { return next(error); }
});

app.get('/api/subscriptions', dbRequired, authenticate, async (req, res, next) => {
  try { return res.json({ subscriptions: await Subscription.find(req.user.role === 'admin' ? {} : { customerId: req.user._id }).sort({ nextDeliveryAt: 1 }).lean() }); }
  catch (error) { return next(error); }
});

app.patch('/api/subscriptions/:id', dbRequired, authenticate, async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, ...(req.user.role === 'admin' ? {} : { customerId: req.user._id }) });
    if (!subscription) return res.status(404).json({ message: 'Subscription not found.' });
    const { action, quantity, productId, interval, intervalDays } = req.body || {};
    const actionStatus = { pause: 'paused', resume: 'active', cancel: 'cancelled' };
    if (action && !Object.hasOwn(actionStatus, action)) return res.status(400).json({ message: 'Choose pause, resume, skip, cancel, or update.' });
    if (action === 'skip') {
      if (subscription.status !== 'active') return res.status(409).json({ message: 'Only an active subscription can skip its next delivery.' });
      subscription.nextDeliveryAt = new Date(subscription.nextDeliveryAt.getTime() + subscription.intervalDays * 86400000);
    }
    if (action && actionStatus[action]) subscription.status = actionStatus[action];
    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return res.status(400).json({ message: 'Quantity must be between 1 and 50.' });
      subscription.quantity = quantity;
    }
    if (productId !== undefined) {
      const product = await Product.findOne({ slug: productId, active: true }).lean();
      if (!product) return res.status(404).json({ message: 'That product is not available.' });
      subscription.productId = product.slug;
      subscription.productName = product.name;
    }
    if (interval !== undefined) {
      if (!['weekly', 'monthly', 'custom'].includes(interval)) return res.status(400).json({ message: 'Choose a weekly, monthly, or custom interval.' });
      if (interval === 'custom' && (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365)) return res.status(400).json({ message: 'Custom deliveries must be between 1 and 365 days apart.' });
      subscription.interval = interval;
      subscription.intervalDays = interval === 'weekly' ? 7 : interval === 'monthly' ? 30 : intervalDays;
    }
    subscription.history.push({ action: action || 'updated', at: new Date() });
    await subscription.save();
    return res.json({ subscription });
  } catch (error) { return next(error); }
});

app.get('/api/admin/overview', dbRequired, authenticate, allowRoles('admin'), async (_req, res, next) => {
  try {
    const realShopFilter = { $nor: [{ slug: { $in: legacyDemoShopSlugs }, ownerId: { $exists: false }, address: /Bengaluru/i }] };
    const [customers, shops, pendingShops, orders, subscriptions, revenue] = await Promise.all([
      User.countDocuments({ role: 'customer' }), Shop.countDocuments({ ...realShopFilter, approved: true }), Shop.countDocuments({ ...realShopFilter, approved: false }), Order.countDocuments(), Subscription.countDocuments({ status: 'active' }), Order.aggregate([{ $match: { paymentStatus: { $in: ['paid', 'pay_on_delivery'] } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    ]);
    return res.json({ customers, shops, pendingShops, orders, activeSubscriptions: subscriptions, orderValue: revenue[0]?.total || 0 });
  } catch (error) { return next(error); }
});

app.get('/api/admin/customers', dbRequired, authenticate, allowRoles('admin'), async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const customers = await User.find({ role: 'customer' }).select('_id name email createdAt').sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50).lean();
    return res.json({ customers, page });
  } catch (error) { return next(error); }
});

app.get('/api/admin/shops', dbRequired, authenticate, allowRoles('admin'), async (_req, res, next) => {
  try {
    const filter = { $nor: [{ slug: { $in: legacyDemoShopSlugs }, ownerId: { $exists: false }, address: /Bengaluru/i }] };
    return res.json({ shops: await Shop.find(filter).sort({ approved: 1, createdAt: -1 }).limit(200).lean() });
  }
  catch (error) { return next(error); }
});

app.patch('/api/admin/shops/:id/approval', dbRequired, authenticate, allowRoles('admin'), async (req, res, next) => {
  try {
    if (typeof req.body?.approved !== 'boolean') return res.status(400).json({ message: 'Set approved to true or false.' });
    if (req.body.approved) {
      const shop = await Shop.findById(req.params.id);
      if (!shop) return res.status(404).json({ message: 'Shop not found.' });
      const readiness = shopReadiness(shop);
      if (!readiness.address) return res.status(409).json({ message: 'Add the complete street address before approving this shop.' });
      if (!readiness.servicePincodes) return res.status(409).json({ message: 'Add at least one valid delivery postal code before approving this shop.' });
      if (!readiness.mapPin) return res.status(409).json({ message: 'Find and verify the shop map pin before approving this shop.' });
    }
    const shop = await Shop.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true, runValidators: true });
    if (!shop) return res.status(404).json({ message: 'Shop not found.' });
    return res.json({ shop });
  } catch (error) { return next(error); }
});

app.patch('/api/admin/shops/:shopId/certifications/:certificationId', dbRequired, authenticate, allowRoles('admin'), async (req, res, next) => {
  try {
    if (typeof req.body?.verified !== 'boolean') return res.status(400).json({ message: 'Set verified to true or false.' });
    const shop = await Shop.findOneAndUpdate({ _id: req.params.shopId, 'certifications._id': req.params.certificationId }, { $set: { 'certifications.$.verified': req.body.verified } }, { new: true });
    if (!shop) return res.status(404).json({ message: 'Shop or certification not found.' });
    return res.json({ certifications: shop.certifications });
  } catch (error) { return next(error); }
});

async function seedCatalog() {
  const products = [
    ['turmeric', 'Lakadong Turmeric', 'The golden one', 249, '100 g', 'Meghalaya', 'BESTSELLER', 'photo-1702041295331-840d4d9aa7c9'],
    ['pepper', 'Malabar Black Pepper', 'Bold & beautifully warm', 189, '100 g', 'Wayanad', 'SMALL BATCH', 'photo-1716816211590-c15a328a5ff0'],
    ['chilli', 'Byadgi Chilli', 'A gentle, brilliant heat', 159, '100 g', 'Karnataka', 'SUN DRIED', 'photo-1588252303782-cb80119abd6d'],
    ['cardamom', 'Green Cardamom', 'Little pods, big perfume', 329, '50 g', 'Idukki', 'RARE FIND', 'photo-1642255521852-7e7c742ac58f'],
    ['cumin', 'Royal Cumin Seeds', 'Earthy, nutty, essential', 129, '100 g', 'Rajasthan', 'FARM FRESH', 'photo-1596040033229-a9821ebd058d'],
    ['cinnamon', 'True Ceylon Cinnamon', 'Sweet with a soft warmth', 219, '50 g', 'Kerala', 'HAND ROLLED', 'photo-1605522469906-3fe226b3562d'],
    ['cloves', 'Handpicked Cloves', 'Sweet, deep and aromatic', 179, '50 g', 'Kerala', 'SMALL BATCH', 'photo-1716816211590-c15a328a5ff0'],
    ['coriander', 'Stone-Ground Coriander', 'Citrusy, mellow and fresh', 99, '100 g', 'Rajasthan', 'MILL FRESH', 'photo-1596040033229-a9821ebd058d'],
    ['fennel', 'Sweet Saunf Fennel', 'A lovely little finish', 109, '100 g', 'Gujarat', 'FARM FRESH', 'photo-1642255521852-7e7c742ac58f'],
    ['fenugreek', 'Fenugreek Seeds', 'A tiny, lovely bitter edge', 79, '100 g', 'Rajasthan', 'SUN DRIED', 'photo-1596040033229-a9821ebd058d'],
    ['mustard', 'Black Mustard Seeds', 'Little seeds, big sizzle', 89, '100 g', 'Karnataka', 'SMALL BATCH', 'photo-1596040033229-a9821ebd058d'],
    ['dry-ginger', 'Sun-Dried Dry Ginger', 'Slow warmth, sunshine sweet', 169, '100 g', 'Kerala', 'SUN DRIED', 'photo-1716816211590-c15a328a5ff0'],
    ['sambar-powder', 'Grandma’s Sambar Powder', 'Slow-roasted, stone-ground', 199, '100 g', 'Tamil Nadu', 'FAMILY RECIPE', 'photo-1588252303782-cb80119abd6d'],
    ['rasam-powder', 'Peppery Rasam Powder', 'A bright little bowl of comfort', 189, '100 g', 'Tamil Nadu', 'MILL FRESH', 'photo-1596040033229-a9821ebd058d'],
    ['garam-masala', 'Sunday Garam Masala', 'A little warmth for everything', 229, '100 g', 'Maharashtra', 'FAMILY RECIPE', 'photo-1588252303782-cb80119abd6d'],
    ['biryani-masala', 'Slow-Roasted Biryani Masala', 'Deep, sweet and celebratory', 249, '100 g', 'Hyderabad', 'SMALL BATCH', 'photo-1716816211590-c15a328a5ff0'],
  ];
  for (const [slug, name, description, price, unit, origin, category, photo] of products) {
    await Product.updateOne({ slug }, { $setOnInsert: { slug, name, description, price, unit, origin, category, image: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=700&q=85`, inventory: 100, active: true } }, { upsert: true });
  }
  await Shop.updateMany(
    {
      slug: { $in: legacyDemoShopSlugs },
      ownerId: { $exists: false },
      address: /Bengaluru/i,
    },
    { $set: { approved: false, servicePincodes: [] } },
  );
}

app.use((error, _req, res, _next) => {
  const status = error.status || (error instanceof multer.MulterError ? 400 : error.name === 'ValidationError' || error.code === 11000 ? 400 : 500);
  if (status === 500) console.error('API error:', error);
  return res.status(status).json({ message: errorMessage(error) });
});

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('Connected to MongoDB.');
    await seedCatalog();
    console.log('Starter catalog is ready. Add verified Chennai/Tamil Nadu shops from the admin dashboard.');
  }).catch((error) => console.error('MongoDB connection failed:', error.message));
} else {
  console.warn('MONGODB_URI is not set; database-backed API endpoints will return 503.');
}
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production.');
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('JWT_SECRET is not set; development tokens will expire when the server restarts.');
}

app.listen(port, () => console.log(`Spice Wagon API listening on http://localhost:${port}`));
