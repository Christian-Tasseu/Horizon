import { db } from '../config/database.js';

export const userRepository = {
    async findByEmail(email) {
        const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return user[0] || null;
    },

    async findById(id) {
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return user[0] || null;
    },
    
    async create({ email, passwordHash, displayName }) {
        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
            [email, passwordHash, displayName]
        );
        return { id: result.insertId, email, displayName };
    }
}

