import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/gradverify'
});

async function runMigration() {
  const client = await pool.connect();
  try {
    // Check if name column exists
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'name'
    `);

    if (result.rows.length === 0) {
      console.log('Adding name column to users table...');
      await client.query(`
        ALTER TABLE "users" 
        ADD COLUMN "name" text NOT NULL DEFAULT ''
      `);
      console.log('Successfully added name column');
    } else {
      console.log('Name column already exists');
    }
  } catch (err) {
    console.error('Error running migration:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error); 