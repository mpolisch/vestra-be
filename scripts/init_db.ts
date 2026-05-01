import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
}

const pool = new Pool({ connectionString });

async function runMigrations() {
    const migrationsDir = path.join(__dirname, '../migrations');

    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort(); // ensures 001_, 002_, 003_ run in order

    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        try {
            await pool.query(sql);
            console.log(`✓ ${file}`);
        } catch (err) {
            console.error(`✗ ${file}:`, err);
            process.exit(1); // stop on first failure
        }
    }

    await pool.end();
    console.log('All migrations complete');
}

runMigrations();
