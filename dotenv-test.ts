import * as dotenv from 'dotenv';
import { join } from 'path';
import * as fs from 'fs';

// Method 1: Direct dotenv config
console.log('Method 1: Direct dotenv config');
dotenv.config();
console.log('DATABASE_URL (Method 1):', process.env.DATABASE_URL);

// Method 2: Manual file reading
console.log('\nMethod 2: Manual file reading');
const envPath = join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('Raw .env content:', envContent);
const envConfig = dotenv.parse(envContent);
console.log('Parsed config:', envConfig);

// Method 3: Set environment variable directly
console.log('\nMethod 3: Direct environment variable');
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/gradverify';
console.log('DATABASE_URL (Method 3):', process.env.DATABASE_URL); 