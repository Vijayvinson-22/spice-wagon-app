import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from './models.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Marketplace Admin';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in .env before creating an admin account.');
  process.exitCode = 1;
} else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Set ADMIN_EMAIL to a valid email address.');
  process.exitCode = 1;
} else if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
  console.error('Set ADMIN_PASSWORD to a password between 12 and 128 characters.');
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!await bcrypt.compare(password, existingUser.passwordHash)) {
        throw new Error('That email already exists. ADMIN_PASSWORD must match its current password to promote it.');
      }
      existingUser.role = 'admin';
      await existingUser.save();
    } else {
      await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' });
    }
    console.log(`Admin account ready for ${email}. Sign in through Your profile to access the admin dashboard.`);
  } catch (error) {
    console.error('Admin account could not be created:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
