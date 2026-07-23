import { db } from '../config/database.js';

export const refreshTokenRepository = {
    async store({userId, tokenHash, expiresAt}) {
        await db.query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [userId, tokenHash, expiresAt]);
    },

    async findValid(tokenHash) {
        const [result] = await db.query('SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()', [tokenHash]);
        return result[0] || null;
    },

    async revoke(tokenHash) {
        await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tokenHash]);
    }

}