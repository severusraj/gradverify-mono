import pkg from 'pg';
const { Pool } = pkg;
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the project root
dotenv.config({ path: join(process.cwd(), '.env') });

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database!');
    client.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 