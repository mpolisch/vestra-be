import { registerUser } from './auth.js';
import { pool } from '../db.js';
import { AppError } from '../utils/AppError.js';
import bcrypt from 'bcrypt';

jest.mock('../db.js', () => ({
    pool: {
        query: jest.fn(),
    },
}));

jest.mock('bcrypt');

const mockQuery = pool.query as jest.Mock;
const mockHash = bcrypt.hash as jest.Mock;

describe('registerUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('hashes the password and returns a PublicUser on success', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
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
        expect(mockQuery).toHaveBeenCalledTimes(2);
        expect(result).toEqual(mockUser);
    });

    it('throws AppError 400 when email is already in use', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'existing' }] });

        const error = await registerUser({
            email: 'taken@example.com',
            password: 'Password1!',
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toBe('Email already in use');
        expect(mockHash).not.toHaveBeenCalled();
    });

    it('propagates database errors from the SELECT query', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB connection failed'));

        await expect(
            registerUser({ email: 'test@example.com', password: 'Password1!' }),
        ).rejects.toThrow('DB connection failed');
    });

    it('propagates database errors from the INSERT query', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
        mockHash.mockResolvedValueOnce('hashed_password');
        mockQuery.mockRejectedValueOnce(new Error('Insert failed'));

        await expect(
            registerUser({ email: 'test@example.com', password: 'Password1!' }),
        ).rejects.toThrow('Insert failed');
    });
});
