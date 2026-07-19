import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signAccess, signRefresh } from '../utils/token.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, agencyName } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
  const isAgent = role === 'agent';
  const user = await User.create({
    name, email, password, phone,
    role: isAgent ? 'agent' : 'user',
    agencyName: isAgent ? agencyName : undefined,
    approved: isAgent ? false : true
  });
  await Wallet.create({ user: user._id, balance: 0 });
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  user.refreshTokens.push(refreshToken);
  await user.save();
  res.status(201).json({ success: true, accessToken, refreshToken, user: sanitize(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !user.password || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  const accessToken = signAccess(user);
  const refreshToken = signRefresh(user);
  user.refreshTokens.push(refreshToken);
  await user.save();
  res.json({ success: true, accessToken, refreshToken, user: sanitize(user) });
});


export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });
  let decoded;
  try { decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
  catch { return res.status(401).json({ success: false, message: 'Invalid refresh token' }); }
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(refreshToken))
    return res.status(401).json({ success: false, message: 'Refresh token revoked' });
  const accessToken = signAccess(user);
  res.json({ success: true, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await User.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: refreshToken } });
  res.json({ success: true, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true });
  res.json({ success: true, user: sanitize(user) });
});

const sanitize = (u) => ({
  _id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role,
  agencyName: u.agencyName, approved: u.approved, creditLimit: u.creditLimit,
  markupPercent: u.markupPercent, avatar: u.avatar, isVerified: u.isVerified
});
