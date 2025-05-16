import { eq } from 'drizzle-orm';
import { db } from './server/db';
import { users } from './shared/schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminAccounts() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
    if (existingAdmin.length === 0) {
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
    } else {
      console.log('Admin account already exists');
    }

    // Check if superadmin already exists
    const existingSuperadmin = await db.select().from(users).where(eq(users.username, 'superadmin'));
    if (existingSuperadmin.length === 0) {
      // Create superadmin account
      const superadminPassword = await hashPassword('superadmin123');
      await db.insert(users).values({
        email: 'superadmin@gradverify.edu',
        password: superadminPassword,
        fullName: 'Super Admin User',
        role: 'superadmin',
        department: 'Executive Office'
      });
      console.log('Superadmin account created successfully');
    } else {
      console.log('Superadmin account already exists');
    }

    // Check if faculty already exists
    const existingFaculty = await db.select().from(users).where(eq(users.username, 'faculty'));
    if (existingFaculty.length === 0) {
      // Create faculty account
      const facultyPassword = await hashPassword('faculty123');
      await db.insert(users).values({
        password: facultyPassword,
        email: 'faculty@gradverify.edu',
        fullName: 'Faculty User',
        role: 'faculty',
        department: 'Computer Science'
      });
      console.log('Faculty account created successfully');
    } else {
      console.log('Faculty account already exists');
    }
  } catch (error) {
    console.error('Error creating accounts:', error);
  }
}

// Run the function
createAdminAccounts()
  .then(() => console.log('Account setup completed'))
  .catch(err => console.error('Error setting up accounts:', err));