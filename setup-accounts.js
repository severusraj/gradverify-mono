import { db } from './server/db.ts';
import { users } from './shared/schema.ts';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminAccounts() {
  try {
    // Create admin account
    const adminPassword = await hashPassword('admin123');
    await db.insert(users).values({
      username: 'admin',
      password: adminPassword,
      email: 'admin@gradverify.edu',
      fullName: 'Admin User',
      role: 'admin',
      department: 'IT Services'
    });
    console.log('Admin account created successfully');

    // Create superadmin account
    const superadminPassword = await hashPassword('superadmin123');
    await db.insert(users).values({
      username: 'superadmin',
      password: superadminPassword,
      email: 'superadmin@gradverify.edu',
      fullName: 'Super Admin User',
      role: 'superadmin',
      department: 'Executive Office'
    });
    console.log('Superadmin account created successfully');

    // Create faculty account
    const facultyPassword = await hashPassword('faculty123');
    await db.insert(users).values({
      username: 'faculty',
      password: facultyPassword,
      email: 'faculty@gradverify.edu',
      fullName: 'Faculty User',
      role: 'faculty',
      department: 'Computer Science'
    });
    console.log('Faculty account created successfully');
  } catch (error) {
    console.error('Error creating accounts:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

// Run the function
createAdminAccounts();