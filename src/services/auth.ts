import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { AppError } from '../utils/AppError.js';
import type { PublicUser } from '../types/index.js';
import type { RegisterDTO, LoginDTO } from '../utils/schemas.js';

const JWT_SECRET = process.env.JWT_SECRET as string;

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

export const loginUser = async (data: LoginDTO): Promise<{ user: PublicUser; token: string }> => {
    const { email, password } = data;

    const result = await pool.query(
        'SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1',
        [email],
    );

    const user = result.rows[0];

    // Use a constant-time compare even when user doesn't exist to prevent
    // timing attacks that could reveal whether an email is registered.
    const passwordHash = user?.password_hash ?? '$2b$12$invalidhashfortimingattackprevention';
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!user || !isValid) {
        throw new AppError('Invalid email or password', 401);
    }

    const publicUser: PublicUser = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };

    const token = jwt.sign({ userId: publicUser.id, email: publicUser.email }, JWT_SECRET, {
        expiresIn: '7d',
    });

    return { user: publicUser, token };
};
