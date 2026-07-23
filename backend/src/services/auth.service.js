import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user) {
  return jwt.sign({ sub: user.id }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });
}

async function issueTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const decoded = jwt.decode(refreshToken);
  await refreshTokenRepository.store({
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async register({ email, password, displayName }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Un compte existe déjà avec cet email');

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await userRepository.create({ email, passwordHash, displayName });
    return issueTokens(user);
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Identifiants invalides');

    const passwordMatches = await argon2.verify(user.password_hash, password);
    if (!passwordMatches) throw new Error('Identifiants invalides');

    return issueTokens(user);
  },

  async refresh(refreshToken) {
    let payload;
    try {
      payload = jwt.verify(refreshToken, env.jwt.refreshSecret);
    } catch {
      throw new Error('Refresh token invalide ou expiré');
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await refreshTokenRepository.findValid(tokenHash);
    if (!stored) throw new Error('Refresh token révoqué ou inconnu');

    await refreshTokenRepository.revoke(tokenHash);
    const user = await userRepository.findById(payload.sub);
    return issueTokens(user);
  },

  async me(userId){
    return await userRepository.findById(userId);
  },

  async logout(refreshToken) {
    await refreshTokenRepository.revoke(hashRefreshToken(refreshToken));
  },
};