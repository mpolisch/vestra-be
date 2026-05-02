import { registerUser } from './auth.js';
import { pool } from '../db.js';
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
