import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { AppError } from '../utils/AppError.js';
import type { PublicUser } from '../types/index.js';
import type { RegisterDTO } from '../utils/schemas.js';

export const registerUser = async (data: RegisterDTO): Promise<PublicUser> => {
    const { email, password } = data;

    // 1. Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount && existingUser.rowCount > 0) {
        throw new AppError('Email already in use', 400);
    }

    // 2. Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Insert user
    const result = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at, updated_at',
        [email, passwordHash],
    );

    return result.rows[0];
};
