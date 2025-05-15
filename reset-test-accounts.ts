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

async function resetTestAccounts() {
  try {
    console.log("Deleting existing test accounts...");
    
    // Delete existing test accounts if they exist
    await db.delete(users).where(eq(users.username, 'admin'));
    await db.delete(users).where(eq(users.username, 'superadmin'));
    await db.delete(users).where(eq(users.username, 'faculty'));
    
    console.log("Creating fresh test accounts...");
    
    // Create admin account
    const adminPassword = await hashPassword('admin123');
    const [adminUser] = await db.insert(users).values({
      username: 'admin',
      password: adminPassword,
      email: 'admin@gradverify.edu',
      fullName: 'Admin User',
      role: 'admin',
      department: 'IT Services'
    }).returning();
    console.log('Admin account created successfully:', adminUser.id);

    // Create superadmin account
    const superadminPassword = await hashPassword('superadmin123');
    const [superadminUser] = await db.insert(users).values({
      username: 'superadmin',
      password: superadminPassword,
      email: 'superadmin@gradverify.edu',
      fullName: 'Super Admin User',
      role: 'superadmin',
      department: 'Executive Office'
    }).returning();
    console.log('Superadmin account created successfully:', superadminUser.id);

    // Create faculty account
    const facultyPassword = await hashPassword('faculty123');
    const [facultyUser] = await db.insert(users).values({
      username: 'faculty',
      password: facultyPassword,
      email: 'faculty@gradverify.edu',
      fullName: 'Faculty User',
      role: 'faculty',
      department: 'Computer Science'
    }).returning();
    console.log('Faculty account created successfully:', facultyUser.id);
    
    // Create student account
    const studentPassword = await hashPassword('student123');
    const [studentUser] = await db.insert(users).values({
      username: 'student',
      password: studentPassword,
      email: 'student@gradverify.edu',
      fullName: 'Student User',
      role: 'student',
      department: 'Computer Science'
    }).returning();
    console.log('Student account created successfully:', studentUser.id);
    
    console.log("All test accounts created successfully!");
    
  } catch (error) {
    console.error('Error resetting test accounts:', error);
  }
}

// Run the function
resetTestAccounts()
  .then(() => console.log('Account reset completed'))
  .catch(err => console.error('Error resetting accounts:', err));