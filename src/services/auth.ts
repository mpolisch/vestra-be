import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import type { PublicUser } from '../types/index.js';
import type { RegisterDTO } from '../utils/schemas.js';

export const registerUser = async (data: RegisterDTO): Promise<PublicUser | null> => {
    const { email, password } = data;

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ON CONFLICT DO NOTHING prevents email enumeration and is atomic —
    // no race condition between a SELECT check and INSERT.
    const result = await pool.query(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, created_at, updated_at`,
        [email, passwordHash],
    );

    // Returns null if email was already taken — caller always responds with 201
    return result.rows[0] ?? null;
};
