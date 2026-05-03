import { registerUser, loginUser } from './auth.js';
import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(),
    },
}));

jest.mock('bcrypt');

const mockQuery = pool.query as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;
const mockSign = jwt.sign as jest.Mock;

describe('registerUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('hashes the password and returns a PublicUser on success', async () => {
        mockHash.mockResolvedValueOnce('hashed_password');

        const mockUser = {
            id: 'uuid-1',
            email: 'test@example.com',
            created_at: new Date(),
            updated_at: new Date(),
        };
        mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

        const result = await registerUser({
            email: 'test@example.com',
            password: 'Password1!',
        });

        expect(mockHash).toHaveBeenCalledWith('Password1!', 12);
        expect(mockQuery).toHaveBeenCalledTimes(1);
        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), [
            'test@example.com',
            'hashed_password',
        ]);
        expect(result).toEqual(mockUser);
    });

    it('returns null when email is already taken (ON CONFLICT DO NOTHING)', async () => {
        mockHash.mockResolvedValueOnce('hashed_password');
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const result = await registerUser({
            email: 'taken@example.com',
            password: 'Password1!',
        });

        expect(result).toBeNull();
    });

    it('propagates database errors', async () => {
        mockHash.mockResolvedValueOnce('hashed_password');
        mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));

        await expect(
            registerUser({ email: 'test@example.com', password: 'Password1!' }),
        ).rejects.toThrow('DB connection failed');
    });
});

describe('loginUser', () => {
    const mockDbUser = {
        id: 'uuid-1',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns a PublicUser and token on valid credentials', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [mockDbUser] });
        mockCompare.mockResolvedValueOnce(true);
        mockSign.mockReturnValueOnce('signed.jwt.token');

        const result = await loginUser({ email: 'test@example.com', password: 'Password1!' });

        expect(mockCompare).toHaveBeenCalledWith('Password1!', 'hashed_password');
        expect(mockSign).toHaveBeenCalledWith(
            { userId: 'uuid-1', email: 'test@example.com' },
            expect.any(String),
            { expiresIn: '7d' },
        );
        expect(result.user).not.toHaveProperty('password_hash');
        expect(result.user).toMatchObject({ id: 'uuid-1', email: 'test@example.com' });
        expect(result.token).toBe('signed.jwt.token');
    });

    it('throws AppError 401 when user does not exist', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });
        mockCompare.mockResolvedValueOnce(false);

        await expect(
            loginUser({ email: 'nobody@example.com', password: 'Password1!' }),
        ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });

        // Assert compare was still called — this enforces the timing attack prevention.
        // If someone removes the dummy hash fallback, this test will catch it.
        expect(mockCompare).toHaveBeenCalled();
    });

    it('throws AppError 401 when password is incorrect', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [mockDbUser] });
        mockCompare.mockResolvedValueOnce(false);

        await expect(
            loginUser({ email: 'test@example.com', password: 'WrongPassword1!' }),
        ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid email or password' });
    });

    it('propagates database errors', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));

        await expect(
            loginUser({ email: 'test@example.com', password: 'Password1!' }),
        ).rejects.toThrow('DB connection failed');
    });
});
