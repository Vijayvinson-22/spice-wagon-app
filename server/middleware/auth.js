import jwt from 'jsonwebtoken';
import { User } from '../models.js';

export async function authenticate(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Sign in to continue.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('_id name email role address deliveryLocation');
    if (!user) return res.status(401).json({ message: 'This account is no longer available.' });
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.name === 'TokenExpiredError' ? 'Your session has expired. Please sign in again.' : 'Your session could not be verified.' });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have permission to do that.' });
    return next();
  };
}
