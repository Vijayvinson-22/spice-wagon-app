import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Whole spices' },
  price: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true },
  origin: { type: String, required: true },
  image: { type: String, default: '' },
  inventory: { type: Number, default: 0, min: 0 },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  active: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', origin: 'text' });

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  address: { type: String, required: true },
  location: { lat: Number, lng: Number },
  servicePincodes: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  certifications: [{ name: String, documentUrl: String, verified: { type: Boolean, default: false } }],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
  openingTime: { type: String, default: '09:00' },
  closingTime: { type: String, default: '20:00' },
}, { timestamps: true });

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, max: 50 },
  unitPrice: { type: Number, required: true, min: 1 },
  customization: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  items: { type: [orderItemSchema], required: true, validate: (items) => items.length > 0 },
  subtotal: { type: Number, required: true, min: 1 },
  deliveryFee: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 1 },
  deliveryAddress: { type: String, required: true, trim: true },
  deliveryLocation: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    updatedAt: Date,
  },
  status: { type: String, enum: ['Order placed', 'Shop accepted', 'Ingredients checked', 'Milling', 'Quality check', 'Packed', 'Ready', 'Out for delivery', 'Delivered', 'Rejected', 'Cancelled'], default: 'Order placed' },
  statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
  paymentMethod: { type: String, enum: ['cod', 'razorpay'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'pay_on_delivery', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  batchId: String,
  millingDate: Date,
  shelfLife: String,
  storageInstructions: String,
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  interval: { type: String, enum: ['weekly', 'monthly', 'custom'], required: true },
  intervalDays: { type: Number, min: 1, max: 365 },
  nextDeliveryAt: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  history: [{ action: String, at: { type: Date, default: Date.now } }],
  customization: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const customBlendSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 42 },
  ingredients: { type: Map, of: Number, required: true },
  spiceLevel: { type: Number, min: 0, max: 100, required: true },
  heatLevel: { type: Number, min: 0, max: 100, required: true },
  saltLevel: { type: Number, min: 0, max: 100, required: true },
  quantity: { type: Number, enum: [100, 200, 500], required: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'shop_owner', 'admin'], default: 'customer' },
  address: { type: String, default: '' },
  deliveryLocation: {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    accuracy: { type: Number, min: 0 },
    updatedAt: Date,
  },
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export const CustomBlend = mongoose.models.CustomBlend || mongoose.model('CustomBlend', customBlendSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
